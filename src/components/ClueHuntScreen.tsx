import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Lightbulb, SkipForward, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Sport } from '../types';
import type {
  CharacterId,
  PetId,
  RabbitVariantId,
  MakoVariantId,
  DogVariantId,
} from '../types/profile';
import type { CreativeLoadout } from '../types/creativeCharacter';
import type { AthleteLoadout } from '../types/athleteCharacter';
import type { BobLoadout } from '../types/bobCharacter';
import type { RefBotLoadout } from '../types/refBotCharacter';
import { useClueHuntGame } from '../hooks/useClueHuntGame';
import { ResultModal } from './ResultModal';
import { CountdownOverlay } from './GameUI';
import { SPORT_ACCENT } from '../lib/sportTheme';
import { SportBall } from './SportBall';
import { scoreClueAnswer } from '../lib/clueHunt';
import { PlayerFace } from './PlayerFace';
import { prefetchPlayerFace } from '../lib/playerFaces';

interface ClueHuntScreenProps {
  sport: Sport;
  equippedCharacter: CharacterId;
  equippedPet?: PetId | null;
  creativeLoadout?: CreativeLoadout;
  athleteLoadout?: AthleteLoadout;
  bobLoadout?: BobLoadout;
  refBotLoadout?: RefBotLoadout;
  rabbitVariant?: RabbitVariantId;
  makoVariant?: MakoVariantId;
  dogVariant?: DogVariantId;
  onHome: () => void;
  onReplay: () => void;
  onProfileChange?: () => void;
}

const GUESS_PLAYER_BACKGROUNDS: Record<Sport, string> = {
  soccer:
    'radial-gradient(circle at 15% 85%, rgba(34,197,94,0.2), transparent 36%), radial-gradient(circle at 88% 18%, rgba(16,185,129,0.13), transparent 34%), linear-gradient(145deg, #07150d 0%, #08120e 48%, #071013 100%)',
  basketball:
    'radial-gradient(circle at 15% 85%, rgba(249,115,22,0.22), transparent 36%), radial-gradient(circle at 88% 18%, rgba(245,158,11,0.13), transparent 34%), linear-gradient(145deg, #1b0d06 0%, #140d09 48%, #0c1014 100%)',
  baseball:
    'radial-gradient(circle at 15% 85%, rgba(239,68,68,0.2), transparent 36%), radial-gradient(circle at 88% 18%, rgba(59,130,246,0.15), transparent 34%), linear-gradient(145deg, #18090b 0%, #100d13 48%, #080f18 100%)',
  football:
    'radial-gradient(circle at 15% 85%, rgba(180,83,9,0.24), transparent 36%), radial-gradient(circle at 88% 18%, rgba(234,179,8,0.13), transparent 34%), linear-gradient(145deg, #170c05 0%, #110d08 48%, #0b1013 100%)',
  hockey:
    'radial-gradient(circle at 15% 85%, rgba(56,189,248,0.2), transparent 36%), radial-gradient(circle at 88% 18%, rgba(186,230,253,0.12), transparent 34%), linear-gradient(145deg, #06131c 0%, #09131a 48%, #091013 100%)',
};

export function ClueHuntScreen({
  sport,
  equippedCharacter,
  equippedPet,
  creativeLoadout,
  athleteLoadout,
  bobLoadout,
  refBotLoadout,
  rabbitVariant,
  makoVariant,
  dogVariant,
  onHome,
  onReplay,
  onProfileChange,
}: ClueHuntScreenProps) {
  const game = useClueHuntGame(sport);
  const inputRef = useRef<HTMLInputElement>(null);
  const visualShownFor = useRef<string | null>(null);
  const [showVisualClue, setShowVisualClue] = useState(false);
  const prompt = game.prompt;
  const displaySport = prompt?.sport ?? sport;
  const accent = SPORT_ACCENT[displaySport];
  const timerPct = Math.max(0, (game.roundLeft / game.roundSeconds) * 100);
  const nextPoints = scoreClueAnswer(Math.max(0, game.hintsRevealed - 1));

  useEffect(() => {
    if (game.phase === 'playing' && !game.locked) {
      inputRef.current?.focus();
    }
  }, [game.phase, game.locked, game.index]);

  useEffect(() => {
    if (!prompt) return;
    prefetchPlayerFace(prompt.sport, prompt.targetId, prompt.targetName);
  }, [prompt]);

  useEffect(() => {
    setShowVisualClue(false);
    if (
      !prompt ||
      game.phase !== 'playing' ||
      game.locked ||
      game.hintsRevealed < prompt.hints.length ||
      visualShownFor.current === prompt.id
    ) {
      return;
    }

    visualShownFor.current = prompt.id;
    let hideId: number | undefined;
    const showId = window.setTimeout(() => {
      setShowVisualClue(true);
      hideId = window.setTimeout(() => setShowVisualClue(false), 3_500);
    }, 900);

    return () => {
      window.clearTimeout(showId);
      if (hideId !== undefined) window.clearTimeout(hideId);
    };
  }, [game.hintsRevealed, game.locked, game.phase, prompt]);

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

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    game.submitName(game.draft);
  }

  return (
    <div
      className="relative flex h-svh flex-col overflow-hidden bg-[#0a0a0b]"
      style={{ background: GUESS_PLAYER_BACKGROUNDS[displaySport] }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 50% 42%, rgba(34,211,238,0.14), transparent 43%)',
        }}
      />
      <div className="pointer-events-none absolute -left-8 bottom-[8%] opacity-[0.055] blur-[0.4px]">
        <SportBall sport={displaySport} size={150} />
      </div>
      <div className="pointer-events-none absolute -right-5 top-[12%] opacity-[0.045] blur-[0.4px]">
        <SportBall sport={displaySport} size={120} />
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none">
        <span className="text-[180px] font-black tracking-tighter text-[#67e8f9]/[0.035]">?</span>
      </div>

      <header className="relative z-20 flex shrink-0 items-center gap-3 px-3 pb-2 pt-[max(0.65rem,env(safe-area-inset-top))] sm:px-4">
        <button
          type="button"
          onClick={handleQuit}
          className="flex h-10 w-10 items-center justify-center rounded-xl border-[2.5px] border-[#3f4147] bg-[#1e1f22] text-[#b5bac1] shadow-[0_3px_0_#1a1b1f] transition-all hover:border-[#5c5e66] hover:text-[#f2f3f5]"
          aria-label="Quit"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <SportBall sport={displaySport} size={22} />
          <div className="min-w-0">
            <p className="truncate text-[11px] font-black uppercase tracking-[0.16em] text-[#f0b232]">
              Guess the Player
            </p>
            <p className="text-[10px] font-bold text-[#949ba4]">
              Exact hidden player #{game.index + 1}
              {prompt ? ` · ${prompt.difficulty}` : ''}
            </p>
          </div>
        </div>

        <div className="rounded-xl border-[2.5px] border-[#3f4147] bg-[#151618] px-3 py-1.5 text-right shadow-[0_3px_0_#0f1012]">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#949ba4]">Score</p>
          <p className="text-sm font-black text-[#f2f3f5] tabular-nums">{game.score}</p>
        </div>
      </header>

      <div className="relative z-20 px-3 sm:px-4">
        <div className="mb-1 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.14em] text-[#949ba4]">
          <span>{game.roundLeft}s left</span>
          <span style={{ color: accent }}>+{nextPoints} if solved now</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#1e1f22]">
          <div
            className="h-full rounded-full transition-[width] duration-1000 linear"
            style={{ width: `${timerPct}%`, background: accent }}
          />
        </div>
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-4">
        {prompt && (
          <>
            <div className="mb-4 min-h-0">
              <AnimatePresence mode="wait">
                {showVisualClue ? (
                  <motion.div
                    key={`visual-${prompt.id}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.35 }}
                    className="pointer-events-none fixed inset-0 z-30 flex flex-col items-center justify-center"
                  >
                    <p className="mb-5 text-xs font-black uppercase tracking-[0.22em]" style={{ color: accent }}>
                      Final visual clue
                    </p>
                    <PlayerFace
                      sport={prompt.sport}
                      playerId={prompt.targetId}
                      playerName={prompt.targetName}
                      size={220}
                      className="shadow-2xl"
                    />
                    <p className="mt-5 text-base font-black text-[#f2f3f5]">Who is this player?</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`hints-${prompt.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2.5"
                  >
                    {prompt.hints.slice(0, game.hintsRevealed).map((hint, i) => (
                      <div
                        key={hint.id}
                        className={`rounded-2xl border-[2.5px] px-4 py-3 shadow-[0_3px_0_rgba(0,0,0,0.35)] ${
                          i === 0
                            ? 'border-white/20 bg-[#15181b]'
                            : 'border-[#3f4147] bg-[#121417]'
                        }`}
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <Lightbulb
                            className="h-3.5 w-3.5"
                            style={{ color: i === 0 ? accent : '#949ba4' }}
                          />
                          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#6d737c]">
                            Clue {i + 1}
                          </span>
                        </div>
                        <p className="text-sm font-bold leading-snug text-[#f2f3f5] sm:text-base">
                          {hint.label}
                        </p>
                      </div>
                    ))}
                    {game.hintsRevealed < prompt.hints.length && (
                      <p className="px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6d737c]">
                        Next clue in a few seconds · payout drops
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <form onSubmit={onSubmit} className="relative mt-auto">
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-[#949ba4]">
                Type the player
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  value={game.draft}
                  onChange={e => game.setDraft(e.target.value)}
                  disabled={game.locked || game.phase !== 'playing'}
                  placeholder="Start typing a name…"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className={`w-full rounded-2xl border-[2.5px] bg-[#151618] px-4 py-3.5 text-base font-bold text-[#f2f3f5] outline-none transition-colors placeholder:text-[#5c5e66] ${
                    game.feedback === 'wrong'
                      ? 'border-[#ed4245]'
                      : game.feedback === 'correct'
                        ? 'border-[#23a559]'
                        : 'border-[#3f4147] focus:border-[#f0b232]'
                  }`}
                />
                {game.suggestions.length > 0 && !game.locked && (
                  <ul className="absolute inset-x-0 bottom-[calc(100%+0.4rem)] z-30 max-h-52 overflow-auto rounded-2xl border-[2.5px] border-[#3f4147] bg-[#121417] shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
                    {game.suggestions.map(s => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => game.submitName(s.name)}
                          className="flex w-full items-center px-4 py-2.5 text-left text-sm font-bold text-[#e3e5e8] hover:bg-white/5"
                        >
                          {s.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="submit"
                  disabled={game.locked || game.draft.trim().length < 2}
                  className="min-h-12 flex-1 rounded-xl border-[2.5px] border-white/20 bg-[#23a559] px-4 text-sm font-black uppercase tracking-wide text-white shadow-[0_3px_0_#126c37] disabled:opacity-40"
                >
                  Lock in
                </button>
                <button
                  type="button"
                  onClick={() => game.skipPrompt()}
                  disabled={!game.skipUnlocked || game.locked}
                  className={`flex min-h-12 items-center gap-2 rounded-xl border-[2.5px] px-4 text-sm font-black uppercase tracking-wide transition-all ${
                    game.skipRecommended
                      ? 'border-[#f0b232] bg-[#f0b232]/15 text-[#f0b232] shadow-[0_0_18px_rgba(240,178,50,0.35)]'
                      : game.skipUnlocked
                        ? 'border-[#3f4147] bg-[#1e1f22] text-[#b5bac1]'
                        : 'border-[#2a2b2f] bg-[#151618] text-[#5c5e66] opacity-60'
                  }`}
                  title="Skip and reveal the hidden player"
                >
                  <SkipForward className="h-4 w-4" />
                  Skip
                </button>
              </div>

              {game.feedback === 'correct' && (
                <p className="mt-3 text-center text-sm font-black text-[#23a559]">
                  +{game.lastGain} · nice find
                </p>
              )}
              {game.feedback === 'wrong' && (
                <p className="mt-3 text-center text-sm font-black text-[#ed4245]">
                  That isn’t the hidden player — try again
                </p>
              )}
            </form>
          </>
        )}
      </main>

      <AnimatePresence>
        {game.feedback === 'skip' && game.revealedAnswer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-black/65 px-5 text-center"
          >
            <motion.div
              initial={{ y: 12, scale: 0.92 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: -8, scale: 0.96 }}
              transition={{ duration: 0.25 }}
            >
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#f0b232]">
                The player was
              </p>
              <p className="mt-2 text-3xl font-black text-white drop-shadow-lg sm:text-4xl">
                {game.revealedAnswer}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {game.phase === 'countdown' && <CountdownOverlay label={game.countdownLabel} />}
      </AnimatePresence>

      <AnimatePresence>
        {game.result && (
          <ResultModal
            result={game.result}
            characterId={equippedCharacter}
            petId={equippedPet}
            creativeLoadout={creativeLoadout}
            athleteLoadout={athleteLoadout}
            bobLoadout={bobLoadout}
            refBotLoadout={refBotLoadout}
            rabbitVariant={rabbitVariant}
            makoVariant={makoVariant}
            dogVariant={dogVariant}
            onHome={handleResultHome}
            onPlayAgain={handleResultReplay}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
