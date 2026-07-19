import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Coins } from 'lucide-react';
import type { Sport } from '../types';
import type { PlayerProfile } from '../types/profile';
import { SportBackground } from './SportBackground';
import { SportBall } from './SportBall';
import { SPORT_ACCENT, SPORT_LABEL, SPORTS } from '../lib/sportTheme';
import { xpProgress } from '../lib/progression';
import { loadSeasonMeta } from '../lib/seasonMeta';
import { getTodayKey } from '../lib/seed';
import { playMenuBack, playMenuClick } from '../lib/menuAudio';

interface CareerScreenProps {
  sport: Sport;
  profile: PlayerProfile;
  onBack: () => void;
  onSportChange?: (sport: Sport) => void;
}

export function CareerScreen({
  sport: initialSport,
  profile,
  onBack,
  onSportChange,
}: CareerScreenProps) {
  const [sport, setSport] = useState<Sport>(initialSport);
  const accent = SPORT_ACCENT[sport];
  const progress = xpProgress(profile.xp);
  const stats = profile.stats[sport];
  const meta = loadSeasonMeta();
  const sportRuns = meta.recentRuns.filter(r => r.sport === sport);

  const today = getTodayKey();
  const dailyToday = stats.dailyCompleted.includes(today) ? 'Done' : 'Open';

  function switchSport(next: Sport) {
    if (next === sport) return;
    playMenuClick();
    setSport(next);
    onSportChange?.(next);
  }

  return (
    <div className="relative h-svh overflow-hidden">
      <SportBackground sport={sport} />
      <div className="relative z-10 h-svh flex flex-col overflow-hidden">
        <header className="shrink-0 flex items-center justify-between gap-2 px-3 sm:px-6 pt-3 pb-1">
          <button
            type="button"
            onClick={() => {
              playMenuBack();
              onBack();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-black text-[#b5bac1] bg-[#1e1f22] border-[2.5px] border-[#3f4147] shadow-[0_3px_0_#1a1b1f]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#1e1f22] border-[2.5px] border-[#f0b232]/70 shadow-[0_3px_0_#8a6814]">
            <Coins className="w-3.5 h-3.5 text-[#f0b232]" />
            <span className="text-xs font-black text-[#f0b232] font-mono">
              {profile.coins.toLocaleString()}
            </span>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 sm:px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="min-h-full flex flex-col items-center justify-center py-4">
            <div className="w-full max-w-md mx-auto space-y-4">
              {/* Page title */}
              <div className="text-center pt-1 pb-1">
                <h1
                  className="text-5xl sm:text-6xl font-black tracking-tight text-[#f2f3f5] leading-none"
                  style={{ textShadow: `0 4px 0 rgba(0,0,0,0.35), 0 0 40px ${accent}33` }}
                >
                  Career
                </h1>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#6d6f78]">
                  Your record
                </p>
              </div>

              {/* Sport category switcher */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 rounded-2xl border-[2.5px] border-[#3f4147] bg-[#0c0d0f]/85 p-1 shadow-[0_3px_0_#0a0a0b]">
                {SPORTS.map(s => {
                  const active = sport === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => switchSport(s)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-black transition-all ${
                        active ? 'text-[#f2f3f5]' : 'text-[#7a7d86] hover:text-[#dbdee1]'
                      }`}
                      style={
                        active
                          ? {
                              background: '#1e1f22',
                              border: `2.5px solid ${SPORT_ACCENT[s]}`,
                              boxShadow: `0 2px 0 ${SPORT_ACCENT[s]}55`,
                            }
                          : { border: '2.5px solid transparent' }
                      }
                    >
                      <SportBall sport={s} size={16} />
                      {SPORT_LABEL[s]}
                    </button>
                  );
                })}
              </div>

              <motion.div
                key={sport}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border-[2.5px] border-[#3f4147] bg-[#121316]/92 p-4 shadow-[0_4px_0_#0a0a0b] text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <SportBall sport={sport} size={22} />
                  <p className="text-lg font-black text-[#f2f3f5]">Level {progress.level}</p>
                </div>
                <p className="text-xs text-[#949ba4]">{profile.playerName}</p>
                <div className="mt-3 h-2.5 rounded-full bg-[#1e1f22] border border-[#3f4147] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${progress.pct}%`, background: accent }}
                  />
                </div>
                <p className="text-[10px] font-bold text-[#6d6f78] mt-1.5">
                  {progress.current}/{progress.needed} XP to next level
                </p>
              </motion.div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  ['Best score', stats.bestScore.toLocaleString()],
                  ['Games played', stats.gamesPlayed.toLocaleString()],
                  ['Correct', stats.totalCorrect.toLocaleString()],
                  ['Daily streak', String(stats.dailyStreak)],
                  ['Perfect boards', String(stats.perfectBoards)],
                  ['Daily today', dailyToday],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border-[2.5px] border-[#2b2d31] bg-[#121316]/85 p-3 shadow-[0_3px_0_#0a0a0b] text-center"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#6d6f78]">{label}</p>
                    <p className="text-xl font-black text-[#f2f3f5] mt-1">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border-[2.5px] border-[#2b2d31] bg-[#121316]/85 p-3 text-center">
                <p className="text-xs font-black text-[#f2f3f5] mb-2">
                  Recent {SPORT_LABEL[sport]} runs
                </p>
                {sportRuns.length === 0 ? (
                  <p className="text-xs text-[#7a7d86]">
                    No {SPORT_LABEL[sport]} finishes yet. Play Daily, Ranked, or Duel to log runs.
                  </p>
                ) : (
                  <ul className="space-y-1.5 text-left">
                    {sportRuns.slice(0, 8).map((run, i) => (
                      <li
                        key={`${run.date}-${run.mode}-${i}`}
                        className="flex items-center justify-between text-xs rounded-xl bg-[#1e1f22]/70 px-2.5 py-2 border border-[#2b2d31]"
                      >
                        <span className="font-bold text-[#b5bac1] capitalize">{run.mode}</span>
                        <span className="font-mono font-black text-[#f2f3f5]">
                          {run.score}
                          {run.perfectBoard ? ' ★' : ''}
                          <span className="text-[#6d6f78] font-bold ml-2">{run.correct}✓</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
