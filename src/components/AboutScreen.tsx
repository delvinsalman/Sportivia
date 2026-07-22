import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  Play,
  LayoutGrid,
  Globe2,
  Gamepad2,
  Swords,
  Layers3,
  PackageOpen,
  ShoppingBag,
  Trophy,
  Wifi,
  Settings,
} from 'lucide-react';
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

const GUIDE: Array<{
  eyebrow: string;
  title: string;
  body: string;
  Icon: LucideIcon;
  glare: string;
}> = [
  {
    eyebrow: 'The board',
    title: 'Match stars to categories',
    body: 'A player drops in. Tap the cell that fits — club, country, award, era, and more — before the clock runs out. Streaks multiply your score. Fill the board, then it refreshes.',
    Icon: LayoutGrid,
    glare: 'rgba(88, 101, 242, 0.16)',
  },
  {
    eyebrow: 'Five sports',
    title: 'One game, five worlds',
    body: 'Soccer, NBA, MLB, NFL, and NHL each have their own pool, look, and record. Switch sports from the home rail anytime.',
    Icon: Globe2,
    glare: 'rgba(35, 165, 89, 0.15)',
  },
  {
    eyebrow: 'Modes',
    title: 'Play how you want',
    body: 'Training is practice with no rewards. Daily is a shared board with a first-finish payday. Ranked is timed and competitive. Vs AI races a bot. 1v1 Duel is a live lobby with a code.',
    Icon: Gamepad2,
    glare: 'rgba(240, 178, 50, 0.14)',
  },
  {
    eyebrow: 'Vs AI & Duels',
    title: 'Race someone — or something',
    body: 'Pick Beginner, Pro, or Expert against the bot. Online, create or join a room, ready up together, and the highest score wins the match.',
    Icon: Swords,
    glare: 'rgba(237, 66, 69, 0.14)',
  },
  {
    eyebrow: 'Card stakes',
    title: 'Put a player on the line',
    body: 'Optionally stake a card from your collection. Win and you keep yours and take theirs. Lose and that card is gone. Draw returns both stakes.',
    Icon: Layers3,
    glare: 'rgba(168, 85, 247, 0.15)',
  },
  {
    eyebrow: 'Packs & collection',
    title: 'Open packs. Build your set',
    body: 'Spend coins on Prospect, Elite, or Icon packs. Cards go Common to Legendary. Duplicates refund coins. Browse your collection by sport anytime.',
    Icon: PackageOpen,
    glare: 'rgba(249, 115, 22, 0.14)',
  },
  {
    eyebrow: 'Store',
    title: 'Skins, pets, and style',
    body: 'Unlock characters and companions with coins. Equip them on home, About, and results. Some skins have loadouts and breed variants.',
    Icon: ShoppingBag,
    glare: 'rgba(56, 189, 248, 0.14)',
  },
  {
    eyebrow: 'Progress',
    title: 'Coins, XP, and career',
    body: 'Finishing scoring runs earns coins and XP. Level up for milestones. Career tracks best scores, streaks, and perfect boards per sport.',
    Icon: Trophy,
    glare: 'rgba(253, 224, 71, 0.13)',
  },
  {
    eyebrow: 'Live & identity',
    title: 'Your name. Your lobby',
    body: 'Edit your display name on home. See who’s online. Host or join a duel with a short code — same board, fair race.',
    Icon: Wifi,
    glare: 'rgba(74, 222, 128, 0.13)',
  },
  {
    eyebrow: 'Settings',
    title: 'Sound, motion, tips',
    body: 'Mute audio, tune music and SFX, reduce motion, or turn off match tips. Promo codes redeem from Settings when you have one.',
    Icon: Settings,
    glare: 'rgba(148, 163, 184, 0.16)',
  },
];

const MODES = [
  { name: 'Training', detail: '1 min · practice' },
  { name: 'Daily', detail: '2 min · first finish' },
  { name: 'Ranked', detail: '2 min · climb' },
  { name: 'Vs AI', detail: 'Bot race · stake' },
  { name: '1v1 Duel', detail: 'Lobby · highest wins' },
] as const;

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

        {/* Guide — everything Sportivia does */}
        <section className="pb-[max(4rem,env(safe-area-inset-bottom))] pt-4 md:pt-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            className="mb-10 md:mb-14 max-w-xl"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#949ba4] mb-3">
              The guide
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-[#f2f3f5] tracking-tight leading-[1.05]">
              Everything in Sportivia
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#949ba4] leading-relaxed">
              From the board to packs, duels, and your career — here’s how the whole app fits together.
            </p>
          </motion.div>

          <div className="mb-12 md:mb-16 flex flex-wrap gap-2 sm:gap-2.5">
            {MODES.map(mode => (
              <div
                key={mode.name}
                className="rounded-2xl bg-[#121316]/55 px-3.5 py-2.5"
              >
                <p className="text-xs font-black text-[#f2f3f5] leading-none">{mode.name}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[#6d6f78]">
                  {mode.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-4 sm:space-y-5">
            {GUIDE.map((item, index) => {
              const Icon = item.Icon;
              return (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-24px' }}
                  transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.2) }}
                  className="relative overflow-hidden rounded-3xl px-5 py-7 sm:px-8 sm:py-8"
                  style={{
                    background: `radial-gradient(ellipse 85% 90% at 12% 20%, ${item.glare} 0%, transparent 58%), radial-gradient(ellipse 70% 60% at 92% 80%, ${item.glare} 0%, transparent 50%), rgba(12, 13, 16, 0.28)`,
                  }}
                >
                  <div className="relative z-10 grid gap-4 sm:grid-cols-[9.5rem_1fr] sm:gap-10">
                    <div className="flex flex-col gap-2.5 sm:pt-0.5">
                      <p
                        className="text-[11px] font-bold uppercase tracking-[0.18em]"
                        style={{ color: accent }}
                      >
                        {item.eyebrow}
                      </p>
                      <Icon
                        className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]"
                        style={{ color: accent }}
                        strokeWidth={2.25}
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl sm:text-2xl font-extrabold text-[#f2f3f5] tracking-tight leading-snug">
                        {item.title}
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm sm:text-[15px] text-[#949ba4] leading-relaxed">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 md:mt-16 text-center"
          >
            <p className="text-xs font-semibold text-[#5c5e66] leading-relaxed max-w-lg mx-auto">
              Coins, packs, and cards are virtual entertainment only — no real-world value.
              Athlete names are for fun and don’t imply endorsement.
            </p>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97, y: 2 }}
              onClick={play}
              className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full px-7 py-3 text-sm font-black border-[2.5px] border-white/30"
              style={{
                background: accent,
                color: onAccentFg(accent),
                boxShadow: `0 4px 0 ${accent}99`,
              }}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Jump in
            </motion.button>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
