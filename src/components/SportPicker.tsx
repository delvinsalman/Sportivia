import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import type { Sport } from '../types';
import { SportBall } from './SportBall';
import { SportGuideOverlay } from './SportGuideOverlay';
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
      <>
        <div className="game-sport-menu" role="tablist" aria-label="Choose sport">
          <div className="game-sport-menu-head">
            <p className="game-sport-menu-kicker">Select</p>
            <div className="game-sport-menu-title-row">
              <p className="game-sport-menu-title">Sport</p>
              <button
                type="button"
                aria-label="About sports"
                aria-expanded={showSportInfo}
                onClick={() => {
                  playMenuClick();
                  setShowSportInfo(true);
                }}
                className={`game-sport-menu-info ${showSportInfo ? 'game-sport-menu-info-on' : ''}`}
              >
                <Info className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="game-sport-menu-list">
            {SPORTS.map((sp, i) => {
              const active = sport === sp;
              const label = SPORT_LABEL[sp];
              const accent = SPORT_ACCENT[sp];
              const railBg = SPORT_RAIL_BG[sp];
              const ballSize =
                sp === 'football' ? 24 : sp === 'hockey' ? 22 : sp === 'basketball' ? 28 : 30;
              return (
                <motion.button
                  key={sp}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{
                    opacity: 1,
                    x: active ? 4 : 0,
                    scale: active ? 1.02 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 420, damping: 28, delay: i * 0.03 }}
                  onClick={() => {
                    playMenuClick();
                    onSportChange(sp);
                  }}
                  className={`game-sport-menu-item ${active ? 'game-sport-menu-item-active' : ''}`}
                  style={
                    {
                      '--sport-rail-bg': railBg.base,
                      '--sport-rail-bg-hover': railBg.hover,
                      '--sport-rail-bg-active': railBg.active,
                      '--sport-accent': accent,
                    } as CSSProperties
                  }
                >
                  <span className="game-sport-menu-copy">
                    <span className="game-sport-menu-name">{label}</span>
                    {active && <span className="game-sport-menu-live">Selected</span>}
                  </span>
                  <span className="game-sport-menu-ball">
                    <SportBall sport={sp} size={ballSize} />
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <SportGuideOverlay
          open={showSportInfo}
          currentSport={sport}
          onClose={() => setShowSportInfo(false)}
          onPickSport={onSportChange}
        />
      </>
    );
  }

  return (
    <div
      role="tablist"
      aria-label="Choose sport"
      className="flex max-w-[min(100vw-1.5rem,44rem)] flex-wrap items-center justify-center gap-0.5 overflow-visible rounded-[20px] border-[3px] border-[#3f4147] bg-[#1e1f22]/95 p-1.5 shadow-[0_5px_0_#0c0d0f] backdrop-blur-md sm:gap-1"
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
            className={`relative flex shrink-0 items-center gap-2 rounded-xl px-2.5 py-2 transition-opacity sm:px-3.5 ${
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
              className={`relative z-10 font-black uppercase leading-none tracking-wide ${
                active ? 'text-sm text-[#f2f3f5] sm:text-base' : 'text-xs text-[#b5bac1] sm:text-sm'
              }`}
              style={active ? { color: accent === '#f4f4f5' ? '#f2f3f5' : accent } : undefined}
            >
              {label}
            </span>
            <span className="relative z-10 flex shrink-0 items-center justify-center">
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
