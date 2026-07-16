import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Coins, Lock, Sparkles, SlidersHorizontal, Check } from 'lucide-react';
import type { CharacterId, PetId, PlayerProfile } from '../types/profile';
import { CHARACTERS, PETS, getCharacterDef, getPetDef } from '../types/profile';
import type { CreativeLoadout, CreativeSlotId } from '../types/creativeCharacter';
import {
  CREATIVE_SLOTS,
  DEFAULT_CREATIVE_LOADOUT,
  normalizeCreativeLoadout,
} from '../types/creativeCharacter';
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
  onSaveCreativeLoadout: (loadout: CreativeLoadout) => void;
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
  onSaveCreativeLoadout,
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
  const [customizing, setCustomizing] = useState(false);
  const [draftLoadout, setDraftLoadout] = useState<CreativeLoadout>(() =>
    normalizeCreativeLoadout(profile.creativeLoadout),
  );
  const [slotId, setSlotId] = useState<CreativeSlotId>('face');
  const slotBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

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

  useEffect(() => {
    setDraftLoadout(normalizeCreativeLoadout(profile.creativeLoadout));
  }, [profile.creativeLoadout]);

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
  const isCreativePreview = !isPets && safePreviewId === 'creative';
  const canCustomize = isCreativePreview && owned;
  const previewLoadout =
    isCreativePreview ? (customizing ? draftLoadout : profile.creativeLoadout) : undefined;
  const activeSlot = CREATIVE_SLOTS.find(s => s.id === slotId) ?? CREATIVE_SLOTS[0];
  const slotIndex = Math.max(0, CREATIVE_SLOTS.findIndex(s => s.id === activeSlot.id));
  const canSlotPrev = slotIndex > 0;
  const canSlotNext = slotIndex < CREATIVE_SLOTS.length - 1;

  const selectItem = (id: string) => {
    if (id === safePreviewId) return;
    playMenuSelect();
    setCustomizing(false);
    if (isPets) setPreviewPetId(id as PetId);
    else setPreviewCharId(id as CharacterId);
  };

  const shiftPreview = (dir: -1 | 1) => {
    const next = Math.min(catalog.length - 1, Math.max(0, previewIndex + dir));
    selectItem(catalog[next].id);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (customizing) return;
    if (info.offset.x <= -SWIPE_THRESHOLD || info.velocity.x <= -400) {
      shiftPreview(1);
    } else if (info.offset.x >= SWIPE_THRESHOLD || info.velocity.x >= 400) {
      shiftPreview(-1);
    }
  };

  const switchTab = (next: StoreTab) => {
    if (next === tab) return;
    playMenuClick();
    setCustomizing(false);
    setTab(next);
  };

  const setSlotPart = (partId: string | null) => {
    playMenuSelect();
    setDraftLoadout(prev => ({ ...prev, [activeSlot.id]: partId }));
  };

  const selectSlot = (id: CreativeSlotId) => {
    playMenuClick();
    setSlotId(id);
    requestAnimationFrame(() => {
      const btn = slotBtnRefs.current[id];
      btn?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
  };

  const shiftSlot = (dir: -1 | 1) => {
    const next = Math.min(CREATIVE_SLOTS.length - 1, Math.max(0, slotIndex + dir));
    if (next === slotIndex) return;
    selectSlot(CREATIVE_SLOTS[next].id);
  };

  const openCustomize = () => {
    playMenuClick();
    setDraftLoadout(normalizeCreativeLoadout(profile.creativeLoadout));
    setSlotId('face');
    setCustomizing(true);
  };

  const saveCustomize = () => {
    playMenuConfirm();
    onSaveCreativeLoadout(draftLoadout);
    setCustomizing(false);
  };

  const resetCustomize = () => {
    playMenuClick();
    setDraftLoadout({ ...DEFAULT_CREATIVE_LOADOUT });
  };

  return (
    <div className="relative h-svh overflow-hidden">
      <SportBackground sport={sport} />

      <div className="relative z-10 h-svh flex flex-col">
        <header className="shrink-0 flex items-center justify-between gap-2 px-3 sm:px-6 pt-2 pb-0">
          <button
            type="button"
            onClick={() => {
              if (customizing) {
                playMenuBack();
                setCustomizing(false);
                setDraftLoadout(normalizeCreativeLoadout(profile.creativeLoadout));
                return;
              }
              playMenuBack();
              onBack();
            }}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-black text-[#b5bac1] hover:text-[#f2f3f5] bg-[#1e1f22] border-[2.5px] border-[#3f4147] hover:border-[#5c5e66] shadow-[0_3px_0_#1a1b1f] hover:translate-y-[1px] hover:shadow-[0_2px_0_#1a1b1f] transition-all shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            {customizing ? 'Cancel' : 'Back'}
          </button>
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#1e1f22] border-[2.5px] border-[#f0b232]/70 shadow-[0_3px_0_#8a6814] shrink-0">
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f0b232]" />
            <span className="text-xs sm:text-sm font-black text-[#f0b232] font-mono">{profile.coins}</span>
          </div>
        </header>

        <div className="shrink-0 flex flex-col items-center gap-3 px-3 pt-0.5 pb-1">
          <motion.div
            key={customizing ? 'kit' : 'store'}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="relative rounded-2xl px-5 py-2 sm:px-7 sm:py-2.5"
            style={{
              border: `2.5px solid ${accent}55`,
              background: 'rgba(14, 15, 18, 0.72)',
              boxShadow: `0 0 0 1px rgba(0,0,0,0.35), 0 4px 20px ${accent}18`,
            }}
          >
            <h1
              className="text-[1.5rem] sm:text-5xl font-black tracking-tight text-[#f2f3f5] leading-[1.05] text-center"
              style={{ textShadow: `0 2px 0 rgba(0,0,0,0.4), 0 0 18px ${accent}40` }}
            >
              {customizing ? 'Kit Creator' : 'Sportivia Store'}
            </h1>
          </motion.div>
          {!customizing && (
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
          )}
        </div>

        <div className="flex-1 flex flex-col items-center min-h-0 overflow-y-auto overscroll-contain px-2 sm:px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="w-full max-w-2xl flex flex-col items-center gap-3 sm:gap-5 py-2 sm:py-0 sm:justify-center sm:flex-1">
            <div className="relative w-full flex items-center justify-center min-h-[220px] sm:min-h-[340px]">
              {!customizing && (
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
                          : {
                              characterId: prevItem.id as CharacterId,
                              ...(prevItem.id === 'creative'
                                ? { creativeLoadout: profile.creativeLoadout }
                                : {}),
                            })}
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
              )}

              <div
                className={`relative z-20 flex flex-col items-center ${
                  customizing ? 'w-[70%] max-w-[420px]' : 'w-[58%] max-w-[380px]'
                }`}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${tab}-${safePreviewId}-${customizing ? 'edit' : 'view'}`}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full flex flex-col items-center"
                  >
                    <CharacterPodium
                      {...(isPets
                        ? { petId: safePreviewId as PetId }
                        : {
                            characterId: safePreviewId as CharacterId,
                            ...(previewLoadout ? { creativeLoadout: previewLoadout } : {}),
                          })}
                      accent={previewDef.accent}
                      height={customizing ? 280 : 300}
                      bare
                      hero
                      sport={sport}
                      className="w-full pointer-events-none max-sm:scale-95 max-sm:origin-top"
                    />
                    {!customizing && (
                      <motion.div
                        className="absolute inset-0 z-30 cursor-grab active:cursor-grabbing"
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.18}
                        onDragEnd={onDragEnd}
                      />
                    )}
                    <div className="text-center -mt-1 pointer-events-none">
                      <p className="text-lg font-black text-[#f2f3f5]">{previewDef.name}</p>
                      <p className="text-xs font-semibold text-[#6d6f78] mt-0.5">
                        {customizing ? 'Mix your look · save when ready' : previewDef.tagline}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {!customizing && (
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
                          : {
                              characterId: nextItem.id as CharacterId,
                              ...(nextItem.id === 'creative'
                                ? { creativeLoadout: profile.creativeLoadout }
                                : {}),
                            })}
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
              )}
            </div>

            {customizing ? (
              <div className="w-full max-w-lg px-2 flex flex-col gap-3">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label="Previous category"
                    disabled={!canSlotPrev}
                    onClick={() => shiftSlot(-1)}
                    className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center border-[2.5px] transition-all ${
                      canSlotPrev
                        ? 'border-[#f472b6]/80 bg-[#1e1f22] text-[#f2f3f5] shadow-[0_3px_0_#7a3a5c] hover:translate-y-[1px] hover:shadow-[0_2px_0_#7a3a5c]'
                        : 'border-[#3f4147] bg-[#151618] text-[#5c5e66] cursor-default'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex-1 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
                    {CREATIVE_SLOTS.map(slot => {
                      const active = slot.id === activeSlot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          ref={el => {
                            slotBtnRefs.current[slot.id] = el;
                          }}
                          onClick={() => selectSlot(slot.id)}
                          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-black border-[2.5px] transition-all ${
                            active
                              ? 'text-[#f2f3f5] border-[#f472b6] bg-[#1e1f22]'
                              : 'text-[#949ba4] border-[#3f4147] bg-[#151618] hover:text-[#dbdee1]'
                          }`}
                        >
                          {slot.label}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    aria-label="Next category"
                    disabled={!canSlotNext}
                    onClick={() => shiftSlot(1)}
                    className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center border-[2.5px] transition-all ${
                      canSlotNext
                        ? 'border-[#f472b6]/80 bg-[#1e1f22] text-[#f2f3f5] shadow-[0_3px_0_#7a3a5c] hover:translate-y-[1px] hover:shadow-[0_2px_0_#7a3a5c]'
                        : 'border-[#3f4147] bg-[#151618] text-[#5c5e66] cursor-default'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {activeSlot.optional && (
                    <button
                      type="button"
                      onClick={() => setSlotPart(null)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-black border-[2.5px] transition-all ${
                        draftLoadout[activeSlot.id] === null
                          ? 'border-[#f472b6] bg-[#1e1f22] text-[#f2f3f5]'
                          : 'border-[#3f4147] bg-[#151618] text-[#949ba4]'
                      }`}
                    >
                      None
                    </button>
                  )}
                  {activeSlot.parts.map(part => {
                    const active = draftLoadout[activeSlot.id] === part.id;
                    return (
                      <button
                        key={part.id}
                        type="button"
                        onClick={() => setSlotPart(part.id)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-black border-[2.5px] transition-all ${
                          active
                            ? 'border-[#f472b6] bg-[#1e1f22] text-[#f2f3f5]'
                            : 'border-[#3f4147] bg-[#151618] text-[#949ba4] hover:text-[#dbdee1]'
                        }`}
                      >
                        {part.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={resetCustomize}
                    className="flex-1 py-3 rounded-2xl text-sm font-black border-[3px] border-[#3f4147] bg-[#2b2d31] text-[#dbdee1] shadow-[0_4px_0_#1a1b1f]"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={saveCustomize}
                    className="flex-[1.4] py-3 rounded-2xl text-sm font-black border-[3px] border-white/25 bg-[#5865f2] hover:bg-[#4752c4] text-white shadow-[0_5px_0_#2f3aa8] flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Save Look
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-md px-3 flex flex-col gap-2">
                {owned ? (
                  <>
                    {canCustomize && (
                      <button
                        type="button"
                        onClick={openCustomize}
                        className="w-full py-3 rounded-2xl text-sm font-black border-[3px] border-[#f472b6]/70 bg-[#1e1f22] text-[#f2f3f5] shadow-[0_5px_0_#7a3a5c] hover:translate-y-[1px] hover:shadow-[0_4px_0_#7a3a5c] transition-all flex items-center justify-center gap-2"
                      >
                        <SlidersHorizontal className="w-4 h-4 text-[#f472b6]" />
                        Customize Kit
                      </button>
                    )}
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
                  </>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
