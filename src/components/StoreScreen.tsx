import { useState, useEffect } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { ArrowLeft, Coins, Lock, ShoppingBag, Sparkles } from 'lucide-react';
import type { CharacterId, PetId, PlayerProfile } from '../types/profile';
import { CHARACTERS, PETS, getCharacterDef, getPetDef } from '../types/profile';
import { CharacterPodium } from './3d/CharacterPodium';
import { SportBackground } from './SportBackground';
import type { Sport } from '../types';
import { SPORT_ACCENT, SPORT_PODIUM_ACCENT } from '../lib/sportTheme';
import { playMenuBack, playMenuClick, playMenuConfirm, playMenuSelect } from '../lib/menuAudio';

type StoreTab = 'skins' | 'pets';

interface StoreScreenProps {
  sport: Sport;
  profile: PlayerProfile;
  onBack: () => void;
  onPurchaseCharacter: (id: CharacterId) => void;
  onEquipCharacter: (id: CharacterId) => void;
  onPurchasePet: (id: PetId) => void;
  onEquipPet: (id: PetId) => void;
  onUnequipPet: () => void;
}

const SWIPE_THRESHOLD = 56;

export function StoreScreen({
  sport,
  profile,
  onBack,
  onPurchaseCharacter,
  onEquipCharacter,
  onPurchasePet,
  onEquipPet,
  onUnequipPet,
}: StoreScreenProps) {
  const accent = SPORT_ACCENT[sport];
  const podiumAccent = SPORT_PODIUM_ACCENT[sport];
  const [tab, setTab] = useState<StoreTab>('skins');
  const [previewCharId, setPreviewCharId] = useState<CharacterId>(() =>
    CHARACTERS.some(c => c.id === profile.equippedCharacter)
      ? profile.equippedCharacter
      : CHARACTERS[0].id,
  );
  const [previewPetId, setPreviewPetId] = useState<PetId>(() =>
    profile.equippedPet && PETS.some(p => p.id === profile.equippedPet)
      ? profile.equippedPet
      : PETS[0].id,
  );

  useEffect(() => {
    const next = CHARACTERS.some(c => c.id === profile.equippedCharacter)
      ? profile.equippedCharacter
      : CHARACTERS[0].id;
    setPreviewCharId(next);
  }, [profile.equippedCharacter]);

  useEffect(() => {
    if (!profile.equippedPet) return;
    if (!PETS.some(p => p.id === profile.equippedPet)) return;
    setPreviewPetId(profile.equippedPet);
  }, [profile.equippedPet]);

  const isPets = tab === 'pets';
  const catalog = isPets ? PETS : CHARACTERS;
  const previewId = isPets ? previewPetId : previewCharId;
  const previewIndex = Math.max(0, catalog.findIndex(item => item.id === previewId));
  const safePreviewId = catalog[previewIndex]?.id ?? catalog[0].id;
  const previewDef = isPets
    ? getPetDef(safePreviewId as PetId)
    : getCharacterDef(safePreviewId as CharacterId);
  const owned = isPets
    ? profile.unlockedPets.includes(safePreviewId as PetId)
    : profile.unlockedCharacters.includes(safePreviewId as CharacterId);
  const equipped = isPets
    ? profile.equippedPet === safePreviewId
    : profile.equippedCharacter === safePreviewId;
  const canAfford = profile.coins >= previewDef.price;
  const prevItem = previewIndex > 0 ? catalog[previewIndex - 1] : null;
  const nextItem = previewIndex < catalog.length - 1 ? catalog[previewIndex + 1] : null;

  const selectItem = (id: string) => {
    if (id === safePreviewId) return;
    playMenuSelect();
    if (isPets) setPreviewPetId(id as PetId);
    else setPreviewCharId(id as CharacterId);
  };

  const shiftPreview = (dir: -1 | 1) => {
    const next = Math.min(catalog.length - 1, Math.max(0, previewIndex + dir));
    selectItem(catalog[next].id);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x <= -SWIPE_THRESHOLD || info.velocity.x <= -400) {
      shiftPreview(1);
    } else if (info.offset.x >= SWIPE_THRESHOLD || info.velocity.x >= 400) {
      shiftPreview(-1);
    }
  };

  const switchTab = (next: StoreTab) => {
    if (next === tab) return;
    playMenuClick();
    setTab(next);
  };

  return (
    <div className="relative h-svh overflow-hidden">
      <SportBackground sport={sport} />

      <div className="relative z-10 h-svh flex flex-col">
        <header className="shrink-0 flex items-center justify-between gap-2 px-3 sm:px-6 py-3 backdrop-blur-md bg-[#0a0a0b]/40 border-b border-white/5">
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
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 justify-center">
            <h1 className="text-xs sm:text-lg font-black text-[#f2f3f5] tracking-tight truncate">
              <span className="sm:hidden">Store</span>
              <span className="hidden sm:inline">Sportivia Game Store</span>
            </h1>
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border-[3px] border-white/25 shadow-[0_3px_0_rgba(0,0,0,0.35)] shrink-0"
              style={{ background: accent }}
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: accent === '#f4f4f5' ? '#18191c' : '#fff' }} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#1e1f22] border-[2.5px] border-[#f0b232]/70 shadow-[0_3px_0_#8a6814] shrink-0">
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f0b232]" />
            <span className="text-xs sm:text-sm font-black text-[#f0b232] font-mono">{profile.coins}</span>
          </div>
        </header>

        <div className="shrink-0 flex justify-center px-5 pt-3">
          <div className="inline-flex rounded-2xl border-[3px] border-[#3f4147] bg-[#0c0d0f]/80 p-1.5 gap-1 shadow-[0_5px_0_#0a0a0b]">
            {([
              ['skins', 'Skins'],
              ['pets', 'Pets'],
            ] as const).map(([id, label]) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => switchTab(id)}
                  className={`px-5 py-2 rounded-xl text-sm font-black transition-all ${
                    active ? 'text-[#f2f3f5]' : 'text-[#949ba4] hover:text-[#dbdee1]'
                  }`}
                  style={
                    active
                      ? {
                          background: '#1e1f22',
                          border: `2.5px solid ${podiumAccent}aa`,
                          boxShadow: `0 3px 0 ${podiumAccent}55`,
                        }
                      : undefined
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center min-h-0 overflow-y-auto overscroll-contain px-2 sm:px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="w-full max-w-2xl flex flex-col items-center gap-3 sm:gap-5 py-2 sm:py-0 sm:justify-center sm:flex-1">
            <div className="relative w-full flex items-center justify-center min-h-[220px] sm:min-h-[340px]">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-[28%] max-w-[140px]">
                {prevItem ? (
                  <button
                    type="button"
                    aria-label={`Preview ${prevItem.name}`}
                    onClick={() => selectItem(prevItem.id)}
                    className="w-full opacity-40 hover:opacity-60 transition-opacity"
                  >
                    <CharacterPodium
                      {...(isPets
                        ? { petId: prevItem.id as PetId }
                        : { characterId: prevItem.id as CharacterId })}
                      accent={prevItem.accent}
                      height={240}
                      bare
                      peek
                      className="w-full pointer-events-none"
                    />
                    <p className="text-[10px] font-semibold text-[#949ba4] text-center -mt-2 truncate px-1">
                      {prevItem.name}
                    </p>
                  </button>
                ) : (
                  <div className="h-[240px]" />
                )}
              </div>

              <div className="relative z-20 w-[58%] max-w-[380px] flex flex-col items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${tab}-${safePreviewId}`}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full flex flex-col items-center"
                  >
                    <CharacterPodium
                      {...(isPets
                        ? { petId: safePreviewId as PetId }
                        : { characterId: safePreviewId as CharacterId })}
                      accent={isPets ? previewDef.accent : podiumAccent}
                      height={300}
                      bare
                      hero
                      className="w-full pointer-events-none max-sm:scale-95 max-sm:origin-top"
                    />
                    <motion.div
                      className="absolute inset-0 z-30 cursor-grab active:cursor-grabbing"
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.18}
                      onDragEnd={onDragEnd}
                    />
                    <div className="text-center -mt-1 pointer-events-none">
                      <p className="text-lg font-black text-[#f2f3f5]">{previewDef.name}</p>
                      <p className="text-xs font-semibold text-[#6d6f78] mt-0.5">{previewDef.tagline}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-[28%] max-w-[140px]">
                {nextItem ? (
                  <button
                    type="button"
                    aria-label={`Preview ${nextItem.name}`}
                    onClick={() => selectItem(nextItem.id)}
                    className="w-full opacity-40 hover:opacity-60 transition-opacity"
                  >
                    <CharacterPodium
                      {...(isPets
                        ? { petId: nextItem.id as PetId }
                        : { characterId: nextItem.id as CharacterId })}
                      accent={nextItem.accent}
                      height={240}
                      bare
                      peek
                      className="w-full pointer-events-none"
                    />
                    <p className="text-[10px] font-semibold text-[#949ba4] text-center -mt-2 truncate px-1">
                      {nextItem.name}
                    </p>
                  </button>
                ) : (
                  <div className="h-[240px]" />
                )}
              </div>
            </div>

            <div className="w-full max-w-md px-3">
              {owned ? (
                <button
                  type="button"
                  onClick={() => {
                    playMenuConfirm();
                    if (isPets && equipped) {
                      onUnequipPet();
                      return;
                    }
                    if (equipped) return;
                    if (isPets) onEquipPet(safePreviewId as PetId);
                    else onEquipCharacter(safePreviewId as CharacterId);
                  }}
                  disabled={!isPets && equipped}
                  className={`w-full py-3.5 rounded-2xl text-sm font-black border-[3px] transition-all ${
                    equipped && !isPets
                      ? 'bg-[#2b2d31] text-[#949ba4] cursor-default border-[#3f4147] shadow-[0_4px_0_#1a1b1f]'
                      : equipped && isPets
                        ? 'bg-[#2b2d31] hover:bg-[#35373c] text-[#f2f3f5] border-[#3f4147] shadow-[0_5px_0_#1a1b1f] hover:translate-y-[1px] hover:shadow-[0_4px_0_#1a1b1f]'
                        : 'bg-[#5865f2] hover:bg-[#4752c4] text-white border-white/25 shadow-[0_5px_0_#2f3aa8] hover:translate-y-[1px] hover:shadow-[0_4px_0_#2f3aa8]'
                  }`}
                >
                  {equipped ? (isPets ? 'Unequip' : 'Equipped') : 'Equip'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!canAfford && previewDef.price > 0) {
                      playMenuClick();
                      return;
                    }
                    playMenuConfirm();
                    if (isPets) onPurchasePet(safePreviewId as PetId);
                    else onPurchaseCharacter(safePreviewId as CharacterId);
                  }}
                  disabled={!canAfford && previewDef.price > 0}
                  className={`w-full py-3.5 rounded-2xl text-sm font-black border-[3px] transition-all flex items-center justify-center gap-2 ${
                    previewDef.price === 0 || canAfford
                      ? 'bg-[#f0b232] hover:bg-[#d99b2b] text-[#1a1a1a] border-white/40 shadow-[0_5px_0_#8a6814] hover:translate-y-[1px] hover:shadow-[0_4px_0_#8a6814]'
                      : 'bg-[#2b2d31] text-[#5c5e66] cursor-not-allowed border-[#3f4147] shadow-[0_4px_0_#1a1b1f]'
                  }`}
                >
                  {previewDef.price === 0 ? (
                    'Claim Free'
                  ) : canAfford ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Unlock · {previewDef.price.toLocaleString()}
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Need {(previewDef.price - profile.coins).toLocaleString()} more
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
