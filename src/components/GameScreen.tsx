import { AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRoundGame } from '../hooks/useRoundGame';
import {
  CategoryGrid, PlayerBar, TopBar, BoardProgress,
  CountdownOverlay, GamePanel, BoardResetToast,
} from './GameUI';
import { ResultModal } from './ResultModal';
import type { Sport, GameMode, GameResult, BotDifficulty } from '../types';
import type { CharacterId, PetId, RabbitVariantId, DogVariantId } from '../types/profile';
import type { CreativeLoadout } from '../types/creativeCharacter';
import type { DuelMatchResult } from '../lib/duelTypes';
import { Bot, Swords } from 'lucide-react';
import { getSettings } from '../lib/settings';
import { BOT_DIFFICULTIES, botName, nextBotDelay, rollBotPoints } from '../lib/botOpponent';
import {
  isWagerActive,
  stakeFromKey,
  type CardWagerAgreement,
} from '../lib/cardWager';
import { settleCardWager, addCardToCollection, removeCardFromCollection } from '../lib/profileStorage';
import type { PlayerProfile } from '../types/profile';

interface GameScreenProps {
  sport: Sport;
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  equippedCharacter: CharacterId;
  equippedPet?: PetId | null;
  creativeLoadout?: CreativeLoadout;
  rabbitVariant?: RabbitVariantId;
  dogVariant?: DogVariantId;
  seedKey?: string;
  opponentName?: string;
  opponentScore?: number;
  opponentFinished?: boolean;
  duelResult?: DuelMatchResult | null;
  cardWager?: CardWagerAgreement | null;
  onScoreChange?: (score: number) => void;
  onDuelFinished?: (payload: {
    score: number;
    correct: number;
    wrong: number;
    maxStreak: number;
  }) => void;
  onHome: () => void;
  onReplay: () => void;
  onProfileChange?: (profile: PlayerProfile) => void;
}

const modeLabels: Record<GameMode, string> = {
  training: 'TRAINING',
  daily: 'DAILY',
  timed: 'RANKED',
  bot: 'VS AI',
  duel: 'DUEL',
};

export function GameScreen({
  sport,
  mode,
  botDifficulty = 'beginner',
  equippedCharacter,
  equippedPet,
  creativeLoadout,
  rabbitVariant,
  dogVariant,
  seedKey,
  opponentName,
  opponentScore = 0,
  opponentFinished = false,
  duelResult = null,
  cardWager = null,
  onScoreChange,
  onDuelFinished,
  onHome,
  onReplay,
  onProfileChange,
}: GameScreenProps) {
  const game = useRoundGame(sport, mode, {
    seedKey,
    onScoreChange,
    onFinished: onDuelFinished,
  });
  const [botScore, setBotScore] = useState(0);
  const botScoreRef = useRef(0);
  const wagerSettledRef = useRef(false);
  const escrowRef = useRef(false);
  const [wagerInfo, setWagerInfo] = useState<GameResult['cardWager']>();

  useEffect(() => {
    if (escrowRef.current) return;
    if (!cardWager || !isWagerActive(cardWager) || !cardWager.yourCard) return;
    const { profile } = removeCardFromCollection(cardWager.yourCard.cardKey);
    escrowRef.current = true;
    onProfileChange?.(profile);
  }, [cardWager, onProfileChange]);

  useEffect(() => {
    if (mode !== 'bot' || game.phase !== 'playing') return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let active = true;
    let attempts = 0;

    const schedule = () => {
      timer = setTimeout(() => {
        if (!active) return;
        const points = rollBotPoints(botDifficulty, Math.random, attempts === 0);
        attempts += 1;
        if (points > 0) {
          botScoreRef.current += points;
          setBotScore(botScoreRef.current);
        }
        schedule();
      }, nextBotDelay(botDifficulty));
    };

    schedule();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [mode, botDifficulty, game.phase]);

  const activeAgreement = useMemo((): CardWagerAgreement | null => {
    if (cardWager && isWagerActive(cardWager)) return cardWager;
    if (mode === 'duel' && duelResult?.wager) {
      return {
        yourCard: stakeFromKey(duelResult.wager.yourCardKey),
        opponentCard: stakeFromKey(duelResult.wager.opponentCardKey),
      };
    }
    return cardWager;
  }, [cardWager, duelResult, mode]);

  useEffect(() => {
    if (wagerSettledRef.current) return;
    if (!game.result?.completed) return;

    let outcome: 'win' | 'loss' | 'draw' | null = null;
    if (mode === 'bot') {
      outcome =
        game.result.score > botScore
          ? 'win'
          : game.result.score < botScore
            ? 'loss'
            : 'draw';
    } else if (mode === 'duel' && duelResult) {
      if (duelResult.winnerId === 'draw') outcome = 'draw';
      else if (duelResult.winnerId === duelResult.you.id) outcome = 'win';
      else outcome = 'loss';
    }

    if (!outcome) return;

    const agreement =
      mode === 'duel' && duelResult?.wager
        ? {
            yourCard: stakeFromKey(duelResult.wager.yourCardKey),
            opponentCard: stakeFromKey(duelResult.wager.opponentCardKey),
          }
        : activeAgreement;

    if (!isWagerActive(agreement)) {
      wagerSettledRef.current = true;
      setWagerInfo({
        active: false,
        outcome: 'none',
        message: 'No card stake this match',
      });
      return;
    }

    wagerSettledRef.current = true;
    const { profile: nextProfile, settlement } = settleCardWager(outcome, agreement!);
    setWagerInfo({
      active: settlement.active,
      outcome: settlement.outcome,
      message: settlement.message,
      gainedName: settlement.gained?.name,
      lostName: settlement.lost?.name,
    });
    onProfileChange?.(nextProfile);
  }, [
    activeAgreement,
    botScore,
    duelResult,
    game.result,
    mode,
    onProfileChange,
  ]);

  const resultWithDuel: GameResult | null = useMemo(() => {
    if (!game.result) return null;
    if (mode === 'bot') {
      const outcome =
        game.result.score > botScore
          ? 'win'
          : game.result.score < botScore
            ? 'loss'
            : 'draw';
      return {
        ...game.result,
        duel: {
          opponentName: botName(botDifficulty),
          opponentScore: botScore,
          outcome,
        },
        cardWager: wagerInfo,
      };
    }
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
      cardWager: wagerInfo,
    };
  }, [
    game.result,
    mode,
    duelResult,
    opponentName,
    opponentScore,
    botScore,
    botDifficulty,
    wagerInfo,
  ]);

  function handleQuit() {
    if (
      escrowRef.current &&
      !wagerSettledRef.current &&
      cardWager?.yourCard &&
      isWagerActive(cardWager)
    ) {
      const { profile } = addCardToCollection(cardWager.yourCard.cardKey);
      onProfileChange?.(profile);
    }
    game.abandonRun();
    onHome();
  }

  const showHints = getSettings().showHints;
  const versusMode = mode === 'duel' || mode === 'bot';
  const versusScore = mode === 'bot' ? botScore : opponentScore;
  const versusName = mode === 'bot' ? botName(botDifficulty) : opponentName ?? 'Opponent';
  const boardChromeRem =
    versusMode && showHints ? 12.5 : versusMode ? 11 : showHints ? 10.5 : 9.75;

  return (
    <div className="h-svh flex flex-col bg-[#0a0a0b] relative overflow-hidden">
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

      {versusMode && (
        <div className="relative z-20 flex justify-center px-4 -mt-1 mb-0.5 shrink-0">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#2b2d31]/80 bg-[#121316]/90 backdrop-blur-md px-3 py-1.5 text-xs">
            {mode === 'bot'
              ? <Bot className="w-3.5 h-3.5 text-[#a855f7]" />
              : <Swords className="w-3.5 h-3.5 text-[#ed4245]" />}
            <span className="font-bold text-[#f2f3f5]">{game.score}</span>
            <span className="text-[#5c5e66]">vs</span>
            <span className="font-bold text-[#f0b232]">{versusScore}</span>
            <span className="text-[#6d6f78] max-w-[7rem] truncate">
              {versusName}
              {mode === 'duel' && opponentFinished ? ' · done' : ''}
            </span>
          </div>
        </div>
      )}

      <main className="flex-1 min-h-0 flex flex-col items-center justify-center px-3 py-2 relative z-10 overflow-hidden">
        {/* Width capped by viewport height so the 3×3 square grid never forces scroll */}
        <div
          className="relative w-full"
          style={{ maxWidth: `min(520px, calc(100svh - ${boardChromeRem}rem))` }}
        >
          <GamePanel>
            <PlayerBar
              playerName={game.currentPlayer?.name}
              roundTime={game.roundTime}
              score={game.score}
              onSkip={game.handleSkip}
              showPoints={game.showPoints}
            />

            <div className="relative mt-2">
              <BoardProgress filled={game.filledCount} total={9} streak={game.streak} />
              <div className="relative w-full">
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
            </div>
          </GamePanel>
        </div>

        {game.phase === 'playing' && showHints && (
          <p className="text-[10px] text-[#5c5e66] text-center mt-2 max-w-[520px] shrink-0 px-2">
            {mode === 'training'
              ? `1:00 sprint · ${game.roundsPlayed} rounds played · practice only — no rewards`
              : mode === 'duel'
                ? `1v1 race · same board · highest score wins · ${5 - game.correctInCycle} until board reset`
                : mode === 'bot'
                  ? `${BOT_DIFFICULTIES[botDifficulty].label} bot · highest score wins · ${5 - game.correctInCycle} until board reset`
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
          creativeLoadout={creativeLoadout}
          rabbitVariant={rabbitVariant}
          dogVariant={dogVariant}
          onPlayAgain={onReplay}
          onHome={onHome}
          waitingForOpponent={mode === 'duel' && !duelResult}
        />
      )}
    </div>
  );
}
