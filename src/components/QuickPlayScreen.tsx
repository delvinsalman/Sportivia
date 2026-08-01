import { X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import type { Sport, GameResult } from '../types';
import type {
  CharacterId,
  PetId,
  RabbitVariantId,
  MakoVariantId,
  StickmanVariantId,
  DogVariantId,
} from '../types/profile';
import type { CreativeLoadout } from '../types/creativeCharacter';
import type { AthleteLoadout } from '../types/athleteCharacter';
import type { BobLoadout } from '../types/bobCharacter';
import type { RefBotLoadout } from '../types/refBotCharacter';
import { useQuickPlayGame } from '../hooks/useQuickPlayGame';
import { PlayerFace } from './PlayerFace';
import { ResultModal } from './ResultModal';
import { CountdownOverlay } from './GameUI';
import { quickChoiceTone } from '../lib/quickPlay';
import { SPORT_ACCENT } from '../lib/sportTheme';
import { SportBall } from './SportBall';

interface QuickPlayScreenProps {
  sport: Sport;
  equippedCharacter: CharacterId;
  equippedPet?: PetId | null;
  creativeLoadout?: CreativeLoadout;
  athleteLoadout?: AthleteLoadout;
  bobLoadout?: BobLoadout;
  refBotLoadout?: RefBotLoadout;
  rabbitVariant?: RabbitVariantId;
  makoVariant?: MakoVariantId;
  stickmanVariant?: StickmanVariantId;
  dogVariant?: DogVariantId;
  onHome: () => void;
  onReplay: () => void;
  onProfileChange?: () => void;
}

export function QuickPlayScreen({
  sport,
  equippedCharacter,
  equippedPet,
  creativeLoadout,
  athleteLoadout,
  bobLoadout,
  refBotLoadout,
  rabbitVariant,
  makoVariant,
  stickmanVariant,
  dogVariant,
  onHome,
  onReplay,
  onProfileChange,
}: QuickPlayScreenProps) {
  const game = useQuickPlayGame(sport);
  const accent = SPORT_ACCENT[sport];
  const q = game.question;
  const timerPct = Math.max(0, (game.timeLeft / game.questionTime) * 100);

  function handleQuit() {
    game.abandonRun();
    onHome();
  }

  function handleResultHome() {
    onProfileChange?.();
    onHome();
  }

  function handleResultReplay() {
    onProfileChange?.();
    onReplay();
  }

  return (
    <div className="relative flex h-svh flex-col overflow-hidden bg-[#0a0a0b]">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none">
        <span className="text-[180px] font-black tracking-tighter text-white/[0.03]">Q</span>
      </div>

      <header className="relative z-20 flex shrink-0 items-center gap-3 px-3 pb-2 pt-[max(0.65rem,env(safe-area-inset-top))] sm:px-4">
        <button
          type="button"
          onClick={handleQuit}
          className="flex h-10 w-10 items-center justify-center rounded-xl border-[2.5px] border-[#3f4147] bg-[#1e1f22] text-[#b5bac1] shadow-[0_3px_0_#0c0d0f] hover:text-[#f2f3f5]"
          aria-label="Quit"
        >
          <X className="h-4 w-4" strokeWidth={2.75} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <SportBall sport={sport} size={18} />
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f0b232]">
              Quick Play
            </p>
            <span className="text-[10px] font-bold text-[#6d6f78]">
              {Math.min(game.index + 1, game.total)}/{game.total}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#1e1f22] shadow-[inset_0_1px_0_rgba(0,0,0,0.45)]">
            <div
              className="h-full rounded-full transition-[width] duration-300 ease-linear"
              style={{
                width: `${timerPct}%`,
                background:
                  game.timeLeft <= 2
                    ? 'linear-gradient(90deg, #ed4245, #f87171)'
                    : `linear-gradient(90deg, ${accent}, #f0b232)`,
              }}
            />
          </div>
        </div>
        <div className="rounded-xl border-[2.5px] border-[#3f4147] bg-[#121316]/95 px-3 py-1.5 text-right shadow-[0_3px_0_#0c0d0f]">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#6d6f78]">Score</p>
          <p className="font-mono text-lg font-black leading-none text-[#f2f3f5]">{game.score}</p>
        </div>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5">
        {q && game.phase === 'playing' && (
          <div className="flex w-full max-w-lg flex-col items-center gap-4 sm:gap-5">
            <div className="flex flex-col items-center gap-2 text-center">
              <PlayerFace
                sport={sport}
                playerId={q.playerId}
                playerName={q.playerName}
                size={96}
                className="shadow-[0_6px_0_rgba(0,0,0,0.35)]"
              />
              <h2 className="text-xl font-black tracking-tight text-[#f2f3f5] sm:text-2xl">
                {q.playerName}
              </h2>
              <p className="text-sm font-bold text-[#949ba4]">{q.prompt}</p>
              {game.streak > 1 && (
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#f0b232]">
                  {game.streak} streak
                </p>
              )}
              {game.feedback === 'timeout' && (
                <p className="text-xs font-black uppercase tracking-wide text-[#ed4245]">Time!</p>
              )}
            </div>

            <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
              {q.choices.map((choice, i) => {
                const tone = quickChoiceTone(i);
                const picked = game.pickedId === choice.id;
                const reveal = game.locked;
                const showCorrect = reveal && choice.correct;
                const showWrong = reveal && picked && !choice.correct;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    disabled={game.locked}
                    onClick={() => game.answer(choice.id)}
                    className="relative min-h-[3.6rem] overflow-hidden rounded-2xl border-[3px] px-4 py-3 text-left transition-transform enabled:hover:translate-y-[1px] disabled:cursor-default sm:min-h-[4.25rem]"
                    style={{
                      borderColor: showCorrect
                        ? '#4ade80'
                        : showWrong
                          ? '#ed4245'
                          : `${tone}cc`,
                      background: showCorrect
                        ? 'linear-gradient(160deg, rgba(35,165,89,0.45), #14532d)'
                        : showWrong
                          ? 'linear-gradient(160deg, rgba(237,66,69,0.4), #7f1d1d)'
                          : `linear-gradient(160deg, ${tone}dd 0%, ${tone}99 100%)`,
                      boxShadow: `0 4px 0 ${showCorrect ? '#14532d' : showWrong ? '#7f1d1d' : `${tone}66`}`,
                      opacity: reveal && !showCorrect && !showWrong ? 0.55 : 1,
                    }}
                  >
                    <span className="relative z-10 text-sm font-black uppercase leading-snug tracking-wide text-white drop-shadow-[0_1px_0_rgba(0,0,0,0.35)] sm:text-base">
                      {choice.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="text-center text-[10px] font-semibold text-[#5c5e66]">
              Tap fast · light coin payout · Daily & Ranked pay more
            </p>
          </div>
        )}
      </main>

      <AnimatePresence>
        {game.phase === 'countdown' && (
          <CountdownOverlay
            label={game.countdownLabel}
            readyHint="Tap fast · beat the clock"
          />
        )}
      </AnimatePresence>

      {game.result && (
        <ResultModal
          result={game.result as GameResult}
          characterId={equippedCharacter}
          petId={equippedPet}
          creativeLoadout={creativeLoadout}
          athleteLoadout={athleteLoadout}
          bobLoadout={bobLoadout}
          refBotLoadout={refBotLoadout}
          rabbitVariant={rabbitVariant}
          makoVariant={makoVariant}
          stickmanVariant={stickmanVariant}
          dogVariant={dogVariant}
          onPlayAgain={handleResultReplay}
          onHome={handleResultHome}
        />
      )}
    </div>
  );
}
