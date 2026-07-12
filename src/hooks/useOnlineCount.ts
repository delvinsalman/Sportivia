import { useEffect, useState } from 'react';
import { liveWsUrl, onlineApiUrl, presenceApiUrl } from '../lib/duelTypes';

const TAB_ID_KEY = 'sportivia-presence-tab';

function tabId(): string {
  try {
    // sessionStorage is unique per tab — so 3 tabs = 3 ids
    let id = sessionStorage.getItem(TAB_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(TAB_ID_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

/**
 * Counts how many browser tabs currently have Sportivia open.
 * Uses per-tab IDs + HTTP heartbeats (and a live WS when available).
 */
export function useOnlineCount(): number | null {
  const [online, setOnline] = useState<number | null>(null);

  useEffect(() => {
    const id = tabId();
    let closed = false;
    let ws: WebSocket | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let beatTimer: ReturnType<typeof setInterval> | undefined;

    async function heartbeat() {
      try {
        const res = await fetch(presenceApiUrl(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
          cache: 'no-store',
          keepalive: true,
        });
        if (!res.ok) return;
        const data = (await res.json()) as { online?: number };
        if (!closed && typeof data.online === 'number') setOnline(data.online);
      } catch {
        try {
          const res = await fetch(onlineApiUrl(), { cache: 'no-store' });
          if (!res.ok) return;
          const data = (await res.json()) as { online?: number };
          if (!closed && typeof data.online === 'number') setOnline(data.online);
        } catch {
          /* server offline */
        }
      }
    }

    function connectWs() {
      if (closed) return;
      try {
        ws = new WebSocket(liveWsUrl());
      } catch {
        return;
      }

      ws.onopen = () => {
        ws?.send(JSON.stringify({ type: 'hello', id }));
      };

      ws.onmessage = ev => {
        try {
          const msg = JSON.parse(String(ev.data)) as { type?: string; online?: number };
          if (msg.type === 'online' && typeof msg.online === 'number') {
            setOnline(msg.online);
          }
        } catch {
          /* ignore */
        }
      };

      ws.onclose = () => {
        if (closed) return;
        retryTimer = setTimeout(connectWs, 4_000);
      };

      ws.onerror = () => {
        ws?.close();
      };
    }

    function leave() {
      const body = JSON.stringify({ id, leave: true });
      try {
        navigator.sendBeacon(presenceApiUrl(), new Blob([body], { type: 'application/json' }));
      } catch {
        void fetch(presenceApiUrl(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        });
      }
    }

    void heartbeat();
    beatTimer = setInterval(() => {
      void heartbeat();
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping', id }));
      }
    }, 8_000);
    connectWs();

    window.addEventListener('pagehide', leave);

    return () => {
      closed = true;
      window.removeEventListener('pagehide', leave);
      if (retryTimer) clearTimeout(retryTimer);
      if (beatTimer) clearInterval(beatTimer);
      leave();
      ws?.close();
    };
  }, []);

  return online;
}
