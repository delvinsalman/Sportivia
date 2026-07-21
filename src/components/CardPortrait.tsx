import { useCallback, useEffect, useRef, useState } from 'react';
import type { Sport } from '../types';
import {
  getCachedPlayerFace,
  invalidatePlayerFace,
  resolvePlayerFace,
} from '../lib/playerFaces';

interface CardPortraitProps {
  sport: Sport;
  playerId: string;
  playerName: string;
  disabled?: boolean;
  initialsClassName?: string;
  imgClassName?: string;
  className?: string;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[parts.length - 1]![0] ?? ''}`.toUpperCase();
}

/** Large card portrait with initials fallback and broken-URL recovery. */
export function CardPortrait({
  sport,
  playerId,
  playerName,
  disabled = false,
  initialsClassName = 'text-5xl font-black text-white/15',
  imgClassName = 'absolute inset-0 h-full w-full object-contain object-bottom drop-shadow-[0_8px_10px_rgba(0,0,0,.75)]',
  className = 'absolute inset-0 flex items-center justify-center',
}: CardPortraitProps) {
  const [face, setFace] = useState<string | null>(
    () => getCachedPlayerFace(sport, playerId) ?? null,
  );
  const retriesRef = useRef(0);

  useEffect(() => {
    if (disabled) return;
    let active = true;
    retriesRef.current = 0;
    const cached = getCachedPlayerFace(sport, playerId);
    if (cached) {
      setFace(cached);
      return;
    }
    setFace(null);
    void resolvePlayerFace(sport, playerId, playerName).then(url => {
      if (active) setFace(url);
    });
    return () => {
      active = false;
    };
  }, [disabled, playerId, playerName, sport]);

  const onError = useCallback(() => {
    if (disabled || retriesRef.current >= 2) {
      setFace(null);
      return;
    }
    retriesRef.current += 1;
    invalidatePlayerFace(sport, playerId);
    void resolvePlayerFace(sport, playerId, playerName, { force: true }).then(url => {
      setFace(url);
    });
  }, [disabled, playerId, playerName, sport]);

  if (disabled) {
    return null;
  }

  if (face) {
    return (
      <img
        src={face}
        alt={playerName}
        className={imgClassName}
        referrerPolicy="no-referrer"
        onError={onError}
      />
    );
  }

  return (
    <div className={className}>
      <span className={initialsClassName}>{initials(playerName)}</span>
    </div>
  );
}
