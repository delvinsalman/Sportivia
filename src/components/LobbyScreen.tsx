import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Check, Swords, Users, Wifi, WifiOff } from 'lucide-react';
import { useState } from 'react';
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
}: LobbyScreenProps) {
  const accent = SPORT_ACCENT[sport];
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);

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

  const inLobby = !!lobby;
  const bothReady =
    !!lobby &&
    lobby.players.length === 2 &&
    lobby.players.every(p => p.ready);

  return (
    <div className="relative h-svh overflow-hidden">
      <SportBackground sport={sport} />

      <div className="relative z-10 h-svh flex flex-col">
        <header className="shrink-0 flex items-center justify-between px-5 py-4 border-b-[3px] border-[#2b2d31] bg-[#0a0a0b]/80 backdrop-blur-md">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-black text-[#b5bac1] hover:text-[#f2f3f5] bg-[#1e1f22] border-[2.5px] border-[#3f4147] shadow-[0_3px_0_#1a1b1f] hover:translate-y-[1px] hover:shadow-[0_2px_0_#1a1b1f] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#ed4245] border-[3px] border-[#ff8a8c] flex items-center justify-center shadow-[0_3px_0_#8f1e22]">
              <Swords className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-black text-[#f2f3f5]">1v1 Duel</h1>
          </div>
          <div
            className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full border-2 ${
              status === 'connected'
                ? 'bg-[#23a559] text-white border-[#4ade80] shadow-[0_2px_0_#14532d]'
                : 'bg-[#1e1f22] text-[#949ba4] border-[#3f4147] shadow-[0_2px_0_#1a1b1f]'
            }`}
          >
            {status === 'connected' ? (
              <Wifi className="w-3.5 h-3.5" />
            ) : (
              <WifiOff className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {status === 'connected' ? 'Live' : status === 'connecting' ? 'Connecting…' : 'Offline'}
            </span>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-[28px] border-[3px] border-[#ed4245]/70 bg-[#121316]/95 backdrop-blur-md p-5 sm:p-6 shadow-[0_9px_0_#8f1e22]"
          >
            <div className="inline-flex items-center gap-1.5 mb-3 px-3 py-1 rounded-full bg-[#ed4245] border-2 border-[#ff6b6e] shadow-[0_3px_0_#8f1e22]">
              <SportBall sport={sport} size={14} />
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white">
                {SPORT_LABEL[sport]} duel
              </p>
            </div>
            <h2 className="text-2xl font-black text-[#f2f3f5] mb-1">Challenge a friend</h2>
            <p className="text-sm font-semibold text-[#949ba4] mb-5">
              Create a lobby, share the code, both ready up — same board, highest score wins.
            </p>

            {error && (
              <div className="mb-4 rounded-2xl border-[3px] border-[#ed4245]/60 bg-[#ed4245]/10 px-3 py-2.5 text-sm font-semibold text-[#f98998] shadow-[0_3px_0_#8f1e22]">
                {error}
              </div>
            )}

            {!inLobby ? (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={onCreate}
                  disabled={status === 'connecting'}
                  className="w-full py-3.5 rounded-2xl text-sm font-black border-[3px] border-white/25 transition-all disabled:opacity-60 hover:translate-y-[1px]"
                  style={{
                    background: accent,
                    color: onAccentFg(accent),
                    boxShadow: `0 5px 0 ${accent === '#f4f4f5' ? '#8a8a8f' : `${accent}99`}`,
                  }}
                >
                  {status === 'connecting' ? 'Connecting…' : 'Create lobby'}
                </button>

                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#5c5e66]">
                  <div className="flex-1 h-[3px] bg-[#2b2d31] rounded-full" />
                  or join
                  <div className="flex-1 h-[3px] bg-[#2b2d31] rounded-full" />
                </div>

                <div className="flex gap-2">
                  <input
                    value={joinCode}
                    onChange={e =>
                      setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))
                    }
                    placeholder="CODE"
                    maxLength={6}
                    className="flex-1 rounded-2xl bg-[#1e1f22] border-[3px] border-[#3f4147] px-4 py-3 text-center text-lg font-black tracking-[0.3em] text-[#f2f3f5] outline-none focus:border-[#5865f2] shadow-[0_4px_0_#1a1b1f]"
                  />
                  <button
                    type="button"
                    onClick={() => onJoin(joinCode)}
                    disabled={joinCode.length < 4 || status === 'connecting'}
                    className="px-5 rounded-2xl bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-40 disabled:cursor-not-allowed text-sm font-black text-white border-[3px] border-white/25 shadow-[0_4px_0_#2f3aa8] hover:translate-y-[1px] hover:shadow-[0_3px_0_#2f3aa8] transition-all"
                  >
                    Join
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-[22px] border-[3px] border-[#3f4147] bg-[#0c0d10] p-4 text-center shadow-[0_5px_0_#0a0a0b]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#6d6f78] mb-1">Lobby code</p>
                  <div className="flex items-center justify-center gap-2">
                    {lobby.code.split('').map((ch, i) => (
                      <span
                        key={`${ch}-${i}`}
                        className="w-10 h-12 sm:w-11 sm:h-14 rounded-2xl bg-[#1e1f24] border-[3px] border-[#ed4245] flex items-center justify-center text-xl sm:text-2xl font-black text-white shadow-[0_4px_0_#8f1e22]"
                      >
                        {ch}
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={copyCode}
                      className="p-2.5 rounded-xl border-[2.5px] border-[#3f4147] bg-[#1e1f22] hover:bg-[#2b2d31] text-[#949ba4] shadow-[0_3px_0_#1a1b1f] transition-all"
                      title="Copy code"
                    >
                      {copied ? <Check className="w-4 h-4 text-[#23a559]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] font-semibold text-[#6d6f78] mt-3">Share this code with your opponent</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-[#949ba4] uppercase tracking-wide">
                    <Users className="w-3.5 h-3.5" />
                    Players ({lobby.players.length}/2)
                  </div>
                  {lobby.players.map(p => {
                    const isYou = p.id === lobby.youId;
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between rounded-2xl border-[3px] border-[#2b2d31] bg-[#151619] px-3.5 py-2.5 shadow-[0_3px_0_#0c0d0f]"
                      >
                        <div>
                          <p className="text-sm font-black text-[#f2f3f5]">
                            {p.name}
                            {isYou && <span className="text-[#6d6f78] font-bold"> (you)</span>}
                            {p.id === lobby.hostId && (
                              <span className="ml-2 text-[9px] px-2 py-0.5 rounded-full bg-[#5865f2] text-white font-black border-2 border-[#8b93ff] shadow-[0_2px_0_#2f3aa8]">
                                HOST
                              </span>
                            )}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded-full border-2 ${
                            p.ready
                              ? 'bg-[#23a559] text-white border-[#4ade80] shadow-[0_2px_0_#14532d]'
                              : 'bg-[#1e1f22] text-[#5c5e66] border-[#3f4147]'
                          }`}
                        >
                          {p.ready ? 'READY' : 'WAITING'}
                        </span>
                      </div>
                    );
                  })}
                  {lobby.players.length < 2 && (
                    <p className="text-center text-xs font-semibold text-[#5c5e66] py-2">Waiting for opponent to join…</p>
                  )}
                </div>

                {bothReady ? (
                  <p className="text-center text-sm font-black text-[#4ade80]">Both ready — starting duel…</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => onReady(!you?.ready)}
                    disabled={lobby.players.length < 2}
                    className={`w-full py-3.5 rounded-2xl text-sm font-black border-[3px] transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      you?.ready
                        ? 'bg-[#2b2d31] text-[#b5bac1] border-[#3f4147] shadow-[0_4px_0_#1a1b1f]'
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
                    {you?.ready ? 'Cancel ready' : 'Ready up'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full py-2.5 rounded-2xl text-sm font-black text-[#949ba4] hover:text-[#f2f3f5] border-[2.5px] border-transparent hover:border-[#3f4147] hover:bg-[#1e1f22] transition-all"
                >
                  Leave lobby
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
