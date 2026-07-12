import { useEffect, useState } from 'react';
import { liveWsUrl, onlineApiUrl } from '../lib/duelTypes';

/**
 * Keeps a presence socket open while the app is mounted and returns
 * how many players currently have Sportivia open.
 */
export function useOnlineCount(): number | null {
  const [online, setOnline] = useState<number | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let closed = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let pollTimer: ReturnType<typeof setInterval> | undefined;

    async function pollFallback() {
      try {
        const res = await fetch(onlineApiUrl(), { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { online?: number };
        if (!closed && typeof data.online === 'number') setOnline(data.online);
      } catch {
        /* ignore — server may be offline in pure static preview */
      }
    }

    function connect() {
      if (closed) return;
      try {
        ws = new WebSocket(liveWsUrl());
      } catch {
        void pollFallback();
        pollTimer = setInterval(() => void pollFallback(), 15_000);
        return;
      }

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
        retryTimer = setTimeout(connect, 4_000);
      };

      ws.onerror = () => {
        ws?.close();
      };
    }

    connect();

    return () => {
      closed = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (pollTimer) clearInterval(pollTimer);
      ws?.close();
    };
  }, []);

  return online;
}
