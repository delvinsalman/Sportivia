import { motion } from 'framer-motion';
import {
  ArrowLeft, Grid3X3, Timer, Swords, Trophy, Coins, SkipForward, Play, Zap, Users, Layers3, Sparkles,
} from 'lucide-react';
import type { Sport, CategoryTag } from '../types';
import type { PlayerProfile } from '../types/profile';
import { getCharacterDef, getPetDef } from '../types/profile';
import { SportBackground } from './SportBackground';
import { SportBall } from './SportBall';
import { CharacterPodium } from './3d/CharacterPodium';
import { CategoryIcon } from './CategoryIcon';
import { PlayerFace } from './PlayerFace';
import { SPORT_ACCENT, SPORT_LABEL, SPORT_PODIUM_ACCENT, SPORTS } from '../lib/sportTheme';
import { playMenuBack, playMenuClick, playMenuConfirm } from '../lib/menuAudio';

interface AboutScreenProps {
  sport: Sport;
  profile: PlayerProfile;
  onBack: () => void;
  onPlay: () => void;
}

type DemoCell = {
  id: string;
  tag: CategoryTag;
  label: string;
  filled?: boolean;
  playerName?: string;
  /** Soccer roster id — shows face in filled demo cells */
  playerId?: string;
};

const BOARD_DEMOS: Record<Sport, { player: string; cells: DemoCell[] }> = {
  soccer: {
    player: 'Lionel Messi',
    cells: [
      { id: 'nat-brazil', tag: 'NATIONALITY', label: 'BRAZIL' },
      { id: 'club-rm', tag: 'PLAYED IN', label: 'REAL MADRID' },
      { id: 'trophy-ucl', tag: 'WINNER', label: 'UCL' },
      { id: 'pos-fwd', tag: 'POSITION', label: 'FORWARD' },
      { id: 'league-pl', tag: 'LEAGUE', label: 'PREMIER LEAGUE' },
      { id: 'nat-argentina', tag: 'NATIONALITY', label: 'ARGENTINA', filled: true, playerName: 'Messi', playerId: 'messi' },
      { id: 'club-barca', tag: 'PLAYED IN', label: 'BARCELONA' },
      { id: 'trophy-wc', tag: 'WINNER', label: 'WORLD CUP' },
      { id: 'decade-10s', tag: 'ERA', label: '2010s' },
    ],
  },
  basketball: {
    player: 'LeBron James',
    cells: [
      { id: 'team-lakers', tag: 'TEAM', label: 'LAKERS', filled: true, playerName: 'LeBron', playerId: 'lebron' },
      { id: 'team-celtics', tag: 'TEAM', label: 'CELTICS' },
      { id: 'pos-guard', tag: 'POSITION', label: 'GUARD' },
      { id: 'pos-forward', tag: 'POSITION', label: 'FORWARD' },
      { id: 'mvp', tag: 'AWARD', label: 'MVP' },
      { id: 'allstar', tag: 'AWARD', label: 'ALL-STAR' },
      { id: 'nat-usa', tag: 'NATIONALITY', label: 'USA' },
      { id: 'champ-1plus', tag: 'WINNER', label: 'CHAMPION' },
      { id: 'draft-00s', tag: 'DRAFT', label: '2000s' },
    ],
  },
  baseball: {
    player: 'Aaron Judge',
    cells: [
      { id: 'team-yankees', tag: 'TEAM', label: 'YANKEES', filled: true, playerName: 'Judge', playerId: 'judge' },
      { id: 'team-redsox', tag: 'TEAM', label: 'RED SOX' },
      { id: 'pos-outfield', tag: 'POSITION', label: 'OUTFIELD' },
      { id: 'league-al', tag: 'LEAGUE', label: 'AL' },
      { id: 'league-nl', tag: 'LEAGUE', label: 'NL' },
      { id: 'award-mvp', tag: 'AWARD', label: 'MVP' },
      { id: 'nat-usa', tag: 'NATIONALITY', label: 'USA' },
      { id: 'award-allstar', tag: 'AWARD', label: 'ALL-STAR' },
      { id: 'decade-2020s', tag: 'ERA', label: '2020s' },
    ],
  },
  football: {
    player: 'Patrick Mahomes',
    cells: [
      { id: 'team-chiefs', tag: 'TEAM', label: 'CHIEFS', filled: true, playerName: 'Mahomes', playerId: 'mahomes' },
      { id: 'team-patriots', tag: 'TEAM', label: 'PATRIOTS' },
      { id: 'pos-qb', tag: 'POSITION', label: 'QB' },
      { id: 'pos-wr', tag: 'POSITION', label: 'WR' },
      { id: 'award-mvp', tag: 'AWARD', label: 'MVP' },
      { id: 'award-probowl', tag: 'AWARD', label: 'PRO BOWL' },
      { id: 'nat-usa', tag: 'NATIONALITY', label: 'USA' },
      { id: 'champ-sb', tag: 'WINNER', label: 'SUPER BOWL' },
      { id: 'draft-10s', tag: 'DRAFT', label: '2010s' },
    ],
  },
  hockey: {
    player: 'Connor McDavid',
    cells: [
      { id: 'team-nhl-oilers', tag: 'TEAM', label: 'OILERS', filled: true, playerName: 'McDavid', playerId: 'connor-mcdavid' },
      { id: 'team-nhl-penguins', tag: 'TEAM', label: 'PENGUINS' },
      { id: 'pos-c', tag: 'POSITION', label: 'CENTER' },
      { id: 'pos-g', tag: 'POSITION', label: 'GOALIE' },
      { id: 'award-hart', tag: 'AWARD', label: 'HART MVP' },
      { id: 'award-nhl-allstar', tag: 'AWARD', label: 'ALL-STAR' },
      { id: 'nat-canada', tag: 'NATIONALITY', label: 'CANADA' },
      { id: 'champ-stanley', tag: 'WINNER', label: 'STANLEY CUP' },
      { id: 'draft-10s', tag: 'DRAFT', label: '2010s' },
    ],
  },
};

const STEPS = [
  { icon: Grid3X3, title: 'Match', body: 'Tap the category that fits them' },
  { icon: SkipForward, title: 'Skip', body: 'Pass if unsure — misses cost more' },
  { icon: Timer, title: 'Race', body: 'Streaks pay · board resets every five' },
];

const MODES = [
  { name: 'Training', detail: '1 min · practice · no rewards', icon: Zap, tone: '#949ba4' },
  { name: 'Daily', detail: '2 min · shared board · bonus coins', icon: Trophy, tone: '#23a559' },
  { name: 'Ranked', detail: '2 min sprint · chase your best', icon: Timer, tone: '#5865f2' },
];

const LIGHT_ACCENT = '#f4f4f5';

function isLightAccent(color: string) {
  return color === LIGHT_ACCENT;
}

function onAccentFg(color: string) {
  return isLightAccent(color) ? '#18191c' : '#ffffff';
}

function MiniBoard({
  demoSport,
  player,
  cells,
}: {
  demoSport: Sport;
  player: string;
  cells: DemoCell[];
}) {
  const fillAccent = isLightAccent(SPORT_ACCENT[demoSport]) ? '#23a559' : SPORT_ACCENT[demoSport];
  const chipBg = SPORT_ACCENT[demoSport];
  const chipFg = onAccentFg(chipBg);

  return (
    <div className="rounded-xl bg-[#0e0f11] border border-[#2b2d31] p-2 sm:p-2.5 h-full">
      <div className="flex items-center gap-1.5 mb-2">
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
          style={{ background: chipBg, color: chipFg }}
        >
          <SportBall sport={demoSport} size={11} />
          {SPORT_LABEL[demoSport]}
        </span>
        <span className="ml-auto text-[8px] font-mono text-[#5c5e66]">10s</span>
      </div>
      <motion.p
        className="text-[11px] sm:text-xs font-extrabold text-[#f0b232] truncate mb-2 leading-tight"
        style={{ filter: 'drop-shadow(0 0 4px rgba(240,178,50,0.35))' }}
      >
        {player}
      </motion.p>
      <div className="grid grid-cols-3 gap-1">
        {cells.map((cell, i) => (
          <motion.div
            key={`${demoSport}-${cell.id}`}
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.02 * i, duration: 0.2 }}
            className={`aspect-square rounded-md flex flex-col items-center justify-center gap-0 p-0.5 ${
              cell.filled ? 'border' : 'bg-[#18191c] border border-[#2b2d31]'
            }`}
            style={cell.filled ? {
              background: `${fillAccent}18`,
              borderColor: `${fillAccent}66`,
            } : undefined}
          >
            {cell.filled ? (
              <>
                <span
                  className="text-[5px] font-bold uppercase tracking-wider"
                  style={{ color: fillAccent }}
                >
                  {cell.tag.split(' ')[0]}
                </span>
                {cell.playerId && cell.playerName ? (
                  <PlayerFace
                    sport={demoSport}
                    playerId={cell.playerId}
                    playerName={
                      cell.playerName === 'Messi'
                        ? 'Lionel Messi'
                        : cell.playerName === 'LeBron'
                          ? 'LeBron James'
                          : cell.playerName === 'Judge'
                            ? 'Aaron Judge'
                            : cell.playerName
                    }
                    size={18}
                    className="my-0.5"
                  />
                ) : null}
                <span className="text-[8px] font-bold text-[#f2f3f5] text-center leading-tight">
                  {cell.playerName}
                </span>
              </>
            ) : (
              <>
                <CategoryIcon categoryId={cell.id} tag={cell.tag} size={14} sport={demoSport} />
                <span className="text-[6px] font-extrabold text-[#e3e5e8] text-center leading-tight line-clamp-1 px-0.5">
                  {cell.label}
                </span>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function DuelShowcase({ accent }: { accent: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-[28px] border-[3px] border-[#ed4245]/70"
      style={{
        background:
          'linear-gradient(145deg, #2a1216 0%, #141218 42%, #1a1610 100%)',
        boxShadow: '0 10px 0 #7a1f24, 0 18px 40px rgba(237,66,69,0.22)',
      }}
    >
      <div
        className="pointer-events-none absolute -top-16 -left-10 w-56 h-56 rounded-full blur-3xl opacity-50"
        style={{ background: '#ed4245' }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -right-8 w-52 h-52 rounded-full blur-3xl opacity-40"
        style={{ background: '#f0b232' }}
      />

      {/* Glossy strip */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/10 to-transparent" />

      <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-0">
        <div className="p-6 sm:p-8">
          <div className="inline-flex items-center gap-1.5 mb-3 px-3 py-1 rounded-full bg-[#ed4245] border-2 border-[#ff6b6e] shadow-[0_3px_0_#8f1e22]">
            <Swords className="w-3.5 h-3.5 text-white" />
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white">Live mode</p>
          </div>
          <h2
            className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2"
            style={{ textShadow: '0 3px 0 rgba(0,0,0,0.35)' }}
          >
            1v1 Duel
          </h2>
          <p className="text-sm text-[#d7d9de] leading-relaxed max-w-md mb-6">
            Create a lobby, share the code, and race the same board. Highest score when time hits zero wins.
          </p>

          <div className="flex items-center justify-between gap-3 sm:gap-4 max-w-md">
            <div className="flex-1 rounded-[22px] border-[3px] border-[#23a559]/70 bg-[#0f1a14] p-3 sm:p-4 text-center shadow-[0_5px_0_#14532d]">
              <div
                className="mx-auto mb-2 w-14 h-14 rounded-full flex items-center justify-center text-sm font-black border-[3px] border-white/25 shadow-[0_4px_0_rgba(0,0,0,0.35)]"
                style={{ background: accent, color: onAccentFg(accent) }}
              >
                YOU
              </div>
              <span className="inline-block text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#23a559] text-white">
                Ready
              </span>
              <p
                className="text-3xl font-black text-white font-mono mt-1.5"
                style={{ textShadow: '0 0 18px rgba(35,165,89,0.45)' }}
              >
                186
              </p>
            </div>

            <div className="shrink-0 flex flex-col items-center gap-1.5">
              <div className="w-14 h-14 rounded-full bg-[#ed4245] border-[3px] border-[#ff8a8c] flex items-center justify-center shadow-[0_5px_0_#8f1e22]">
                <span className="text-base font-black text-white">VS</span>
              </div>
              <span className="text-[9px] font-black text-[#f2f3f5]/70 uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/35">
                Same board
              </span>
            </div>

            <div className="flex-1 rounded-[22px] border-[3px] border-[#f0b232]/75 bg-[#1a160c] p-3 sm:p-4 text-center shadow-[0_5px_0_#8a6814]">
              <div className="mx-auto mb-2 w-14 h-14 rounded-full bg-[#f0b232] border-[3px] border-white/30 flex items-center justify-center text-sm font-black text-[#18191c] shadow-[0_4px_0_rgba(0,0,0,0.35)]">
                RIV
              </div>
              <span className="inline-block text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#f0b232] text-[#18191c]">
                Ready
              </span>
              <p
                className="text-3xl font-black text-[#f0b232] font-mono mt-1.5"
                style={{ textShadow: '0 0 18px rgba(240,178,50,0.45)' }}
              >
                172
              </p>
            </div>
          </div>
        </div>

        <div className="relative p-6 sm:p-8 border-t-[3px] lg:border-t-0 lg:border-l-[3px] border-[#ed4245]/35 flex flex-col justify-center">
          <div
            className="rounded-[24px] bg-[#0c0d10] border-[3px] border-[#3a3d45] p-5"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 0 #1a1b1f' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#5865f2] border-2 border-[#8b93ff] flex items-center justify-center shadow-[0_3px_0_#2f3aa8]">
                <Users className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs font-black text-[#f2f3f5]">Lobby waiting</p>
              <span className="ml-auto flex items-center gap-1.5 text-[10px] font-black text-white px-2.5 py-1 rounded-full bg-[#23a559] border-2 border-[#4ade80] shadow-[0_2px_0_#14532d]">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                LIVE
              </span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#949ba4] mb-2">
              Share code
            </p>
            <div className="flex gap-2 mb-5">
              {['K', '7', 'M', '2'].map(ch => (
                <div
                  key={ch}
                  className="flex-1 aspect-square rounded-2xl bg-[#1e1f24] border-[3px] border-[#ed4245] flex items-center justify-center text-xl sm:text-2xl font-black text-white shadow-[0_4px_0_#8f1e22]"
                >
                  {ch}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-2xl bg-[#15161a] px-3.5 py-2.5 border-2 border-[#2b2d31]">
                <span className="text-xs font-black text-[#f2f3f5]">You</span>
                <span className="text-[10px] font-black text-white px-2.5 py-1 rounded-full bg-[#23a559] shadow-[0_2px_0_#14532d]">
                  READY
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[#15161a] px-3.5 py-2.5 border-2 border-[#2b2d31]">
                <span className="text-xs font-black text-[#f2f3f5]">Rival</span>
                <span className="text-[10px] font-black text-white px-2.5 py-1 rounded-full bg-[#23a559] shadow-[0_2px_0_#14532d]">
                  READY
                </span>
              </div>
            </div>
            <p className="text-center text-[12px] font-black text-[#4ade80] mt-4">
              Both ready — starting duel…
            </p>
          </div>
        </div>
      </div>
    </div>
  );
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-svh overflow-x-hidden bg-[#0a0a0b]"
    >
      <SportBackground sport={sport} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a0a0b]/40 via-transparent to-[#0a0a0b]" />

      <div className="relative z-30 sticky top-0 flex items-center justify-between px-4 sm:px-6 py-3 backdrop-blur-md bg-[#0a0a0b]/55 border-b border-white/5">
        <button
          type="button"
          onClick={back}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1e1f22] border-[2.5px] border-[#3f4147] hover:border-[#5c5e66] text-[#b5bac1] hover:text-[#f2f3f5] shadow-[0_3px_0_#1a1b1f] hover:translate-y-[1px] hover:shadow-[0_2px_0_#1a1b1f] transition-all"
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
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black border-[2.5px] border-white/30"
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

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 pb-16">
        {/* Hero */}
        <section className="grid md:grid-cols-2 gap-8 md:gap-10 items-center pt-8 md:pt-12 mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#949ba4] mb-3">
              Welcome
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#f2f3f5] tracking-tight leading-[0.95] mb-4">
              Sports trivia
              <span className="block" style={{ color: accent }}>built for speed</span>
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
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="relative"
          >
            <div
              className="absolute inset-8 rounded-full blur-3xl opacity-40"
              style={{ background: accent }}
            />
            <div className="relative w-full max-w-[520px] mx-auto">
              <CharacterPodium
                characterId={profile.equippedCharacter}
                accent={SPORT_PODIUM_ACCENT[sport]}
                height={400}
                bare
                hero
                sport={sport}
                className="w-full max-w-[460px] mx-auto"
                {...(profile.equippedCharacter === 'creative'
                  ? { creativeLoadout: profile.creativeLoadout }
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
                  />
                </div>
              )}
            </div>
            <p className="relative text-center text-xs text-[#949ba4] mt-2">
              {pet ? `${character.name} · ${pet.name}` : character.name}
            </p>
          </motion.div>
        </section>

        {/* Board + compact how-to */}
        <section className="mb-12 md:mb-16">
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5c5e66] mb-2">
              The board
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f2f3f5]">Every sport, same heat</h2>
            <p className="text-sm text-[#949ba4] mt-1 whitespace-nowrap">
              Soccer, NBA, MLB, NFL, and NHL — same rules, different boards. Tap the fit before time runs out.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            className="relative rounded-[28px] border-[3px] border-[#3f4147] bg-[#121316]/95 overflow-hidden"
            style={{ boxShadow: `0 8px 0 #1e1f22, 0 16px 40px ${accent}22` }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/8 to-transparent" />
            <div className="relative p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
              {SPORTS.map((s, i) => {
                const demo = BOARD_DEMOS[s];
                return (
                  <motion.div
                    key={s}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.06 * i }}
                  >
                    <MiniBoard
                      demoSport={s}
                      player={demo.player}
                      cells={demo.cells}
                    />
                  </motion.div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 border-t-[3px] border-[#2b2d31]">
              {STEPS.map(({ icon: Icon, title, body }, i) => (
                <div
                  key={title}
                  className={`flex items-start gap-3 p-4 sm:p-5 ${
                    i < STEPS.length - 1 ? 'sm:border-r-[3px] border-[#2b2d31] border-b-[3px] sm:border-b-0' : ''
                  }`}
                >
                  <div
                    className="shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center border-[3px] border-white/25 shadow-[0_4px_0_rgba(0,0,0,0.35)]"
                    style={{ background: accent, color: onAccentFg(accent) }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">
                      <span className="text-white/50 font-mono text-xs mr-1">{i + 1}</span>
                      {title}
                    </p>
                    <p className="text-[12px] font-medium text-[#c5c7cc] leading-snug mt-0.5 whitespace-nowrap truncate">
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* 1v1 wow section */}
        <section className="mb-12 md:mb-16">
          <DuelShowcase accent={accent} />
        </section>

        {/* Other modes */}
        <section className="mb-12 md:mb-16">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#949ba4] mb-2">Solo modes</p>
          <h2
            className="text-2xl sm:text-3xl font-black text-white mb-5"
            style={{ textShadow: '0 3px 0 rgba(0,0,0,0.3)' }}
          >
            Or play your way
          </h2>
          <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
            {MODES.map((mode, i) => {
              const Icon = mode.icon;
              return (
                <motion.div
                  key={mode.name}
                  initial={{ opacity: 0, y: 14, rotate: i % 2 === 0 ? -1.5 : 1.5 }}
                  whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * i, type: 'spring', stiffness: 320, damping: 20 }}
                  className="relative overflow-hidden rounded-[24px] border-[3px] p-5"
                  style={{
                    background: `linear-gradient(160deg, ${mode.tone}28 0%, #15161a 48%, #121316 100%)`,
                    borderColor: `${mode.tone}aa`,
                    boxShadow: `0 7px 0 ${mode.tone}55, 0 14px 28px rgba(0,0,0,0.28)`,
                  }}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/12 to-transparent" />
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center border-[3px] mb-3 shadow-[0_4px_0_rgba(0,0,0,0.35)]"
                    style={{
                      background: mode.tone,
                      borderColor: 'rgba(255,255,255,0.35)',
                      color: mode.tone === '#949ba4' ? '#18191c' : '#fff',
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-lg font-black text-white">{mode.name}</p>
                  <p className="text-sm font-semibold text-[#d0d2d8] mt-1 leading-snug">{mode.detail}</p>
                  <span
                    className="mt-3 inline-flex text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full text-white"
                    style={{ background: mode.tone, color: mode.tone === '#949ba4' || mode.tone === '#f0b232' ? '#18191c' : '#fff' }}
                  >
                    Mode
                  </span>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Card packs */}
        <section className="mb-12 md:mb-16">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#949ba4] mb-2">
            Collect
          </p>
          <h2
            className="text-2xl sm:text-3xl font-black text-white mb-2"
            style={{ textShadow: '0 3px 0 rgba(0,0,0,0.3)' }}
          >
            Card packs
          </h2>
          <p className="text-sm font-medium text-[#c5c7cc] mb-5 max-w-2xl leading-relaxed">
            Spend coins on packs to pull real athletes for each sport. Higher tiers mean better odds —
            build your collection and chase legendaries.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              {
                name: 'Prospect',
                detail: '3 cards · starter odds · build your base',
                tone: '#94a3b8',
                cost: '250',
              },
              {
                name: 'Elite',
                detail: '6 cards · rare+ guaranteed · stronger pulls',
                tone: '#f0b232',
                cost: '800',
              },
              {
                name: 'Icon',
                detail: '9 cards · epic+ guaranteed · chase legends',
                tone: '#c084fc',
                cost: '2,000',
              },
            ].map((pack, i) => (
              <motion.div
                key={pack.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * i, type: 'spring', stiffness: 320, damping: 20 }}
                className="relative overflow-hidden rounded-[24px] border-[3px] p-5"
                style={{
                  background: `linear-gradient(160deg, ${pack.tone}28 0%, #15161a 48%, #121316 100%)`,
                  borderColor: `${pack.tone}aa`,
                  boxShadow: `0 7px 0 ${pack.tone}55, 0 14px 28px rgba(0,0,0,0.28)`,
                }}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/12 to-transparent" />
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center border-[3px] mb-3 shadow-[0_4px_0_rgba(0,0,0,0.35)]"
                  style={{
                    background: pack.tone,
                    borderColor: 'rgba(255,255,255,0.35)',
                    color: pack.tone === '#94a3b8' || pack.tone === '#f0b232' ? '#18191c' : '#fff',
                  }}
                >
                  <Layers3 className="w-6 h-6" />
                </div>
                <p className="text-lg font-black text-white">{pack.name} Pack</p>
                <p className="text-sm font-semibold text-[#d0d2d8] mt-1 leading-snug">{pack.detail}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full"
                    style={{
                      background: pack.tone,
                      color: pack.tone === '#94a3b8' || pack.tone === '#f0b232' ? '#18191c' : '#fff',
                    }}
                  >
                    <Coins className="w-3 h-3" />
                    {pack.cost}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Progression */}
        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[28px] border-[3px] border-[#f0b232] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5"
            style={{
              background: 'linear-gradient(135deg, #3a2e12 0%, #1a1710 45%, #151619 100%)',
              boxShadow: '0 9px 0 #8a6814, 0 16px 36px rgba(240,178,50,0.2)',
            }}
          >
            <div className="w-16 h-16 rounded-[20px] bg-[#f0b232] border-[3px] border-white/40 flex items-center justify-center shrink-0 shadow-[0_5px_0_#8a6814]">
              <Sparkles className="w-8 h-8 text-[#18191c]" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black text-white">Coins, levels & packs</h2>
              <p className="text-sm font-medium text-[#d7d9de] mt-1 leading-relaxed max-w-xl">
                Finish Daily, Ranked, or Duels to earn coins and XP. Level up, unlock skins and pets,
                then spend coins on card packs to collect athletes — progress stays on this device.
              </p>
            </div>
            <motion.button
              type="button"
              whileTap={{ scale: 0.96, y: 2 }}
              onClick={() => {
                playMenuClick();
                onPlay();
              }}
              className="shrink-0 px-7 py-3.5 rounded-2xl text-sm font-black border-[3px] border-white/25"
              style={{
                background: accent,
                color: onAccentFg(accent),
                boxShadow: `0 5px 0 ${accent}88`,
              }}
            >
              Start playing
            </motion.button>
          </motion.div>
        </section>
      </div>
    </motion.div>
  );
}
