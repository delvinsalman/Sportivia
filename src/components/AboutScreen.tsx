import { motion } from 'framer-motion';
import { ArrowLeft, Play } from 'lucide-react';
import type { Sport } from '../types';
import type { PlayerProfile } from '../types/profile';
import { getCharacterDef, getPetDef } from '../types/profile';
import { SportBackground } from './SportBackground';
import { SportBall } from './SportBall';
import { CharacterPodium } from './3d/CharacterPodium';
import { SPORT_ACCENT, SPORT_LABEL, SPORT_PODIUM_ACCENT, SPORTS } from '../lib/sportTheme';
import { playMenuBack, playMenuConfirm } from '../lib/menuAudio';

interface AboutScreenProps {
  sport: Sport;
  profile: PlayerProfile;
  onBack: () => void;
  onPlay: () => void;
}

const LIGHT_ACCENT = '#f4f4f5';

function isLightAccent(color: string) {
  return color === LIGHT_ACCENT;
}

function onAccentFg(color: string) {
  return isLightAccent(color) ? '#18191c' : '#ffffff';
}

export function AboutScreen({ sport, profile, onBack, onPlay }: AboutScreenProps) {
  const accent = SPORT_ACCENT[sport];
  const character = getCharacterDef(profile.equippedCharacter);
  const pet = profile.equippedPet ? getPetDef(profile.equippedPet) : null;

  function back() {
    playMenuBack();
    onBack();
  }

  function play() {
    playMenuConfirm();
    onPlay();
  }

  return (
    <div className="relative min-h-svh overflow-x-hidden [scrollbar-gutter:stable]">
      <SportBackground sport={sport} />

      <div className="relative z-30 sticky top-0 flex items-center justify-between gap-2 px-4 sm:px-6 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] bg-transparent">
        <button
          type="button"
          onClick={back}
          className="flex min-h-11 items-center gap-2 px-3 py-2 rounded-full bg-[#1e1f22] border-[2.5px] border-[#3f4147] hover:border-[#5c5e66] text-[#b5bac1] hover:text-[#f2f3f5] shadow-[0_3px_0_#1a1b1f] hover:translate-y-[1px] hover:shadow-[0_2px_0_#1a1b1f] transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="text-xs font-black">Back</span>
        </button>
        <div className="flex items-center gap-2">
          <SportBall sport={sport} size={20} />
          <span className="text-sm font-extrabold text-[#f2f3f5] tracking-tight">Sportivia</span>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.96, y: 2 }}
          onClick={play}
          className="flex min-h-11 items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black border-[2.5px] border-white/30"
          style={{
            background: accent,
            color: onAccentFg(accent),
            boxShadow: `0 3px 0 ${accent}99`,
          }}
        >
          <Play className="w-3 h-3 fill-current" />
          Play
        </motion.button>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6">
        {/* Full-page hero — fixed character frame so scroll/scrollbar never rescales the 3D view */}
        <section className="flex min-h-[calc(100svh-3.75rem)] flex-col justify-center py-10 md:py-12">
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#949ba4] mb-3">
                Welcome
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[#f2f3f5] tracking-tight leading-[0.95] mb-4">
                Sports trivia
                <span className="block" style={{ color: accent }}>built for speed.</span>
              </h1>
              <p className="text-base sm:text-lg text-[#b5bac1] leading-relaxed max-w-md mb-6">
                Match stars to categories on a live 3×3 board across Soccer, NBA, MLB, NFL, and NHL.
              </p>
              <div className="flex flex-wrap gap-2">
                {SPORTS.map(s => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black border-[2.5px] shadow-[0_3px_0_rgba(0,0,0,0.35)]"
                    style={{
                      background: SPORT_ACCENT[s],
                      color: onAccentFg(SPORT_ACCENT[s]),
                      borderColor: 'rgba(255,255,255,0.35)',
                    }}
                  >
                    <SportBall sport={s} size={16} />
                    {SPORT_LABEL[s]}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="relative flex justify-center md:justify-end"
            >
              <div
                className="absolute inset-8 rounded-full blur-3xl opacity-40"
                style={{ background: accent }}
              />
              {/* Locked box size — prevents Canvas aspect from jumping when the scrollbar appears */}
              <div className="relative h-[420px] w-full max-w-[460px] shrink-0">
                <CharacterPodium
                  characterId={profile.equippedCharacter}
                  accent={SPORT_PODIUM_ACCENT[sport]}
                  height={400}
                  bare
                  hero
                  sport={sport}
                  className="h-full w-full"
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
                {pet && (
                  <div className="absolute right-[-2%] bottom-0 w-[52%] max-w-[260px] pointer-events-none">
                    <CharacterPodium
                      petId={pet.id}
                      accent={pet.accent}
                      height={340}
                      bare
                      hero
                      hidePodium
                      className="w-full"
                      {...(pet.id === 'dog' ? { dogVariant: profile.dogVariant } : {})}
                    />
                  </div>
                )}
                <p className="absolute inset-x-0 -bottom-1 text-center text-xs text-[#949ba4]">
                  {pet ? `${character.name} · ${pet.name}` : character.name}
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Coming soon */}
        <section className="pb-16 pt-2 text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#f2f3f5] mb-2">
              Coming soon
            </h2>
            <p className="mx-auto max-w-md text-sm text-[#949ba4] leading-relaxed">
              Full guide to the board, duels, modes, and packs — for now, jump in and play.
            </p>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
