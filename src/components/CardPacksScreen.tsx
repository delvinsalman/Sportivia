import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ChevronDown,
  Coins,
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
import { CARD_CATALOG, CARD_PACKS, CARDS_BY_SPORT } from '../lib/cardCatalog';
import { openCardPack } from '../lib/profileStorage';
import {
  cleanTeamName,
  resolvePlayerCardBio,
  resolvePlayerFace,
  type PlayerCardBio,
} from '../lib/playerFaces';
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
import { assetUrl } from '../lib/assetUrl';
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
}: {
  card: CollectibleCard;
  duplicate?: boolean;
  refund?: number;
  locked?: boolean;
}) {
  const [face, setFace] = useState<string | null>(null);
  const [bio, setBio] = useState<PlayerCardBio | null>(null);
  const rarity = RARITY_META[card.rarity];
  const age = bio?.age ?? card.age;
  const retired = bio?.retired ?? card.retired;
  const team = cleanTeamName(bio?.team) ?? cleanTeamName(card.team);

  useEffect(() => {
    let active = true;
    if (locked) return;
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
  }, [card.name, card.playerId, card.sport, locked]);

  return (
    <div
      className={`relative aspect-[3/4.25] w-full overflow-hidden rounded-[22px] border-[3px] ${
        locked ? 'opacity-55 grayscale' : ''
      }`}
      style={{
        borderColor: locked ? '#3f4147' : rarity.border,
        background: locked ? 'linear-gradient(145deg,#2b2d31,#111214)' : rarity.background,
        boxShadow: locked
          ? '0 7px 0 #111214'
          : `0 8px 0 #111214, 0 0 24px ${rarity.glow}, inset 0 0 0 1px rgba(255,255,255,.16)`,
      }}
    >
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_25%_15%,white,transparent_28%)]" />
      <div className="absolute -right-8 top-16 rotate-90 text-[54px] font-black tracking-tighter text-white/[0.045]">
        SPORTIVIA
      </div>

      <div className="relative z-10 flex h-full flex-col p-3">
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

        <div className="relative my-1 min-h-0 flex-1 overflow-hidden rounded-xl">
          {locked ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="h-12 w-12 text-white/20" />
            </div>
          ) : face ? (
            <img
              src={face}
              alt={card.name}
              className="absolute inset-0 h-full w-full object-contain object-bottom drop-shadow-[0_8px_10px_rgba(0,0,0,.75)]"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-black text-white/15">
                {card.name.split(/\s+/).map(part => part[0]).slice(0, 2).join('')}
              </span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        <div className="relative z-10 border-t border-white/15 pt-2 text-center">
          <p className="truncate text-base font-black uppercase leading-tight tracking-tight text-white">
            {locked ? 'Undiscovered' : card.name}
          </p>
          {retired ? (
            <div className="mt-1.5 flex flex-col items-center gap-1">
              <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-[0.16em] text-white/80">
                Retired
              </span>
              {team && (
                <p className="truncate text-[10px] font-bold text-white/55">
                  Last club · {team}
                </p>
              )}
            </div>
          ) : (
            <p className="mt-1 truncate text-[10px] font-bold text-white/70">
              {team ?? 'Free agent'}
            </p>
          )}
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
    </div>
  );
}

/** Showcase 3 players from this sport/tier as a tight portrait stack. */
function pickShowcaseCards(sport: Sport, tier: CardPackTier): CollectibleCard[] {
  const pool = [...CARDS_BY_SPORT[sport]].sort((a, b) => b.rating - a.rating);
  const prefer: CardRarity[] =
    tier === 'icon'
      ? ['legendary', 'epic', 'rare']
      : tier === 'elite'
        ? ['epic', 'rare']
        : ['rare', 'common', 'epic'];

  const fitsEliteFace = (card: CollectibleCard) => {
    if (tier !== 'elite') return true;
    // Elite art should feel current — skip retired icons like Kaká on the pack face.
    if (card.retired) return false;
    if (sport === 'soccer' && card.playerId === 'kaka') return false;
    return true;
  };

  const picked: CollectibleCard[] = [];
  for (const rarity of prefer) {
    for (const card of pool) {
      if (card.rarity !== rarity) continue;
      if (!fitsEliteFace(card)) continue;
      if (picked.some(item => item.key === card.key)) continue;
      picked.push(card);
      if (picked.length >= 3) return picked;
    }
  }
  for (const card of pool) {
    if (!fitsEliteFace(card)) continue;
    if (picked.some(item => item.key === card.key)) continue;
    picked.push(card);
    if (picked.length >= 3) break;
  }
  return picked;
}

function ShowcaseMiniCard({
  card,
  large = false,
  dimmed = false,
}: {
  card: CollectibleCard;
  large?: boolean;
  dimmed?: boolean;
}) {
  const [face, setFace] = useState<string | null>(null);
  const rarity = RARITY_META[card.rarity];

  useEffect(() => {
    let active = true;
    void resolvePlayerFace(card.sport, card.playerId, card.name).then(url => {
      if (active) setFace(url);
    });
    return () => {
      active = false;
    };
  }, [card.name, card.playerId, card.sport]);

  return (
    <div
      className={`relative overflow-hidden rounded-[18px] border-2 ${
        large ? 'h-[250px] w-[168px]' : 'h-[200px] w-[134px]'
      }`}
      style={{
        borderColor: rarity.border,
        background: '#0b0c10',
        boxShadow: dimmed
          ? '0 8px 16px rgba(0,0,0,0.4)'
          : `0 14px 28px rgba(0,0,0,0.55), 0 0 20px ${rarity.glow}`,
        opacity: dimmed ? 0.92 : 1,
      }}
    >
      {face ? (
        <img
          src={face}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover object-[center_18%]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[#16171b] text-3xl">
          {SPORT_META[card.sport].icon}
        </div>
      )}

      {/* Bottom fade for name */}
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />

      <div className="absolute left-2 top-2 rounded-md bg-black/55 px-1.5 py-0.5 backdrop-blur-[2px]">
        <p className="font-mono text-sm font-black leading-none text-white">{card.rating}</p>
      </div>

      <div
        className="absolute right-2 top-2 rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide"
        style={{ background: `${rarity.border}dd`, color: '#0b0c10' }}
      >
        {rarity.label.slice(0, 3)}
      </div>

      <div className="absolute inset-x-0 bottom-0 px-2 pb-2">
        <p className="truncate text-[11px] font-black uppercase tracking-wide text-white">
          {card.name.split(' ').slice(-1)[0]}
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
}: {
  pack: CardPackDefinition;
  sport: Sport;
  large?: boolean;
  tearing?: boolean;
}) {
  const accent = PACK_ACCENT[pack.id] ?? PACK_ACCENT.prospect;
  const tier = pack.name.replace(' Pack', '').toUpperCase();
  const cards = useMemo(() => pickShowcaseCards(sport, pack.id), [sport, pack.id]);

  // Tight overlapping fan — center card in front
  const poses = large
    ? [
        { rotate: -11, x: -54, y: 22, z: 1, dimmed: true },
        { rotate: 0, x: 0, y: 0, z: 3, dimmed: false },
        { rotate: 11, x: 54, y: 22, z: 2, dimmed: true },
      ]
    : [
        { rotate: -10, x: -42, y: 18, z: 1, dimmed: true },
        { rotate: 0, x: 0, y: 0, z: 3, dimmed: false },
        { rotate: 10, x: 42, y: 18, z: 2, dimmed: true },
      ];

  return (
    <motion.div
      className={`relative mx-auto flex shrink-0 flex-col items-center ${
        large ? 'h-[380px] w-[300px]' : 'h-[290px] w-[230px]'
      }`}
      animate={
        tearing
          ? { scale: [1, 1.03, 0.95], rotate: [0, -2, 3, 0], y: [0, -6, 10] }
          : undefined
      }
      transition={tearing ? { duration: 0.85, ease: 'easeInOut' } : undefined}
    >
      <div className="mb-3 text-center">
        <p
          className={`font-black uppercase tracking-[0.22em] ${large ? 'text-[10px]' : 'text-[8px]'}`}
          style={{ color: accent }}
        >
          {tier} PACK
        </p>
      </div>

      <div className="relative flex-1 w-full">
        {/* Soft ground glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[58%] h-24 w-40 -translate-x-1/2 rounded-full blur-2xl"
          style={{ background: accent, opacity: 0.18 }}
        />

        {cards.map((card, index) => {
          const pose = poses[index] ?? poses[1];
          return (
            <div
              key={card.key}
              className="absolute left-1/2 top-[46%]"
              style={{
                zIndex: pose.z,
                transform: `translate(-50%, -50%) translate(${pose.x}px, ${pose.y}px) rotate(${pose.rotate}deg)`,
              }}
            >
              <ShowcaseMiniCard card={card} large={large} dimmed={pose.dimmed} />
            </div>
          );
        })}
      </div>

      <p
        className={`mt-1 font-black uppercase tracking-[0.16em] text-white/50 ${
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
  const [search, setSearch] = useState('');
  const [rarityFilter, setRarityFilter] = useState<CardRarity | 'all'>('all');
  const [showAll, setShowAll] = useState(false);
  const [visibleCount, setVisibleCount] = useState(48);
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);

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
  const sportOwned = Object.keys(profile.cardCollection.owned).filter(
    key => key.startsWith(`${sport}:`) && (profile.cardCollection.owned[key] ?? 0) > 0,
  ).length;

  return (
    <div className="relative h-svh overflow-hidden">
      <SportBackground sport={sport} />

      {/* Left sport rail — overlay so layout stays put */}
      <aside
        className="pointer-events-none fixed left-0 top-1/2 z-30 -translate-y-1/2 pl-2 sm:pl-4"
        aria-label="Choose sport"
      >
        <div
          className="pointer-events-auto flex flex-col gap-2 rounded-2xl border border-white/10 bg-[#16171b]/92 p-2 backdrop-blur-md"
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
                className={`flex h-14 w-14 items-center justify-center rounded-xl transition-opacity sm:h-16 sm:w-16 ${
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
                <SportBall sport={item} size={40} />
              </button>
            );
          })}
        </div>
      </aside>

      <div className="relative z-10 flex h-svh flex-col">
        <header className="flex shrink-0 items-center justify-between gap-3 px-4 pt-4 sm:px-8">
          <button
            type="button"
            onClick={() => {
              playMenuBack();
              onBack();
            }}
            className="game-chip"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex items-center justify-end gap-2">
            <div className="inline-flex gap-1 rounded-full border border-white/8 bg-[#16171b]/90 p-1">
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
                    className={`game-chip !py-1.5 ${active ? 'game-chip-active' : ''}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                );
              })}
            </div>

            <div className="game-chip hidden sm:inline-flex">
              <Sparkles className="h-3.5 w-3.5 text-[#f0b232]" />
              Pity {pityLeft}
            </div>

            <div className="game-chip game-chip-active !gap-1.5">
              <Coins className="h-3.5 w-3.5 text-[#f0b232]" />
              <span className="font-mono text-[#f0b232]">{profile.coins.toLocaleString()}</span>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-8 sm:px-8 sm:pt-10">
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
                  const [, c1] = pack.colors;
                  return (
                    <motion.article
                      key={pack.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.28 }}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#12131a]/80 p-3.5 sm:p-4"
                      style={{
                        boxShadow: `0 8px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.04)`,
                        borderColor: `${c1}40`,
                      }}
                    >
                      <div className="relative flex min-h-[300px] items-center justify-center py-1 sm:min-h-[310px]">
                        <div className="relative transition-transform duration-300 group-hover:-translate-y-1">
                          <PackArt pack={pack} sport={sport} />
                        </div>
                      </div>

                      <div className="mt-3 flex flex-1 flex-col border-t border-white/10 pt-3">
                        <h3 className="text-base font-extrabold tracking-tight text-white sm:text-lg">{pack.name}</h3>
                        <p className="mt-0.5 text-[12px] font-semibold leading-snug text-[#949ba4]">
                          {pack.cardCount} cards · {pack.tagline}
                        </p>
                        <div className="mt-2.5">
                          <Odds pack={pack} />
                        </div>
                        <button
                          type="button"
                          onClick={() => buyPack(pack.id)}
                          disabled={!affordable}
                          className="game-gold-cta mt-3.5 w-full py-2.5 text-sm"
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
                  <label className="game-chip min-w-[180px] flex-1 !rounded-2xl">
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
                      className="game-chip h-full appearance-none !rounded-2xl pr-8 capitalize outline-none"
                    >
                      <option value="all">All rarities</option>
                      {Object.keys(RARITY_META).map(rarity => <option key={rarity}>{rarity}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d6f78]" />
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
                    {filteredCards.slice(0, visibleCount).map(card => (
                      <div key={card.key} className="relative">
                        <PlayerCard
                          card={card}
                          locked={(profile.cardCollection.owned[card.key] ?? 0) === 0}
                        />
                        {(profile.cardCollection.owned[card.key] ?? 0) > 1 && (
                          <span className="game-chip game-chip-active absolute -right-1 -top-1 z-20 !min-h-0 !px-2 !py-0.5 text-[9px] text-[#f0b232]">
                            ×{profile.cardCollection.owned[card.key]}
                          </span>
                        )}
                      </div>
                    ))}
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
        {opening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-[#050608]/96 px-3 py-6 backdrop-blur-xl"
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
                  className="fixed left-3 top-4 z-20 flex items-center gap-1.5 rounded-full border-[2.5px] border-[#3f4147] bg-[#1e1f22] px-2.5 py-1.5 text-xs font-black text-[#b5bac1] shadow-[0_3px_0_#1a1b1f] transition-all hover:translate-y-[1px] hover:border-[#5c5e66] hover:text-[#f2f3f5] hover:shadow-[0_2px_0_#1a1b1f] sm:left-6 sm:top-6 sm:gap-2 sm:px-3 sm:text-sm"
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
