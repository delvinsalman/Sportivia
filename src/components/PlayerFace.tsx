import { useEffect, useState } from 'react';
import type { Sport } from '../types';
import { getCachedPlayerFace, resolvePlayerFace } from '../lib/playerFaces';
import { SPORT_ACCENT, SPORT_STITCH } from '../lib/sportTheme';

interface PlayerFaceProps {
  sport: Sport;
  playerId: string;
  playerName: string;
  size?: number;
  className?: string;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[parts.length - 1]![0] ?? ''}`.toUpperCase();
}

function faceAccent(sport: Sport): string {
  return sport === 'baseball' ? SPORT_STITCH.baseball : SPORT_ACCENT[sport];
}

/** Circular player face with initials fallback while loading / on miss. */
export function PlayerFace({
  sport,
  playerId,
  playerName,
  size = 40,
  className = '',
}: PlayerFaceProps) {
  const [url, setUrl] = useState<string | null>(
    () => getCachedPlayerFace(sport, playerId) ?? null,
  );
  const [broken, setBroken] = useState(false);
  const accent = faceAccent(sport);

  useEffect(() => {
    let cancelled = false;
    setBroken(false);
    const cached = getCachedPlayerFace(sport, playerId);
    if (cached !== undefined) {
      setUrl(cached);
      if (cached) return;
    } else {
      setUrl(null);
    }
    void resolvePlayerFace(sport, playerId, playerName).then(resolved => {
      if (!cancelled) setUrl(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, [sport, playerId, playerName]);

  const showImg = Boolean(url) && !broken;

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-[#0f1218] ${className}`}
      style={{
        width: size,
        height: size,
        boxShadow: `0 0 0 2px ${accent}8c`,
      }}
      aria-hidden
    >
      {showImg ? (
        <img
          src={url!}
          alt=""
          className="h-full w-full object-cover object-top"
          draggable={false}
          onError={() => setBroken(true)}
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center text-[10px] font-extrabold tracking-wide"
          style={{ color: accent }}
        >
          {initials(playerName)}
        </span>
      )}
    </div>
  );
}
