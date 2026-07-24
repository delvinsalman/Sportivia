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
      <div className="game-sport-menu" role="tablist" aria-label="Choose sport">
        <div className="game-sport-menu-head">
          <div className="min-w-0">
            <p className="game-sport-menu-kicker">Select</p>
            <p className="game-sport-menu-title">Sport</p>
          </div>
          <button
            type="button"
            aria-label="About sports"
            aria-expanded={showSportInfo}
            onClick={() => {
              playMenuClick();
              setShowSportInfo(v => !v);
            }}
            className={`game-sport-menu-info ${showSportInfo ? 'game-sport-menu-info-on' : ''}`}
          >
            <Info className="h-3 w-3" strokeWidth={2.75} />
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
                  Every sport is the same trivia idea — match stars to categories on a 3×3 board — just with that sport’s players and categories. Switch anytime from this menu and pick up a run whenever you want.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="game-sport-menu-list">
          {SPORTS.map((sp, i) => {
            const active = sport === sp;
            const label = SPORT_LABEL[sp];
            const accent = SPORT_ACCENT[sp];
            const railBg = SPORT_RAIL_BG[sp];
            const wideIcon = sp === 'football' || sp === 'hockey';
            const ballSize =
              sp === 'football' ? 30 : sp === 'hockey' ? 28 : sp === 'basketball' ? 32 : 34;
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
                  x: active ? 6 : 0,
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
                <span
                  className={`game-sport-menu-ball ${
                    wideIcon
                      ? sp === 'football'
                        ? 'game-sport-menu-ball-football'
                        : 'game-sport-menu-ball-hockey'
                      : ''
                  }`}
                >
                  <SportBall sport={sp} size={ballSize} />
                </span>
                <span className="game-sport-menu-copy">
                  <span className="game-sport-menu-name">{label}</span>
                  {active && <span className="game-sport-menu-live">Selected</span>}
                </span>
              </motion.button>
            );
          })}
        </div>
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
