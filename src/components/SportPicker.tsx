import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Sport } from '../types';
import { FootballBall, HockeyPuck, SportBall } from './SportBall';
import {
  COMING_SOON_ACCENT,
  COMING_SOON_LABEL,
  COMING_SOON_SPORTS,
  SPORT_ACCENT,
  SPORT_LABEL,
  SPORT_PICKER_BG,
  SPORTS,
  type ComingSoonSport,
} from '../lib/sportTheme';
import { playMenuClick } from '../lib/menuAudio';

interface SportPickerProps {
  sport: Sport;
  onSportChange: (sport: Sport) => void;
  layout?: 'bar' | 'rail';
}

interface ComingSoonSportButtonProps {
  sport: ComingSoonSport;
  isOpen: boolean;
  onToggle: (sport: ComingSoonSport) => void;
  rail?: boolean;
}

function ComingSoonSportButton({ sport, isOpen, onToggle, rail }: ComingSoonSportButtonProps) {
  const label = COMING_SOON_LABEL[sport];
  const accent = COMING_SOON_ACCENT[sport];

  if (rail) {
    return (
      <div
        role="tab"
        aria-selected={false}
        aria-label={`${label} — Coming soon`}
        title="Coming soon"
        className="flex items-center gap-2.5 sm:gap-3 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-2xl border-[3px] border-[#2b2d31] opacity-40"
      >
        <span className="grayscale shrink-0">
          {sport === 'football' ? <FootballBall size={28} /> : <HockeyPuck size={28} />}
        </span>
        <div className="min-w-0 flex flex-col gap-0.5">
          <span className="text-[11px] sm:text-sm font-black uppercase tracking-wide text-[#5c5e66] leading-none">
            {label}
          </span>
          <span
            className="text-[9px] font-black uppercase tracking-wider leading-none"
            style={{ color: accent }}
          >
            Coming soon
          </span>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      role="tab"
      aria-selected={false}
      aria-expanded={isOpen}
      aria-label={`${label} — Coming soon`}
      title="Coming soon"
      onClick={() => onToggle(sport)}
      className={`relative shrink-0 flex items-center gap-1.5 sm:gap-2 rounded-xl px-2.5 sm:px-3 py-2 cursor-not-allowed transition-all ${
        isOpen ? 'opacity-60' : 'opacity-35 hover:opacity-50'
      }`}
      style={
        isOpen
          ? {
              boxShadow: `inset 0 0 0 2px ${accent}66, 0 3px 0 rgba(0,0,0,0.25)`,
              background: `${accent}18`,
            }
          : undefined
      }
    >
      <span className="text-xs sm:text-sm font-black tracking-wide text-[#b5bac1] uppercase leading-none">
        {label}
      </span>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.span
            key="coming-soon"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden text-[10px] sm:text-xs font-black tracking-wide uppercase whitespace-nowrap leading-none"
            style={{ color: accent }}
          >
            Coming soon
          </motion.span>
        )}
      </AnimatePresence>
      <span className="flex items-center justify-center shrink-0 grayscale">
        {sport === 'football' ? <FootballBall size={22} /> : <HockeyPuck size={22} />}
      </span>
    </button>
  );
}

export function SportPicker({ sport, onSportChange, layout = 'bar' }: SportPickerProps) {
  const [openComingSoon, setOpenComingSoon] = useState<ComingSoonSport | null>(null);
  const rail = layout === 'rail';

  const handleComingSoonToggle = (next: ComingSoonSport) => {
    playMenuClick();
    setOpenComingSoon(current => (current === next ? null : next));
  };

  if (rail) {
    return (
      <div className="flex flex-col items-stretch gap-3" role="tablist" aria-label="Choose sport">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#949ba4] px-1">
          Sports
        </p>
        <div className="flex flex-col items-stretch gap-2.5">
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
                  setOpenComingSoon(null);
                  onSportChange(sp);
                }}
                className={`relative flex items-center gap-2.5 sm:gap-3 px-2.5 py-2 sm:px-3 sm:py-2.5 min-h-[48px] sm:min-h-[52px] rounded-2xl border-[3px] transition-colors ${
                  active ? '' : 'opacity-45 hover:opacity-80'
                }`}
                style={
                  active
                    ? {
                        borderColor: `${accent}cc`,
                        background: `${accent}18`,
                        boxShadow: `0 4px 0 ${accent}55`,
                      }
                    : {
                        borderColor: '#2b2d31',
                        background: 'transparent',
                        boxShadow: '0 4px 0 transparent',
                      }
                }
              >
                <span className="shrink-0 w-[30px] h-[30px] flex items-center justify-center">
                  <SportBall sport={sp} size={30} />
                </span>
                <span
                  className={`text-[11px] sm:text-sm font-black uppercase tracking-wide leading-none ${
                    active ? 'text-[#f2f3f5]' : 'text-[#5c5e66]'
                  }`}
                  style={active ? { color: accent === '#f4f4f5' ? '#f2f3f5' : accent } : undefined}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="w-full h-[3px] rounded-full bg-[#2b2d31] my-0.5" />

        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5c5e66] px-1">
          Coming soon
        </p>
        <div className="flex flex-col items-stretch gap-2">
          {COMING_SOON_SPORTS.map(sp => (
            <ComingSoonSportButton
              key={sp}
              sport={sp}
              isOpen={false}
              onToggle={() => {}}
              rail
            />
          ))}
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
              setOpenComingSoon(null);
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

      {COMING_SOON_SPORTS.map(sp => (
        <ComingSoonSportButton
          key={sp}
          sport={sp}
          isOpen={openComingSoon === sp}
          onToggle={handleComingSoonToggle}
        />
      ))}
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
