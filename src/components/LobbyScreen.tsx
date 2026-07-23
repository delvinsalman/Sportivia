import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Check, Swords, Wifi, WifiOff } from 'lucide-react';
import { useState } from 'react';
import type { Sport } from '../types';
import type { DuelLobbyState, DuelPlayerInfo } from '../lib/duelTypes';
import type { DuelConnectionStatus } from '../hooks/useDuel';
import type { PlayerProfile } from '../types/profile';
import { SportBackground } from './SportBackground';
import { SportBall } from './SportBall';
import { CoinIcon } from './CoinIcon';
import { SPORT_ACCENT, SPORT_LABEL } from '../lib/sportTheme';
import { DUEL_STAKE_PRESETS, DUEL_STAKE_MAX, clampDuelStake, formatCoins } from '../lib/coinStake';
import { playMenuClick, playMenuConfirm } from '../lib/menuAudio';

interface LobbyScreenProps {
  sport: Sport;
  profile: PlayerProfile;
  status: DuelConnectionStatus;
  error: string | null;
  lobby: DuelLobbyState | null;
  you: DuelPlayerInfo | null;
  onBack: () => void;
  onCreate: () => void;
  onJoin: (code: string) => void;
  onReady: (ready: boolean) => void;
  onLeave: () => void;
  onSetWager: (stake: { coins: number }) => void;
}

function onAccentFg(color: string) {
  return color === '#f4f4f5' || color === '#f0b232' ? '#18191c' : '#ffffff';
}

export function LobbyScreen({
  sport,
  profile,
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
  const [draftStake, setDraftStake] = useState(0);

  const inLobby = !!lobby;
  const bothHere = !!lobby && lobby.players.length === 2;
  const bothReady =
    bothHere && lobby.players.every(p => p.ready && p.wagerDecided);

  const liveDraft = clampDuelStake(draftStake);
  const canAfford = liveDraft <= profile.coins;
  const presets = DUEL_STAKE_PRESETS;

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

  function lockStake(amount: number) {
    const coins = clampDuelStake(amount);
    if (coins > profile.coins) return;
    playMenuConfirm();
    setDraftStake(coins);
    onSetWager({ coins });
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
                <span className="text-[10px] font-black uppercase tracking-wide text-white">
                  {SPORT_LABEL[sport]}
                </span>
              </div>
              <h2 className="text-2xl font-black text-[#f2f3f5]">Find a rival</h2>
              <p className="mt-1 text-sm font-semibold text-[#949ba4]">
                Optional coin stakes — winner takes the matched pot.
              </p>

              <button
                type="button"
                onClick={onCreate}
                className="mt-5 w-full rounded-2xl border-[3px] border-white/25 bg-[#ed4245] py-3.5 text-sm font-black text-white shadow-[0_5px_0_#8f1e22]"
              >
                Create lobby
              </button>

              <div className="mt-4 flex gap-2">
                <input
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="CODE"
                  maxLength={6}
                  className="min-w-0 flex-1 rounded-2xl border-[2.5px] border-[#3f4147] bg-[#1e1f22] px-3 py-3 text-center font-mono text-sm font-black tracking-[0.2em] text-[#f2f3f5] outline-none"
                />
                <button
                  type="button"
                  onClick={() => onJoin(joinCode.trim())}
                  className="rounded-2xl border-[3px] border-white/20 bg-[#5865f2] px-4 py-3 text-sm font-black text-white shadow-[0_5px_0_#2f3aa8]"
                >
                  Join
                </button>
              </div>

              {error && (
                <div className="mt-3 rounded-xl border-2 border-[#ed4245]/50 bg-[#ed4245]/10 px-2.5 py-1.5 text-[11px] font-semibold text-[#f98998]">
                  {error}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex h-full max-h-[40rem] w-full max-w-md flex-col overflow-hidden rounded-[28px] border-[3px] border-[#ed4245]/70 bg-[#121316]/95 shadow-[0_9px_0_#8f1e22] backdrop-blur-md"
            >
              <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 px-3 py-3 sm:px-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6d6f78]">
                    Lobby code
                  </p>
                  <p className="font-mono text-2xl font-black tracking-[0.18em] text-[#f2f3f5]">
                    {lobby.code}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copyCode}
                  className="flex items-center gap-1.5 rounded-full border-[2.5px] border-[#3f4147] bg-[#1e1f22] px-3 py-2 text-xs font-black text-[#b5bac1]"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-[#4ade80]" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              {error && (
                <div className="mx-3 mt-2 shrink-0 rounded-xl border-2 border-[#ed4245]/50 bg-[#ed4245]/10 px-2.5 py-1.5 text-[11px] font-semibold text-[#f98998] sm:mx-4">
                  {error}
                </div>
              )}

              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-3 sm:px-4">
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
                        <p className="mt-2 flex items-center gap-1 text-[10px] font-black text-[#f0b232]">
                          <CoinIcon size={12} />
                          {p.wagerDecided
                            ? (p.wagerCoins ?? 0) > 0
                              ? formatCoins(p.wagerCoins ?? 0)
                              : 'No stake'
                            : 'Pick stake'}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-2xl border-[2.5px] border-[#3f4147] bg-[#151619] p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6d6f78]">
                    Your stake · optional
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#949ba4]">
                    Pick an amount below. Winner takes the matched pot.
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {presets.map(amount => {
                      const active = you?.wagerDecided && (you.wagerCoins ?? 0) === amount;
                      const lockedOut = amount > profile.coins;
                      return (
                        <button
                          key={amount}
                          type="button"
                          disabled={lockedOut}
                          onClick={() => {
                            playMenuClick();
                            lockStake(amount);
                          }}
                          className={`rounded-2xl border-[2.5px] px-2.5 py-3 text-xs font-black transition-all disabled:cursor-not-allowed disabled:opacity-35 ${
                            active
                              ? 'border-[#f0b232]/80 bg-[#2a2414] text-[#f0b232] shadow-[0_3px_0_#8a6814]'
                              : 'border-[#3f4147] bg-[#1e1f22] text-[#949ba4] hover:text-[#f2f3f5]'
                          }`}
                        >
                          {amount === 0 ? 'No stake' : formatCoins(amount)}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2.5 flex items-center gap-2 rounded-xl border-[2.5px] border-[#3f4147] bg-[#121316] px-3 py-2.5">
                    <CoinIcon size={18} />
                    <input
                      type="number"
                      min={0}
                      max={DUEL_STAKE_MAX}
                      step={50}
                      value={draftStake || ''}
                      placeholder="Custom amount"
                      onChange={e => setDraftStake(Number(e.target.value) || 0)}
                      className="min-w-0 flex-1 bg-transparent font-mono text-sm font-black text-[#f0b232] outline-none placeholder:text-[#5c5e66]"
                    />
                    <button
                      type="button"
                      disabled={!canAfford || liveDraft <= 0}
                      onClick={() => {
                        playMenuClick();
                        lockStake(liveDraft);
                      }}
                      className="shrink-0 rounded-full border-[2.5px] border-[#f0b232]/70 bg-[#2a2414] px-3 py-1.5 text-[10px] font-black text-[#f0b232] disabled:opacity-40"
                    >
                      Set
                    </button>
                  </div>
                  {!canAfford && liveDraft > 0 && (
                    <p className="mt-2 text-[11px] font-black text-[#ed4245]">Not enough coins</p>
                  )}
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
                      : !you?.wagerDecided
                        ? 'Pick a stake first'
                        : you?.ready
                          ? 'Cancel ready'
                          : 'Ready'}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
