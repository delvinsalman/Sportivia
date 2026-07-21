import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, RotateCcw, Home, Sparkles, Coins, Zap } from 'lucide-react';
import type { GameResult } from '../types';
import { generateShareText } from '../lib/roundEngine';
import { SportBall } from './SportBall';
import { CharacterPodium } from './3d/CharacterPodium';
import { SPORT_PODIUM_ACCENT } from '../lib/sportTheme';
import { getCharacterDef, getPetDef } from '../types/profile';
import type { CharacterId, PetId, RabbitVariantId, DogVariantId } from '../types/profile';
import type { CreativeLoadout } from '../types/creativeCharacter';

interface ResultModalProps {
  result: GameResult;
  characterId: CharacterId;
  petId?: PetId | null;
  creativeLoadout?: CreativeLoadout;
  rabbitVariant?: RabbitVariantId;
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
  rabbitVariant,
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
      className="fixed inset-0 z-50 min-h-svh overflow-y-auto bg-[#0a0a0b]"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 20% 40%, ${accent}18 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 85% 80%, ${accent}10 0%, transparent 50%)`,
        }}
      />

      <div className="relative z-10 min-h-svh flex flex-col md:flex-row">
        {/* Character hero — full height on desktop */}
        <div
          className="relative md:w-[44%] lg:w-[42%] min-h-[320px] md:min-h-svh flex flex-col items-center justify-center shrink-0 border-b md:border-b-0 md:border-r border-[#2b2d31]/80 px-4 py-10"
          style={{ background: `radial-gradient(ellipse 80% 60% at 50% 55%, ${accent}22 0%, #0a0a0b 70%)` }}
        >
          <div className="absolute top-5 left-5 flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#1e1f22] border-[2.5px] border-[#3f4147] shadow-[0_3px_0_#0c0d0f]">
            <SportBall sport={result.sport} size={20} />
            <span className="text-[10px] font-black text-[#949ba4] uppercase tracking-widest">
              {modeLabels[result.mode]}
            </span>
          </div>

          <div className="relative w-full max-w-[440px] md:max-w-[480px]">
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
                {...(characterId === 'bunny' && rabbitVariant
                  ? { rabbitVariant }
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
          <p className="mt-4 text-sm font-semibold text-[#949ba4]">
            {character.name}{pet ? ` · ${pet.name}` : ''}
          </p>
        </div>

        {/* Stats panel */}
        <div className="flex-1 flex flex-col justify-center px-6 py-8 sm:px-10 lg:px-14 max-w-2xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.35 }}
          >
            <div className="mb-6">
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
              {result.cardWager?.active && result.cardWager.outcome !== 'none' && !waitingForOpponent && (
                <p
                  className={`text-sm sm:text-base mt-2 font-black ${
                    result.cardWager.outcome === 'win'
                      ? 'text-[#23a559]'
                      : result.cardWager.outcome === 'loss'
                        ? 'text-[#ed4245]'
                        : 'text-[#949ba4]'
                  }`}
                >
                  {result.cardWager.message}
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

            <div className="mb-8">
              <p className="text-6xl sm:text-7xl font-black text-[#f0b232] font-mono leading-none drop-shadow-[0_4px_0_#8a6814]">
                {result.score}
              </p>
              <p className="text-[10px] font-black text-[#949ba4] uppercase tracking-widest mt-2">Final Score</p>
            </div>

            {rewards && (
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-[22px] bg-[#1a160c] p-4 sm:p-5 border-[3px] border-[#f0b232]/75 flex items-center gap-3 shadow-[0_5px_0_#8a6814]">
                  <div className="w-11 h-11 rounded-xl bg-[#f0b232] border-[3px] border-white/30 flex items-center justify-center shadow-[0_3px_0_#8a6814]">
                    <Coins className="w-5 h-5 text-[#18191c]" />
                  </div>
                  <div>
                    <p className="font-black text-[#f0b232] font-mono text-xl sm:text-2xl">
                      +{rewards.coinsEarned}
                    </p>
                    <p className="text-[10px] font-black text-[#949ba4] uppercase tracking-wide">Coins</p>
                  </div>
                </div>
                <div className="rounded-[22px] bg-[#12152a] p-4 sm:p-5 border-[3px] border-[#5865f2]/75 flex items-center gap-3 shadow-[0_5px_0_#2f3aa8]">
                  <div className="w-11 h-11 rounded-xl bg-[#5865f2] border-[3px] border-white/25 flex items-center justify-center shadow-[0_3px_0_#2f3aa8]">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-[#5865f2] font-mono text-xl sm:text-2xl">
                      +{rewards.xpEarned}
                    </p>
                    <p className="text-[10px] font-black text-[#949ba4] uppercase tracking-wide">XP</p>
                  </div>
                </div>
              </div>
            )}

            {rewards?.leveledUp && (
              <div className="flex flex-col gap-1.5 mb-5 py-2.5 px-4 rounded-2xl bg-[#5865f2]/15 border-[3px] border-[#5865f2]/60 shadow-[0_4px_0_#2f3aa8]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#5865f2] shrink-0" />
                  <span className="text-sm font-black text-[#b5bac1]">
                    Leveled up to <strong className="text-[#f2f3f5]">{rewards.newLevel}</strong>
                  </span>
                </div>
                {(rewards.milestoneBonus ?? 0) > 0 && (
                  <p className="text-xs font-black text-[#f0b232] pl-6">
                    Milestone bonus +{rewards.milestoneBonus!.toLocaleString()} coins
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-8">
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
                  className="rounded-2xl bg-[#1a1b1f] p-3 sm:p-4 text-center border-[3px] border-[#3f4147] shadow-[0_4px_0_#0c0d0f]"
                >
                  <p className="font-black text-[#f2f3f5] text-sm sm:text-base">{value}</p>
                  <p className="text-[9px] font-black text-[#949ba4] uppercase tracking-wide mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleShare}
                className="py-3.5 rounded-2xl bg-[#1e1f22] hover:bg-[#2b2d31] text-[#f2f3f5] text-sm font-black border-[3px] border-[#3f4147] shadow-[0_4px_0_#0c0d0f] hover:translate-y-[1px] hover:shadow-[0_3px_0_#0c0d0f] transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
              </button>
              <button
                type="button"
                onClick={onPlayAgain}
                disabled={waitingForOpponent}
                className="py-3.5 rounded-2xl bg-[#23a559] hover:bg-[#1a7d43] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-black border-[3px] border-white/25 shadow-[0_5px_0_#14532d] hover:translate-y-[1px] hover:shadow-[0_4px_0_#14532d] transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                {result.mode === 'duel' ? 'Rematch' : 'Again'}
              </button>
              <button
                type="button"
                onClick={onHome}
                className="py-3.5 rounded-2xl bg-[#1e1f22] hover:bg-[#2b2d31] text-[#949ba4] hover:text-[#f2f3f5] text-sm font-black border-[3px] border-[#3f4147] shadow-[0_4px_0_#0c0d0f] hover:translate-y-[1px] hover:shadow-[0_3px_0_#0c0d0f] transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Menu
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
