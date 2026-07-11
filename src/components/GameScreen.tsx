import { AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';
import { useRoundGame } from '../hooks/useRoundGame';
import {
  CategoryGrid, PlayerBar, TopBar, BoardProgress,
  CountdownOverlay, GamePanel, BoardResetToast,
} from './GameUI';
import { ResultModal } from './ResultModal';
import type { Sport, GameMode, GameResult } from '../types';
import type { CharacterId, PetId } from '../types/profile';
import type { DuelMatchResult } from '../lib/duelTypes';
import { Swords } from 'lucide-react';

interface GameScreenProps {
  sport: Sport;
  mode: GameMode;
  equippedCharacter: CharacterId;
  equippedPet?: PetId | null;
  seedKey?: string;
  opponentName?: string;
  opponentScore?: number;
  opponentFinished?: boolean;
  duelResult?: DuelMatchResult | null;
  onScoreChange?: (score: number) => void;
  onDuelFinished?: (payload: {
    score: number;
    correct: number;
    wrong: number;
    maxStreak: number;
  }) => void;
  onHome: () => void;
  onReplay: () => void;
}

const modeLabels: Record<GameMode, string> = {
  training: 'TRAINING',
  daily: 'DAILY',
  timed: 'RANKED',
  duel: 'DUEL',
};

export function GameScreen({
  sport,
  mode,
  equippedCharacter,
  equippedPet,
  seedKey,
  opponentName,
  opponentScore = 0,
  opponentFinished = false,
  duelResult = null,
  onScoreChange,
  onDuelFinished,
  onHome,
  onReplay,
}: GameScreenProps) {
  const game = useRoundGame(sport, mode, {
    seedKey,
    onScoreChange,
    onFinished: onDuelFinished,
  });

  const resultWithDuel: GameResult | null = useMemo(() => {
    if (!game.result) return null;
    if (mode !== 'duel') return game.result;

    let outcome: 'win' | 'loss' | 'draw' | 'pending' = 'pending';
    if (duelResult) {
      if (duelResult.winnerId === 'draw') outcome = 'draw';
      else if (duelResult.winnerId === duelResult.you.id) outcome = 'win';
      else outcome = 'loss';
    }

    return {
      ...game.result,
      duel: {
        opponentName: duelResult?.opponent.name ?? opponentName ?? 'Opponent',
        opponentScore: duelResult?.opponent.score ?? opponentScore,
        outcome,
      },
    };
  }, [game.result, mode, duelResult, opponentName, opponentScore]);

  function handleQuit() {
    game.abandonRun();
    onHome();
  }

  return (
    <div className="min-h-svh flex flex-col bg-[#0a0a0b] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none">
        <span className="text-[200px] font-black text-white/[0.025] tracking-tighter">GIQ</span>
      </div>

      <TopBar
        gameTimeLeft={game.gameTimeLeft}
        totalGameTime={game.totalGameTime}
        mode={modeLabels[mode]}
        sport={sport}
        onClose={handleQuit}
        correctInCycle={game.correctInCycle}
      />

      {mode === 'duel' && (
        <div className="relative z-20 flex justify-center px-4 -mt-1 mb-1">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#2b2d31]/80 bg-[#121316]/90 backdrop-blur-md px-3 py-1.5 text-xs">
            <Swords className="w-3.5 h-3.5 text-[#ed4245]" />
            <span className="font-bold text-[#f2f3f5]">{game.score}</span>
            <span className="text-[#5c5e66]">vs</span>
            <span className="font-bold text-[#f0b232]">{opponentScore}</span>
            <span className="text-[#6d6f78] max-w-[7rem] truncate">
              {opponentName ?? 'Opponent'}
              {opponentFinished ? ' · done' : ''}
            </span>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 relative z-10">
        <div className="relative w-full max-w-[540px]">
          <GamePanel>
            <PlayerBar
              playerName={game.currentPlayer?.name}
              roundTime={game.roundTime}
              score={game.score}
              onSkip={game.handleSkip}
              showPoints={game.showPoints}
            />

            <div className="relative flex items-center justify-center gap-3 mt-3">
              <div className="relative w-full max-w-[540px]">
                <BoardResetToast show={game.boardResetFlash} />
                <CategoryGrid
                  cells={game.board}
                  onPick={game.handlePick}
                  feedback={game.feedback}
                  feedbackCell={game.feedbackCell}
                  disabled={game.phase !== 'playing' || !game.currentPlayer || game.boardResetFlash}
                  sport={sport}
                  boardKey={game.boardKey}
                  resetting={game.boardResetFlash}
                />
              </div>
              <div className="hidden sm:block shrink-0">
                <BoardProgress filled={game.filledCount} total={9} streak={game.streak} />
              </div>
            </div>
          </GamePanel>
        </div>

        {game.phase === 'playing' && (
          <p className="text-[10px] text-[#5c5e66] text-center mt-4 max-w-[540px]">
            {mode === 'training'
              ? `1:00 sprint · ${game.roundsPlayed} rounds played · practice only — no rewards`
              : mode === 'duel'
                ? `1v1 race · same board · highest score wins · ${5 - game.correctInCycle} until board reset`
                : `Tap the category that fits · ${5 - game.correctInCycle} until board reset · wrong −3 pts (worse if consecutive)`}
          </p>
        )}
      </main>

      <AnimatePresence>
        {game.phase === 'countdown' && (
          <CountdownOverlay label={game.countdownLabel} />
        )}
      </AnimatePresence>

      {resultWithDuel && (
        <ResultModal
          result={resultWithDuel}
          characterId={equippedCharacter}
          petId={equippedPet}
          onPlayAgain={onReplay}
          onHome={onHome}
          waitingForOpponent={mode === 'duel' && !duelResult}
        />
      )}
    </div>
  );
}
