import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pencil, Play, ShoppingBag, Check, Info, Settings,
  Medal, ArrowLeft, LayoutGrid, Gamepad2, Wifi,
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
import { SPORT_ACCENT, SPORT_PODIUM_ACCENT, SPORT_LABEL, SPORTS } from '../lib/sportTheme';
import { playMenuBack, playMenuClick, playMenuConfirm } from '../lib/menuAudio';
import { PAGE_TRANSITION } from '../lib/pageTransitions';
import { useSettings } from '../hooks/useSettings';
import { pickRandomPlayerName } from '../lib/playerNames';
import { BOT_DIFFICULTIES } from '../lib/botOpponent';
import { isDailySpinAvailable } from '../lib/profileStorage';
import { DailySpinModal } from './DailySpinModal';
import type { DailySpinPrize } from '../lib/dailySpin';
import { DAILY_SPIN_ICON } from '../lib/dailySpin';
import { assetUrl } from '../lib/assetUrl';
import { isPokiBuild } from '../lib/platformBuild';
import { ModeGuideOverlay } from './ModeGuideOverlay';

interface HomeScreenProps {
  sport: Sport | null;
  onSportChange: (sport: Sport) => void;
  onStart: (
    mode: GameMode,
    botDifficulty?: BotDifficulty,
    duelChoice?: 'friend' | 'random',
  ) => void;
  profile: PlayerProfile;
  onOpenStore: () => void;
  onOpenCards: () => void;
  onOpenCareer: () => void;
  onOpenAbout: () => void;
  onOpenSettings: () => void;
  onSaveName: (name: string) => void;
  onProfileChange?: (profile: PlayerProfile) => void;
  online?: number | null;
}

const modeLabels: Record<GameMode, string> = {
  training: 'Training',
  daily: 'Daily Challenge',
  timed: 'Ranked',
  bot: 'Vs AI',
  duel: '1v1 Duel',
  quick: 'Quick Play',
  clue: 'Guess the Player',
  campaign: 'Campaign',
};

const MODE_META: Record<
  GameMode,
  { tone: string; icon: string; detail: string; blurb: string; howTo: string[] }
> = {
  training: {
    tone: '#949ba4',
    icon: '/icons/modes/training.png',
    detail: '1 min · practice · no rewards',
    blurb: 'A short practice board with no coins or XP. Warm up, learn the categories, then jump into a real mode.',
    howTo: [
      'Open a one-minute practice board for your selected sport.',
      'Fill cells by naming players that fit each category.',
      'No coins or XP are awarded — it’s a pure warm-up.',
    ],
  },
  daily: {
    tone: '#23a559',
    icon: '/icons/modes/daily.png',
    detail: '2 min · first finish pays',
    blurb: 'One shared board per sport each day. Your first finish pays coins + XP; later runs still count toward your streak.',
    howTo: [
      'Everyone gets the same daily board for that sport.',
      'Finish within 2 minutes to lock in your score.',
      'Your first clear of the day pays coins + XP; later runs still grow your streak.',
    ],
  },
  timed: {
    tone: '#5865f2',
    icon: '/icons/modes/ranked.png',
    detail: '2 min · ranked bonus',
    blurb: 'Classic timed board run. Score for coins, XP, and ranked payout — the main grind when you want real rewards.',
    howTo: [
      'Race a fresh 2-minute board and fill as many cells as you can.',
      'Higher scores earn more coins and XP.',
      'Ranked payouts boost the best finishes.',
    ],
  },
  quick: {
    tone: '#f59e0b',
    icon: '/icons/modes/quick.png',
    detail: '10 Qs · fast trivia · light coins',
    blurb: 'Ten rapid-fire trivia questions — no bingo board. Fast rounds with a light coin payout; Daily & Ranked pay more.',
    howTo: [
      'Answer 10 multiple-choice trivia questions in a row.',
      'No bingo board — just speed and sports knowledge.',
      'Earn a light coin payout; Daily and Ranked pay more.',
    ],
  },
  clue: {
    tone: '#22d3ee',
    icon: '/icons/modes/clue.png',
    detail: '90 sec · type names · big coins',
    blurb:
      'One hidden player from your selected sport. Progressive clues reveal every 5 seconds. Type the exact player with suggestions; guess early for full coins, because every extra hint cuts the payout.',
    howTo: [
      'A mystery player is hidden — clues unlock every few seconds.',
      'Type the name (suggestions help with spelling).',
      'Guess early for max coins; each extra hint lowers the payout.',
    ],
  },
  campaign: {
    tone: '#f0b232',
    icon: '/icons/trophy-record.png',
    detail: 'Special · 40 stages · all 5 sports',
    blurb:
      'Sportivia’s special path across all five top sports — soccer, basketball, baseball, football, and hockey. Climb 40 stages of player trivia + championship & award curveballs. Test what you know, learn as you go, and earn coins + XP with stars, chapter gates, and huge finale bonuses.',
    howTo: [
      'Climb 40 stages across all five sports.',
      'Earn stars, clear chapter gates, and unlock bigger bonuses.',
      'Finale stages pay the biggest coin and XP rewards.',
    ],
  },
  bot: {
    tone: '#a855f7',
    icon: '/icons/modes/bot.png',
    detail: 'Race a bot · stake coins · high risk',
    blurb: 'Race an AI on the same board. Pick a difficulty and optionally stake coins — win the race to cash out, or lose the bet.',
    howTo: [
      'Choose Beginner, Pro, or Elite difficulty.',
      'Optionally stake coins before the race starts.',
      'Beat the bot on the shared board to win the stake and rewards.',
    ],
  },
  duel: {
    tone: '#ed4245',
    icon: '/icons/modes/duel.png',
    detail: isPokiBuild() ? 'Live 1v1 · on sportivia.xyz' : 'Friend lobby or public matchmaking',
    blurb: isPokiBuild()
      ? 'Live online 1v1 isn’t supported on this platform. Open sportivia.xyz to duel another player — every other mode works here.'
      : 'Create a private room for a friend or search the public queue for a random opponent. Both use the same live 1v1 game.',
    howTo: isPokiBuild()
      ? [
          'Live duel isn’t available in this build.',
          'Open sportivia.xyz to play 1v1 against real players.',
          'Every other mode still works here.',
        ]
      : [
          'Create or join a private room with a code.',
          'Both players get the same live board.',
          'Highest score wins when the timer ends.',
        ],
  },
};

interface ModeCard {
  key: string;
  mode: GameMode;
  duelChoice?: 'friend' | 'random';
  label: string;
  tone: string;
  icon: string;
  detail: string;
  blurb: string;
  howTo: string[];
  live?: boolean;
}

function baseCard(mode: GameMode): ModeCard {
  return { key: mode, mode, label: modeLabels[mode], ...MODE_META[mode] };
}

const OFFLINE_CARDS: ModeCard[] = (
  ['daily', 'quick', 'clue', 'training', 'timed', 'bot'] as GameMode[]
).map(baseCard);

const ONLINE_CARDS: ModeCard[] = isPokiBuild()
  ? [{ ...baseCard('duel'), live: true }]
  : [
      {
        key: 'duel-friend',
        mode: 'duel',
        duelChoice: 'friend',
        label: '1v1 Duel',
        tone: '#ed4245',
        icon: '/icons/modes/duel.png',
        detail: 'Private room · invite by code',
        blurb:
          'Make a private room and share the code with a friend. You both play the exact same board at the same time, and the higher score takes the win.',
        howTo: [
          'Create a room or join with a shared code.',
          'Both players race the same live board.',
          'When time is up, the higher score wins.',
        ],
        live: true,
      },
      {
        key: 'duel-random',
        mode: 'duel',
        duelChoice: 'random',
        label: 'Online Public',
        tone: '#38bdf8',
        icon: '/icons/region-globe.png',
        detail: 'Public queue · random rival',
        blurb:
          'Jump into the public queue and get paired with a random live player on your sport. The match starts the moment someone is found — no code needed.',
        howTo: [
          'Enter the public matchmaking queue for your sport.',
          'Stay on the search screen until a rival is found.',
          'The duel starts automatically — no lobby code required.',
        ],
        live: true,
      },
    ];

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
  onOpenCards,
  onOpenCareer,
  onOpenAbout,
  onOpenSettings,
  onSaveName,
  onProfileChange,
  online,
}: HomeScreenProps) {
  const [showModes, setShowModes] = useState(false);
  const [showSportPick, setShowSportPick] = useState(false);
  const [pendingAfterSport, setPendingAfterSport] = useState<'modes' | 'campaign' | null>(null);
  const [showBotDifficulties, setShowBotDifficulties] = useState(false);
  const [showDailySpin, setShowDailySpin] = useState(false);
  const [modeInfo, setModeInfo] = useState<string | null>(null);
  const { settings } = useSettings();
  const homeSport = sport;
  const s = homeSport ? profile.stats[homeSport] : null;
  const today = getTodayKey();
  const dailyDone = Boolean(s?.dailyCompleted.includes(today));
  const spinReady = isDailySpinAvailable(profile);
  const accent = homeSport ? SPORT_ACCENT[homeSport] : '#f0b232';
  const character = getCharacterDef(profile.equippedCharacter);
  const showOnline = settings.showOnlineCount ? online : null;
  const guideCard =
    [...OFFLINE_CARDS, ...ONLINE_CARDS].find(card => card.key === modeInfo) ?? null;

  function handleSpinClaimed(next: PlayerProfile, _prize: DailySpinPrize) {
    onProfileChange?.(next);
  }

  function requestPlay() {
    playMenuClick();
    setShowBotDifficulties(false);
    setModeInfo(null);
    if (!homeSport) {
      setPendingAfterSport('modes');
      setShowSportPick(true);
      return;
    }
    setShowModes(true);
  }

  function requestCampaign() {
    playMenuConfirm();
    setModeInfo(null);
    if (!homeSport) {
      setPendingAfterSport('campaign');
      setShowSportPick(true);
      return;
    }
    onStart('campaign');
  }

  function renderModeCard(card: ModeCard, i: number) {
    const expandable = card.mode === 'bot';
    const expanded = expandable && showBotDifficulties;
    const guided = modeInfo === card.key;

    return (
      <motion.div
        key={card.key}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...PAGE_TRANSITION, delay: 0.03 * i }}
        className="relative"
      >
        <button
          type="button"
          onClick={() => {
            playMenuConfirm();
            setModeInfo(null);
            if (expandable) {
              setShowBotDifficulties(open => !open);
              return;
            }
            setShowBotDifficulties(false);
            setShowModes(false);
            onStart(card.mode, undefined, card.duelChoice);
          }}
          className="group/mode relative flex h-[66px] w-full items-center gap-3 overflow-hidden rounded-xl border-2 px-3.5 text-left transition-all hover:translate-y-[1px] sm:h-[72px] [@media(max-height:700px)]:!h-[60px]"
          style={{
            background: `linear-gradient(160deg, ${card.tone}22 0%, #1a1b1f 55%)`,
            borderColor: expanded ? card.tone : `${card.tone}88`,
            boxShadow: `0 4px 0 ${card.tone}55`,
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.12] transition-opacity group-hover/mode:opacity-[0.2]"
            style={{ backgroundImage: `radial-gradient(circle at 92% 12%, ${card.tone}, transparent 42%)` }}
          />

          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-white/15 bg-[#111214]/80 shadow-[0_2px_0_rgba(0,0,0,0.35)] [@media(max-height:700px)]:!h-10 [@media(max-height:700px)]:!w-10">
            <img
              src={assetUrl(card.icon)}
              alt=""
              className="h-8 w-8 object-contain [@media(max-height:700px)]:!h-7 [@media(max-height:700px)]:!w-7"
              draggable={false}
            />
          </span>

          <span className="relative block min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-base font-black leading-tight text-[#f2f3f5]">
                {card.label}
              </span>
              {card.mode === 'daily' && dailyDone && (
                <span className="shrink-0 rounded-full border-2 border-[#4ade80] bg-[#23a559] px-1.5 py-0.5 text-[10px] font-black text-white shadow-[0_2px_0_#14532d]">
                  DONE
                </span>
              )}
              {card.live && (
                <span
                  className="flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
                  style={{
                    borderColor: `${card.tone}88`,
                    background: `${card.tone}1f`,
                    color: card.tone,
                  }}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                      style={{ background: card.tone }}
                    />
                    <span
                      className="relative inline-flex h-1.5 w-1.5 rounded-full"
                      style={{ background: card.tone }}
                    />
                  </span>
                  Live
                </span>
              )}
              {expandable && (
                <span
                  className="shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
                  style={{
                    borderColor: `${card.tone}88`,
                    background: `${card.tone}1f`,
                    color: card.tone,
                  }}
                >
                  3 levels
                </span>
              )}
              <span
                role="button"
                tabIndex={0}
                aria-label={`About ${card.label}`}
                aria-expanded={guided}
                onClick={e => {
                  e.stopPropagation();
                  playMenuClick();
                  setModeInfo(card.key);
                }}
                onKeyDown={e => {
                  if (e.key !== 'Enter' && e.key !== ' ') return;
                  e.preventDefault();
                  e.stopPropagation();
                  playMenuClick();
                  setModeInfo(card.key);
                }}
                className={`inline-flex cursor-pointer p-1 transition-colors ${
                  guided ? 'text-[#f0b232]' : 'text-[#7a7d86] hover:text-[#d7dae0]'
                }`}
              >
                <Info className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
            </span>
            <span className="mt-1 block truncate text-xs font-semibold leading-none text-[#949ba4]">
              {card.detail}
            </span>
          </span>

          <span className="relative shrink-0 text-xl font-black" style={{ color: card.tone }}>
            {expanded ? '↑' : '→'}
          </span>
        </button>
      </motion.div>
    );
  }

  function pickSport(next: Sport) {
    playMenuConfirm();
    onSportChange(next);
    setShowSportPick(false);
    const pending = pendingAfterSport;
    setPendingAfterSport(null);
    if (pending === 'campaign') {
      onStart('campaign');
      return;
    }
    if (pending === 'modes') {
      setShowModes(true);
    }
  }

  return (
    <div className="relative h-svh overflow-hidden">
      <SportBackground sport={homeSport} />

      <div
        className={`transition-opacity duration-300 ${showModes || showSportPick ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      >
      {/* Sportivia — very top left */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-0 left-0 z-30 flex items-center gap-2 pt-[max(0.75rem,env(safe-area-inset-top))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-2 pb-2 sm:gap-3 sm:p-4"
      >
        <h1 className="text-xl sm:text-4xl font-black tracking-tight text-[#f2f3f5] leading-none">
          Sportivia
        </h1>
      </motion.div>

      {/* Left-center sport rail — only after a sport is chosen */}
      {homeSport && (
      <motion.aside
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed left-0 top-1/2 z-30 flex -translate-y-1/2 flex-col items-stretch gap-2.5 pl-0 sm:gap-3.5 max-sm:origin-left max-sm:scale-[0.9]"
      >
        <SportPicker sport={homeSport} onSportChange={onSportChange} layout="rail" />
      </motion.aside>
      )}

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
        <div className="cards-nav-snake-ring">
          <button
            type="button"
            onClick={() => {
              playMenuClick();
              onOpenCards();
            }}
            className="game-nav-tab game-nav-tab-cards"
            aria-label="Cards"
          >
            <LayoutGrid className="h-4 w-4 sm:h-[1.05rem] sm:w-[1.05rem]" />
            <span className="hidden sm:inline">Cards</span>
          </button>
        </div>
        <div className="store-nav-snake-ring">
          <button
            type="button"
            onClick={() => {
              playMenuClick();
              onOpenStore();
            }}
            className="game-nav-tab game-nav-tab-store"
            aria-label="Store"
          >
            <ShoppingBag className="h-4 w-4 sm:h-[1.05rem] sm:w-[1.05rem]" />
            <span className="hidden sm:inline">Store</span>
          </button>
        </div>
      </motion.div>

      {/* Daily Spin — mid-right stage */}
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-1/2 right-0 z-30 -translate-y-1/2 pr-[max(0.75rem,env(safe-area-inset-right))] pl-2"
      >
        <button
          type="button"
          onClick={() => {
            playMenuClick();
            setShowDailySpin(true);
          }}
          className={`game-spin-chip relative ${spinReady ? 'game-spin-chip-ready' : ''}`}
          aria-label="Daily Spin"
        >
          <img
            src={DAILY_SPIN_ICON}
            alt=""
            draggable={false}
            className="h-6 w-6 object-contain sm:h-7 sm:w-7"
          />
          <span>Spin</span>
          {spinReady && (
            <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-[#f0b232] shadow-[0_0_8px_#f0b232]" />
          )}
        </button>
      </motion.div>

      {/* Level — bottom right alone */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-0 right-0 z-30 pb-[max(0.5rem,env(safe-area-inset-bottom))] pr-[max(0.5rem,env(safe-area-inset-right))] pl-2 pt-2 sm:p-4 max-sm:scale-[0.82] max-sm:origin-bottom-right"
      >
        <LevelCorner profile={profile} accent={accent} />
      </motion.div>

      {/* Hero — character center stage */}
      <div
        className={`relative z-10 h-svh flex flex-col items-center justify-center pr-3 sm:px-4 pt-[max(4rem,calc(env(safe-area-inset-top)+3.25rem))] sm:pt-14 pb-[max(5.75rem,calc(env(safe-area-inset-bottom)+5rem))] sm:pb-10 max-sm:translate-y-0 sm:-translate-y-4 ${
          homeSport ? 'pl-[4.75rem] sm:pl-4' : 'pl-3 sm:pl-4'
        }`}
      >
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
              accent={homeSport ? SPORT_PODIUM_ACCENT[homeSport] : '#f0b232'}
              height={330}
              bare
              hero
              sport={homeSport ?? 'soccer'}
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
              {...(profile.equippedCharacter === 'ref-bot'
                ? { refBotLoadout: profile.refBotLoadout }
                : {})}
              {...(profile.equippedCharacter === 'bunny'
                ? { rabbitVariant: profile.rabbitVariant }
                : {})}
              {...(profile.equippedCharacter === 'mako'
                ? { makoVariant: profile.makoVariant }
                : {})}
              {...(profile.equippedCharacter === 'stickman'
                ? { stickmanVariant: profile.stickmanVariant }
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

          <div className="flex flex-col items-center gap-2.5 mt-1 sm:mt-2 shrink-0 max-sm:-translate-x-2 sm:translate-x-0">
            <div className="play-snake-ring">
              <motion.button
                type="button"
                whileHover={{
                  scale: 1.04,
                  y: -2,
                  transition: { type: 'spring', stiffness: 420, damping: 18 },
                }}
                whileTap={{ scale: 0.97, y: 2 }}
                onClick={requestPlay}
                className="group/play relative z-[1] flex min-h-11 items-center gap-2.5 rounded-[0.9rem] border-2 border-white/25 bg-gradient-to-b from-[#ffe08a] via-[#f0b232] to-[#d4921a] px-8 py-3.5 text-sm font-black text-[#3a2600] transition-all hover:brightness-105 sm:px-11 sm:py-4 sm:text-base"
              >
                <Play className="h-5 w-5 fill-current drop-shadow-sm transition-transform duration-300 ease-out group-hover/play:scale-110 group-hover/play:-rotate-12" />
                <span className="tracking-wide">Play</span>
              </motion.button>
            </div>

            <div className="play-snake-ring play-snake-ring-camp">
              <motion.button
                type="button"
                whileHover={{
                  scale: 1.03,
                  y: -1,
                  transition: { type: 'spring', stiffness: 420, damping: 18 },
                }}
                whileTap={{ scale: 0.97, y: 1 }}
                onClick={requestCampaign}
                className="group/camp relative z-[1] flex min-h-11 items-center gap-2 rounded-[0.85rem] border-2 border-white/20 bg-gradient-to-b from-[#7dffa8] via-[#23a559] to-[#157a3f] px-5 py-2.5 text-xs font-black uppercase tracking-wide text-[#062816] transition-all hover:brightness-105 sm:px-7 sm:py-3 sm:text-sm"
              >
                <span>Campaign</span>
                <span className="rounded-full border border-[#062816]/20 bg-[#062816]/15 px-1.5 py-0.5 text-[8px] font-black tracking-wider text-[#062816]">
                  Special
                </span>
              </motion.button>
            </div>
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
              setModeInfo(null);
              setShowBotDifficulties(false);
              setShowModes(false);
            }}
          >
            <button
              type="button"
              onClick={() => {
                playMenuBack();
                setModeInfo(null);
                setShowBotDifficulties(false);
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
              className="relative z-10 flex min-h-svh w-full flex-col justify-center overflow-y-auto overscroll-contain px-4 py-6 pt-[max(4rem,calc(env(safe-area-inset-top)+3.25rem))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8 [@media(max-height:700px)]:!py-3"
              onClick={e => e.stopPropagation()}
            >
              <div className="mx-auto mb-3 flex w-full max-w-3xl items-center gap-2.5 [@media(max-height:700px)]:!mb-2">
                <h3 className="text-3xl font-black tracking-tight text-[#f2f3f5] sm:text-4xl [@media(max-height:700px)]:!text-3xl">Game Modes</h3>
                <span
                  className="rounded-full border px-2.5 py-1 text-xs font-black uppercase tracking-[0.18em]"
                  style={{
                    borderColor: `${accent}88`,
                    background: `${accent}1a`,
                    color: accent === '#f4f4f5' ? '#f2f3f5' : accent,
                  }}
                >
                  {homeSport ? SPORT_LABEL[homeSport] : 'Sport'}
                </span>
              </div>

              <div className="mx-auto w-full max-w-3xl">
                <div className="mb-2 flex items-center gap-2">
                  <Gamepad2 className="h-3.5 w-3.5 shrink-0 text-[#7a7d86]" />
                  <p className="shrink-0 text-xs font-black uppercase tracking-[0.2em] text-[#8b8e97]">
                    Offline · Play on your own
                  </p>
                  <span className="h-px flex-1 bg-[#2b2d33]" />
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
                  {OFFLINE_CARDS.map(renderModeCard)}
                </div>

                <AnimatePresence initial={false}>
                  {showBotDifficulties && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={PAGE_TRANSITION}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-3 gap-2 pt-2">
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
                              className="rounded-2xl border-[2.5px] bg-[#111214] px-2 py-2.5 text-center shadow-[0_3px_0_#0c0d0f] transition-transform hover:translate-y-[1px]"
                              style={{ borderColor: `${config.color}aa` }}
                            >
                              <p className="text-sm font-black" style={{ color: config.color }}>
                                {config.label}
                              </p>
                              <p className="mt-1 text-[10px] font-bold leading-tight text-[#7a7d86]">
                                {difficulty === 'beginner'
                                  ? 'Stake optional'
                                  : difficulty === 'pro'
                                    ? 'Optional · 1.75×'
                                    : 'Optional · 2.5×'}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mx-auto mt-4 w-full max-w-3xl [@media(max-height:700px)]:!mt-3">
                <div className="mb-2 flex items-center gap-2">
                  <Wifi className="h-3.5 w-3.5 shrink-0 text-[#23a559]" />
                  <p className="shrink-0 text-xs font-black uppercase tracking-[0.2em] text-[#23a559]">
                    Online · Real opponents
                  </p>
                  {typeof showOnline === 'number' && (
                    <span className="shrink-0 rounded-full border border-[#23a559]/50 bg-[#23a559]/12 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-[#7ee2a8]">
                      {showOnline} online
                    </span>
                  )}
                  <span className="h-px flex-1 bg-[#23a559]/25" />
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
                  {ONLINE_CARDS.map(renderModeCard)}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* First-time / required sport pick */}
      <AnimatePresence>
        {showSportPick && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px]"
            onClick={() => {
              playMenuBack();
              setPendingAfterSport(null);
              setShowSportPick(false);
            }}
          >
            <button
              type="button"
              onClick={() => {
                playMenuBack();
                setPendingAfterSport(null);
                setShowSportPick(false);
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
              className="relative z-10 flex min-h-svh w-full flex-col justify-center overflow-y-auto overscroll-contain px-4 py-6 pt-[max(4rem,calc(env(safe-area-inset-top)+3.25rem))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="mx-auto mb-5 w-full max-w-lg text-center sm:mb-6">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#f0b232]">
                  First up
                </p>
                <h3 className="mt-1.5 text-2xl font-black tracking-tight text-[#f2f3f5] sm:text-3xl">
                  Pick your sport
                </h3>
                <p className="mt-2 text-sm font-semibold text-[#949ba4]">
                  We’ll save it for next time — switch anytime from the home menu.
                </p>
              </div>

              <div className="mx-auto flex w-full max-w-lg flex-col gap-2.5 sm:gap-3">
                {SPORTS.map((sp, i) => {
                  const spAccent = SPORT_ACCENT[sp];
                  return (
                    <motion.button
                      key={sp}
                      type="button"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...PAGE_TRANSITION, delay: 0.035 * i }}
                      onClick={() => pickSport(sp)}
                      className="flex h-[72px] w-full items-center gap-3.5 rounded-2xl border-[3px] bg-[#15161a] px-4 text-left shadow-[0_4px_0_#0c0d0f] transition-all hover:translate-y-[1px] hover:brightness-110 sm:h-[78px] sm:px-5"
                      style={{
                        borderColor: `${spAccent}99`,
                        background: `linear-gradient(160deg, ${spAccent}24 0%, #15161a 58%)`,
                      }}
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-white/15 bg-black/30">
                        <SportBall sport={sp} size={sp === 'football' || sp === 'hockey' ? 28 : 32} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-base font-black uppercase tracking-wide text-[#f2f3f5] sm:text-lg">
                          {SPORT_LABEL[sp]}
                        </span>
                        <span className="mt-0.5 block text-[11px] font-bold text-[#949ba4]">
                          Same game · this sport’s stars
                        </span>
                      </span>
                      <span
                        className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider"
                        style={{ background: `${spAccent}22`, color: spAccent === '#f4f4f5' ? '#f2f3f5' : spAccent }}
                      >
                        Play
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {guideCard && (
          <ModeGuideOverlay
            key={guideCard.key}
            card={guideCard}
            onClose={() => setModeInfo(null)}
            onPlay={() => {
              const card = guideCard;
              setModeInfo(null);
              if (card.mode === 'bot') {
                setShowBotDifficulties(true);
                return;
              }
              setShowBotDifficulties(false);
              setShowModes(false);
              onStart(card.mode, undefined, card.duelChoice);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDailySpin && (
          <DailySpinModal
            profile={profile}
            onClose={() => setShowDailySpin(false)}
            onClaimed={handleSpinClaimed}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
