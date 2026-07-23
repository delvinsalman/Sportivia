import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, RotateCcw, Home, Sparkles, Zap } from 'lucide-react';
import { CoinIcon } from './CoinIcon';
import type { GameResult } from '../types';
import { generateShareText } from '../lib/roundEngine';
import { SportBall } from './SportBall';
import { CharacterPodium } from './3d/CharacterPodium';
import { SPORT_PODIUM_ACCENT } from '../lib/sportTheme';
import { getCharacterDef, getPetDef } from '../types/profile';
import type { CharacterId, PetId, RabbitVariantId, MakoVariantId, DogVariantId } from '../types/profile';
import type { CreativeLoadout } from '../types/creativeCharacter';
import type { AthleteLoadout } from '../types/athleteCharacter';
import type { BobLoadout } from '../types/bobCharacter';

interface ResultModalProps {
  result: GameResult;
  characterId: CharacterId;
  petId?: PetId | null;
  creativeLoadout?: CreativeLoadout;
  athleteLoadout?: AthleteLoadout;
  bobLoadout?: BobLoadout;
  rabbitVariant?: RabbitVariantId;
  makoVariant?: MakoVariantId;
  dogVariant?: DogVariantId;
  onPlayAgain: () => void;
  onHome: () => void;
  waitingForOpponent?: boolean;
}

const modeLabels: Record<GameResult['mode'], string> = {
  training: 'Training',
  daily: 'Daily Challenge',
  timed: 'Ranked',
  bot: 'Vs AI',
  duel: '1v1 Duel',
};

export function ResultModal({
  result,
  characterId,
  petId,
  creativeLoadout,
  athleteLoadout,
  bobLoadout,
  rabbitVariant,
  makoVariant,
  dogVariant,
  onPlayAgain,
  onHome,
  waitingForOpponent = false,
}: ResultModalProps) {
  const [copied, setCopied] = useState(false);
  const rewards = result.rewards;
  const character = getCharacterDef(characterId);
  const pet = petId ? getPetDef(petId) : null;
  const accent = SPORT_PODIUM_ACCENT[result.sport];
  const duel = result.duel;

  const shareText = generateShareText(
    result.sport, result.mode, result.score, result.correct, result.boardFilled, result.date,
  );

  const title = duel
    ? waitingForOpponent
      ? 'Waiting for opponent…'
      : duel.outcome === 'win'
        ? 'You Win!'
        : duel.outcome === 'loss'
          ? 'You Lose'
          : duel.outcome === 'draw'
            ? 'Draw!'
            : "Time's Up!"
    : rewards?.leveledUp
      ? `Level ${rewards.newLevel}!`
      : result.perfectBoard
        ? 'Perfect Board!'
        : result.completed
          ? "Time's Up!"
          : 'Run Ended';

  async function handleShare() {
    try {
      if (navigator.share) await navigator.share({ text: shareText });
      else { await navigator.clipboard.writeText(shareText); setCopied(true); }
    } catch {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
    }
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 min-h-svh overflow-y-auto overflow-x-hidden bg-[#0a0a0b]"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 20% 40%, ${accent}18 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 85% 80%, ${accent}10 0%, transparent 50%)`,
        }}
      />

      <div className="relative z-10 min-h-svh flex flex-col md:flex-row">
        {/* Character hero — compact on phones so stats stay visible */}
        <div
          className="relative md:w-[44%] lg:w-[42%] min-h-[200px] max-h-[38svh] md:max-h-none md:min-h-svh flex flex-col items-center justify-center shrink-0 border-b md:border-b-0 md:border-r border-[#2b2d31]/80 px-3 py-5 pt-[max(1.25rem,env(safe-area-inset-top))] md:px-4 md:py-10"
          style={{ background: `radial-gradient(ellipse 80% 60% at 50% 55%, ${accent}22 0%, #0a0a0b 70%)` }}
        >
          <div className="absolute top-[max(0.75rem,env(safe-area-inset-top))] left-3 md:top-5 md:left-5 flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#1e1f22] border-[2.5px] border-[#3f4147] shadow-[0_3px_0_#0c0d0f]">
            <SportBall sport={result.sport} size={18} />
            <span className="text-[10px] font-black text-[#949ba4] uppercase tracking-widest">
              {modeLabels[result.mode]}
            </span>
          </div>

          <div className="relative w-full max-w-[280px] md:max-w-[480px] scale-[0.78] md:scale-100 origin-center">
            <div className="relative mx-auto w-[72%] max-w-[360px]">
              <CharacterPodium
                characterId={characterId}
                accent={accent}
                bare
                hero
                height={340}
                className="w-full"
                sport={result.sport}
                {...(characterId === 'creative' && creativeLoadout
                  ? { creativeLoadout }
                  : {})}
                {...(characterId === 'athlete' && athleteLoadout
                  ? { athleteLoadout }
                  : {})}
                {...(characterId === 'bob' && bobLoadout ? { bobLoadout } : {})}
                {...(characterId === 'bunny' && rabbitVariant
                  ? { rabbitVariant }
                  : {})}
                {...(characterId === 'mako' && makoVariant
                  ? { makoVariant }
                  : {})}
              />
            </div>
            {petId && pet && (
              <div className="absolute left-[54%] bottom-0 w-[40%] max-w-[200px] md:max-w-[220px] pointer-events-none">
                <CharacterPodium
                  petId={petId}
                  accent={pet.accent}
                  bare
                  hero
                  hidePodium
                  height={260}
                  className="w-full"
                  {...(petId === 'dog' && dogVariant ? { dogVariant } : {})}
                />
              </div>
            )}
          </div>
          <p className="mt-1 md:mt-4 text-xs md:text-sm font-semibold text-[#949ba4]">
            {character.name}{pet ? ` · ${pet.name}` : ''}
          </p>
        </div>

        {/* Stats panel */}
        <div className="flex-1 flex flex-col justify-center px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-10 lg:px-14 max-w-2xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.35 }}
          >
            <div className="mb-5">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#f2f3f5] tracking-tight">
                {title}
              </h2>
              <p className="text-sm sm:text-base font-semibold text-[#949ba4] mt-2">
                {result.correct} correct · {result.wrong} wrong · best streak {result.maxStreak}
              </p>
              {duel && (
                <p className="text-sm sm:text-base mt-2 font-black" style={{ color: accent }}>
                  You {result.score} — {duel.opponentScore} {duel.opponentName}
                  {waitingForOpponent ? ' · waiting…' : ''}
                </p>
              )}
              {result.coinStake && result.coinStake.amount > 0 && (
                <p
                  className={`mt-2 text-sm font-black ${
                    result.coinStake.net > 0
                      ? 'text-[#4ade80]'
                      : result.coinStake.net < 0
                        ? 'text-[#ed4245]'
                        : 'text-[#f0b232]'
                  }`}
                >
                  Stake {result.coinStake.label}
                </p>
              )}
              {!result.completed && (
                <p className="text-xs text-[#ed4245] mt-2 font-black">
                  Quit early — no coins or XP earned
                </p>
              )}
              {result.completed && result.mode === 'training' && (
                <p className="text-xs text-[#949ba4] mt-2 font-semibold">
                  Practice mode — score doesn&apos;t earn coins or XP
                </p>
              )}
            </div>

            <div className="mb-6">
              <p className="text-5xl sm:text-7xl font-black text-[#f0b232] font-mono leading-none drop-shadow-[0_4px_0_#8a6814]">
                {result.score}
              </p>
              <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-[#949ba4]">Final Score</p>
            </div>

            {rewards && (
              <div className="mb-5 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 rounded-[22px] border-[3px] border-[#f0b232]/75 bg-[#1a160c] p-4 shadow-[0_5px_0_#8a6814] sm:p-5">
                  <div className="flex h-11 w-11 items-center justify-center drop-shadow-[0_3px_0_rgba(0,0,0,0.4)]">
                    <CoinIcon size={40} />
                  </div>
                  <div>
                    <p className="font-mono text-xl font-black text-[#f0b232] sm:text-2xl">
                      +{rewards.coinsEarned}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-wide text-[#949ba4]">Coins</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-[22px] border-[3px] border-[#5865f2]/75 bg-[#12152a] p-4 shadow-[0_5px_0_#2f3aa8] sm:p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border-[3px] border-white/25 bg-[#5865f2] shadow-[0_3px_0_#2f3aa8]">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-mono text-xl font-black text-[#5865f2] sm:text-2xl">
                      +{rewards.xpEarned}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-wide text-[#949ba4]">XP</p>
                  </div>
                </div>
              </div>
            )}

            {rewards?.leveledUp && (
              <div className="mb-5 flex flex-col gap-1.5 rounded-2xl border-[3px] border-[#5865f2]/60 bg-[#5865f2]/15 px-4 py-2.5 shadow-[0_4px_0_#2f3aa8]">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 shrink-0 text-[#5865f2]" />
                  <span className="text-sm font-black text-[#b5bac1]">
                    Leveled up to <strong className="text-[#f2f3f5]">{rewards.newLevel}</strong>
                  </span>
                </div>
                {(rewards.milestoneBonus ?? 0) > 0 && (
                  <p className="pl-6 text-xs font-black text-[#f0b232]">
                    Milestone bonus +{rewards.milestoneBonus!.toLocaleString()} coins
                  </p>
                )}
              </div>
            )}

            <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { label: 'Filled', value: `${result.boardFilled}/9` },
                { label: 'Skipped', value: result.skipped },
                {
                  label: 'Accuracy',
                  value:
                    result.correct + result.wrong > 0
                      ? `${Math.round((result.correct / (result.correct + result.wrong)) * 100)}%`
                      : '—',
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-2xl border-[3px] border-[#3f4147] bg-[#1a1b1f] p-3 text-center shadow-[0_4px_0_#0c0d0f] sm:p-4"
                >
                  <p className="text-sm font-black text-[#f2f3f5] sm:text-base">{value}</p>
                  <p className="mt-0.5 text-[9px] font-black uppercase tracking-wide text-[#949ba4]">{label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleShare}
                className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border-[3px] border-[#3f4147] bg-[#1e1f22] py-3.5 text-sm font-black text-[#f2f3f5] shadow-[0_4px_0_#0c0d0f] transition-all hover:translate-y-[1px] hover:bg-[#2b2d31] hover:shadow-[0_3px_0_#0c0d0f]"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
              </button>
              <button
                type="button"
                onClick={onPlayAgain}
                disabled={waitingForOpponent}
                className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border-[3px] border-white/25 bg-[#23a559] py-3.5 text-sm font-black text-white shadow-[0_5px_0_#14532d] transition-all hover:translate-y-[1px] hover:bg-[#1a7d43] hover:shadow-[0_4px_0_#14532d] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw className="h-4 w-4" />
                {result.mode === 'duel' ? 'Rematch' : 'Again'}
              </button>
              <button
                type="button"
                onClick={onHome}
                className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border-[3px] border-[#3f4147] bg-[#1e1f22] py-3.5 text-sm font-black text-[#949ba4] shadow-[0_4px_0_#0c0d0f] transition-all hover:translate-y-[1px] hover:bg-[#2b2d31] hover:text-[#f2f3f5] hover:shadow-[0_3px_0_#0c0d0f]"
              >
                <Home className="h-4 w-4" />
                Menu
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
