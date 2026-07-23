import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { randomBytes } from 'crypto';
import { createReadStream, existsSync, statSync } from 'fs';
import { extname, join, normalize, resolve } from 'path';
import { fileURLToPath } from 'url';

const PORT = Number(process.env.PORT ?? process.env.DUEL_PORT ?? 3001);
const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const DIST = resolve(ROOT, 'dist');
const WS_PATH = '/duel';
const LIVE_PATH = '/live';

type Sport = 'soccer' | 'basketball' | 'baseball' | 'football' | 'hockey';
type RoomStatus = 'lobby' | 'playing' | 'finished';

interface ClientMsg {
  type: string;
  name?: string;
  characterId?: string;
  sport?: Sport;
  code?: string;
  score?: number;
  correct?: number;
  wrong?: number;
  maxStreak?: number;
  coins?: number;
  cardLevels?: Record<string, number>;
}

const CARD_STAT_KEYS = ['pac', 'sho', 'pas', 'dri', 'def', 'phy'] as const;

function sanitizeCardLevels(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, number> = {};
  const src = raw as Record<string, unknown>;
  for (const key of CARD_STAT_KEYS) {
    const n = Number(src[key]);
    if (!Number.isFinite(n) || n <= 0) continue;
    out[key] = Math.max(0, Math.min(99, Math.floor(n)));
  }
  return out;
}

interface PlayerInfo {
  id: string;
  name: string;
  characterId: string;
  ready: boolean;
  score: number;
  finished: boolean;
  correct: number;
  wrong: number;
  maxStreak: number;
  wagerDecided: boolean;
  wagerCoins: number;
  cardLevels: Record<string, number>;
}

interface Player extends PlayerInfo {
  ws: WebSocket;
  alive: boolean;
}

interface Room {
  code: string;
  sport: Sport;
  hostId: string;
  status: RoomStatus;
  seed: string | null;
  players: Map<string, Player>;
}

const rooms = new Map<string, Room>();
const socketRoom = new WeakMap<WebSocket, string>();
const socketPlayer = new WeakMap<WebSocket, string>();
const liveClients = new Set<WebSocket>();
/** Tab-scoped presence ids → last seen (ms). More reliable than raw socket count. */
const presence = new Map<string, number>();
const presenceSocket = new WeakMap<WebSocket, string>();
const PRESENCE_TTL_MS = 45_000;

function prunePresence() {
  const cutoff = Date.now() - PRESENCE_TTL_MS;
  for (const [id, seen] of presence) {
    if (seen < cutoff) presence.delete(id);
  }
}

function onlineCount() {
  prunePresence();
  return presence.size;
}

function touchPresence(id: string) {
  const clean = id.trim().slice(0, 64);
  if (!clean) return;
  presence.set(clean, Date.now());
}

function dropPresence(id: string) {
  presence.delete(id);
}

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.glb': 'model/gltf-binary',
  '.fbx': 'application/octet-stream',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.m4v': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.map': 'application/json',
};

/** Extensions that must 404 when missing — never SPA-fallback to index.html. */
const ASSET_EXTS = new Set([
  '.js',
  '.css',
  '.map',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.svg',
  '.ico',
  '.woff',
  '.woff2',
  '.glb',
  '.fbx',
  '.mp3',
  '.wav',
  '.mp4',
  '.m4v',
  '.webm',
  '.mov',
  '.json',
]);


function makeCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  const bytes = randomBytes(6);
  for (let i = 0; i < 6; i++) code += alphabet[bytes[i] % alphabet.length];
  return code;
}

function uniqueCode(): string {
  let code = makeCode();
  while (rooms.has(code)) code = makeCode();
  return code;
}

function send(ws: WebSocket, payload: unknown) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function publicPlayers(room: Room): PlayerInfo[] {
  return [...room.players.values()].map(p => ({
    id: p.id,
    name: p.name,
    characterId: p.characterId,
    ready: p.ready,
    score: p.score,
    finished: p.finished,
    correct: p.correct,
    wrong: p.wrong,
    maxStreak: p.maxStreak,
    wagerDecided: p.wagerDecided,
    wagerCoins: p.wagerCoins,
    cardLevels: p.cardLevels ?? {},
  }));
}

function broadcast(room: Room, payload: unknown, except?: WebSocket) {
  for (const p of room.players.values()) {
    if (p.ws !== except) send(p.ws, payload);
  }
}

function lobbyPayload(room: Room) {
  return {
    type: 'lobby',
    code: room.code,
    sport: room.sport,
    status: room.status,
    hostId: room.hostId,
    players: publicPlayers(room),
  };
}

function removePlayer(ws: WebSocket) {
  const code = socketRoom.get(ws);
  const playerId = socketPlayer.get(ws);
  if (!code || !playerId) return;

  const room = rooms.get(code);
  if (!room) return;

  const leaving = room.players.get(playerId);
  const wasPlaying = room.status === 'playing';
  room.players.delete(playerId);
  socketRoom.delete(ws);
  socketPlayer.delete(ws);

  if (room.players.size === 0) {
    rooms.delete(code);
    return;
  }

  if (room.hostId === playerId) {
    room.hostId = [...room.players.keys()][0];
  }

  // Mid-match disconnect → remaining player wins cleanly
  if (wasPlaying && room.players.size === 1 && leaving) {
    const winner = [...room.players.values()][0]!;
    room.status = 'finished';
    send(winner.ws, {
      type: 'result',
      winnerId: winner.id,
      you: {
        id: winner.id,
        name: winner.name,
        score: winner.score,
        correct: winner.correct,
        wrong: winner.wrong,
        maxStreak: winner.maxStreak,
      },
      opponent: {
        id: leaving.id,
        name: leaving.name,
        score: leaving.score,
        correct: leaving.correct,
        wrong: leaving.wrong,
        maxStreak: leaving.maxStreak,
      },
      disconnected: true,
      wager: {
        yourCoins: winner.wagerCoins ?? 0,
        opponentCoins: leaving.wagerCoins ?? 0,
      },
    });
    broadcast(room, lobbyPayload(room));
    return;
  }

  broadcast(room, { type: 'opponent_left', players: publicPlayers(room), hostId: room.hostId });
  broadcast(room, lobbyPayload(room));
}

function tryStart(room: Room) {
  if (room.status !== 'lobby') return;
  if (room.players.size !== 2) return;
  if (![...room.players.values()].every(p => p.ready && p.wagerDecided)) return;

  room.status = 'playing';
  room.seed = `duel-${room.code}-${Date.now()}`;
  for (const p of room.players.values()) {
    p.score = 0;
    p.finished = false;
    p.correct = 0;
    p.wrong = 0;
    p.maxStreak = 0;
  }

  broadcast(room, {
    type: 'start',
    code: room.code,
    sport: room.sport,
    seed: room.seed,
    players: publicPlayers(room),
  });
}

function tryFinish(room: Room) {
  if (room.status !== 'playing') return;
  const players = [...room.players.values()];
  if (players.length < 2 || !players.every(p => p.finished)) return;

  room.status = 'finished';
  const [a, b] = players;
  let winnerId: string | 'draw' = 'draw';
  if (a.score > b.score) winnerId = a.id;
  else if (b.score > a.score) winnerId = b.id;

  for (const p of players) {
    const opp = players.find(x => x.id !== p.id)!;
    send(p.ws, {
      type: 'result',
      winnerId,
      you: {
        id: p.id,
        name: p.name,
        score: p.score,
        correct: p.correct,
        wrong: p.wrong,
        maxStreak: p.maxStreak,
      },
      opponent: {
        id: opp.id,
        name: opp.name,
        score: opp.score,
        correct: opp.correct,
        wrong: opp.wrong,
        maxStreak: opp.maxStreak,
      },
      wager: {
        yourCoins: p.wagerCoins ?? 0,
        opponentCoins: opp.wagerCoins ?? 0,
      },
    });
  }
}

function safeFilePath(urlPath: string): string | null {
  const cleaned = decodeURIComponent(urlPath.split('?')[0] || '/');
  const relative = cleaned === '/' ? '/index.html' : cleaned;
  const full = normalize(join(DIST, relative));
  if (!full.startsWith(DIST)) return null;
  return full;
}

function serveStatic(reqUrl: string, res: import('http').ServerResponse, req?: import('http').IncomingMessage) {
  if (!existsSync(DIST)) {
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Build missing. Run npm run build before starting the server.');
    return;
  }

  const pathOnly = reqUrl.split('?')[0] || '/';
  let filePath = safeFilePath(pathOnly);
  if (!filePath) {
    res.writeHead(400).end('Bad request');
    return;
  }

  const ext = extname(filePath).toLowerCase();
  const missing = !existsSync(filePath) || statSync(filePath).isDirectory();
  if (missing) {
    if (ASSET_EXTS.has(ext)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end('Not found');
      return;
    }
    filePath = join(DIST, 'index.html');
  }

  if (!existsSync(filePath)) {
    res.writeHead(404).end('Not found');
    return;
  }

  const type = MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream';
  const stat = statSync(filePath);
  const size = stat.size;
  const isMedia = type.startsWith('video/') || type.startsWith('audio/');
  const cacheControl = isMedia
    ? 'public, max-age=31536000, immutable'
    : extname(filePath).toLowerCase() === '.html'
      ? 'no-cache'
      : 'public, max-age=3600';

  const range = req?.headers.range;
  if (isMedia && range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match) {
      res.writeHead(416, {
        'Content-Type': type,
        'Content-Range': `bytes */${size}`,
      });
      res.end();
      return;
    }
    const start = match[1] ? Number(match[1]) : 0;
    const end = match[2] ? Number(match[2]) : size - 1;
    if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= size) {
      res.writeHead(416, {
        'Content-Type': type,
        'Content-Range': `bytes */${size}`,
      });
      res.end();
      return;
    }
    const cappedEnd = Math.min(end, size - 1);
    const chunk = cappedEnd - start + 1;
    res.writeHead(206, {
      'Content-Type': type,
      'Content-Length': chunk,
      'Content-Range': `bytes ${start}-${cappedEnd}/${size}`,
      'Accept-Ranges': 'bytes',
      'Cache-Control': cacheControl,
    });
    createReadStream(filePath, { start, end: cappedEnd }).pipe(res);
    return;
  }

  res.writeHead(200, {
    'Content-Type': type,
    'Content-Length': size,
    'Accept-Ranges': isMedia ? 'bytes' : 'none',
    'Cache-Control': cacheControl,
  });
  createReadStream(filePath).pipe(res);
}

const server = createServer((req, res) => {
  const url = req.url || '/';

  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS' && url.startsWith('/api/')) {
    res.writeHead(204, cors);
    res.end();
    return;
  }

  if (url.startsWith('/api/health') || url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', ...cors });
    res.end(
      JSON.stringify({
        ok: true,
        service: 'sportivia',
        rooms: rooms.size,
        online: onlineCount(),
      }),
    );
    return;
  }

  if (url.startsWith('/api/online')) {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      ...cors,
    });
    res.end(JSON.stringify({ online: onlineCount() }));
    return;
  }

  if (url.startsWith('/api/presence')) {
    const readBody = (cb: (raw: string) => void) => {
      const chunks: Buffer[] = [];
      req.on('data', c => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
      req.on('end', () => cb(Buffer.concat(chunks).toString('utf8')));
    };

    if (req.method === 'POST') {
      readBody(raw => {
        let id = '';
        let leave = false;
        try {
          const parsed = JSON.parse(raw || '{}') as { id?: string; leave?: boolean };
          id = typeof parsed.id === 'string' ? parsed.id : '';
          leave = Boolean(parsed.leave);
        } catch {
          /* ignore */
        }
        if (leave) dropPresence(id);
        else touchPresence(id);
        const online = onlineCount();
        broadcastOnline();
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', ...cors });
        res.end(JSON.stringify({ online }));
      });
      return;
    }

    res.writeHead(405, cors);
    res.end();
    return;
  }

  serveStatic(url, res, req);
});

function broadcastOnline() {
  const payload = JSON.stringify({ type: 'online', online: onlineCount() });
  for (const client of liveClients) {
    if (client.readyState === WebSocket.OPEN) client.send(payload);
  }
}

// noServer + manual upgrade routing — required when multiple WS paths share one HTTP server.
// Otherwise the first WebSocketServer aborts non-matching upgrades with HTTP 400.
const liveWss = new WebSocketServer({ noServer: true });
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (req, socket, head) => {
  let pathname = '/';
  try {
    pathname = new URL(req.url || '/', 'http://localhost').pathname;
  } catch {
    socket.destroy();
    return;
  }

  if (pathname === LIVE_PATH) {
    liveWss.handleUpgrade(req, socket, head, ws => {
      liveWss.emit('connection', ws, req);
    });
    return;
  }

  if (pathname === WS_PATH) {
    wss.handleUpgrade(req, socket, head, ws => {
      wss.emit('connection', ws, req);
    });
    return;
  }

  socket.destroy();
});

liveWss.on('connection', ws => {
  const c = ws as WebSocket & { isAlive?: boolean };
  c.isAlive = true;
  liveClients.add(ws);
  send(ws, { type: 'online', online: onlineCount() });

  ws.on('message', raw => {
    try {
      const msg = JSON.parse(String(raw)) as { type?: string; id?: string };
      if (msg.type === 'hello' && typeof msg.id === 'string') {
        const prev = presenceSocket.get(ws);
        if (prev && prev !== msg.id) dropPresence(prev);
        presenceSocket.set(ws, msg.id);
        touchPresence(msg.id);
        broadcastOnline();
      } else if (msg.type === 'ping') {
        const id = presenceSocket.get(ws);
        if (id) touchPresence(id);
        send(ws, { type: 'online', online: onlineCount() });
      }
    } catch {
      /* ignore */
    }
  });

  ws.on('pong', () => {
    c.isAlive = true;
    const id = presenceSocket.get(ws);
    if (id) touchPresence(id);
  });

  ws.on('close', () => {
    liveClients.delete(ws);
    const id = presenceSocket.get(ws);
    if (id) dropPresence(id);
    broadcastOnline();
  });

  ws.on('error', () => {
    liveClients.delete(ws);
    const id = presenceSocket.get(ws);
    if (id) dropPresence(id);
    broadcastOnline();
  });
});

const liveHeartbeat = setInterval(() => {
  for (const client of liveWss.clients) {
    const c = client as WebSocket & { isAlive?: boolean };
    if (c.isAlive === false) {
      const id = presenceSocket.get(client);
      if (id) dropPresence(id);
      liveClients.delete(client);
      client.terminate();
      continue;
    }
    c.isAlive = false;
    if (client.readyState === WebSocket.OPEN) client.ping();
  }
  prunePresence();
  broadcastOnline();
}, 25_000);

liveWss.on('close', () => clearInterval(liveHeartbeat));

// Keep connections alive through proxies / idle timeouts
const heartbeat = setInterval(() => {
  for (const client of wss.clients) {
    const playerId = socketPlayer.get(client);
    const code = socketRoom.get(client);
    const room = code ? rooms.get(code) : undefined;
    const player = playerId && room ? room.players.get(playerId) : undefined;

    if (player && !player.alive) {
      client.terminate();
      continue;
    }
    if (player) player.alive = false;
    if (client.readyState === WebSocket.OPEN) client.ping();
  }
}, 25_000);

wss.on('close', () => clearInterval(heartbeat));

wss.on('connection', ws => {
  ws.on('pong', () => {
    const playerId = socketPlayer.get(ws);
    const code = socketRoom.get(ws);
    const room = code ? rooms.get(code) : undefined;
    const player = playerId && room ? room.players.get(playerId) : undefined;
    if (player) player.alive = true;
  });

  ws.on('message', raw => {
    let msg: ClientMsg;
    try {
      msg = JSON.parse(String(raw));
    } catch {
      send(ws, { type: 'error', message: 'Invalid message' });
      return;
    }

    if (msg.type === 'create') {
      if (socketRoom.get(ws)) removePlayer(ws);
      const sport = msg.sport ?? 'soccer';
      const code = uniqueCode();
      const id = randomBytes(8).toString('hex');
      const player: Player = {
        id,
        name: (msg.name || 'Player').slice(0, 18),
        characterId: msg.characterId || 'cube-man',
        ready: false,
        score: 0,
        finished: false,
        correct: 0,
        wrong: 0,
        maxStreak: 0,
        wagerDecided: false,
        wagerCoins: 0,
        cardLevels: sanitizeCardLevels(msg.cardLevels),
        ws,
        alive: true,
      };
      const room: Room = {
        code,
        sport,
        hostId: id,
        status: 'lobby',
        seed: null,
        players: new Map([[id, player]]),
      };
      rooms.set(code, room);
      socketRoom.set(ws, code);
      socketPlayer.set(ws, id);
      send(ws, { type: 'created', ...lobbyPayload(room), youId: id });
      return;
    }

    if (msg.type === 'join') {
      const code = (msg.code || '').toUpperCase().trim();
      const room = rooms.get(code);
      if (!room) {
        send(ws, { type: 'error', message: 'Lobby not found' });
        return;
      }
      if (room.status !== 'lobby') {
        send(ws, { type: 'error', message: 'Match already started' });
        return;
      }
      if (room.players.size >= 2) {
        send(ws, { type: 'error', message: 'Lobby is full' });
        return;
      }
      if (socketRoom.get(ws)) removePlayer(ws);

      const id = randomBytes(8).toString('hex');
      const player: Player = {
        id,
        name: (msg.name || 'Player').slice(0, 18),
        characterId: msg.characterId || 'cube-man',
        ready: false,
        score: 0,
        finished: false,
        correct: 0,
        wrong: 0,
        maxStreak: 0,
        wagerDecided: false,
        wagerCoins: 0,
        cardLevels: sanitizeCardLevels(msg.cardLevels),
        ws,
        alive: true,
      };
      room.players.set(id, player);
      socketRoom.set(ws, code);
      socketPlayer.set(ws, id);
      send(ws, { type: 'joined', ...lobbyPayload(room), youId: id });
      broadcast(room, lobbyPayload(room));
      return;
    }

    const code = socketRoom.get(ws);
    const playerId = socketPlayer.get(ws);
    if (!code || !playerId) {
      send(ws, { type: 'error', message: 'Not in a lobby' });
      return;
    }
    const room = rooms.get(code);
    const player = room?.players.get(playerId);
    if (!room || !player) {
      send(ws, { type: 'error', message: 'Lobby expired' });
      return;
    }

    if (msg.type === 'ready') {
      if (room.status !== 'lobby') return;
      if (!player.wagerDecided) {
        send(ws, { type: 'error', message: 'Set a coin stake or choose No stake first' });
        return;
      }
      player.ready = true;
      broadcast(room, lobbyPayload(room));
      tryStart(room);
      return;
    }

    if (msg.type === 'unready') {
      if (room.status !== 'lobby') return;
      player.ready = false;
      broadcast(room, lobbyPayload(room));
      return;
    }

    if (msg.type === 'wager') {
      if (room.status !== 'lobby') return;
      const coinsRaw = Number(msg.coins);
      const coins = Number.isFinite(coinsRaw)
        ? Math.max(0, Math.min(50_000, Math.floor(coinsRaw)))
        : 0;
      player.wagerDecided = true;
      player.wagerCoins = coins;
      player.ready = false;
      broadcast(room, lobbyPayload(room));
      return;
    }

    if (msg.type === 'score') {
      if (room.status !== 'playing') return;
      player.score = Math.max(0, Math.floor(msg.score ?? 0));
      broadcast(
        room,
        { type: 'opponent_score', playerId, score: player.score },
        ws,
      );
      return;
    }

    if (msg.type === 'finish') {
      if (room.status !== 'playing') return;
      player.finished = true;
      player.score = Math.max(0, Math.floor(msg.score ?? player.score));
      player.correct = Math.max(0, Math.floor(msg.correct ?? 0));
      player.wrong = Math.max(0, Math.floor(msg.wrong ?? 0));
      player.maxStreak = Math.max(0, Math.floor(msg.maxStreak ?? 0));
      broadcast(
        room,
        {
          type: 'opponent_finished',
          playerId,
          score: player.score,
          correct: player.correct,
          wrong: player.wrong,
          maxStreak: player.maxStreak,
        },
        ws,
      );
      tryFinish(room);
      return;
    }

    if (msg.type === 'leave') {
      removePlayer(ws);
      send(ws, { type: 'left' });
      return;
    }

    if (msg.type === 'rematch') {
      if (room.players.size !== 2) {
        send(ws, { type: 'error', message: 'Need 2 players for rematch' });
        return;
      }

      // Only the first rematch request resets the finished match. The second
      // player may arrive after their opponent has already readied up; resetting
      // again here would silently erase that ready state.
      if (room.status === 'finished') {
        room.status = 'lobby';
        room.seed = null;
        for (const p of room.players.values()) {
          p.ready = false;
          p.score = 0;
          p.finished = false;
          p.correct = 0;
          p.wrong = 0;
          p.maxStreak = 0;
          p.wagerDecided = false;
          p.wagerCoins = 0;
        }
      } else if (room.status !== 'lobby') {
        send(ws, { type: 'error', message: 'Match is still in progress' });
        return;
      }

      broadcast(room, lobbyPayload(room));
      return;
    }
  });

  ws.on('close', () => removePlayer(ws));
  ws.on('error', () => removePlayer(ws));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[sportivia] live on http://0.0.0.0:${PORT}`);
  console.log(`[sportivia] duel websocket at ws://0.0.0.0:${PORT}${WS_PATH}`);
  console.log(`[sportivia] live count websocket at ws://0.0.0.0:${PORT}${LIVE_PATH}`);
});
