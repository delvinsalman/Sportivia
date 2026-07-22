import { useMemo, useState } from 'react';
import { ArrowLeft, Lock, Sparkles } from 'lucide-react';
import { HomeCoinMeter } from './LevelBar';
import { SportBackground } from './SportBackground';
import { CharacterPodium } from './3d/CharacterPodium';
import { CharacterFutCard } from './CharacterFutCard';
import type { Sport } from '../types';
import type { CharacterId, PlayerProfile } from '../types/profile';
import { CHARACTERS, getCharacterDef } from '../types/profile';
import {
  canUpgradeCharacter,
  characterCardStats,
  characterOverall,
  FEATURED_STAT_KEYS,
  FEATURED_STAT_LABELS,
  getCharacterLevel,
  MAX_CHARACTER_LEVEL,
} from '../lib/characterCards';
import { playMenuBack, playMenuClick, playMenuConfirm, playMenuSelect } from '../lib/menuAudio';

interface CharacterCardsScreenProps {
  sport: Sport;
  profile: PlayerProfile;
  onBack: () => void;
  onPurchaseCharacter: (id: CharacterId) => void;
  onUpgradeCharacter: (id: CharacterId) => void;
  onEquipCharacter: (id: CharacterId) => void;
}

export function CharacterCardsScreen({
  sport,
  profile,
  onBack,
  onPurchaseCharacter,
  onUpgradeCharacter,
  onEquipCharacter,
}: CharacterCardsScreenProps) {
  const [selectedId, setSelectedId] = useState<CharacterId>(() =>
    CHARACTERS.some(c => c.id === profile.equippedCharacter)
      ? profile.equippedCharacter
      : CHARACTERS[0].id,
  );

  const character = useMemo(() => getCharacterDef(selectedId), [selectedId]);
  const owned = profile.unlockedCharacters.includes(selectedId);
  const equipped = profile.equippedCharacter === selectedId;
  const level = getCharacterLevel(profile, selectedId);
  const ovr = characterOverall(character, Math.max(1, level || 1));
  const stats = characterCardStats(character, Math.max(1, level || 1));
  const upgrade = canUpgradeCharacter(profile, selectedId);
  const canAfford = character.price <= 0 || profile.coins >= character.price;

  function select(id: CharacterId) {
    playMenuSelect();
    setSelectedId(id);
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

        <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-3 overflow-hidden px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 lg:flex-row lg:items-stretch lg:gap-6">
          {/* Featured card — centered in its column */}
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
                        Overall · Lv {owned ? level : 0}
                      </p>
                    </div>
                    <p className="max-w-[9rem] text-right text-[10px] font-bold uppercase tracking-wide text-[#949ba4]">
                      {character.tagline}
                    </p>
                  </div>

                  <div className="relative mx-auto mt-0.5 h-[180px] w-full sm:h-[210px]">
                    <CharacterPodium
                      characterId={selectedId}
                      accent={character.accent}
                      height={210}
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
                    <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1 px-2">
                      {FEATURED_STAT_KEYS.map(key => (
                        <div key={key} className="flex items-baseline justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                            {FEATURED_STAT_LABELS[key]}
                          </span>
                          <span className="font-mono text-base font-black text-[#f2f3f5]">
                            {owned ? stats[key] : '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 space-y-2">
                {owned ? (
                  <>
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
                    <button
                      type="button"
                      onClick={() => {
                        if (!upgrade.ok) {
                          playMenuClick();
                          return;
                        }
                        playMenuConfirm();
                        onUpgradeCharacter(selectedId);
                      }}
                      disabled={!upgrade.ok}
                      className={`w-full py-2.5 rounded-2xl text-sm font-black border-[3px] transition-all ${
                        upgrade.ok
                          ? 'bg-[#23a559] hover:bg-[#1e8f4c] text-white border-white/25 shadow-[0_5px_0_#14532d] hover:translate-y-[1px] hover:shadow-[0_4px_0_#14532d]'
                          : 'bg-[#2b2d31] text-[#5c5e66] cursor-not-allowed border-[#3f4147] shadow-[0_4px_0_#1a1b1f]'
                      }`}
                    >
                      {level >= MAX_CHARACTER_LEVEL
                        ? 'Max Level'
                        : upgrade.ok
                          ? `Upgrade · ${upgrade.cost.toLocaleString()} coins`
                          : upgrade.reason ?? 'Upgrade'}
                    </button>
                  </>
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
                  Upgrade cards to raise stats. Unlock looks in Store.
                </p>
              </div>
            </div>
          </div>

          {/* Collection — fills remaining height; scrolls inside the pane only */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <p className="mb-2 shrink-0 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[#949ba4] lg:text-left">
              Your collection
            </p>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5 [scrollbar-width:thin]">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 xl:grid-cols-4">
                {CHARACTERS.map(item => (
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
