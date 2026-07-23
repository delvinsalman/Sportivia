import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import type { Sport } from '../types';
import { SportBall } from './SportBall';
import {
  SPORT_ACCENT,
  SPORT_LABEL,
  SPORT_PICKER_BG,
  SPORT_RAIL_BG,
  SPORTS,
} from '../lib/sportTheme';
import { playMenuClick } from '../lib/menuAudio';

interface SportPickerProps {
  sport: Sport;
  onSportChange: (sport: Sport) => void;
  layout?: 'bar' | 'rail';
}

export function SportPicker({ sport, onSportChange, layout = 'bar' }: SportPickerProps) {
  const rail = layout === 'rail';
  const [showSportInfo, setShowSportInfo] = useState(false);

  if (rail) {
    return (
      <div className="relative flex flex-col items-stretch gap-2 sm:gap-2.5" role="tablist" aria-label="Choose sport">
        <div className="relative flex items-center gap-1 px-0.5 sm:px-0">
          <p className="game-sport-rail-label hidden sm:block !pb-0">Sports</p>
          <button
            type="button"
            aria-label="About sports"
            aria-expanded={showSportInfo}
            onClick={() => {
              playMenuClick();
              setShowSportInfo(v => !v);
            }}
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all sm:h-[1.05rem] sm:w-[1.05rem] ${
              showSportInfo
                ? 'border-[#f0b232]/80 bg-[#2a2414] text-[#f0b232]'
                : 'border-[#3f4147]/90 bg-[#1e1f22]/80 text-[#6d6f78] hover:border-[#5c5e66] hover:text-[#b5bac1]'
            }`}
          >
            <Info className="h-2.5 w-2.5" strokeWidth={2.5} />
          </button>
          {showSportInfo && (
            <>
              <button
                type="button"
                aria-label="Dismiss sports info"
                className="fixed inset-0 z-40 cursor-default bg-transparent"
                onClick={() => setShowSportInfo(false)}
              />
              <div className="absolute left-full top-0 z-50 ml-2.5 w-[min(15.5rem,calc(100vw-5.5rem))] rounded-2xl border-[2.5px] border-[#3f4147] bg-[#121316]/98 p-3 text-left shadow-[0_8px_0_#0a0a0b,0_18px_40px_rgba(0,0,0,0.45)]">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#f0b232]">
                  Same game · any sport
                </p>
                <p className="mt-1.5 text-[11px] font-semibold leading-snug text-[#b5bac1]">
                  Every sport is the same trivia idea — match stars to categories on a 3×3 board — just with that sport’s players and categories. Switch anytime from this rail and pick up a run whenever you want.
                </p>
              </div>
            </>
          )}
        </div>
        {SPORTS.map(sp => {
          const active = sport === sp;
          const label = SPORT_LABEL[sp];
          const railBg = SPORT_RAIL_BG[sp];
          return (
            <button
              key={sp}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={label}
              onClick={() => {
                playMenuClick();
                onSportChange(sp);
              }}
              className={`game-sport-tab ${active ? 'game-sport-tab-active' : ''}`}
              style={
                {
                  '--sport-rail-bg': railBg.base,
                  '--sport-rail-bg-hover': railBg.hover,
                  '--sport-rail-bg-active': railBg.active,
                } as CSSProperties
              }
            >
              <span className="shrink-0 w-[28px] h-[28px] flex items-center justify-center">
                <SportBall sport={sp} size={28} />
              </span>
              <span className="leading-none hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      aria-label="Choose sport"
      className="flex flex-wrap items-center justify-center gap-0.5 sm:gap-1 rounded-[20px] bg-[#1e1f22]/95 backdrop-blur-md p-1.5 border-[3px] border-[#3f4147] shadow-[0_5px_0_#0c0d0f] max-w-[min(100vw-1.5rem,44rem)] overflow-visible"
    >
      {SPORTS.map(sp => {
        const active = sport === sp;
        const accent = SPORT_ACCENT[sp];
        const label = SPORT_LABEL[sp];

        return (
          <button
            key={sp}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={label}
            onClick={() => {
              playMenuClick();
              onSportChange(sp);
            }}
            className={`relative shrink-0 flex items-center gap-2 rounded-xl px-2.5 sm:px-3.5 py-2 transition-opacity ${
              active ? '' : 'opacity-50 hover:opacity-80'
            }`}
          >
            {active && (
              <motion.div
                layoutId="sport-picker-active"
                className="absolute inset-0 rounded-xl border-[2.5px]"
                style={{
                  background: SPORT_PICKER_BG[sp],
                  borderColor: `${accent}aa`,
                  boxShadow: `0 3px 0 ${accent}66`,
                }}
                transition={{ type: 'spring', stiffness: 520, damping: 34 }}
              />
            )}
            <span
              className={`relative z-10 font-black tracking-wide uppercase leading-none ${
                active ? 'text-sm sm:text-base text-[#f2f3f5]' : 'text-xs sm:text-sm text-[#b5bac1]'
              }`}
              style={active ? { color: accent === '#f4f4f5' ? '#f2f3f5' : accent } : undefined}
            >
              {label}
            </span>
            <span className="relative z-10 flex items-center justify-center shrink-0">
              <SportBall sport={sp} size={active ? 26 : 22} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function SportBadge({ sport, size = 30 }: { sport: Sport; size?: number }) {
  const accent = SPORT_ACCENT[sport];
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border-[2.5px] px-3 py-1.5"
      style={{
        background: `${accent}22`,
        borderColor: `${accent}66`,
      }}
    >
      <SportBall sport={sport} size={size * 0.7} />
      <span className="text-xs font-black uppercase tracking-wide" style={{ color: accent }}>
        {SPORT_LABEL[sport]}
      </span>
    </div>
  );
}
