import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ChevronDown,
  Coins,
  Heart,
  Info,
  Layers3,
  Lock,
  PackageOpen,
  Search,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import type { Sport } from '../types';
import type { PlayerProfile } from '../types/profile';
import type {
  CardPackDefinition,
  CardPackTier,
  CardRarity,
  CollectibleCard,
  OpenedCard,
} from '../types/cards';
import { CARD_PACKS, CARDS_BY_SPORT, cardDisplayName, isCatalogStar, isMemorialCard } from '../lib/cardCatalog';
import { openCardPack } from '../lib/profileStorage';
import {
  cleanTeamName,
  prefetchFaceManifests,
  resolvePlayerCardBio,
  invalidatePlayerFace,
  resolvePlayerFace,
  type PlayerCardBio,
} from '../lib/playerFaces';
import { CardPortrait } from './CardPortrait';
import { CoinBadge } from './LevelBar';
import {
  playCardReveal,
  playMenuBack,
  playMenuClick,
  playMenuSelect,
  playPackOpen,
  playPackSuspense,
  stopPackSuspense,
} from '../lib/menuAudio';
import { setAmbientDuck } from '../lib/ambientControl';
import { SportBackground } from './SportBackground';
import { SportBall } from './SportBall';

interface CardPacksScreenProps {
  profile: PlayerProfile;
  initialSport: Sport;
  onBack: () => void;
  onProfileChange: (profile: PlayerProfile) => void;
}

const SPORT_META: Record<Sport, { label: string; short: string; icon: string; accent: string }> = {
  soccer: { label: 'Soccer', short: 'SOC', icon: '⚽', accent: '#23a559' },
  basketball: { label: 'NBA', short: 'NBA', icon: '🏀', accent: '#f97316' },
  baseball: { label: 'MLB', short: 'MLB', icon: '⚾', accent: '#f8fafc' },
  football: { label: 'NFL', short: 'NFL', icon: '🏈', accent: '#a16207' },
  hockey: { label: 'NHL', short: 'NHL', icon: '🏒', accent: '#38bdf8' },
};

const RARITY_META: Record<
  CardRarity,
  { label: string; color: string; border: string; glow: string; background: string }
> = {
  common: {
    label: 'Common',
    color: '#d1d5db',
    border: '#64748b',
    glow: 'rgba(100,116,139,.28)',
    background: 'linear-gradient(145deg,#334155 0%,#111827 58%,#1f2937 100%)',
  },
  rare: {
    label: 'Rare',
    color: '#93c5fd',
    border: '#3b82f6',
    glow: 'rgba(59,130,246,.35)',
    background: 'linear-gradient(145deg,#1d4ed8 0%,#111827 58%,#172554 100%)',
  },
  epic: {
    label: 'Epic',
    color: '#d8b4fe',
    border: '#a855f7',
    glow: 'rgba(168,85,247,.42)',
    background: 'linear-gradient(145deg,#7e22ce 0%,#1e1b4b 58%,#4c1d95 100%)',
  },
  legendary: {
    label: 'Legendary',
    color: '#fde68a',
    border: '#f0b232',
    glow: 'rgba(240,178,50,.55)',
    background: 'linear-gradient(145deg,#f59e0b 0%,#3f2a0a 45%,#18181b 75%,#713f12 100%)',
  },
};

function PlayerCard({
  card,
  duplicate,
  refund,
  locked = false,
  onInspect,
}: {
  card: CollectibleCard;
  duplicate?: boolean;
  refund?: number;
  locked?: boolean;
  onInspect?: (card: CollectibleCard) => void;
}) {
  const [bio, setBio] = useState<PlayerCardBio | null>(null);
  const rarity = RARITY_META[card.rarity];
  const age = bio?.age ?? card.age;
  const retired = bio?.retired ?? card.retired;
  const team = cleanTeamName(bio?.team) ?? cleanTeamName(card.team);
  const canInspect = !locked && !!onInspect;

  useEffect(() => {
    let active = true;
    if (locked) return;
    void resolvePlayerCardBio(card.sport, card.name).then(details => {
      if (active) setBio(details);
    });
    return () => {
      active = false;
    };
  }, [card.name, card.sport, locked]);

  const body = (
    <>
      <div className="absolute -right-8 top-16 rotate-90 text-[54px] font-black tracking-tighter text-white/[0.045]">
        SPORTIVIA
      </div>

      <div className="relative z-10 grid h-full grid-rows-[auto_minmax(0,1fr)_auto] gap-1 p-3 pl-2.5 pt-2.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-2xl font-black leading-none text-white font-mono">{card.rating}</p>
            <p className="mt-1 text-[9px] font-black uppercase tracking-[0.16em]" style={{ color: rarity.color }}>
              {card.positions[0] ?? 'Player'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-lg leading-none">{SPORT_META[card.sport].icon}</span>
            <span
              className="rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-wider"
              style={{ color: rarity.color, borderColor: `${rarity.border}99` }}
            >
              {rarity.label}
            </span>
          </div>
        </div>

        {/* Portrait fills leftover space; image stays bottom-aligned */}
        <div className="relative min-h-0 overflow-hidden rounded-xl">
          {locked ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="h-12 w-12 text-white/20" />
            </div>
          ) : (
            <CardPortrait
              sport={card.sport}
              playerId={card.playerId}
              playerName={card.name}
            />
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        <div className="relative z-10 min-w-0 border-t border-white/15 pt-2 text-center">
          <p
            className="flex min-w-0 w-full items-center justify-center gap-1 px-0.5 text-base font-black uppercase leading-tight tracking-tight text-white"
            title={locked ? undefined : card.name}
          >
            <span className="min-w-0 truncate">
              {locked ? 'Undiscovered' : cardDisplayName(card)}
            </span>
            {!locked && isMemorialCard(card) && (
              <Heart
                className="h-3.5 w-3.5 shrink-0 fill-[#f43f5e] text-[#f43f5e]"
                aria-label="In memoriam"
              />
            )}
          </p>
          <div className="mt-1 flex h-[2.35rem] flex-col items-center justify-center gap-0.5 overflow-hidden">
            {retired ? (
              <>
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-[0.16em] text-white/80">
                  Retired
                </span>
                {team && (
                  <p className="max-w-full truncate text-[10px] font-bold text-white/55">
                    LC · {team}
                  </p>
                )}
              </>
            ) : (
              <p className="max-w-full truncate text-[10px] font-bold text-white/70">
                {team ?? 'Free agent'}
              </p>
            )}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1 border-t border-white/10 pt-2">
            <div className="min-w-0">
              <p className="text-[7px] font-black uppercase tracking-widest text-white/35">Country</p>
              <p className="truncate text-[9px] font-black text-white/85">{card.country}</p>
            </div>
            <div>
              <p className="text-[7px] font-black uppercase tracking-widest text-white/35">
                {age ? 'Age' : 'Era'}
              </p>
              <p className="text-[9px] font-black text-white/85">{age ?? card.era}</p>
            </div>
          </div>
        </div>
      </div>

      {duplicate && (
        <div className="absolute inset-x-2 top-1/2 z-20 -translate-y-1/2 rounded-xl border-2 border-[#f0b232] bg-[#111214]/95 px-2 py-2 text-center shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#f0b232]">Duplicate</p>
          <p className="text-xs font-black text-white">+{refund} coins</p>
        </div>
      )}
    </>
  );

  const shellClass = `relative aspect-[3/4.25] w-full overflow-hidden rounded-[22px] border-[3px] ${
    locked ? 'opacity-55 grayscale' : ''
  } ${canInspect ? 'cursor-pointer transition-transform hover:-translate-y-0.5 active:scale-[0.98]' : ''}`;

  const shellStyle = {
    borderColor: locked ? '#3f4147' : rarity.border,
    background: locked ? 'linear-gradient(145deg,#2b2d31,#111214)' : rarity.background,
    boxShadow: locked
      ? '0 7px 0 #111214'
      : `0 8px 0 #111214, 0 0 24px ${rarity.glow}, inset 0 0 0 1px rgba(255,255,255,.16)`,
  } as const;

  if (canInspect) {
    return (
      <button
        type="button"
        onClick={() => onInspect(card)}
        className={shellClass}
        style={shellStyle}
        aria-label={`Inspect ${card.name}`}
      >
        {body}
      </button>
    );
  }

  return (
    <div className={shellClass} style={shellStyle}>
      {body}
    </div>
  );
}

function CardInspectOverlay({
  card,
  onClose,
}: {
  card: CollectibleCard;
  onClose: () => void;
}) {
  const [face, setFace] = useState<string | null>(null);
  const [bio, setBio] = useState<PlayerCardBio | null>(null);
  const inspectRetriesRef = useRef(0);
  const rarity = RARITY_META[card.rarity];
  const age = bio?.age ?? card.age;
  const retired = bio?.retired ?? card.retired;
  const team = cleanTeamName(bio?.team) ?? cleanTeamName(card.team);

  useEffect(() => {
    let active = true;
    inspectRetriesRef.current = 0;
    void resolvePlayerFace(card.sport, card.playerId, card.name)
      .then(url => {
        if (active) setFace(url);
        return resolvePlayerCardBio(card.sport, card.name);
      })
      .then(details => {
        if (active) setBio(details);
      });
    return () => {
      active = false;
    };
  }, [card.name, card.playerId, card.sport]);

  const handleInspectFaceError = () => {
    if (inspectRetriesRef.current >= 2) {
      setFace(null);
      return;
    }
    inspectRetriesRef.current += 1;
    invalidatePlayerFace(card.sport, card.playerId);
    void resolvePlayerFace(card.sport, card.playerId, card.name, { force: true }).then(setFace);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#030406]/88 px-4 backdrop-blur-md"
      onClick={() => {
        playMenuBack();
        onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={card.name}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.42, y: 48, rotateX: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
        exit={{ opacity: 0, scale: 0.72, y: 24 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22, mass: 0.85 }}
        className="relative w-full max-w-[min(92vw,340px)]"
        style={{ perspective: 1200 }}
        onClick={event => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => {
            playMenuBack();
            onClose();
          }}
          className="absolute -right-1 -top-10 z-20 rounded-full border border-white/15 bg-[#1e1f22] p-2 text-[#b5bac1] hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <motion.div
          className="relative aspect-[3/4.25] w-full overflow-hidden rounded-[28px] border-[3px]"
          style={{
            borderColor: rarity.border,
            background: rarity.background,
            boxShadow: `0 24px 60px rgba(0,0,0,.55), 0 0 48px ${rarity.glow}, inset 0 0 0 1px rgba(255,255,255,.18)`,
          }}
          animate={{
            boxShadow: [
              `0 24px 60px rgba(0,0,0,.55), 0 0 28px ${rarity.glow}`,
              `0 24px 60px rgba(0,0,0,.55), 0 0 56px ${rarity.glow}`,
              `0 24px 60px rgba(0,0,0,.55), 0 0 28px ${rarity.glow}`,
            ],
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="absolute -right-10 top-20 rotate-90 text-[72px] font-black tracking-tighter text-white/[0.05]">
            SPORTIVIA
          </div>

          <div className="relative z-10 grid h-full grid-rows-[auto_minmax(0,1fr)_auto] gap-1.5 p-4 pl-3.5 pt-3.5 sm:p-5 sm:pl-4 sm:pt-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-4xl font-black leading-none text-white sm:text-5xl">
                  {card.rating}
                </p>
                <p
                  className="mt-1.5 text-[11px] font-black uppercase tracking-[0.18em]"
                  style={{ color: rarity.color }}
                >
                  {card.positions.join(' · ') || 'Player'}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-2xl leading-none">{SPORT_META[card.sport].icon}</span>
                <span
                  className="rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider"
                  style={{ color: rarity.color, borderColor: `${rarity.border}aa` }}
                >
                  {rarity.label}
                </span>
              </div>
            </div>

            <div className="relative min-h-0 overflow-hidden rounded-2xl">
              {face ? (
                <motion.img
                  key={face}
                  src={face}
                  alt={card.name}
                  initial={{ scale: 1.28, y: 18, opacity: 0.55 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 160, damping: 20, delay: 0.08 }}
                  className="absolute inset-0 h-full w-full object-contain object-bottom drop-shadow-[0_16px_28px_rgba(0,0,0,.85)]"
                  referrerPolicy="no-referrer"
                  draggable={false}
                  onError={handleInspectFaceError}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-7xl font-black text-white/15">
                    {card.name.split(/\s+/).map(part => part[0]).slice(0, 2).join('')}
                  </span>
                </div>
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/85 to-transparent" />
            </div>

            <div className="relative z-10 min-w-0 border-t border-white/20 pt-3 text-center">
              <p
                className="flex min-w-0 w-full items-center justify-center gap-1.5 px-1 text-xl font-black uppercase leading-tight tracking-tight text-white sm:text-2xl"
                title={card.name}
              >
                <span className="min-w-0 truncate">{cardDisplayName(card)}</span>
                {isMemorialCard(card) && (
                  <Heart
                    className="h-5 w-5 shrink-0 fill-[#f43f5e] text-[#f43f5e] sm:h-6 sm:w-6"
                    aria-label="In memoriam"
                  />
                )}
              </p>
              <div className="mt-1.5 flex h-[2.75rem] flex-col items-center justify-center gap-1 overflow-hidden">
                {retired ? (
                  <>
                    <span className="rounded-full border border-white/25 bg-white/10 px-3 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-white/85">
                      Retired
                    </span>
                    {team && (
                      <p className="max-w-full truncate text-xs font-bold text-white/60">LC · {team}</p>
                    )}
                  </>
                ) : (
                  <p className="max-w-full truncate text-xs font-bold text-white/75">{team ?? 'Free agent'}</p>
                )}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/15 pt-3">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/35">Country</p>
                  <p className="mt-0.5 truncate text-[11px] font-black text-white/90">{card.country}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/35">
                    {age ? 'Age' : 'Era'}
                  </p>
                  <p className="mt-0.5 text-[11px] font-black text-white/90">{age ?? card.era}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/35">Sport</p>
                  <p className="mt-0.5 text-[11px] font-black text-white/90">
                    {SPORT_META[card.sport].label}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[#6d6f78]">
          Tap outside to close
        </p>
      </motion.div>
    </motion.div>
  );
}

/** Hand-picked recognizable faces for each pack tier showcase. */
const SHOWCASE_FACE_IDS: Record<Sport, Record<CardPackTier, string[]>> = {
  soccer: {
    prospect: [
      'camavinga', 'gvardiol', 'olise', 'rashford', 'grealish', 'eze',
      'kenanyildiz', 'morganrogers', 'chiesa', 'vlahovic', 'gavi', 'endo', 'joaofelix',
    ],
    elite: [
      'haaland', 'vinicius', 'mbappe', 'bellingham', 'salah', 'rodri', 'kane',
      'yamal', 'saka', 'palmer', 'foden', 'wirtz', 'musiala', 'leao', 'isak',
    ],
    icon: ['messi', 'cr7', 'maradona', 'pele', 'zidane', 'r9', 'ronaldinho', 'cruyff', 'maldini', 'buffon'],
  },
  basketball: {
    prospect: [
      'zion', 'wagner', 'scottie', 'mobley', 'cade', 'banchero', 'chet',
      'middleton', 'trae', 'fox', 'siakam', 'jalengreen',
    ],
    elite: [
      'luka', 'sga', 'jokic', 'giannis', 'tatum', 'wemby', 'ant', 'booker',
      'embiid', 'brunson', 'kawhi', 'ad', 'ja', 'haliburton',
    ],
    icon: ['lebron', 'kobe', 'mj', 'curry', 'magic', 'bird', 'shaq', 'duncan', 'kareem', 'wilt'],
  },
  baseball: {
    prospect: [
      'raleigh', 'perdomo', 'correa', 'bregman', 'yamamoto', 'darvish',
      'chapman', 'smithwill', 'stanton',
    ],
    elite: [
      'ohtani', 'judge', 'betts', 'soto', 'acuna', 'witt', 'trout', 'harper',
      'freeman', 'skubal', 'skenes', 'henderson', 'tucker', 'lindor',
    ],
    icon: ['mays', 'aaron', 'ruth', 'mantle', 'jeter', 'griffey', 'bonds', 'pedro', 'jackie', 'cobb'],
  },
  football: {
    prospect: [
      'tua', 'mayfield', 'lawrence', 'dak', 'diggs', 'metcalf', 'waddle',
      'smith', 'wilson', 'purdy',
    ],
    elite: [
      'mahomes', 'allen', 'lamar', 'jefferson', 'chase', 'burrow', 'mccaffrey',
      'kelce', 'barkley', 'parsons', 'garrett', 'cdlamb', 'puka', 'hurts',
    ],
    icon: ['brady', 'montana', 'rice', 'lt', 'barry', 'moss', 'deion', 'payton', 'manning', 'gronk'],
  },
  hockey: {
    prospect: [
      'macklin-celebrini', 'matvei-michkov', 'adam-fantilli', 'connor-bedard',
      'adam-fox', 'brayden-point',
    ],
    elite: [
      'connor-mcdavid', 'nathan-mackinnon', 'auston-matthews', 'cale-makar',
      'leon-draisaitl', 'nikita-kucherov', 'david-pastrnak', 'quinn-hughes',
      'matthew-tkachuk', 'kirill-kaprizov',
    ],
    icon: [
      'wayne-gretzky', 'mario-lemieux', 'gordie-howe', 'bobby-orr',
      'sidney-crosby', 'alex-ovechkin', 'patrick-roy', 'martin-brodeur',
    ],
  },
};

/** Showcase recognizable players that match the pack tier. */
function pickShowcaseCards(sport: Sport, tier: CardPackTier, count = 5): CollectibleCard[] {
  const byId = new Map(CARDS_BY_SPORT[sport].map(card => [card.playerId, card]));
  const preferred = SHOWCASE_FACE_IDS[sport][tier]
    .map(id => byId.get(id))
    .filter((card): card is CollectibleCard => Boolean(card));

  if (preferred.length >= count) return preferred.slice(0, count);

  const pool = [...CARDS_BY_SPORT[sport]].sort((a, b) => {
    const starDelta =
      Number(isCatalogStar(sport, b.playerId)) - Number(isCatalogStar(sport, a.playerId));
    if (starDelta !== 0) return starDelta;
    return b.rating - a.rating;
  });

  const prefer: CardRarity[] =
    tier === 'icon'
      ? ['legendary', 'epic', 'rare']
      : tier === 'elite'
        ? ['epic', 'rare']
        : ['rare', 'common'];

  const fitsTier = (card: CollectibleCard, starsOnly: boolean) => {
    if (starsOnly && !isCatalogStar(sport, card.playerId)) return false;
    if (tier === 'icon') {
      return card.rarity === 'legendary' || card.rarity === 'epic' || card.rating >= 90;
    }
    if (card.retired) return false;
    if (tier === 'elite') {
      return (
        (card.rarity === 'epic' || card.rarity === 'rare') &&
        card.rating >= 87 &&
        card.rating <= 95
      );
    }
    return (
      (card.rarity === 'rare' || card.rarity === 'common') &&
      card.rating >= 76 &&
      card.rating <= 86
    );
  };

  const picked = [...preferred];
  const take = (starsOnly: boolean) => {
    for (const rarity of prefer) {
      for (const card of pool) {
        if (card.rarity !== rarity) continue;
        if (!fitsTier(card, starsOnly)) continue;
        if (picked.some(item => item.key === card.key)) continue;
        picked.push(card);
        if (picked.length >= count) return;
      }
    }
  };

  take(true);
  if (picked.length < count) take(false);

  if (picked.length < count) {
    for (const card of pool) {
      if (picked.some(item => item.key === card.key)) continue;
      if (tier !== 'icon' && card.retired) continue;
      picked.push(card);
      if (picked.length >= count) break;
    }
  }

  return picked.slice(0, count);
}

function ShowcaseMiniCard({
  card,
  large = false,
  dimmed = false,
  fade = 1,
}: {
  card: CollectibleCard;
  large?: boolean;
  dimmed?: boolean;
  fade?: number;
}) {
  const [face, setFace] = useState<string | null>(null);
  const miniRetriesRef = useRef(0);
  const rarity = RARITY_META[card.rarity];

  useEffect(() => {
    let active = true;
    miniRetriesRef.current = 0;
    void resolvePlayerFace(card.sport, card.playerId, card.name).then(url => {
      if (active) setFace(url);
    });
    return () => {
      active = false;
    };
  }, [card.name, card.playerId, card.sport]);

  const handleMiniFaceError = () => {
    if (miniRetriesRef.current >= 2) {
      setFace(null);
      return;
    }
    miniRetriesRef.current += 1;
    invalidatePlayerFace(card.sport, card.playerId);
    void resolvePlayerFace(card.sport, card.playerId, card.name, { force: true }).then(setFace);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[14px] border-[2.5px] ${
        large ? 'h-[236px] w-[172px]' : 'h-[188px] w-[138px]'
      }`}
      style={{
        borderColor: rarity.border,
        background: '#0b0c10',
        boxShadow: dimmed
          ? '0 6px 12px rgba(0,0,0,0.35)'
          : `0 10px 22px rgba(0,0,0,0.5), 0 0 16px ${rarity.glow}`,
        opacity: fade,
        filter: dimmed ? 'saturate(0.7) brightness(0.82)' : undefined,
      }}
    >
      {face ? (
        <img
          src={face}
          alt=""
          draggable={false}
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover object-[center_18%]"
          onError={handleMiniFaceError}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[#16171b] text-3xl">
          {SPORT_META[card.sport].icon}
        </div>
      )}

      {/* Bottom fade for name */}
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />

      <div className="absolute left-1.5 top-1.5 rounded-md bg-black/55 px-1.5 py-0.5 backdrop-blur-[2px]">
        <p className="font-mono text-sm font-black leading-none text-white">{card.rating}</p>
      </div>

      <div
        className="absolute right-2 top-2 rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide"
        style={{ background: `${rarity.border}dd`, color: '#0b0c10' }}
      >
        {rarity.label.slice(0, 3)}
      </div>

      <div className="absolute inset-x-0 bottom-0 min-w-0 px-2 pb-2">
        <p
          className="flex min-w-0 w-full items-center gap-1 text-[11px] font-black uppercase tracking-wide text-white"
          title={card.name}
        >
          <span className="min-w-0 truncate">{cardDisplayName(card)}</span>
          {isMemorialCard(card) && (
            <Heart className="h-3 w-3 shrink-0 fill-[#f43f5e] text-[#f43f5e]" aria-label="In memoriam" />
          )}
        </p>
        <p className="truncate text-[9px] font-bold uppercase tracking-wider text-white/55">
          {card.positions[0] ?? 'Player'}
        </p>
      </div>
    </div>
  );
}

const PACK_ACCENT: Record<string, string> = {
  prospect: '#94a3b8',
  elite: '#f0b232',
  icon: '#c084fc',
};

function PackArt({
  pack,
  sport,
  large = false,
  tearing = false,
  interactive = false,
}: {
  pack: CardPackDefinition;
  sport: Sport;
  large?: boolean;
  tearing?: boolean;
  interactive?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const accent = PACK_ACCENT[pack.id] ?? PACK_ACCENT.prospect;
  const tier = pack.name.replace(' Pack', '').toUpperCase();
  const cards = useMemo(() => pickShowcaseCards(sport, pack.id, 5), [sport, pack.id]);
  const expanded = interactive && hovered && !tearing;

  // Straight row: center crisp, sides fade out — stays put on hover
  const poses = large
    ? [
        { rotate: 0, x: -96, y: 2, z: 1, scale: 0.78, dimmed: true, fade: 0.28 },
        { rotate: 0, x: -48, y: 0, z: 2, scale: 0.88, dimmed: true, fade: 0.55 },
        { rotate: 0, x: 0, y: 0, z: 3, scale: 0.98, dimmed: false, fade: 1 },
        { rotate: 0, x: 48, y: 0, z: 2, scale: 0.88, dimmed: true, fade: 0.55 },
        { rotate: 0, x: 96, y: 2, z: 1, scale: 0.78, dimmed: true, fade: 0.28 },
      ]
    : [
        { rotate: 0, x: -88, y: 2, z: 1, scale: 0.76, dimmed: true, fade: 0.26 },
        { rotate: 0, x: -44, y: 0, z: 2, scale: 0.86, dimmed: true, fade: 0.52 },
        { rotate: 0, x: 0, y: 0, z: 3, scale: 0.96, dimmed: false, fade: 1 },
        { rotate: 0, x: 44, y: 0, z: 2, scale: 0.86, dimmed: true, fade: 0.52 },
        { rotate: 0, x: 88, y: 2, z: 1, scale: 0.76, dimmed: true, fade: 0.26 },
      ];

  return (
    <motion.div
      className={`relative mx-auto flex shrink-0 flex-col items-center ${
        large
          ? 'h-[min(360px,70vw)] w-full max-w-[min(400px,92vw)] sm:h-[400px]'
          : 'h-[250px] w-full max-w-[320px]'
      }`}
      onMouseEnter={() => interactive && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={
        tearing
          ? { scale: [1, 1.03, 0.95], rotate: [0, -2, 3, 0], y: [0, -6, 10] }
          : { y: expanded ? -3 : 0 }
      }
      transition={
        tearing
          ? { duration: 0.85, ease: 'easeInOut' }
          : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
      }
    >
      <div className="mb-1.5 text-center">
        <p
          className={`font-black uppercase tracking-[0.22em] ${large ? 'text-[10px]' : 'text-[8px]'}`}
          style={{ color: accent }}
        >
          {tier} PACK
        </p>
      </div>

      <div
        className="relative w-full flex-1"
        style={{
          perspective: 900,
          maskImage:
            'linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)',
        }}
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[58%] h-24 -translate-x-1/2 rounded-full blur-2xl"
          animate={{
            opacity: expanded ? 0.32 : 0.14,
            width: expanded ? 260 : 200,
          }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{ background: accent }}
        />

        {cards.map((card, index) => {
          const pose = poses[index] ?? poses[2]!;
          return (
            <div
              key={card.key}
              className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2"
              style={{ zIndex: pose.z }}
            >
              <div
                style={{
                  transform: `translate(${pose.x}px, ${pose.y}px) scale(${pose.scale})`,
                  opacity: pose.fade,
                  transformOrigin: '50% 50%',
                }}
              >
                <ShowcaseMiniCard
                  card={card}
                  large={large}
                  dimmed={pose.dimmed}
                  fade={1}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p
        className={`mt-0 font-black uppercase tracking-[0.16em] text-white/50 ${
          large ? 'text-[10px]' : 'text-[8px]'
        }`}
      >
        {SPORT_META[sport].label} · {pack.cardCount} cards
      </p>

      {tearing && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.55, 0] }}
          transition={{ duration: 0.65 }}
          style={{
            background:
              'radial-gradient(circle at 50% 42%, rgba(255,255,255,0.4), transparent 55%)',
          }}
        />
      )}
    </motion.div>
  );
}

function Odds({ pack }: { pack: CardPackDefinition }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {(Object.keys(pack.odds) as CardRarity[]).map(rarity => (
        <span
          key={rarity}
          className="rounded-full border px-2 py-0.5 text-[9px] font-black uppercase"
          style={{
            color: RARITY_META[rarity].color,
            borderColor: `${RARITY_META[rarity].border}66`,
            background: `${RARITY_META[rarity].border}14`,
          }}
        >
          {RARITY_META[rarity].label.slice(0, 1)} {pack.odds[rarity]}%
        </span>
      ))}
    </div>
  );
}

const PACKS_DISCLAIMER =
  'Coins, packs, and cards are virtual entertainment items with no real-world or cash value. They cannot be bought, sold, traded, or redeemed for money or prizes. Pack openings use in-game coins only and are not gambling. Athlete names and likenesses are for entertainment purposes only and do not imply endorsement.';

const MENU_BACK_CLASS =
  'flex min-h-11 items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-full text-xs sm:text-sm font-black text-[#b5bac1] hover:text-[#f2f3f5] bg-[#1e1f22] border-[2.5px] border-[#3f4147] hover:border-[#5c5e66] shadow-[0_3px_0_#1a1b1f] hover:translate-y-[1px] hover:shadow-[0_2px_0_#1a1b1f] transition-all shrink-0';

export function CardPacksScreen({
  profile,
  initialSport,
  onBack,
  onProfileChange,
}: CardPacksScreenProps) {
  const [sport, setSport] = useState<Sport>(initialSport);
  const [tab, setTab] = useState<'packs' | 'collection'>('packs');
  const [opening, setOpening] = useState<{ pack: CardPackDefinition; cards: OpenedCard[] } | null>(null);
  const [openingStarted, setOpeningStarted] = useState(false);
  const [tearing, setTearing] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [search, setSearch] = useState('');
  const [rarityFilter, setRarityFilter] = useState<CardRarity | 'all'>('all');
  const [showAll, setShowAll] = useState(false);
  const [visibleCount, setVisibleCount] = useState(48);
  const [inspected, setInspected] = useState<CollectibleCard | null>(null);
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    prefetchFaceManifests();
  }, []);

  function inspectCard(card: CollectibleCard) {
    playMenuClick();
    setInspected(card);
  }

  useEffect(() => {
    if (!openingStarted || !opening) return;
    if (revealed >= opening.cards.length) return;
    const delay = revealed === 0 ? 280 : opening.cards.length > 3 ? 680 : 520;
    const timer = window.setTimeout(() => {
      const nextIndex = revealed;
      setRevealed(value => value + 1);
      playCardReveal(opening.cards[nextIndex]?.card.rarity ?? 'common');
    }, delay);
    return () => window.clearTimeout(timer);
  }, [opening, openingStarted, revealed]);

  useEffect(() => {
    if (!opening || openingStarted) {
      stopPackSuspense();
      return;
    }
    playPackSuspense();
    return () => stopPackSuspense();
  }, [opening, openingStarted]);

  useEffect(() => {
    if (opening) {
      // Duck menu music under pack suspense / reveal SFX
      setAmbientDuck(openingStarted ? 0.12 : 0.22);
    } else {
      setAmbientDuck(1);
    }
    return () => setAmbientDuck(1);
  }, [opening, openingStarted]);

  useEffect(() => {
    if (!openingStarted || revealed <= 0) return;
    revealRefs.current[revealed - 1]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });
  }, [openingStarted, revealed]);

  const filteredCards = useMemo(() => {
    const query = search.trim().toLowerCase();
    return CARDS_BY_SPORT[sport]
      .filter(card => showAll || (profile.cardCollection.owned[card.key] ?? 0) > 0)
      .filter(card => rarityFilter === 'all' || card.rarity === rarityFilter)
      .filter(card => {
        if (!query) return true;
        return [card.name, card.team, card.country, ...card.positions]
          .join(' ')
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name));
  }, [profile.cardCollection.owned, rarityFilter, search, showAll, sport]);

  function buyPack(tier: CardPackTier) {
    playMenuClick();
    const pack = CARD_PACKS.find(item => item.id === tier);
    if (!pack) return;
    if (profile.coins < pack.cost) {
      setError(`Need ${pack.cost - profile.coins} more coins`);
      return;
    }
    setError(null);
    // Preview only. Coins and pulls are committed when the player confirms "Buy & rip".
    setOpening({ pack, cards: [] });
    setOpeningStarted(false);
    setTearing(false);
    setRevealed(0);
  }

  function confirmPackOpen() {
    if (!opening || tearing) return;

    // Preserve a pack generated by an older hot-reloaded screen without charging twice.
    if (opening.cards.length > 0) {
      playPackOpen();
      setTearing(true);
      window.setTimeout(() => {
        setTearing(false);
        setOpeningStarted(true);
      }, 900);
      return;
    }

    const result = openCardPack(sport, opening.pack.id);
    if (!result.ok) {
      stopPackSuspense();
      setError(result.error ?? 'Could not open pack');
      setOpening(null);
      return;
    }

    onProfileChange(result.profile);
    setOpening({ pack: opening.pack, cards: result.cards });
    playPackOpen();
    setTearing(true);
    window.setTimeout(() => {
      setTearing(false);
      setOpeningStarted(true);
      setRevealed(0);
    }, 900);
  }

  function closeOpening() {
    stopPackSuspense();
    playMenuBack();
    setOpening(null);
    setOpeningStarted(false);
    setTearing(false);
    setRevealed(0);
  }

  const pityLeft = Math.max(1, 35 - profile.cardCollection.legendaryPity);
  const sportOwned = CARDS_BY_SPORT[sport].filter(
    card => (profile.cardCollection.owned[card.key] ?? 0) > 0,
  ).length;

  return (
    <div className="relative h-svh overflow-hidden">
      <SportBackground sport={sport} />

      {/* Left sport rail — overlay so layout stays put */}
      <aside
        className="pointer-events-none fixed left-0 top-1/2 z-30 -translate-y-1/2 pl-[max(0.5rem,env(safe-area-inset-left))] sm:pl-4"
        aria-label="Choose sport"
      >
        <div
          className="pointer-events-auto flex flex-col gap-1.5 rounded-2xl border border-white/10 bg-[#16171b]/92 p-1.5 backdrop-blur-md sm:gap-2 sm:p-2"
          role="tablist"
        >
          {(Object.keys(SPORT_META) as Sport[]).map(item => {
            const active = sport === item;
            const accent = SPORT_META[item].accent;
            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={SPORT_META[item].label}
                onClick={() => {
                  playMenuSelect();
                  setSport(item);
                  setVisibleCount(48);
                }}
                className={`flex h-11 w-11 items-center justify-center rounded-xl transition-opacity sm:h-16 sm:w-16 ${
                  active ? '' : 'opacity-45 hover:opacity-80'
                }`}
                style={
                  active
                    ? {
                        border: `2px solid ${accent}aa`,
                        background: `${accent}18`,
                        boxShadow: `0 0 12px ${accent}33`,
                      }
                    : { border: '2px solid transparent' }
                }
              >
                <SportBall sport={item} size={32} className="sm:hidden" />
                <SportBall sport={item} size={40} className="hidden sm:block" />
              </button>
            );
          })}
        </div>
      </aside>

      <div className="relative z-10 flex h-svh flex-col">
        <header className="flex shrink-0 items-center justify-between gap-2 pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
          <button
            type="button"
            onClick={() => {
              playMenuBack();
              onBack();
            }}
            className={MENU_BACK_CLASS}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center justify-end gap-1.5 sm:gap-2.5">
            <button
              type="button"
              onClick={() => {
                playMenuClick();
                setShowDisclaimer(true);
              }}
              className="game-nav-tab !min-h-[2.35rem] !px-2.5 sm:!px-3"
              aria-label="Packs disclaimer"
              title="Disclaimer"
            >
              <Info className="h-4 w-4" />
            </button>

            {([
              ['packs', 'Packs', PackageOpen],
              ['collection', 'Collection', Layers3],
            ] as const).map(([id, label, Icon]) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    playMenuClick();
                    setTab(id);
                  }}
                  className={`game-nav-tab !min-h-[2.35rem] ${active ? 'game-nav-tab-active' : ''}`}
                >
                  <Icon className="h-4 w-4 sm:h-[1.05rem] sm:w-[1.05rem]" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              );
            })}

            <div className="group relative hidden sm:block">
              <div
                className="game-nav-tab !min-h-[2.35rem] cursor-help"
                tabIndex={0}
                aria-describedby="pity-tooltip"
              >
                <Sparkles className="h-4 w-4 text-[#f0b232]" />
                <span>Pity {pityLeft}</span>
              </div>
              <div
                id="pity-tooltip"
                role="tooltip"
                className="pointer-events-none absolute right-0 top-[calc(100%+0.45rem)] z-50 w-56 rounded-xl border border-[#f0b232]/35 bg-[#1a1b20] px-3 py-2.5 opacity-0 shadow-[0_12px_28px_rgba(0,0,0,.55)] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
              >
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#f0b232]">
                  Legendary pity
                </p>
                <p className="mt-1 text-xs font-semibold leading-snug text-[#dbdee1]">
                  A legendary is guaranteed within 35 packs.
                  {pityLeft === 1
                    ? ' Next pack is guaranteed.'
                    : ` ${pityLeft} packs left.`}
                </p>
              </div>
            </div>

            <CoinBadge coins={profile.coins} />
          </div>
        </header>

        <main
          className={`min-h-0 flex-1 overflow-y-auto overscroll-contain pl-[4.25rem] pr-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8 ${
            tab === 'packs' ? 'pt-3 sm:pt-4' : 'pt-8 sm:pt-10'
          }`}
        >
          {tab === 'packs' ? (
            <div className="mx-auto flex w-full max-w-5xl flex-col">
              {error && (
                <div className="game-panel mb-6 flex items-center justify-between border-[#ed4245]/40 px-4 py-3 text-sm font-bold text-[#f2f3f5]">
                  {error}
                  <button type="button" onClick={() => setError(null)}><X className="h-4 w-4" /></button>
                </div>
              )}

              <div className="border-b border-white/10 pb-5 text-center sm:text-left">
                <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  Get Packs
                </h2>
                <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-[#8b8e97]">
                  {SPORT_META[sport].label} · collect new items
                </p>
              </div>

              <div className="mt-10 grid gap-5 sm:grid-cols-3 sm:gap-6">
                {CARD_PACKS.map((pack, index) => {
                  const affordable = profile.coins >= pack.cost;
                  const [accent, glow, deep] = pack.colors;
                  return (
                    <motion.article
                      key={pack.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.28 }}
                      className="game-pack-panel group relative overflow-visible px-5 py-4 sm:px-6 sm:py-4"
                      style={{
                        borderColor: `${accent}55`,
                        background: `linear-gradient(165deg, ${accent}2e 0%, ${deep}b8 42%, rgba(12, 13, 16, 0.72) 100%)`,
                        boxShadow: `0 4px 18px rgba(0, 0, 0, 0.28), inset 0 1px 0 ${glow}22`,
                      }}
                    >
                      <div className="relative z-10 flex min-h-[250px] items-center justify-center overflow-hidden py-0 sm:min-h-[255px]">
                        <PackArt pack={pack} sport={sport} interactive />
                      </div>

                      <div className="relative z-0 mt-1.5 flex flex-1 flex-col border-t border-white/10 pt-2.5">
                        <h3 className="text-base font-extrabold tracking-tight text-white sm:text-lg">{pack.name}</h3>
                        <p className="mt-0.5 text-[12px] font-semibold leading-snug text-[#949ba4]">
                          {pack.cardCount} cards · {pack.tagline}
                        </p>
                        <div className="mt-2">
                          <Odds pack={pack} />
                        </div>
                        <button
                          type="button"
                          onClick={() => buyPack(pack.id)}
                          disabled={!affordable}
                          className="game-gold-cta mt-2.5 w-full py-2.5 text-sm"
                        >
                          <Coins className="h-4 w-4" />
                          {affordable ? pack.cost.toLocaleString() : 'Need more coins'}
                        </button>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-6xl space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-white">
                    Collection
                    <span className="ml-2 text-base font-bold text-[#8b8e97]">
                      {sportOwned}/{CARDS_BY_SPORT[sport].length}
                    </span>
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="game-chip min-w-0 w-full flex-1 !rounded-2xl sm:min-w-[180px]">
                    <Search className="h-4 w-4 text-[#6d6f78]" />
                    <input
                      value={search}
                      onChange={event => {
                        setSearch(event.target.value);
                        setVisibleCount(48);
                      }}
                      placeholder="Search players, teams..."
                      className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-white outline-none placeholder:text-[#6d6f78]"
                    />
                  </label>
                  <label className="relative">
                    <select
                      value={rarityFilter}
                      onChange={event => {
                        setRarityFilter(event.target.value as CardRarity | 'all');
                        setVisibleCount(48);
                      }}
                      className="game-chip h-full appearance-none !rounded-2xl !pr-10 capitalize outline-none"
                    >
                      <option value="all">All rarities</option>
                      {Object.keys(RARITY_META).map(rarity => <option key={rarity}>{rarity}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6d6f78]" />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAll(value => !value);
                      setVisibleCount(48);
                    }}
                    className={`game-chip ${showAll ? 'game-chip-active' : ''}`}
                  >
                    {showAll ? 'Catalog' : 'Owned'}
                  </button>
                </div>
              </div>

              {filteredCards.length ? (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {filteredCards.slice(0, visibleCount).map(card => {
                      const owned = (profile.cardCollection.owned[card.key] ?? 0) > 0;
                      return (
                        <div key={card.key} className="relative">
                          <PlayerCard
                            card={card}
                            locked={!owned}
                            onInspect={owned ? inspectCard : undefined}
                          />
                        </div>
                      );
                    })}
                  </div>
                  {visibleCount < filteredCards.length && (
                    <button
                      type="button"
                      onClick={() => setVisibleCount(count => count + 48)}
                      className="game-chip mx-auto"
                    >
                      Load more ({filteredCards.length - visibleCount})
                    </button>
                  )}
                </>
              ) : (
                <div className="game-panel flex min-h-[280px] flex-col items-center justify-center border-dashed text-center">
                  <Trophy className="h-9 w-9 text-[#5c5e66]" />
                  <p className="mt-3 text-lg font-extrabold text-white">No cards yet</p>
                  <p className="mt-1 text-sm font-semibold text-[#8b8e97]">
                    Open a {SPORT_META[sport].label} pack to start collecting.
                  </p>
                  <button
                    type="button"
                    onClick={() => setTab('packs')}
                    className="game-gold-cta mt-4 px-5 py-2.5 text-xs"
                  >
                    Go to Packs
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {inspected && (
          <CardInspectOverlay
            key={inspected.key}
            card={inspected}
            onClose={() => setInspected(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDisclaimer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#050608]/72 px-4 backdrop-blur-sm"
            onClick={() => {
              playMenuBack();
              setShowDisclaimer(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 360, damping: 24 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="packs-disclaimer-title"
              className="game-panel relative w-full max-w-md border-white/12 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
              onClick={event => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  playMenuBack();
                  setShowDisclaimer(false);
                }}
                className="absolute right-3 top-3 rounded-full border border-white/10 bg-white/5 p-1.5 text-[#949ba4] transition-colors hover:text-white"
                aria-label="Close disclaimer"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="mb-3 flex items-center gap-2 pr-8">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#f0b232]/35 bg-[#f0b232]/12 text-[#f0b232]">
                  <Info className="h-4 w-4" />
                </span>
                <h3
                  id="packs-disclaimer-title"
                  className="text-sm font-black uppercase tracking-[0.16em] text-white"
                >
                  Disclaimer
                </h3>
              </div>
              <p className="text-sm font-semibold leading-relaxed text-[#c5c7cc]">
                {PACKS_DISCLAIMER}{' '}
                <span className="font-black uppercase text-[#ed4245]">NEVER START GAMBLING</span>
              </p>
              <button
                type="button"
                onClick={() => {
                  playMenuClick();
                  setShowDisclaimer(false);
                }}
                className="game-gold-cta mt-5 w-full py-2.5 text-sm"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {opening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-[#050608]/96 px-3 py-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl"
          >
            {!openingStarted ? (
              <motion.div
                initial={{ scale: 0.9, y: 24 }}
                animate={{ scale: 1, y: 0 }}
                className="flex min-h-full flex-col items-center justify-center"
              >
                <button
                  type="button"
                  onClick={closeOpening}
                  className="fixed left-3 top-[max(1rem,env(safe-area-inset-top))] z-20 flex min-h-11 items-center gap-1.5 rounded-full border-[2.5px] border-[#3f4147] bg-[#1e1f22] px-3 py-2 text-xs font-black text-[#b5bac1] shadow-[0_3px_0_#1a1b1f] transition-all hover:translate-y-[1px] hover:border-[#5c5e66] hover:text-[#f2f3f5] hover:shadow-[0_2px_0_#1a1b1f] sm:left-6 sm:top-6 sm:gap-2 sm:px-3 sm:text-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <PackArt
                  pack={opening.pack}
                  sport={sport}
                  large
                  tearing={tearing}
                />
                <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.22em] text-[#6d6f78]">
                  {tearing ? 'Ripping pack…' : 'Confirm purchase'}
                </p>
                <h2 className="mt-1 text-2xl font-black text-[#f2f3f5]">{opening.pack.name}</h2>
                <p className="mt-1 text-[11px] font-bold text-[#949ba4]">
                  {tearing ? 'Cards coming out' : 'Coins charged on open'}
                </p>
                <button
                  type="button"
                  onClick={confirmPackOpen}
                  disabled={tearing}
                  className="mt-5 flex items-center gap-2 rounded-full border-[2.5px] border-[#f0b232]/70 bg-[#f0b232] px-8 py-3.5 text-sm font-black text-[#18191c] shadow-[0_3px_0_#8a6814] transition-all hover:translate-y-[1px] hover:shadow-[0_2px_0_#8a6814] disabled:opacity-60"
                >
                  <PackageOpen className="h-5 w-5" />
                  Open · {opening.pack.cost.toLocaleString()}
                </button>
                <button
                  type="button"
                  onClick={closeOpening}
                  disabled={tearing}
                  className="mt-4 text-xs font-black text-[#6d6f78] hover:text-[#f2f3f5] disabled:opacity-40"
                >
                  Cancel
                </button>
              </motion.div>
            ) : (
              <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col items-center pb-[max(2rem,env(safe-area-inset-bottom))] pt-2">
                <div className="sticky top-0 z-20 mb-6 w-full rounded-2xl border-[2.5px] border-[#3f4147] bg-[#121316]/92 py-3 text-center shadow-[0_3px_0_#0a0a0b] backdrop-blur-md">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#6d6f78]">
                    {revealed < opening.cards.length
                      ? `Item ${Math.min(revealed + 1, opening.cards.length)} / ${opening.cards.length}`
                      : 'Pack complete'}
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-[#f2f3f5]">{opening.pack.name}</h2>
                </div>
                <div className="grid w-full grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 md:grid-cols-3">
                  {opening.cards.map((opened, index) => (
                    <div
                      key={`${opened.card.key}-${index}`}
                      ref={node => {
                        revealRefs.current[index] = node;
                      }}
                      className="min-h-[360px] w-full max-w-[260px]"
                    >
                      <AnimatePresence>
                        {revealed > index && (
                          <motion.div
                            initial={{ opacity: 0, rotateY: 90, scale: 0.72, y: 35 }}
                            animate={{ opacity: 1, rotateY: 0, scale: 1, y: 0 }}
                            transition={{ type: 'spring', damping: 14, stiffness: 180 }}
                          >
                            <PlayerCard
                              card={opened.card}
                              duplicate={opened.duplicate}
                              refund={opened.duplicateCoins}
                              onInspect={inspectCard}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
                {revealed >= opening.cards.length && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    type="button"
                    onClick={closeOpening}
                    className="mt-8 rounded-full border-[2.5px] border-[#f0b232]/70 bg-[#f0b232] px-8 py-3 text-sm font-black text-[#18191c] shadow-[0_3px_0_#8a6814] transition-all hover:translate-y-[1px] hover:shadow-[0_2px_0_#8a6814]"
                  >
                    Add to collection
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
