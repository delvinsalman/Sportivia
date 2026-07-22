import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Check, Swords, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Sport } from '../types';
import type { DuelLobbyState, DuelPlayerInfo } from '../lib/duelTypes';
import type { DuelConnectionStatus } from '../hooks/useDuel';
import { SportBackground } from './SportBackground';
import { SportBall } from './SportBall';
import { SPORT_ACCENT, SPORT_LABEL } from '../lib/sportTheme';

interface LobbyScreenProps {
  sport: Sport;
  status: DuelConnectionStatus;
  error: string | null;
  lobby: DuelLobbyState | null;
  you: DuelPlayerInfo | null;
  onBack: () => void;
  onCreate: () => void;
  onJoin: (code: string) => void;
  onReady: (ready: boolean) => void;
  onLeave: () => void;
  onSetWager: (stake: {
    cardKey: string | null;
    cardName?: string | null;
    cardRarity?: string | null;
    cardRating?: number | null;
  }) => void;
}

function onAccentFg(color: string) {
  return color === '#f4f4f5' || color === '#f0b232' ? '#18191c' : '#ffffff';
}

export function LobbyScreen({
  sport,
  status,
  error,
  lobby,
  you,
  onBack,
  onCreate,
  onJoin,
  onReady,
  onLeave,
  onSetWager,
}: LobbyScreenProps) {
  const accent = SPORT_ACCENT[sport];
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);

  const inLobby = !!lobby;
  const bothHere = !!lobby && lobby.players.length === 2;
  const bothReady =
    bothHere && lobby.players.every(p => p.ready && p.wagerDecided);

  // Auto-skip card stakes so the ready gate still works without stake UI.
  useEffect(() => {
    if (!lobby || you?.wagerDecided) return;
    onSetWager({ cardKey: null });
  }, [lobby, you?.wagerDecided, onSetWager]);

  async function copyCode() {
    if (!lobby?.code) return;
    await navigator.clipboard.writeText(lobby.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function handleBack() {
    onLeave();
    onBack();
  }

  return (
    <div className="relative h-svh overflow-hidden">
      <SportBackground sport={sport} />

      <div className="relative z-10 flex h-svh flex-col">
        <header className="flex shrink-0 items-center justify-between gap-2 bg-transparent px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))] sm:px-5">
          <button
            type="button"
            onClick={handleBack}
            className="flex min-h-11 items-center gap-2 rounded-full border-[2.5px] border-[#3f4147] bg-[#1e1f22] px-3 py-2 text-sm font-black text-[#b5bac1] shadow-[0_3px_0_#1a1b1f] transition-all hover:translate-y-[1px] hover:text-[#f2f3f5] hover:shadow-[0_2px_0_#1a1b1f]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border-[3px] border-[#ff8a8c] bg-[#ed4245] shadow-[0_3px_0_#8f1e22]">
              <Swords className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-black text-[#f2f3f5]">1v1 Duel</h1>
          </div>
          <div
            className={`flex items-center gap-1.5 rounded-full border-2 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
              status === 'connected'
                ? 'border-[#4ade80] bg-[#23a559] text-white shadow-[0_2px_0_#14532d]'
                : 'border-[#3f4147] bg-[#1e1f22] text-[#949ba4] shadow-[0_2px_0_#1a1b1f]'
            }`}
          >
            {status === 'connected' ? (
              <Wifi className="h-3.5 w-3.5" />
            ) : (
              <WifiOff className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {status === 'connected' ? 'Live' : status === 'connecting' ? 'Connecting…' : 'Offline'}
            </span>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 items-center justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
          {!inLobby ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md rounded-[28px] border-[3px] border-[#ed4245]/70 bg-[#121316]/95 p-5 shadow-[0_9px_0_#8f1e22] backdrop-blur-md sm:p-6"
            >
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border-2 border-[#ff6b6e] bg-[#ed4245] px-3 py-1 shadow-[0_3px_0_#8f1e22]">
                <SportBall sport={sport} size={14} />
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white">
                  {SPORT_LABEL[sport]} duel
                </p>
              </div>
              <h2 className="mb-1 text-2xl font-black text-[#f2f3f5]">Challenge a friend</h2>
              <p className="mb-5 text-sm font-semibold text-[#949ba4]">
                Share a code, ready up together, and the highest score wins.
              </p>

              {error && (
                <div className="mb-4 rounded-2xl border-[3px] border-[#ed4245]/60 bg-[#ed4245]/10 px-3 py-2.5 text-sm font-semibold text-[#f98998] shadow-[0_3px_0_#8f1e22]">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={onCreate}
                  disabled={status === 'connecting'}
                  className="w-full rounded-2xl border-[3px] border-white/25 py-3.5 text-sm font-black transition-all hover:translate-y-[1px] disabled:opacity-50"
                  style={{
                    background: accent,
                    color: onAccentFg(accent),
                    boxShadow: `0 5px 0 ${accent === '#f4f4f5' ? '#8a8a8f' : `${accent}99`}`,
                  }}
                >
                  {status === 'connecting' ? 'Connecting…' : 'Create lobby'}
                </button>
                <div className="flex gap-2">
                  <input
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value.toUpperCase())}
                    onFocus={e => {
                      requestAnimationFrame(() => {
                        e.target.scrollIntoView({ block: 'center', behavior: 'smooth' });
                      });
                    }}
                    placeholder="CODE"
                    maxLength={6}
                    className="min-h-12 flex-1 rounded-2xl border-[3px] border-[#3f4147] bg-[#1e1f22] px-4 py-3 text-center text-sm font-black uppercase tracking-[0.2em] text-[#f2f3f5] outline-none focus:border-[#ed4245]"
                  />
                  <button
                    type="button"
                    onClick={() => onJoin(joinCode)}
                    disabled={joinCode.trim().length < 4 || status === 'connecting'}
                    className="min-h-12 rounded-2xl border-[3px] border-[#3f4147] bg-[#1e1f22] px-4 py-3 text-sm font-black text-[#f2f3f5] disabled:opacity-40"
                  >
                    Join
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex h-[min(420px,72svh)] w-full max-w-lg flex-col overflow-hidden rounded-[24px] border-[3px] border-[#ed4245]/70 bg-[#121316]/95 shadow-[0_7px_0_#8f1e22] backdrop-blur-md"
            >
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-3 py-2 sm:px-4">
                <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#ff6b6e] bg-[#ed4245] px-2.5 py-0.5 shadow-[0_2px_0_#8f1e22]">
                  <SportBall sport={sport} size={12} />
                  <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white">
                    {SPORT_LABEL[sport]}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copyCode}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border-[2.5px] border-[#3f4147] bg-[#1a1b1f] px-3 py-1.5 shadow-[0_3px_0_#0c0d0f] transition-all hover:border-[#5c5e66]"
                  title="Copy lobby code"
                >
                  <span className="font-mono text-base font-black tracking-[0.18em] text-[#f2f3f5] sm:text-lg">
                    {lobby.code}
                  </span>
                  {copied ? (
                    <Check className="h-4 w-4 text-[#23a559]" />
                  ) : (
                    <Copy className="h-4 w-4 text-[#949ba4]" />
                  )}
                </button>
              </div>

              {error && (
                <div className="mx-3 mt-2 shrink-0 rounded-xl border-2 border-[#ed4245]/50 bg-[#ed4245]/10 px-2.5 py-1.5 text-[11px] font-semibold text-[#f98998] sm:mx-4">
                  {error}
                </div>
              )}

              <div className="flex min-h-0 flex-1 flex-col gap-3 px-3 py-3 sm:px-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6d6f78]">
                  Players · {lobby.players.length}/2
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1].map(slot => {
                    const p = lobby.players[slot];
                    if (!p) {
                      return (
                        <div
                          key={`empty-${slot}`}
                          className="rounded-xl border-[2.5px] border-dashed border-[#2b2d31] bg-[#151619]/80 px-2.5 py-3"
                        >
                          <p className="text-[10px] font-black uppercase tracking-wide text-[#5c5e66]">
                            Waiting…
                          </p>
                          <p className="mt-1 text-xs font-semibold text-[#3f4147]">Open slot</p>
                        </div>
                      );
                    }
                    const isYou = p.id === lobby.youId;
                    return (
                      <div
                        key={p.id}
                        className="rounded-xl border-[2.5px] border-[#2b2d31] bg-[#151619] px-2.5 py-3 shadow-[0_2px_0_#0c0d0f]"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <p className="min-w-0 truncate text-xs font-black text-[#f2f3f5]">
                            {p.name}
                            {isYou ? ' · you' : ''}
                          </p>
                          <span
                            className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[8px] font-black ${
                              p.ready
                                ? 'border-[#4ade80] bg-[#23a559] text-white'
                                : 'border-[#3f4147] bg-[#1e1f22] text-[#5c5e66]'
                            }`}
                          >
                            {p.ready ? 'READY' : 'WAIT'}
                          </span>
                        </div>
                        {p.id === lobby.hostId && (
                          <span className="mt-1 inline-block rounded-full border border-[#8b93ff] bg-[#5865f2] px-1.5 py-0.5 text-[8px] font-black text-white">
                            HOST
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!bothHere && (
                  <div className="mt-auto rounded-xl border border-white/10 bg-[#151619]/80 px-3 py-4 text-center">
                    <p className="text-sm font-black text-[#f2f3f5]">Waiting for opponent</p>
                    <p className="mt-1 text-xs font-semibold text-[#6d6f78]">
                      Share the code above.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2 border-t border-white/10 px-3 py-2.5 sm:px-4">
                {bothReady ? (
                  <p className="flex-1 py-2 text-center text-sm font-black text-[#4ade80]">
                    Both ready — starting duel…
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => onReady(!you?.ready)}
                    disabled={!bothHere || !you?.wagerDecided}
                    className={`min-h-11 flex-1 rounded-2xl border-[3px] py-2.5 text-sm font-black transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                      you?.ready
                        ? 'border-[#3f4147] bg-[#2b2d31] text-[#b5bac1] shadow-[0_4px_0_#1a1b1f]'
                        : 'border-white/25 hover:translate-y-[1px]'
                    }`}
                    style={
                      you?.ready
                        ? undefined
                        : {
                            background: accent,
                            color: onAccentFg(accent),
                            boxShadow: `0 5px 0 ${accent === '#f4f4f5' ? '#8a8a8f' : `${accent}99`}`,
                          }
                    }
                  >
                    {!bothHere
                      ? 'Waiting for opponent'
                      : you?.ready
                        ? 'Cancel ready'
                        : 'Ready up'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleBack}
                  className="min-h-11 shrink-0 px-3 text-xs font-black text-[#6d6f78] transition-colors hover:text-[#f2f3f5]"
                >
                  Leave
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
