import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Ban, Search, Swords } from 'lucide-react';
import type { Sport } from '../types';
import type { PlayerProfile } from '../types/profile';
import type { CardRarity, CollectibleCard } from '../types/cards';
import {
  ownedCardsForSport,
  rollBotWager,
  toWagerStake,
  type CardWagerAgreement,
  type CardWagerStake,
} from '../lib/cardWager';
import { cardDisplayName } from '../lib/cardCatalog';
import type { BotDifficulty } from '../types';
import { SportBackground } from './SportBackground';
import { playMenuBack, playMenuClick, playMenuSelect } from '../lib/menuAudio';
import { SPORT_LABEL } from '../lib/sportTheme';

const RARITY_COLOR: Record<CardRarity, string> = {
  common: '#94a3b8',
  rare: '#60a5fa',
  epic: '#c084fc',
  legendary: '#f0b232',
};

const RARITY_FILTERS: Array<'all' | CardRarity> = [
  'all',
  'common',
  'rare',
  'epic',
  'legendary',
];

interface CardWagerScreenProps {
  profile: PlayerProfile;
  sport: Sport;
  modeLabel: string;
  opponentLabel: string;
  botDifficulty?: BotDifficulty;
  onBack: () => void;
  onSkip: () => void;
  onConfirm: (agreement: CardWagerAgreement) => void;
}

export function CardWagerScreen({
  profile,
  sport,
  modeLabel,
  opponentLabel,
  botDifficulty = 'pro',
  onBack,
  onSkip,
  onConfirm,
}: CardWagerScreenProps) {
  const owned = useMemo(
    () => ownedCardsForSport(profile.cardCollection.owned, sport),
    [profile.cardCollection.owned, sport],
  );
  const [selected, setSelected] = useState<CollectibleCard | null>(null);
  const [search, setSearch] = useState('');
  const [rarityFilter, setRarityFilter] = useState<'all' | CardRarity>('all');
  const [preview, setPreview] = useState<{
    yours: CardWagerStake;
    theirs: CardWagerStake | null;
  } | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return owned.filter(card => {
      if (rarityFilter !== 'all' && card.rarity !== rarityFilter) return false;
      if (!query) return true;
      return (
        card.name.toLowerCase().includes(query) ||
        card.team.toLowerCase().includes(query) ||
        card.positions.some(pos => pos.toLowerCase().includes(query))
      );
    });
  }, [owned, rarityFilter, search]);

  useEffect(() => {
    if (selected && !filtered.some(card => card.key === selected.key)) {
      setSelected(null);
    }
  }, [filtered, selected]);

  function handleSkip() {
    playMenuClick();
    onSkip();
  }

  function handleStake() {
    if (!selected) return;
    playMenuSelect();
    const yours = toWagerStake(selected);
    const theirs = rollBotWager(sport, botDifficulty);
    setPreview({ yours, theirs });
  }

  function handleContinue() {
    if (!preview) return;
    playMenuClick();
    onConfirm({
      yourCard: preview.yours,
      opponentCard: preview.theirs,
    });
  }

  return (
    <div className="relative h-svh overflow-hidden">
      <SportBackground sport={sport} />
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
          <div className="game-chip">
            <Swords className="h-3.5 w-3.5 text-[#ed4245]" />
            {modeLabel}
          </div>
        </header>

        <main className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-4 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8">
          <div className={`mx-auto w-full ${preview ? 'max-w-lg' : 'max-w-3xl'}`}>
            {!preview ? (
              <div className="w-full">
                <h2 className="text-center text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  Put a card on the line?
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-center text-sm font-semibold leading-relaxed text-[#949ba4]">
                  Optional stake vs {opponentLabel}. Win and you take their card. Lose and yours is
                  gone — pull it again from packs. You can also say no.
                </p>

                {owned.length === 0 ? (
                  <div className="mt-6 text-center">
                    <p className="text-lg font-extrabold text-white">No {SPORT_LABEL[sport]} cards yet</p>
                    <p className="mt-1 text-sm font-semibold text-[#8b8e97]">
                      Open packs first, or skip and play without a stake.
                    </p>
                    <button type="button" onClick={handleSkip} className="game-gold-cta mt-5 px-6 py-2.5 text-sm">
                      Play without stake
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <label className="game-chip min-w-0 flex-1 !rounded-2xl">
                        <Search className="h-4 w-4 shrink-0 text-[#6d6f78]" />
                        <input
                          value={search}
                          onChange={event => setSearch(event.target.value)}
                          placeholder="Search player, team…"
                          className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-white outline-none placeholder:text-[#6d6f78]"
                        />
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {RARITY_FILTERS.map(filter => {
                          const active = rarityFilter === filter;
                          const color =
                            filter === 'all' ? '#f2f3f5' : RARITY_COLOR[filter];
                          return (
                            <button
                              key={filter}
                              type="button"
                              onClick={() => {
                                playMenuClick();
                                setRarityFilter(filter);
                              }}
                              className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide transition-colors ${
                                active ? 'bg-white/10' : 'bg-transparent opacity-70 hover:opacity-100'
                              }`}
                              style={{
                                color,
                                borderColor: active ? `${color}99` : 'rgba(255,255,255,0.12)',
                              }}
                            >
                              {filter}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-4 grid max-h-[min(42svh,360px)] grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
                      {filtered.length ? (
                        filtered.map(card => {
                          const active = selected?.key === card.key;
                          return (
                            <button
                              key={card.key}
                              type="button"
                              onClick={() => {
                                playMenuClick();
                                setSelected(card);
                              }}
                              className={`flex items-center justify-between rounded-2xl border px-3 py-3 text-left transition-colors ${
                                active
                                  ? 'border-[#f0b232]/70 bg-[#f0b232]/12'
                                  : 'border-white/10 bg-[#12131a]/85 hover:border-white/20'
                              }`}
                            >
                              <div className="min-w-0 flex-1 pr-2">
                                <p className="truncate text-sm font-extrabold text-white" title={card.name}>
                                  {cardDisplayName(card)}
                                </p>
                                <p
                                  className="mt-0.5 text-[10px] font-black uppercase tracking-wide"
                                  style={{ color: RARITY_COLOR[card.rarity] }}
                                >
                                  {card.rarity} · {card.rating} OVR
                                </p>
                              </div>
                              <span className="font-mono text-sm font-black text-white/70">
                                {card.rating}
                              </span>
                            </button>
                          );
                        })
                      ) : (
                        <div className="col-span-full px-4 py-8 text-center">
                          <p className="text-sm font-extrabold text-white">No matches</p>
                          <p className="mt-1 text-xs font-semibold text-[#8b8e97]">
                            Try another rarity or search.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={handleSkip}
                        className="game-chip flex-1 justify-center !rounded-2xl !py-3"
                      >
                        <Ban className="h-4 w-4" />
                        No stake
                      </button>
                      <button
                        type="button"
                        disabled={!selected}
                        onClick={handleStake}
                        className="game-gold-cta flex-1 py-3 text-sm disabled:opacity-40"
                      >
                        Stake {selected ? selected.name.split(' ').slice(-1)[0] : 'card'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full text-center"
              >
                <h2 className="text-2xl font-extrabold text-white">Stake locked in</h2>
                <div className="mt-6 grid gap-3">
                  <StakeCard label="You put up" stake={preview.yours} />
                  {preview.theirs ? (
                    <StakeCard label={`${opponentLabel} puts up`} stake={preview.theirs} />
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-[#12131a]/90 px-4 py-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8b8e97]">
                        {opponentLabel}
                      </p>
                      <p className="mt-2 text-lg font-extrabold text-white">Sits this one out</p>
                      <p className="mt-1 text-xs font-semibold text-[#949ba4]">
                        No card trade this match — yours stays safe.
                      </p>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleContinue}
                  className="game-gold-cta mt-8 w-full py-3 text-sm"
                >
                  {preview.theirs ? 'Continue to match' : 'Play without trade'}
                </button>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function StakeCard({ label, stake }: { label: string; stake: CardWagerStake }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#12131a]/90 px-4 py-4 text-left">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8b8e97]">{label}</p>
      <p className="mt-1 text-lg font-extrabold text-white">{stake.name}</p>
      <p
        className="mt-0.5 text-[11px] font-black uppercase tracking-wide"
        style={{ color: RARITY_COLOR[stake.rarity] }}
      >
        {stake.rarity} · {stake.rating} OVR
      </p>
    </div>
  );
}
