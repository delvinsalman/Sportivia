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

type Sport = 'soccer' | 'basketball' | 'baseball';
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
  '.map': 'application/json',
};

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

  broadcast(room, { type: 'opponent_left', players: publicPlayers(room), hostId: room.hostId });
  broadcast(room, lobbyPayload(room));
}

function tryStart(room: Room) {
  if (room.status !== 'lobby') return;
  if (room.players.size !== 2) return;
  if (![...room.players.values()].every(p => p.ready)) return;

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

function serveStatic(reqUrl: string, res: import('http').ServerResponse) {
  if (!existsSync(DIST)) {
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Build missing. Run npm run build before starting the server.');
    return;
  }

  let filePath = safeFilePath(reqUrl);
  if (!filePath) {
    res.writeHead(400).end('Bad request');
    return;
  }

  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(DIST, 'index.html');
  }

  if (!existsSync(filePath)) {
    res.writeHead(404).end('Not found');
    return;
  }

  const type = MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type });
  createReadStream(filePath).pipe(res);
}

const server = createServer((req, res) => {
  const url = req.url || '/';

  if (url.startsWith('/api/health') || url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, service: 'sportivia', rooms: rooms.size }));
    return;
  }

  serveStatic(url, res);
});

const wss = new WebSocketServer({ server, path: WS_PATH });

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
      room.status = 'lobby';
      room.seed = null;
      for (const p of room.players.values()) {
        p.ready = false;
        p.score = 0;
        p.finished = false;
        p.correct = 0;
        p.wrong = 0;
        p.maxStreak = 0;
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
});
