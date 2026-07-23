import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Lock, Minus, Plus, Search, Sparkles, X } from 'lucide-react';
import { HomeCoinMeter } from './LevelBar';
import { SportBackground } from './SportBackground';
import { CharacterPodium } from './3d/CharacterPodium';
import { CharacterFutCard } from './CharacterFutCard';
import type { Sport } from '../types';
import type { CharacterId, PlayerProfile } from '../types/profile';
import { CHARACTERS, getCharacterDef } from '../types/profile';
import {
  CARD_CATEGORY_OPTIONS,
  CARD_STAT_KEYS,
  CARD_STAT_LABELS,
  canUpgradeCharacterStat,
  characterCardStatsWithPending,
  characterOverallWithPending,
  emptyStatPending,
  getCharacterLevel,
  matchesCardCategory,
  pendingCount,
  pendingUpgradeTotal,
  type CardCategoryFilter,
  type CardStatKey,
  type StatPending,
} from '../lib/characterCards';
import { playMenuBack, playMenuClick, playMenuConfirm, playMenuSelect } from '../lib/menuAudio';

interface CharacterCardsScreenProps {
  sport: Sport;
  profile: PlayerProfile;
  onBack: () => void;
  onPurchaseCharacter: (id: CharacterId) => void;
  onApplyStatUpgrades: (id: CharacterId, pending: StatPending) => boolean;
  onEquipCharacter: (id: CharacterId) => void;
}

export function CharacterCardsScreen({
  sport,
  profile,
  onBack,
  onPurchaseCharacter,
  onApplyStatUpgrades,
  onEquipCharacter,
}: CharacterCardsScreenProps) {
  const [selectedId, setSelectedId] = useState<CharacterId>(() =>
    CHARACTERS.some(c => c.id === profile.equippedCharacter)
      ? profile.equippedCharacter
      : CHARACTERS[0].id,
  );
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CardCategoryFilter>('all');
  const [pending, setPending] = useState<StatPending>(emptyStatPending);
  const [cartOpen, setCartOpen] = useState(false);

  const character = useMemo(() => getCharacterDef(selectedId), [selectedId]);
  const owned = profile.unlockedCharacters.includes(selectedId);
  const equipped = profile.equippedCharacter === selectedId;
  const level = getCharacterLevel(profile, selectedId);
  const stats = characterCardStatsWithPending(character, profile, pending);
  const ovr = characterOverallWithPending(character, profile, pending);
  const canAfford = character.price <= 0 || profile.coins >= character.price;
  const queued = pendingCount(pending);
  const cart = useMemo(
    () => pendingUpgradeTotal(profile, character, pending),
    [character, pending, profile],
  );

  useEffect(() => {
    if (queued > 0) setCartOpen(true);
  }, [queued]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CHARACTERS.filter(item => {
      if (!matchesCardCategory(item, profile, category)) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.tagline.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      );
    });
  }, [category, profile, query]);

  function select(id: CharacterId) {
    playMenuSelect();
    setSelectedId(id);
    setPending(emptyStatPending());
    setCartOpen(false);
  }

  function queueStat(stat: CardStatKey) {
    const check = canUpgradeCharacterStat(profile, character, stat, pending);
    if (!check.ok) {
      playMenuClick();
      return;
    }
    playMenuClick();
    setPending(prev => ({ ...prev, [stat]: (prev[stat] ?? 0) + 1 }));
  }

  function unqueueStat(stat: CardStatKey) {
    playMenuClick();
    setPending(prev => {
      const next = { ...prev };
      const n = (next[stat] ?? 0) - 1;
      if (n <= 0) delete next[stat];
      else next[stat] = n;
      return next;
    });
  }

  function clearPending() {
    playMenuBack();
    setPending(emptyStatPending());
    setCartOpen(false);
  }

  function confirmPending() {
    if (queued <= 0) return;
    if (profile.coins < cart.total) {
      playMenuClick();
      return;
    }
    playMenuConfirm();
    const ok = onApplyStatUpgrades(selectedId, pending);
    if (ok) {
      setPending(emptyStatPending());
      setCartOpen(false);
    }
  }

  return (
    <div className="relative h-svh overflow-hidden text-[#f2f3f5]">
      <SportBackground sport={sport} />
      <div className="relative z-10 flex h-full flex-col">
        <header className="flex shrink-0 items-center justify-between gap-3 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 sm:px-5">
          <button
            type="button"
            onClick={() => {
              playMenuBack();
              onBack();
            }}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-black text-[#b5bac1] hover:text-[#f2f3f5] bg-[#1e1f22] border-[2.5px] border-[#3f4147] hover:border-[#5c5e66] shadow-[0_3px_0_#1a1b1f] hover:translate-y-[1px] hover:shadow-[0_2px_0_#1a1b1f] transition-all shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <p className="hidden sm:block text-[11px] font-black uppercase tracking-[0.18em] text-[#949ba4]">
              Skin cards
            </p>
            <HomeCoinMeter coins={profile.coins} />
          </div>
        </header>

        <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col items-center justify-center gap-3 overflow-hidden px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 lg:flex-row lg:items-center lg:gap-6">
          <div className="flex w-full shrink-0 flex-col items-center justify-center lg:w-[22.5rem] xl:w-[24rem]">
            <div className="w-full max-w-[20rem] sm:max-w-[22rem]">
              <div className="relative overflow-hidden rounded-[1.35rem] border-[3px] border-[#3f4147] bg-[#12141a]/90 shadow-[0_6px_0_#0a0b0d]">
                <div
                  className="pointer-events-none absolute inset-0 opacity-40"
                  style={{
                    background: `radial-gradient(ellipse 80% 55% at 50% 20%, ${character.accent}55 0%, transparent 65%)`,
                  }}
                />
                <div className="relative px-4 pt-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-4xl font-black leading-none tracking-tight text-[#f8fafc]">
                        {owned ? ovr : '—'}
                      </p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/50">
                        Overall · Lv {owned ? level + queued : 0}
                      </p>
                    </div>
                    <p className="max-w-[9rem] text-right text-[10px] font-bold uppercase tracking-wide text-[#949ba4]">
                      {character.tagline}
                    </p>
                  </div>

                  <div className="relative mx-auto mt-0.5 h-[150px] w-full sm:h-[175px]">
                    <CharacterPodium
                      characterId={selectedId}
                      accent={character.accent}
                      height={175}
                      bare
                      hero
                      sport={sport}
                      className="h-full w-full"
                      {...(selectedId === 'creative'
                        ? { creativeLoadout: profile.creativeLoadout }
                        : {})}
                      {...(selectedId === 'athlete'
                        ? { athleteLoadout: profile.athleteLoadout }
                        : {})}
                      {...(selectedId === 'bob' ? { bobLoadout: profile.bobLoadout } : {})}
                      {...(selectedId === 'bunny'
                        ? { rabbitVariant: profile.rabbitVariant }
                        : {})}
                    />
                    {!owned && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/25 bg-black/55">
                          <Lock className="h-5 w-5 text-white/85" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pb-3.5 text-center">
                    <p className="text-lg font-black uppercase tracking-wide text-[#f2f3f5] sm:text-xl">
                      {character.name}
                    </p>
                    <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 px-0.5">
                      {CARD_STAT_KEYS.map(key => {
                        const queuedForStat = pending[key] ?? 0;
                        const check = owned
                          ? canUpgradeCharacterStat(profile, character, key, pending)
                          : { ok: false, cost: 0, reason: 'Locked' as const };
                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between gap-1 rounded-lg bg-black/25 px-2 py-1.5 border border-white/5"
                          >
                            <div className="min-w-0 text-left">
                              <p className="text-[9px] font-bold uppercase tracking-wider text-white/45">
                                {CARD_STAT_LABELS[key]}
                                {queuedForStat > 0 ? (
                                  <span className="ml-1 text-[#4ade80]">+{queuedForStat}</span>
                                ) : null}
                              </p>
                              <p className="font-mono text-base font-black leading-none text-[#f2f3f5]">
                                {owned ? stats[key] : '—'}
                              </p>
                            </div>
                            {owned && (
                              <div className="flex items-center gap-1">
                                {queuedForStat > 0 && (
                                  <button
                                    type="button"
                                    aria-label={`Remove ${CARD_STAT_LABELS[key]} upgrade`}
                                    onClick={() => unqueueStat(key)}
                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-[#3f4147] bg-[#1e1f22] text-[#b5bac1] hover:text-[#f2f3f5]"
                                  >
                                    <Minus className="h-3.5 w-3.5" strokeWidth={3} />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  title={
                                    check.ok
                                      ? `Queue +1 · ${check.cost.toLocaleString()} coins`
                                      : check.reason
                                  }
                                  onClick={() => queueStat(key)}
                                  disabled={!check.ok}
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
                                    check.ok
                                      ? 'border-[#23a559]/80 bg-[#23a559]/25 text-[#4ade80] hover:bg-[#23a559]/40'
                                      : 'border-[#3f4147] bg-[#1e1f22] text-[#5c5e66] cursor-not-allowed'
                                  }`}
                                >
                                  <Plus className="h-4 w-4" strokeWidth={3} />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 space-y-2">
                {owned ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (equipped) {
                        playMenuClick();
                        return;
                      }
                      playMenuConfirm();
                      onEquipCharacter(selectedId);
                    }}
                    disabled={equipped}
                    className={`w-full py-3 rounded-2xl text-sm font-black border-[3px] transition-all ${
                      equipped
                        ? 'bg-[#2b2d31] text-[#949ba4] cursor-default border-[#3f4147] shadow-[0_4px_0_#1a1b1f]'
                        : 'bg-[#5865f2] hover:bg-[#4752c4] text-white border-white/25 shadow-[0_5px_0_#2f3aa8] hover:translate-y-[1px] hover:shadow-[0_4px_0_#2f3aa8]'
                    }`}
                  >
                    {equipped ? 'Equipped' : 'Equip'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!canAfford && character.price > 0) {
                        playMenuClick();
                        return;
                      }
                      playMenuConfirm();
                      onPurchaseCharacter(selectedId);
                    }}
                    disabled={!canAfford && character.price > 0}
                    className={`w-full py-3 rounded-2xl text-sm font-black border-[3px] transition-all flex items-center justify-center gap-2 ${
                      character.price === 0 || canAfford
                        ? 'bg-[#f0b232] hover:bg-[#d99b2b] text-[#1a1a1a] border-white/40 shadow-[0_5px_0_#8a6814] hover:translate-y-[1px] hover:shadow-[0_4px_0_#8a6814]'
                        : 'bg-[#2b2d31] text-[#5c5e66] cursor-not-allowed border-[#3f4147] shadow-[0_4px_0_#1a1b1f]'
                    }`}
                  >
                    {character.price === 0 ? (
                      'Claim Free'
                    ) : canAfford ? (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Unlock · {character.price.toLocaleString()}
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Need {(character.price - profile.coins).toLocaleString()} more
                      </>
                    )}
                  </button>
                )}
                <p className="px-1 text-center text-[10px] font-semibold leading-snug text-[#6d6f78]">
                  Queue stat upgrades, then pay the total. Unlock looks in Store.
                </p>
              </div>
            </div>
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pt-0">
            <div className="mb-2.5 shrink-0 space-y-2.5">
              <p className="text-center text-lg font-black uppercase tracking-[0.12em] text-[#f2f3f5] sm:text-xl lg:text-left">
                Your collection
              </p>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6d6f78]" />
                  <input
                    type="search"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search skins…"
                    className="w-full rounded-xl border-[2.5px] border-[#3f4147] bg-[#1e1f22] py-2 pl-9 pr-3 text-sm font-semibold text-[#f2f3f5] placeholder:text-[#6d6f78] outline-none focus:border-[#5c5e66]"
                  />
                </label>
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none]">
                {CARD_CATEGORY_OPTIONS.map(opt => {
                  const active = category === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        playMenuClick();
                        setCategory(opt.id);
                      }}
                      className={`shrink-0 rounded-full border-[2.5px] px-3 py-1 text-[11px] font-black uppercase tracking-wide transition-all ${
                        active
                          ? 'border-[#f0b232]/80 bg-[#2a2414] text-[#f0b232]'
                          : 'border-[#3f4147] bg-[#1e1f22] text-[#949ba4] hover:text-[#f2f3f5]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className="overflow-y-auto overscroll-contain pr-0.5 [scrollbar-width:thin]"
              style={{
                maxHeight: 'calc(2 * 12.75rem + 0.625rem)',
              }}
            >
              {filtered.length === 0 ? (
                <p className="rounded-2xl border-[2.5px] border-[#3f4147] bg-[#1e1f22]/70 px-4 py-8 text-center text-sm font-semibold text-[#6d6f78]">
                  No skins match that filter.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
                  {filtered.map(item => (
                    <CharacterFutCard
                      key={item.id}
                      character={item}
                      profile={profile}
                      selected={selectedId === item.id}
                      compact
                      accent={item.accent}
                      onSelect={select}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {cartOpen && queued > 0 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5">
          <div className="pointer-events-auto w-full max-w-md overflow-hidden rounded-2xl border-[3px] border-[#f0b232]/70 bg-[#14110a]/95 shadow-[0_8px_0_#8a6814] backdrop-blur-md">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#f0b232]">
                  Upgrade total
                </p>
                <p className="mt-0.5 text-sm font-semibold text-[#b5bac1]">
                  {queued} upgrade{queued === 1 ? '' : 's'} queued
                </p>
              </div>
              <button
                type="button"
                onClick={clearPending}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#3f4147] bg-[#1e1f22] text-[#b5bac1] hover:text-[#f2f3f5]"
                aria-label="Clear upgrades"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1.5 px-4 py-3">
              {cart.lines.map(line => (
                <div
                  key={line.stat}
                  className="flex items-center justify-between gap-3 text-sm font-bold"
                >
                  <span className="text-[#f2f3f5]">
                    {CARD_STAT_LABELS[line.stat]}{' '}
                    <span className="text-[#4ade80]">+{line.count}</span>
                  </span>
                  <span className="font-mono text-[#ffe08a]">{line.cost.toLocaleString()}</span>
                </div>
              ))}
              <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2">
                <span className="text-sm font-black uppercase tracking-wide text-[#949ba4]">
                  Total
                </span>
                <span className="font-mono text-xl font-black text-[#f0b232]">
                  {cart.total.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex gap-2 px-4 pb-4">
              <button
                type="button"
                onClick={clearPending}
                className="flex-1 rounded-xl border-[2.5px] border-[#3f4147] bg-[#1e1f22] py-2.5 text-sm font-black text-[#b5bac1] hover:text-[#f2f3f5]"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={confirmPending}
                disabled={profile.coins < cart.total}
                className={`flex-[1.4] rounded-xl border-[2.5px] py-2.5 text-sm font-black transition-all ${
                  profile.coins >= cart.total
                    ? 'border-white/30 bg-[#23a559] text-white shadow-[0_4px_0_#14532d] hover:bg-[#1e8f4c]'
                    : 'border-[#3f4147] bg-[#2b2d31] text-[#5c5e66] cursor-not-allowed'
                }`}
              >
                {profile.coins >= cart.total
                  ? `Pay · ${cart.total.toLocaleString()}`
                  : `Need ${(cart.total - profile.coins).toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
