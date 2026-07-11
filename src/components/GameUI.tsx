import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';
import { X, SkipForward } from 'lucide-react';
import type { BoardCell, Sport } from '../types';
import type { Feedback } from '../hooks/useRoundGame';
import { RESET_EVERY } from '../lib/scoring';
import { SportBall } from './SportBall';
import { CategoryIcon } from './CategoryIcon';

const PANEL_W = 'w-full max-w-[540px]';

interface CategoryGridProps {
  cells: BoardCell[];
  onPick: (index: number) => void;
  feedback: Feedback;
  feedbackCell: number | null;
  disabled: boolean;
  sport: Sport;
  boardKey?: number;
  resetting?: boolean;
}

export function CategoryGrid({
  cells,
  onPick,
  feedback,
  feedbackCell,
  disabled,
  sport,
  boardKey = 0,
  resetting = false,
}: CategoryGridProps) {
  return (
    <div className={`relative ${PANEL_W}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={boardKey}
          initial={{ opacity: 0, scale: 0.97, filter: 'blur(5px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.97, filter: 'blur(6px)' }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-3 gap-2.5 sm:gap-3"
        >
          {cells.map((cell, i) => {
            const isFilled = cell.filled;
            const isWrong = feedback === 'wrong' && feedbackCell === i;
            const isCorrect = feedback === 'correct' && feedbackCell === i;

            return (
              <motion.button
                key={`${cell.category.id}-${i}`}
                onClick={() => !disabled && !isFilled && onPick(i)}
                disabled={disabled || isFilled || resetting}
                whileTap={!isFilled && !disabled && !resetting ? { scale: 0.96 } : undefined}
                initial={{ opacity: 0, y: 12, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 0.04 + i * 0.035,
                  duration: 0.34,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`
                  relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 p-2.5 sm:p-3
                  transition-colors duration-150 select-none
                  ${isFilled
                    ? 'bg-[#142d1e]/95 border-[3px] border-[#23a559] shadow-[0_4px_0_#14532d] cursor-default'
                    : isWrong
                      ? 'bg-[#3d1a1a] border-[3px] border-[#ed4245] shadow-[0_4px_0_#8f1e22] animate-shake'
                      : isCorrect
                        ? 'bg-[#142d1e] border-[3px] border-[#23a559] shadow-[0_4px_0_#14532d]'
                        : 'bg-[#18191c]/95 border-[3px] border-[#3f4147] shadow-[0_4px_0_#0c0d0f] hover:bg-[#1e1f24] hover:border-[#5c5e66] cursor-pointer backdrop-blur-sm'
                  }
                `}
              >
                {isFilled ? (
                  <>
                    <span className="text-[9px] font-bold text-[#23a559]/90 uppercase tracking-widest leading-none">
                      {cell.category.tag}
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-[#f2f3f5] leading-tight text-center line-clamp-2 mt-0.5">
                      {cell.playerName}
                    </span>
                  </>
                ) : (
                  <>
                    <CategoryIcon categoryId={cell.category.id} tag={cell.category.tag} size={42} sport={sport} />
                    <span className="text-[8px] sm:text-[9px] font-semibold text-[#949ba4] uppercase tracking-widest leading-none">
                      {cell.category.tag}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-[#e3e5e8] leading-tight text-center line-clamp-2">
                      {cell.category.label}
                    </span>
                  </>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const actionBox = 'flex flex-col items-center justify-center rounded-2xl bg-[#18191c] border-[3px] border-[#3f4147] shadow-[0_3px_0_#0c0d0f] shrink-0 w-[62px] h-[58px]';

interface PlayerBarProps {
  playerName: string | undefined;
  roundTime: number;
  score: number;
  onSkip: () => void;
  showPoints: number | null;
}

export function PlayerBar({ playerName, roundTime, score, onSkip, showPoints }: PlayerBarProps) {
  const pct = (roundTime / 10) * 100;

  return (
    <div className={`relative ${PANEL_W} h-[62px] mb-1`}>
      {/* Timer — pinned left */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2">
        <div className="relative w-11 h-11">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="18" fill="none" stroke="#2b2d31" strokeWidth="2.5" />
            <circle
              cx="22" cy="22" r="18" fill="none"
              stroke={roundTime <= 3 ? '#ed4245' : '#23a559'}
              strokeWidth="2.5"
              strokeDasharray={`${2 * Math.PI * 18}`}
              strokeDashoffset={`${2 * Math.PI * 18 * (1 - pct / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#f2f3f5] font-mono">
            {roundTime}
          </span>
        </div>
      </div>

      {/* Skip + Score — pinned right */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <button onClick={onSkip} className={`${actionBox} hover:bg-[#232428] transition-colors cursor-pointer group`}>
          <SkipForward className="w-4 h-4 text-[#949ba4] group-hover:text-[#dbdee1]" />
          <span className="text-[8px] font-black text-[#949ba4] uppercase tracking-wider mt-0.5">Skip</span>
          <span className="text-[7px] text-[#5c5e66] font-mono font-bold">SPACE</span>
        </button>

        <div className={`${actionBox} relative overflow-visible`}>
          <div className="absolute inset-x-0 -top-5 h-5 flex items-center justify-center pointer-events-none overflow-hidden">
            <AnimatePresence>
              {showPoints !== null && (
                <motion.span
                  key={showPoints}
                  initial={{ opacity: 1, y: 4 }}
                  animate={{ opacity: 0, y: -10 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65 }}
                  className={`text-sm font-black font-mono whitespace-nowrap ${showPoints < 0 ? 'text-[#ed4245]' : 'text-[#f0b232]'}`}
                >
                  {showPoints > 0 ? '+' : ''}{showPoints}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <span className="text-[8px] font-black text-[#949ba4] uppercase tracking-wider">Score</span>
          <span className="text-base font-black text-[#f2f3f5] font-mono leading-none mt-0.5">{score}</span>
        </div>
      </div>

      {/* Player name */}
      <div className="absolute inset-0 flex flex-col justify-center pl-14 pr-[136px] pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.span
            key={playerName ?? 'pending'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="inline-block min-w-0 max-w-full truncate text-xl sm:text-2xl font-extrabold text-[#f0b232] text-left leading-normal"
            style={{ filter: 'drop-shadow(0 0 5px rgba(240,178,50,0.55))' }}
          >
            {playerName ?? '\u00A0'}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

interface TopBarProps {
  gameTimeLeft: number;
  totalGameTime: number;
  mode: string;
  sport: Sport;
  onClose: () => void;
  correctInCycle: number;
}

function formatTime(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

export function BoardResetToast({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none rounded-2xl overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.55, 0] }}
            transition={{ duration: 0.85, times: [0, 0.35, 1], ease: 'easeOut' }}
            style={{
              background:
                'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(35,165,89,0.28) 0%, transparent 72%)',
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 1.02 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative px-4 py-2 rounded-full bg-[#0c0d0f]/90 border-[3px] border-[#23a559]/70 backdrop-blur-md shadow-[0_4px_0_#14532d]"
          >
            <span className="text-[11px] font-black tracking-[0.22em] uppercase text-[#f2f3f5]">
              New board
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function TopBar({ gameTimeLeft, totalGameTime, mode, sport, onClose, correctInCycle }: TopBarProps) {
  const progress = totalGameTime > 0 ? (gameTimeLeft / totalGameTime) * 100 : 100;

  return (
    <div className="w-full">
      {totalGameTime > 0 && (
        <div className="h-[3px] w-full bg-[#141517]">
          <div
            className="h-full bg-[#23a559] transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2.5">
          {totalGameTime > 0 && (
            <span className="font-mono text-sm font-medium text-[#b5bac1]">{formatTime(gameTimeLeft)}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1 mr-1">
            {Array.from({ length: RESET_EVERY }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${i < correctInCycle ? 'bg-[#23a559]' : 'bg-[#2b2d31]'}`}
              />
            ))}
          </div>
          <span className="text-[11px] font-black text-[#b5bac1] uppercase tracking-widest">{mode}</span>
          <SportBall sport={sport} size={18} />
          <button onClick={onClose} className="p-1.5 rounded-xl border-[2.5px] border-[#3f4147] bg-[#1e1f22] hover:bg-[#2b2d31] text-[#949ba4] hover:text-[#f2f3f5] shadow-[0_3px_0_#0c0d0f] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface CountdownOverlayProps {
  label: string;
}

export function CountdownOverlay({ label }: CountdownOverlayProps) {
  const isGo = label === 'GO!';
  const isReady = label === 'GET READY';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={label}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.2, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          className="text-center"
        >
          <p className={`font-black tracking-tight ${
            isGo ? 'text-6xl text-[#23a559]' : isReady ? 'text-3xl text-[#f2f3f5]' : 'text-7xl text-[#f2f3f5] font-mono'
          }`}
          style={isGo ? { textShadow: '0 4px 0 #14532d' } : { textShadow: '0 4px 0 rgba(0,0,0,0.4)' }}
          >
            {label}
          </p>
          {isReady && (
            <p className="text-sm font-black text-[#949ba4] mt-3 uppercase tracking-wide">Match players to categories</p>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

interface BoardProgressProps {
  filled: number;
  total: number;
  streak: number;
}

export function BoardProgress({ filled, total, streak }: BoardProgressProps) {
  return (
    <div className="flex flex-col items-center justify-center py-2 w-5 min-h-[148px]">
      <span className="text-xs font-bold text-[#f0b232] mb-1 h-4 leading-4">
        {streak >= 2 ? `+${streak}` : '\u00A0'}
      </span>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full transition-all duration-300 ${
            i < filled ? 'bg-[#f0b232]' : 'bg-[#2b2d31]'
          }`}
          style={{ height: i < filled ? 22 : 14 }}
        />
      ))}
    </div>
  );
}

export function GamePanel({ children }: { children: ReactNode }) {
  return (
    <div className={`${PANEL_W} mx-auto rounded-[28px] bg-[#111214]/90 border-[3px] border-[#3f4147] backdrop-blur-md p-4 sm:p-5 shadow-[0_8px_0_#0c0d0f]`}>
      {children}
    </div>
  );
}
