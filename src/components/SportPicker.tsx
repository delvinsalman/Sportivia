import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
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

  if (rail) {
    return (
      <div className="flex flex-col items-stretch gap-2 sm:gap-2.5" role="tablist" aria-label="Choose sport">
      <p className="game-sport-rail-label hidden sm:block">Sports</p>
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
      className="inline-flex items-center justify-center rounded-full border-[3px] shrink-0 shadow-[0_3px_0_rgba(0,0,0,0.35)]"
      aria-label={SPORT_LABEL[sport]}
      style={{
        width: size + 14,
        height: size + 14,
        background: `linear-gradient(145deg, ${accent}33, ${accent}12)`,
        borderColor: `${accent}88`,
      }}
    >
      <SportBall sport={sport} size={size} />
    </div>
  );
}
