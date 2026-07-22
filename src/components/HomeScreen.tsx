import { useState, useRef, useEffect, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pencil, Play, ShoppingBag, Check, Info, Settings,
  Medal, ArrowLeft,
} from 'lucide-react';
import type { Sport, GameMode, BotDifficulty } from '../types';
import type { PlayerProfile } from '../types/profile';
import { getTodayKey } from '../lib/seed';
import { SportBackground } from './SportBackground';
import { SportBall } from './SportBall';
import { SportPicker } from './SportPicker';
import { CharacterPodium } from './3d/CharacterPodium';
import { HeaderStats, LevelCorner } from './LevelBar';
import { getCharacterDef, getPetDef } from '../types/profile';
import { SPORT_ACCENT, SPORT_PODIUM_ACCENT, SPORT_LABEL, SPORT_RAIL_BG } from '../lib/sportTheme';
import { playMenuBack, playMenuClick, playMenuConfirm } from '../lib/menuAudio';
import { PAGE_TRANSITION } from '../lib/pageTransitions';
import { useSettings } from '../hooks/useSettings';
import { pickRandomPlayerName } from '../lib/playerNames';
import { BOT_DIFFICULTIES } from '../lib/botOpponent';

interface HomeScreenProps {
  sport: Sport;
  onSportChange: (sport: Sport) => void;
  onStart: (mode: GameMode, botDifficulty?: BotDifficulty) => void;
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
  bot: 'Vs AI',
  duel: '1v1 Duel',
};

const MODE_META: Record<GameMode, { tone: string; icon: string; detail: string }> = {
  training: { tone: '#949ba4', icon: '/icons/modes/training.png', detail: '1 min · practice · no rewards' },
  daily: { tone: '#23a559', icon: '/icons/modes/daily.png', detail: '2 min · first finish pays' },
  timed: { tone: '#5865f2', icon: '/icons/modes/ranked.png', detail: '2 min · ranked bonus' },
  bot: { tone: '#a855f7', icon: '/icons/modes/bot.png', detail: 'Race a bot · highest score wins' },
  duel: { tone: '#ed4245', icon: '/icons/modes/duel.png', detail: 'Lobby code · highest score wins' },
};

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
    onSave(trimmed || pickRandomPlayerName());
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
  const [showBotDifficulties, setShowBotDifficulties] = useState(false);
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

      <div
        className={`transition-opacity duration-300 ${showModes ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      >
      {/* Sportivia — very top left */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-0 left-0 z-30 flex items-center gap-2 pt-[max(0.75rem,env(safe-area-inset-top))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-2 pb-2 sm:p-4"
      >
        <SportBall sport={sport} size={30} className="shrink-0 drop-shadow-sm" />
        <h1 className="text-xl sm:text-4xl font-black tracking-tight text-[#f2f3f5] leading-none">
          Sportivia
        </h1>
      </motion.div>

      {/* Left-center sport rail + record */}
      <motion.aside
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-30 flex flex-col items-stretch gap-2.5 sm:gap-4 pl-[max(0.5rem,env(safe-area-inset-left))] sm:pl-5 max-sm:scale-[0.92] max-sm:origin-left"
      >
        <SportPicker sport={sport} onSportChange={onSportChange} layout="rail" />

        <div
          className="game-sport-record"
          style={
            {
              '--sport-rail-bg': SPORT_RAIL_BG[sport].base,
            } as CSSProperties
          }
        >
          <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 shrink-0">
            <img
              src="/icons/trophy-record.png"
              alt=""
              width={32}
              height={32}
              draggable={false}
              className="h-7 w-7 sm:h-8 sm:w-8 select-none object-contain drop-shadow-[0_2px_0_rgba(0,0,0,0.35)]"
            />
          </div>
          <div className="min-w-0 flex-1 hidden sm:block">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#949ba4] leading-none mb-1">
              Record
            </p>
            <p className="text-sm sm:text-base font-black text-[#f2f3f5] font-mono leading-none">
              {s.bestScore > 0 ? s.bestScore : '—'}
              <span className="text-[10px] font-black text-[#949ba4] ml-1.5 tracking-wide">
                ALL-TIME BEST
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
          <div className="min-w-0 flex-1 sm:hidden text-center">
            <p className="text-[8px] font-black uppercase tracking-wide text-[#949ba4] leading-none mb-0.5">
              Best
            </p>
            <p className="text-xs font-black text-[#f2f3f5] font-mono leading-none">
              {s.bestScore > 0 ? s.bestScore : '—'}
            </p>
          </div>
        </div>
      </motion.aside>

      {/* Coins + game nav tabs — top right */}
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-0 right-0 z-30 flex max-w-[min(100vw-7.5rem,100%)] items-center gap-1 overflow-x-auto overscroll-x-contain scrollbar-none pt-[max(0.5rem,env(safe-area-inset-top))] pr-[max(0.5rem,env(safe-area-inset-right))] pb-2 pl-1 sm:max-w-none sm:gap-2.5 sm:overflow-visible sm:p-4"
      >
        <HeaderStats profile={profile} online={showOnline} coinStyle="home" />
        <button
          type="button"
          onClick={() => {
            playMenuClick();
            onOpenSettings();
          }}
          className="game-nav-tab"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4 sm:h-[1.05rem] sm:w-[1.05rem]" />
          <span className="hidden sm:inline">Settings</span>
        </button>
        <button
          type="button"
          onClick={() => {
            playMenuClick();
            onOpenAbout();
          }}
          className="game-nav-tab"
          aria-label="About"
        >
          <Info className="h-4 w-4 sm:h-[1.05rem] sm:w-[1.05rem]" />
          <span className="hidden sm:inline">About</span>
        </button>
        <button
          type="button"
          onClick={() => {
            playMenuClick();
            onOpenCareer();
          }}
          className="game-nav-tab"
          aria-label="Career"
        >
          <Medal className="h-4 w-4 sm:h-[1.05rem] sm:w-[1.05rem]" />
          <span className="hidden sm:inline">Career</span>
        </button>
        <button
          type="button"
          onClick={() => {
            playMenuClick();
            onOpenStore();
          }}
          className="game-nav-tab"
          aria-label="Store"
        >
          <ShoppingBag className="h-4 w-4 sm:h-[1.05rem] sm:w-[1.05rem]" />
          <span className="hidden sm:inline">Store</span>
        </button>
      </motion.div>

      {/* Level — bottom right alone */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-0 right-0 z-30 pb-[max(0.5rem,env(safe-area-inset-bottom))] pr-[max(0.5rem,env(safe-area-inset-right))] pl-2 pt-2 sm:p-4 max-sm:scale-90 max-sm:origin-bottom-right"
      >
        <LevelCorner profile={profile} accent={accent} />
      </motion.div>

      {/* Hero — character center stage */}
      <div className="relative z-10 h-svh flex flex-col items-center justify-center pl-[4.75rem] sm:pl-4 pr-3 sm:px-4 pt-[max(4rem,calc(env(safe-area-inset-top)+3.25rem))] sm:pt-14 pb-[max(4rem,calc(env(safe-area-inset-bottom)+3.5rem))] sm:pb-10 max-sm:translate-y-0 sm:-translate-y-4">
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

          <div className="relative w-full max-w-[min(100%,280px)] sm:max-w-[520px] shrink min-h-0">
            <div className="max-sm:scale-[0.82] max-sm:origin-top">
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
              {...(profile.equippedCharacter === 'athlete'
                ? { athleteLoadout: profile.athleteLoadout }
                : {})}
              {...(profile.equippedCharacter === 'bob'
                ? { bobLoadout: profile.bobLoadout }
                : {})}
              {...(profile.equippedCharacter === 'bunny'
                ? { rabbitVariant: profile.rabbitVariant }
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
                  {...(profile.equippedPet === 'dog'
                    ? { dogVariant: profile.dogVariant }
                    : {})}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col items-center mt-1 sm:mt-2 shrink-0">
            <motion.button
              type="button"
              whileHover={{
                scale: 1.04,
                y: -2,
                transition: { type: 'spring', stiffness: 420, damping: 18 },
              }}
              whileTap={{ scale: 0.97, y: 2 }}
              onClick={() => {
                playMenuClick();
                setShowBotDifficulties(false);
                setShowModes(true);
              }}
              className="group/play flex items-center gap-2.5 rounded-2xl border-[3px] border-white/30 bg-gradient-to-b from-[#ffe08a] via-[#f0b232] to-[#d4921a] px-9 py-3.5 text-sm font-black text-[#3a2600] shadow-[0_5px_0_#a5711a] transition-all hover:brightness-105 sm:px-11 sm:py-4 sm:text-base"
            >
              <Play className="h-5 w-5 fill-current drop-shadow-sm transition-transform duration-300 ease-out group-hover/play:scale-110 group-hover/play:-rotate-12" />
              <span className="tracking-wide">Play</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
      </div>

      {/* Mode picker modal */}
      <AnimatePresence>
        {showModes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]"
            onClick={() => {
              playMenuBack();
              setShowModes(false);
            }}
          >
            <button
              type="button"
              onClick={() => {
                playMenuBack();
                setShowModes(false);
              }}
              className="fixed top-0 left-0 z-50 m-3 flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border-[2.5px] border-[#3f4147] bg-[#1e1f22] px-3 py-2 text-xs font-black text-[#b5bac1] shadow-[0_3px_0_#1a1b1f] sm:m-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <motion.div
              initial={{ opacity: 0, y: 36, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 28, scale: 0.97 }}
              transition={PAGE_TRANSITION}
              className="relative z-10 flex min-h-svh w-full flex-col justify-center overflow-y-auto overscroll-contain px-4 py-8 pt-[max(4.5rem,calc(env(safe-area-inset-top)+3.5rem))] pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="mx-auto mb-5 flex w-full max-w-lg items-center gap-3 sm:mb-6">
                <h3 className="text-2xl font-black tracking-tight text-[#f2f3f5] sm:text-4xl">Game Modes</h3>
                <span
                  className="rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em]"
                  style={{
                    borderColor: `${accent}88`,
                    background: `${accent}1a`,
                    color: accent === '#f4f4f5' ? '#f2f3f5' : accent,
                  }}
                >
                  {SPORT_LABEL[sport]}
                </span>
              </div>

              <div className="mx-auto flex w-full max-w-lg flex-col gap-3">
                {(['daily', 'training', 'timed', 'bot', 'duel'] as GameMode[]).map((m, i) => {
                  const meta = MODE_META[m];
                  return (
                    <motion.div
                      key={m}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...PAGE_TRANSITION, delay: 0.04 * i }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          playMenuConfirm();
                          if (m === 'bot') {
                            setShowBotDifficulties(open => !open);
                            return;
                          }
                          setShowModes(false);
                          onStart(m);
                        }}
                        className="group/mode relative flex h-[88px] w-full items-center gap-4 overflow-hidden rounded-2xl border-[3px] px-4 text-left transition-all hover:translate-y-[1px] sm:h-[96px] sm:px-5"
                        style={{
                          background: `linear-gradient(160deg, ${meta.tone}22 0%, #1a1b1f 55%)`,
                          borderColor: `${meta.tone}88`,
                          boxShadow: `0 5px 0 ${meta.tone}55`,
                        }}
                      >
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-0 opacity-[0.12] transition-opacity group-hover/mode:opacity-[0.2]"
                          style={{ backgroundImage: `radial-gradient(circle at 92% 12%, ${meta.tone}, transparent 42%)` }}
                        />
                        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-[3px] border-white/15 bg-[#111214]/80 shadow-[0_3px_0_rgba(0,0,0,0.35)]">
                          <img
                            src={meta.icon}
                            alt=""
                            className="h-9 w-9 object-contain"
                            draggable={false}
                          />
                        </div>
                        <div className="relative min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-lg font-black text-[#f2f3f5]">
                              {modeLabels[m]}
                            </p>
                            {m === 'daily' && dailyDone && (
                              <span className="rounded-full border-2 border-[#4ade80] bg-[#23a559] px-2 py-0.5 text-[9px] font-black text-white shadow-[0_2px_0_#14532d]">
                                DONE
                              </span>
                            )}
                            {m === 'duel' && (
                              <span className="rounded-full border-2 border-[#ff8a8c] bg-[#ed4245] px-2 py-0.5 text-[9px] font-black text-white shadow-[0_2px_0_#8f1e22]">
                                LIVE
                              </span>
                            )}
                          </div>
                          <p className="mt-1 truncate text-xs font-semibold whitespace-nowrap text-[#949ba4]">
                            {meta.detail}
                          </p>
                        </div>
                        <span className="relative shrink-0 text-lg font-black" style={{ color: meta.tone }}>
                          {m === 'bot' && showBotDifficulties ? '↑' : '→'}
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {m === 'bot' && showBotDifficulties && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={PAGE_TRANSITION}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-3 gap-2 px-1 pt-3">
                              {(Object.keys(BOT_DIFFICULTIES) as BotDifficulty[]).map(difficulty => {
                                const config = BOT_DIFFICULTIES[difficulty];
                                return (
                                  <button
                                    key={difficulty}
                                    type="button"
                                    onClick={() => {
                                      playMenuConfirm();
                                      setShowModes(false);
                                      setShowBotDifficulties(false);
                                      onStart('bot', difficulty);
                                    }}
                                    className="rounded-2xl border-[2.5px] bg-[#111214] px-2 py-3 text-center shadow-[0_3px_0_#0c0d0f] transition-transform hover:translate-y-[1px]"
                                    style={{ borderColor: `${config.color}aa` }}
                                  >
                                    <p className="text-xs font-black" style={{ color: config.color }}>
                                      {config.label}
                                    </p>
                                    <p className="mt-1 text-[8px] font-bold leading-tight text-[#7a7d86]">
                                      {difficulty === 'beginner' ? 'Steady' : difficulty === 'pro' ? 'Competitive' : 'Fast'}
                                    </p>
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
