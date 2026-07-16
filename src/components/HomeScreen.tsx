import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Play, ShoppingBag, X, Check, Info, Zap, Trophy, Timer, Swords, Settings, Medal } from 'lucide-react';
import type { Sport, GameMode } from '../types';
import type { PlayerProfile } from '../types/profile';
import { getTodayKey } from '../lib/seed';
import { SportBackground } from './SportBackground';
import { SportBall } from './SportBall';
import { SportPicker, SportBadge } from './SportPicker';
import { CharacterPodium } from './3d/CharacterPodium';
import { HeaderStats, LevelCorner } from './LevelBar';
import { getCharacterDef, getPetDef } from '../types/profile';
import { SPORT_ACCENT, SPORT_PODIUM_ACCENT } from '../lib/sportTheme';
import { playMenuBack, playMenuClick, playMenuConfirm } from '../lib/menuAudio';
import { useSettings } from '../hooks/useSettings';

interface HomeScreenProps {
  sport: Sport;
  onSportChange: (sport: Sport) => void;
  onStart: (mode: GameMode) => void;
  profile: PlayerProfile;
  onOpenStore: () => void;
  onOpenCareer: () => void;
  onOpenAbout: () => void;
  onOpenSettings: () => void;
  onSaveName: (name: string) => void;
  online?: number | null;
}

const modeLabels: Record<GameMode, string> = {
  training: 'Training',
  daily: 'Daily Challenge',
  timed: 'Ranked',
  duel: '1v1 Duel',
};

const MODE_META: Record<GameMode, { tone: string; icon: typeof Zap; detail: string }> = {
  training: { tone: '#949ba4', icon: Zap, detail: '1 min · practice · no coins or XP' },
  daily: { tone: '#23a559', icon: Trophy, detail: '2 min · first finish pays · missions count' },
  timed: { tone: '#5865f2', icon: Timer, detail: '2 min · finish for ranked bonus' },
  duel: { tone: '#ed4245', icon: Swords, detail: 'Lobby code · race a friend · highest score wins' },
};

function onAccentFg(color: string) {
  return color === '#f4f4f5' || color === '#949ba4' || color === '#f0b232' ? '#18191c' : '#ffffff';
}

function EditableName({
  name,
  onSave,
}: {
  name: string;
  onSave: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(name);
  }, [name]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function commit() {
    const trimmed = draft.trim().slice(0, 18);
    onSave(trimmed || 'Pro');
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') { setDraft(name); setEditing(false); }
          }}
          maxLength={18}
          className="w-44 text-center text-lg font-black bg-[#1e1f22] border-[3px] border-[#5865f2] rounded-2xl px-3 py-1.5 text-[#f2f3f5] outline-none shadow-[0_3px_0_#2f3aa8]"
        />
        <button
          type="button"
          onClick={commit}
          className="p-2 rounded-xl bg-[#23a559] border-[3px] border-white/25 text-white shadow-[0_3px_0_#14532d] hover:translate-y-[1px] hover:shadow-[0_2px_0_#14532d] transition-all"
        >
          <Check className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="group flex items-center gap-2 hover:opacity-90 transition-opacity"
    >
      <h2 className="text-xl sm:text-2xl font-black text-[#f2f3f5] tracking-tight">{name}</h2>
      <Pencil className="w-3.5 h-3.5 text-[#5c5e66] group-hover:text-[#949ba4] transition-colors" />
    </button>
  );
}

export function HomeScreen({
  sport,
  onSportChange,
  onStart,
  profile,
  onOpenStore,
  onOpenCareer,
  onOpenAbout,
  onOpenSettings,
  onSaveName,
  online,
}: HomeScreenProps) {
  const [showModes, setShowModes] = useState(false);
  const { settings } = useSettings();
  const s = profile.stats[sport];
  const today = getTodayKey();
  const dailyDone = s.dailyCompleted.includes(today);
  const accent = SPORT_ACCENT[sport];
  const character = getCharacterDef(profile.equippedCharacter);
  const showOnline = settings.showOnlineCount ? online : null;

  return (
    <div className="relative h-svh overflow-hidden">
      <SportBackground sport={sport} />

      {/* Sportivia — very top left */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-0 left-0 z-30 p-3 sm:p-4 flex items-center gap-2"
      >
        <SportBall sport={sport} size={24} className="shrink-0 drop-shadow-sm" />
        <h1 className="text-base sm:text-xl font-black tracking-tight text-[#f2f3f5] leading-none">
          Sportivia
        </h1>
      </motion.div>

      {/* Left-center sport rail + record */}
      <motion.aside
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-30 pl-2 sm:pl-5 flex flex-col items-stretch gap-3 sm:gap-4 max-sm:scale-[0.92] max-sm:origin-left"
      >
        <SportPicker sport={sport} onSportChange={onSportChange} layout="rail" />

        <div
          className="flex items-center gap-2.5 sm:gap-3 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-2xl border-[3px]"
          style={{
            borderColor: `${accent}88`,
            background: `${accent}14`,
            boxShadow: `0 4px 0 ${accent}44`,
          }}
        >
          <div
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border-2 border-white/20 shrink-0"
            style={{ background: accent }}
          >
            <Trophy
              className="w-4 h-4"
              style={{ color: accent === '#f4f4f5' ? '#18191c' : '#fff' }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#949ba4] leading-none mb-1">
              Record
            </p>
            <p className="text-sm sm:text-base font-black text-[#f2f3f5] font-mono leading-none">
              {s.bestScore > 0 ? s.bestScore : '—'}
              <span className="text-[10px] font-black text-[#949ba4] ml-1.5 tracking-wide">
                BEST
              </span>
            </p>
            {(s.dailyStreak > 0 || dailyDone) && (
              <p className="text-[10px] font-black mt-1.5 leading-none">
                {s.dailyStreak > 0 && (
                  <span className="text-[#f0b232]">🔥 {s.dailyStreak}d</span>
                )}
                {s.dailyStreak > 0 && dailyDone && (
                  <span className="text-[#5c5e66]"> · </span>
                )}
                {dailyDone && <span className="text-[#23a559]">Daily done</span>}
              </p>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Coins, level, about, store — very top right */}
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-0 right-0 z-30 p-2 sm:p-4 flex items-center gap-1 sm:gap-2"
      >
        <HeaderStats profile={profile} online={showOnline} />
        <button
          type="button"
          onClick={() => {
            playMenuClick();
            onOpenSettings();
          }}
          className="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:gap-1 sm:px-3 sm:py-1.5 rounded-full bg-[#1e1f22] border-[2.5px] border-[#3f4147] hover:border-[#f0b232] shadow-[0_3px_0_#1a1b1f] hover:translate-y-[1px] hover:shadow-[0_2px_0_#1a1b1f] backdrop-blur-md transition-all"
          aria-label="Settings"
        >
          <Settings className="w-3.5 h-3.5 text-[#949ba4]" />
          <span className="text-[10px] sm:text-xs font-black text-[#b5bac1] hidden sm:inline">Settings</span>
        </button>
        <button
          type="button"
          onClick={() => {
            playMenuClick();
            onOpenAbout();
          }}
          className="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:gap-1 sm:px-3 sm:py-1.5 rounded-full bg-[#1e1f22] border-[2.5px] border-[#3f4147] hover:border-[#23a559] shadow-[0_3px_0_#1a1b1f] hover:translate-y-[1px] hover:shadow-[0_2px_0_#1a1b1f] backdrop-blur-md transition-all"
          aria-label="About"
        >
          <Info className="w-3.5 h-3.5 text-[#949ba4]" />
          <span className="text-[10px] sm:text-xs font-black text-[#b5bac1] hidden sm:inline">About</span>
        </button>
        <button
          type="button"
          onClick={() => {
            playMenuClick();
            onOpenCareer();
          }}
          className="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:gap-1 sm:px-3 sm:py-1.5 rounded-full bg-[#1e1f22] border-[2.5px] border-[#3f4147] hover:border-[#f0b232] shadow-[0_3px_0_#1a1b1f] hover:translate-y-[1px] hover:shadow-[0_2px_0_#1a1b1f] backdrop-blur-md transition-all"
          aria-label="Career"
        >
          <Medal className="w-3.5 h-3.5 text-[#949ba4]" />
          <span className="text-[10px] sm:text-xs font-black text-[#b5bac1] hidden sm:inline">Career</span>
        </button>
        <button
          type="button"
          onClick={() => {
            playMenuClick();
            onOpenStore();
          }}
          className="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:gap-1 sm:px-3 sm:py-1.5 rounded-full bg-[#1e1f22] border-[2.5px] border-[#3f4147] hover:border-[#5865f2] shadow-[0_3px_0_#1a1b1f] hover:translate-y-[1px] hover:shadow-[0_2px_0_#1a1b1f] backdrop-blur-md transition-all"
          aria-label="Store"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-[#949ba4]" />
          <span className="text-[10px] sm:text-xs font-black text-[#b5bac1] hidden sm:inline">Store</span>
        </button>
      </motion.div>

      {/* Level — bottom right alone */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-0 right-0 z-30 p-2 sm:p-4 max-sm:scale-90 max-sm:origin-bottom-right"
      >
        <LevelCorner profile={profile} accent={accent} />
      </motion.div>

      {/* Hero — character center stage */}
      <div className="relative z-10 h-svh flex flex-col items-center justify-center pl-14 sm:pl-4 pr-3 sm:px-4 pt-14 sm:pt-12 pb-16 sm:pb-10 max-sm:translate-y-0 sm:-translate-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center w-full max-w-md min-h-0"
        >
          <div className="flex flex-col items-center translate-x-0 sm:translate-x-2.5 translate-y-1 sm:translate-y-4 relative z-10 -mb-1 shrink-0">
            <EditableName name={profile.playerName} onSave={onSaveName} />
            <p className="text-xs font-semibold text-[#949ba4] mt-0.5 mb-0 text-center">
              {profile.equippedPet
                ? `${character.name} · ${getPetDef(profile.equippedPet).name}`
                : character.name}
            </p>
          </div>

          <div className="relative w-full max-w-[min(100%,320px)] sm:max-w-[520px] shrink min-h-0">
            <div className="max-sm:scale-[0.88] max-sm:origin-top">
            <CharacterPodium
              characterId={profile.equippedCharacter}
              accent={SPORT_PODIUM_ACCENT[sport]}
              height={330}
              bare
              hero
              sport={sport}
              className="w-full max-w-[400px] sm:max-w-[450px] mx-auto"
              {...(profile.equippedCharacter === 'creative'
                ? { creativeLoadout: profile.creativeLoadout }
                : {})}
            />
            </div>
            {profile.equippedPet && (
              <div className="absolute right-0 sm:right-[-6%] bottom-0 w-[50%] sm:w-[56%] max-w-[280px] pointer-events-none max-sm:scale-90 max-sm:origin-bottom-right">
                <CharacterPodium
                  petId={profile.equippedPet}
                  accent={getPetDef(profile.equippedPet).accent}
                  height={300}
                  bare
                  hero
                  hidePodium
                  className="w-full"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col items-center mt-1 sm:mt-2 shrink-0">
            <motion.button
              type="button"
              whileHover={{
                scale: 1.05,
                y: -3,
                transition: { type: 'spring', stiffness: 420, damping: 18 },
              }}
              whileTap={{ scale: 0.96, y: 2 }}
              onClick={() => {
                playMenuClick();
                setShowModes(true);
              }}
              className="group/play relative overflow-hidden flex items-center gap-2.5 px-8 sm:px-10 py-3 sm:py-3.5 rounded-2xl text-sm sm:text-base font-black border-[3px] border-white/30 transition-[box-shadow] duration-200"
              style={{
                background: accent,
                color: onAccentFg(accent),
                boxShadow: `0 6px 0 ${accent === '#f4f4f5' ? '#8a8a8f' : `${accent}99`}, 0 0 0 0 ${accent}00`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = `0 9px 0 ${accent === '#f4f4f5' ? '#8a8a8f' : `${accent}99`}, 0 12px 32px ${accent}55`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = `0 6px 0 ${accent === '#f4f4f5' ? '#8a8a8f' : `${accent}99`}, 0 0 0 0 ${accent}00`;
              }}
            >
              <span className="play-btn-shine" aria-hidden />
              <Play className="relative z-10 w-5 h-5 fill-current drop-shadow-sm transition-transform duration-300 ease-out group-hover/play:scale-125 group-hover/play:-rotate-12" />
              <span className="relative z-10 tracking-wide">Play</span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Mode picker modal */}
      <AnimatePresence>
        {showModes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              playMenuBack();
              setShowModes(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              className="w-full max-w-md max-h-[85svh] overflow-y-auto overscroll-contain rounded-[28px] bg-[#151619] border-[3px] border-[#3f4147] p-4 sm:p-5 shadow-[0_10px_0_#0c0d0f]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <SportBadge sport={sport} size={24} />
                  <div>
                    <h3 className="text-lg font-black text-[#f2f3f5]">Choose Mode</h3>
                    <p className="text-xs font-semibold text-[#949ba4] mt-0.5">Pick how you want to play</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playMenuBack();
                    setShowModes(false);
                  }}
                  className="p-2 rounded-xl border-[2.5px] border-[#3f4147] bg-[#1e1f22] hover:bg-[#2b2d31] text-[#949ba4] shadow-[0_3px_0_#1a1b1f] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5">
                {(['training', 'daily', 'timed', 'duel'] as GameMode[]).map(m => {
                  const meta = MODE_META[m];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        playMenuConfirm();
                        setShowModes(false);
                        onStart(m);
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-3.5 rounded-[20px] border-[3px] text-left transition-all hover:translate-y-[1px]"
                      style={{
                        background: `linear-gradient(160deg, ${meta.tone}22 0%, #1a1b1f 55%)`,
                        borderColor: `${meta.tone}88`,
                        boxShadow: `0 5px 0 ${meta.tone}55`,
                      }}
                    >
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center border-[3px] border-white/25 shrink-0 shadow-[0_3px_0_rgba(0,0,0,0.35)]"
                        style={{
                          background: meta.tone,
                          color: onAccentFg(meta.tone),
                        }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-[#f2f3f5] text-sm">
                            {m === 'duel' ? '1v1 Duel' : modeLabels[m]}
                          </p>
                          {m === 'daily' && dailyDone && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#23a559] text-white font-black border-2 border-[#4ade80] shadow-[0_2px_0_#14532d]">
                              DONE
                            </span>
                          )}
                          {m === 'duel' && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#ed4245] text-white font-black border-2 border-[#ff8a8c] shadow-[0_2px_0_#8f1e22]">
                              LIVE
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-semibold text-[#949ba4] mt-0.5">
                          {meta.detail}
                        </p>
                      </div>
                      <span className="text-lg font-black shrink-0" style={{ color: meta.tone }}>→</span>
                    </button>
                  );
                })}
              </div>

              {s.bestScore > 0 && (
                <p className="text-center text-[10px] font-black uppercase tracking-wider text-[#5c5e66] mt-4">
                  Best {s.bestScore}
                  {s.dailyStreak > 0 && ` · 🔥 ${s.dailyStreak}d`}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
