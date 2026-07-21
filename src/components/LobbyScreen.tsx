import { motion } from 'framer-motion';
import { ArrowLeft, Ban, Copy, Check, Swords, Users, Wifi, WifiOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Sport } from '../types';
import type { DuelLobbyState, DuelPlayerInfo } from '../lib/duelTypes';
import type { DuelConnectionStatus } from '../hooks/useDuel';
import type { PlayerProfile } from '../types/profile';
import type { CardRarity, CollectibleCard } from '../types/cards';
import { ownedCardsForSport, toWagerStake } from '../lib/cardWager';
import { cardDisplayName } from '../lib/cardCatalog';
import { SportBackground } from './SportBackground';
import { SportBall } from './SportBall';
import { SPORT_ACCENT, SPORT_LABEL } from '../lib/sportTheme';
import { playMenuClick } from '../lib/menuAudio';

const RARITY_COLOR: Record<CardRarity, string> = {
  common: '#94a3b8',
  rare: '#60a5fa',
  epic: '#c084fc',
  legendary: '#f0b232',
};

interface LobbyScreenProps {
  sport: Sport;
  status: DuelConnectionStatus;
  error: string | null;
  lobby: DuelLobbyState | null;
  you: DuelPlayerInfo | null;
  profile: PlayerProfile;
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

function wagerLabel(player: DuelPlayerInfo) {
  if (!player.wagerDecided) return 'Stake pending';
  if (!player.wagerCardKey) return 'No stake';
  return player.wagerCardName ?? 'Card staked';
}

export function LobbyScreen({
  sport,
  status,
  error,
  lobby,
  you,
  profile,
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
  const [selected, setSelected] = useState<CollectibleCard | null>(null);

  const owned = useMemo(
    () => ownedCardsForSport(profile.cardCollection.owned, sport),
    [profile.cardCollection.owned, sport],
  );

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
    lobby.players.every(p => p.ready && p.wagerDecided);

  function submitSkipWager() {
    playMenuClick();
    setSelected(null);
    onSetWager({ cardKey: null });
  }

  function submitCardWager(card: CollectibleCard) {
    playMenuClick();
    const stake = toWagerStake(card);
    setSelected(card);
    onSetWager({
      cardKey: stake.cardKey,
      cardName: stake.name,
      cardRarity: stake.rarity,
      cardRating: stake.rating,
    });
  }

  return (
    <div className="relative h-svh overflow-hidden">
      <SportBackground sport={sport} />

      <div className="relative z-10 h-svh flex flex-col">
        <header className="shrink-0 flex items-center justify-between px-5 py-4 bg-transparent">
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

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain flex items-center justify-center px-4 py-4 sm:py-6">
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
              Share a code, optionally stake a card, then ready up — winner takes the loser&apos;s card.
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
                  className="w-full py-3.5 rounded-2xl text-sm font-black border-[3px] border-white/25 hover:translate-y-[1px] transition-all disabled:opacity-50"
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
                    placeholder="CODE"
                    maxLength={6}
                    className="flex-1 rounded-2xl border-[3px] border-[#3f4147] bg-[#1e1f22] px-4 py-3 text-center text-sm font-black tracking-[0.2em] text-[#f2f3f5] uppercase outline-none focus:border-[#ed4245]"
                  />
                  <button
                    type="button"
                    onClick={() => onJoin(joinCode)}
                    disabled={joinCode.trim().length < 4 || status === 'connecting'}
                    className="rounded-2xl border-[3px] border-[#3f4147] bg-[#1e1f22] px-4 py-3 text-sm font-black text-[#f2f3f5] disabled:opacity-40"
                  >
                    Join
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border-[3px] border-[#2b2d31] bg-[#151619] px-4 py-3 shadow-[0_3px_0_#0c0d0f]">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6d6f78]">Lobby code</p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="flex-1 font-mono text-2xl font-black tracking-[0.2em] text-[#f2f3f5]">
                      {lobby.code}
                    </p>
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
                          <p
                            className="mt-0.5 text-[10px] font-black uppercase tracking-wide"
                            style={{
                              color: p.wagerCardRarity
                                ? RARITY_COLOR[p.wagerCardRarity as CardRarity] ?? '#949ba4'
                                : '#6d6f78',
                            }}
                          >
                            {wagerLabel(p)}
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

                {lobby.players.length === 2 && (
                  <div className="rounded-2xl border-[3px] border-[#2b2d31] bg-[#151619] p-3 shadow-[0_3px_0_#0c0d0f]">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6d6f78] mb-2">
                      Card stake (optional)
                    </p>
                    <p className="text-[11px] font-semibold text-[#949ba4] mb-3">
                      Both must stake a card for a trade. If either skips, no cards change hands.
                    </p>
                    {owned.length === 0 ? (
                      <button
                        type="button"
                        onClick={submitSkipWager}
                        className="w-full rounded-xl border-[2.5px] border-[#3f4147] bg-[#1e1f22] py-2.5 text-xs font-black text-[#b5bac1]"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Ban className="w-3.5 h-3.5" />
                          No cards — skip stake
                        </span>
                      </button>
                    ) : (
                      <>
                        <div className="max-h-36 space-y-1.5 overflow-y-auto mb-2">
                          {owned.slice(0, 24).map(card => {
                            const active = (you?.wagerCardKey ?? selected?.key) === card.key;
                            return (
                              <button
                                key={card.key}
                                type="button"
                                onClick={() => submitCardWager(card)}
                                className={`flex w-full items-center justify-between rounded-xl border px-2.5 py-2 text-left ${
                                  active
                                    ? 'border-[#f0b232]/70 bg-[#f0b232]/12'
                                    : 'border-[#2b2d31] bg-[#1a1b1f] hover:border-[#3f4147]'
                                }`}
                              >
                                <span className="min-w-0 truncate pr-2 text-xs font-black text-[#f2f3f5]" title={card.name}>
                                  {cardDisplayName(card)}
                                </span>
                                <span
                                  className="text-[9px] font-black uppercase"
                                  style={{ color: RARITY_COLOR[card.rarity] }}
                                >
                                  {card.rarity}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          onClick={submitSkipWager}
                          className={`w-full rounded-xl border-[2.5px] py-2 text-xs font-black ${
                            you?.wagerDecided && !you.wagerCardKey
                              ? 'border-[#f0b232]/50 bg-[#f0b232]/10 text-[#f0b232]'
                              : 'border-[#3f4147] bg-[#1e1f22] text-[#b5bac1]'
                          }`}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <Ban className="w-3.5 h-3.5" />
                            No stake
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                )}

                {bothReady ? (
                  <p className="text-center text-sm font-black text-[#4ade80]">Both ready — starting duel…</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => onReady(!you?.ready)}
                    disabled={lobby.players.length < 2 || !you?.wagerDecided}
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
                    {!you?.wagerDecided
                      ? 'Pick stake first'
                      : you?.ready
                        ? 'Cancel ready'
                        : 'Ready up'}
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
