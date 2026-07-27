import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Lock, Star, Zap, Info } from 'lucide-react';
import type { Sport } from '../types';
import {
  CAMPAIGN_LEVELS,
  getCampaignLevel,
  isLevelUnlocked,
  starsOnLevel,
  isMixedLevel,
  primarySport,
  getGateBonus,
  hasClaimedGateBonus,
  type CampaignProgress,
  type CampaignLevelDef,
} from '../lib/campaign';
import { loadCampaignProgress, markCampaignIntroSeen } from '../lib/campaignStorage';
import { CharacterPodium } from './3d/CharacterPodium';
import { SportBall } from './SportBall';
import { CampaignBackground } from './SportBackground';
import { SPORT_LABEL } from '../lib/sportTheme';
import { playMenuBack, playMenuClick, playMenuConfirm } from '../lib/menuAudio';
import type { PlayerProfile } from '../types/profile';
import { loadProfile } from '../lib/profileStorage';
import { assetUrl } from '../lib/assetUrl';

const CAMPAIGN_ACCENT = '#f0b232';

interface CampaignScreenProps {
  sport: Sport;
  onBack: () => void;
  onPlayLevel: (levelId: number) => void;
}

const CHAPTERS = [
  { id: 0, from: 1, to: 10, title: 'Rookie Road' },
  { id: 1, from: 11, to: 20, title: 'Rising Heat' },
  { id: 2, from: 21, to: 30, title: 'Pressure Pack' },
  { id: 3, from: 31, to: 40, title: 'Final Stretch' },
] as const;

type ChapterId = (typeof CHAPTERS)[number]['id'];

function chapterForLevel(levelId: number) {
  return CHAPTERS.find(c => levelId >= c.from && levelId <= c.to) ?? CHAPTERS[0];
}

function StarRow({ filled, size = 14 }: { filled: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3].map(i => (
        <Star
          key={i}
          className={
            i <= filled
              ? 'fill-[#f0b232] text-[#f0b232] drop-shadow-[0_1px_0_#8a6814]'
              : 'text-white/25'
          }
          style={{ width: size, height: size }}
          strokeWidth={2.4}
        />
      ))}
    </span>
  );
}

function chapterStars(progress: CampaignProgress, from: number, to: number) {
  let sum = 0;
  for (let i = from; i <= to; i++) sum += starsOnLevel(progress, i);
  return sum;
}

function PlatformNode({
  node,
  open,
  active,
  nodeStars,
  showAvatar,
  profile,
  onSelect,
}: {
  node: CampaignLevelDef;
  open: boolean;
  active: boolean;
  nodeStars: number;
  showAvatar: boolean;
  profile: PlayerProfile;
  onSelect: () => void;
}) {
  const isGate = node.kind === 'gate';
  const glow = active && open;

  // Selected = bright gold; other unlocked = dull gold; locked = dark
  const face = glow
    ? isGate
      ? 'radial-gradient(ellipse at 40% 30%, #ff6b6e 0%, #ed4245 42%, #a11f24 78%, #6b1418 100%)'
      : 'radial-gradient(ellipse at 40% 30%, #ffe08a 0%, #f0b232 42%, #c48a18 78%, #8a6814 100%)'
    : open
      ? isGate
        ? 'radial-gradient(ellipse at 40% 30%, #9a6a3a 0%, #6a4a28 55%, #3a2a18 100%)'
        : 'radial-gradient(ellipse at 40% 30%, #a89048 0%, #7a6834 55%, #3e3418 100%)'
      : 'radial-gradient(ellipse at 40% 30%, #3a3c42 0%, #222428 60%, #141518 100%)';

  const rim = glow
    ? isGate
      ? '#8f1e22'
      : '#8a6814'
    : open
      ? '#4a3a18'
      : '#0a0a0b';

  const rimHi = glow
    ? isGate
      ? '#ed4245'
      : '#d4a017'
    : open
      ? '#6a5828'
      : '#1a1b1f';

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative z-10 flex w-[5.35rem] shrink-0 flex-col items-center sm:w-[6.1rem]"
    >
      <span
        className={`mb-1 text-[1.75rem] font-black leading-none tracking-tight sm:text-[2.05rem] ${
          glow
            ? isGate
              ? 'text-[#ed4245] drop-shadow-[0_2px_0_#8f1e22]'
              : 'text-[#f0b232] drop-shadow-[0_2px_0_#8a6814]'
            : open
              ? 'text-[#c4a86a] drop-shadow-[0_2px_0_rgba(0,0,0,0.55)]'
              : 'text-white/35'
        }`}
      >
        {node.id}
      </span>

      {/* Flat podium disc — ellipse top, thin front rim */}
      <span
        className={`relative z-10 h-[2.65rem] w-[5rem] sm:h-[2.95rem] sm:w-[5.6rem] ${
          glow ? 'scale-110' : 'group-hover:scale-105'
        } transition-transform`}
      >
        {/* Ground shadow */}
        <span
          aria-hidden
          className="absolute -bottom-1 left-1/2 h-2.5 w-[88%] -translate-x-1/2 rounded-[100%] bg-black/50 blur-[3px]"
        />

        {/* Front rim / thickness (podium facing camera) */}
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 top-[28%] rounded-[100%]"
          style={{
            background: `linear-gradient(180deg, ${rimHi} 0%, ${rim} 100%)`,
            boxShadow: `0 4px 0 ${rim}`,
          }}
        />

        {/* Top face — flat ellipse */}
        <span
          className="absolute inset-x-0 bottom-[22%] top-0 rounded-[100%]"
          style={{
            background: face,
            boxShadow: glow
              ? isGate
                ? 'inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -3px 6px rgba(0,0,0,0.35), 0 0 18px rgba(237,66,69,0.4)'
                : 'inset 0 1px 2px rgba(255,255,255,0.45), inset 0 -3px 6px rgba(0,0,0,0.3), 0 0 20px rgba(240,178,50,0.5)'
              : open
                ? 'inset 0 1px 2px rgba(255,224,138,0.15), inset 0 -3px 6px rgba(0,0,0,0.4)'
                : 'inset 0 1px 2px rgba(255,255,255,0.12), inset 0 -3px 6px rgba(0,0,0,0.45)',
          }}
        />

        {/* Inner well */}
        <span
          aria-hidden
          className="absolute inset-x-[12%] bottom-[34%] top-[18%] rounded-[100%]"
          style={{
            background: open
              ? glow
                ? 'radial-gradient(ellipse at 40% 35%, rgba(255,224,138,0.2) 0%, rgba(0,0,0,0.32) 72%)'
                : 'radial-gradient(ellipse at 40% 35%, rgba(255,224,138,0.07) 0%, rgba(0,0,0,0.38) 72%)'
              : 'radial-gradient(ellipse at 40% 35%, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.5) 75%)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
          }}
        />

        {/* Rim highlight */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-x-[4%] bottom-[26%] top-[6%] rounded-[100%] border-[2px] ${
            glow
              ? isGate
                ? 'border-white/25'
                : 'border-[#ffe08a]/50'
              : open
                ? 'border-[#c4a86a]/30'
                : 'border-white/12'
          }`}
        />

        {/* Icons sit on the flat top */}
        <span className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center pb-[8%]">
          {!open ? (
            <Lock className="h-5 w-5 text-white/75 sm:h-6 sm:w-6" strokeWidth={2.75} />
          ) : isGate && !showAvatar ? (
            <Zap className="h-5 w-5 text-[#ed4245] sm:h-6 sm:w-6" strokeWidth={2.5} />
          ) : null}
        </span>

        {showAvatar && open && (
          <span className="pointer-events-none absolute left-1/2 top-[10%] z-10 h-[7.5rem] w-[6.5rem] -translate-x-1/2 -translate-y-[88%] sm:h-[8.75rem] sm:w-[7.5rem]">
            <CharacterPodium
              characterId={profile.equippedCharacter}
              accent={CAMPAIGN_ACCENT}
              bare
              hero
              hidePodium
              height={175}
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
              {...(profile.equippedCharacter === 'mako'
                ? { makoVariant: profile.makoVariant }
                : {})}
            />
          </span>
        )}
      </span>

      <span className="mt-2">
        <StarRow filled={nodeStars} size={13} />
      </span>
      <span className="mt-1 flex items-center gap-0.5">
        {node.sports.slice(0, 3).map(s => (
          <SportBall key={s} sport={s} size={11} />
        ))}
      </span>
    </button>
  );
}

export function CampaignScreen({ sport, onBack, onPlayLevel }: CampaignScreenProps) {
  const [profile] = useState(() => loadProfile());
  const [progress, setProgress] = useState<CampaignProgress>(() => loadCampaignProgress());
  const [selected, setSelected] = useState<number>(() => {
    const p = loadCampaignProgress();
    return Math.min(p.unlockedThrough, 40);
  });
  const [chapterId, setChapterId] = useState(() =>
    chapterForLevel(Math.min(loadCampaignProgress().unlockedThrough, 40)).id,
  );
  const [slideDir, setSlideDir] = useState<1 | -1>(1);
  const [showIntro, setShowIntro] = useState(() => !loadCampaignProgress().seenIntro);
  const [showInfo, setShowInfo] = useState(false);
  const infoLeaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openInfo() {
    if (infoLeaveRef.current) clearTimeout(infoLeaveRef.current);
    setShowInfo(true);
  }

  function closeInfo() {
    if (infoLeaveRef.current) clearTimeout(infoLeaveRef.current);
    infoLeaveRef.current = setTimeout(() => setShowInfo(false), 140);
  }

  useEffect(() => {
    setProgress(loadCampaignProgress());
  }, []);

  useEffect(() => {
    return () => {
      if (infoLeaveRef.current) clearTimeout(infoLeaveRef.current);
    };
  }, []);

  function dismissIntro() {
    playMenuConfirm();
    markCampaignIntroSeen();
    setShowIntro(false);
  }

  const chapter = CHAPTERS[chapterId] ?? CHAPTERS[0];
  const level = getCampaignLevel(selected);
  const unlocked = isLevelUnlocked(progress, selected);
  const stars = starsOnLevel(progress, selected);
  const chStars = chapterStars(progress, chapter.from, chapter.to);
  const chMax = (chapter.to - chapter.from + 1) * 3;
  const mixed = isMixedLevel(level);
  const gateBonus = level.kind === 'gate' ? getGateBonus(level.id) : null;
  const gateClaimed = gateBonus ? hasClaimedGateBonus(progress, level.id) : false;

  const pageLevels = useMemo(
    () => CAMPAIGN_LEVELS.filter(l => l.id >= chapter.from && l.id <= chapter.to),
    [chapter.from, chapter.to],
  );

  function goChapter(nextId: ChapterId) {
    if (nextId < 0 || nextId >= CHAPTERS.length || nextId === chapterId) return;
    playMenuClick();
    setSlideDir(nextId > chapterId ? 1 : -1);
    setChapterId(nextId);
    const nextChapter = CHAPTERS[nextId]!;
    if (selected < nextChapter.from || selected > nextChapter.to) {
      const pick =
        CAMPAIGN_LEVELS.filter(l => l.id >= nextChapter.from && l.id <= nextChapter.to).find(l =>
          isLevelUnlocked(progress, l.id),
        )?.id ?? nextChapter.from;
      setSelected(pick);
    }
  }

  return (
    <div className="relative h-svh overflow-hidden">
      <CampaignBackground />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/45"
      />

      <div className="relative z-10 flex h-svh flex-col">
        {/* Top: back + chapter + stars */}
        <header className="grid shrink-0 grid-cols-[auto_1fr_auto] items-center gap-2 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5">
          <button
            type="button"
            onClick={() => {
              playMenuBack();
              onBack();
            }}
            className="flex items-center gap-1.5 rounded-full border-[2.5px] border-white/15 bg-black/45 px-3 py-1.5 text-xs font-black text-[#dbdee1] backdrop-blur-md shadow-[0_3px_0_rgba(0,0,0,0.45)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="relative text-center">
            <div className="flex items-center justify-center gap-1.5">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-white/70">
                Chapter {chapter.id + 1}
              </p>
              <button
                type="button"
                aria-label="About Campaign"
                aria-expanded={showInfo}
                onMouseEnter={openInfo}
                onMouseLeave={closeInfo}
                onFocus={openInfo}
                onBlur={closeInfo}
                onClick={() => {
                  playMenuClick();
                  setShowInfo(cur => !cur);
                }}
                className="flex h-5 w-5 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white/70 transition hover:border-[#f0b232]/55 hover:text-[#f0b232]"
              >
                <Info className="h-3 w-3" strokeWidth={2.5} />
              </button>
            </div>
            <h1
              className="text-2xl font-black tracking-tight text-white sm:text-3xl"
              style={{ textShadow: '0 3px 0 rgba(0,0,0,0.55)' }}
            >
              {chapter.title}
            </h1>
            <AnimatePresence>
              {showInfo && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  onMouseEnter={openInfo}
                  onMouseLeave={closeInfo}
                  className="absolute left-1/2 top-full z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border-[2.5px] border-[#f0b232]/45 bg-[#12141a]/96 p-3.5 text-left shadow-[0_10px_28px_rgba(0,0,0,0.55)] backdrop-blur-xl"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f0b232]">
                    Campaign
                  </p>
                  <p className="mt-1.5 text-sm font-semibold leading-snug text-white/90">
                    Combines all 5 top sports — soccer, basketball, NFL, baseball, and hockey.
                    Test your trivia while you learn, and earn XP, coins, stars, and gate bonuses
                    as you climb the path.
                  </p>
                  <div className="mt-2.5 flex items-center gap-1.5">
                    {(['soccer', 'basketball', 'football', 'baseball', 'hockey'] as Sport[]).map(
                      s => (
                        <SportBall key={s} sport={s} size={22} />
                      ),
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex min-w-[5.5rem] flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 rounded-full border-2 border-[#f0b232]/50 bg-black/50 px-2.5 py-1 backdrop-blur-md">
              <Star className="h-3.5 w-3.5 fill-[#f0b232] text-[#f0b232]" strokeWidth={2.5} />
              <span className="text-xs font-black text-white">
                {chStars}/{chMax}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-[#f0b232]"
                style={{ width: `${(chStars / chMax) * 100}%` }}
              />
            </div>
          </div>
        </header>

        {/* Detail menu — clean, light glass */}
        <div className="relative z-30 shrink-0 px-3 pt-5 sm:px-5 sm:pt-6">
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16 }}
            className="mx-auto w-full max-w-xl rounded-2xl border border-white/20 bg-white/[0.08] px-4 py-3 backdrop-blur-md sm:px-5 sm:py-3.5"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/55">
                Level {level.id} ·{' '}
                {mixed ? 'Mixed' : SPORT_LABEL[primarySport(level)]}
                {level.kind === 'gate' ? ' · Gate' : ''}
              </p>
              <div className="flex shrink-0 items-center gap-2">
                {stars >= 2 && (
                  <span className="rounded-full border border-[#4ade80]/70 bg-[#23a559]/90 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">
                    Completed
                  </span>
                )}
                <StarRow filled={stars} size={18} />
              </div>
            </div>

            <div className="mt-1 flex items-end gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-black text-white sm:text-2xl">{level.title}</h2>
                <p className="mt-0.5 text-xs font-semibold text-white/60">
                  {level.tagline} ·{' '}
                  {mixed ? 'mixed' : SPORT_LABEL[primarySport(level)].toLowerCase()} ·{' '}
                  {level.timeSec}s
                </p>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold text-white/70">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-white/40">
                      Clock
                    </span>
                    <span className="font-black text-white">{level.timeSec}s</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-white/40">
                      Sport
                    </span>
                    <span className="inline-flex items-center gap-1">
                      {level.sports.map(s => (
                        <SportBall key={s} sport={s} size={14} />
                      ))}
                    </span>
                  </span>
                </div>

                <p className="mt-2 text-[10px] font-bold leading-snug text-white/50">
                  {stars >= 2
                    ? stars === 3
                      ? 'Completed · replay for fun'
                      : 'Completed · chase that last ★'
                    : level.kind === 'gate'
                      ? gateClaimed
                        ? 'Gate cleared · bonus already claimed'
                        : gateBonus
                          ? `2★ clears chapter · bonus +${gateBonus.coins}c / +${gateBonus.xp} XP`
                          : '2★ clears this chapter · next page unlocks'
                      : '2★ unlocks next · players + titles + awards'}
                </p>

                <p className="mt-1.5 text-[10px] font-black text-[#f0b232]/90">
                  ★1 {level.starScores[0]}+ · ★2 {level.starScores[1]}+ · ★3{' '}
                  {level.starScores[2]}+
                  {gateBonus && !gateClaimed
                    ? ` · ${gateBonus.title}: +${gateBonus.coins}c / +${gateBonus.xp} XP`
                    : ''}
                </p>
              </div>

              <button
                type="button"
                disabled={!unlocked}
                onClick={() => {
                  if (!unlocked) return;
                  playMenuConfirm();
                  onPlayLevel(level.id);
                }}
                className="mb-0.5 shrink-0 rounded-xl border-2 border-white/25 bg-[#23a559] px-5 py-2.5 text-sm font-black uppercase tracking-wide text-white shadow-[0_3px_0_#14532d] transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 sm:px-6"
                style={
                  stars >= 2
                    ? { background: '#3a3c42', boxShadow: '0 3px 0 #1a1b1f' }
                    : level.kind === 'gate'
                      ? { background: '#ed4245', boxShadow: '0 3px 0 #8f1e22' }
                      : undefined
                }
              >
                {!unlocked
                  ? 'Locked'
                  : stars >= 2
                    ? 'Replay'
                    : stars > 0
                      ? 'Play Again'
                      : level.kind === 'gate'
                        ? 'Play Gate'
                        : 'Play'}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Path */}
        <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center px-1 pb-[max(2.25rem,env(safe-area-inset-bottom))] sm:px-3 -translate-y-9 sm:-translate-y-14">
          <div className="relative flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              aria-label="Previous chapter"
              disabled={chapterId === 0}
              onClick={() => goChapter((chapterId - 1) as ChapterId)}
              className="z-20 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] border-white/20 bg-black/55 text-white shadow-[0_4px_0_rgba(0,0,0,0.5)] backdrop-blur-md disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.75} />
            </button>

            <div className="relative min-w-0 flex-1 overflow-hidden py-4">
              <AnimatePresence mode="wait" custom={slideDir}>
                <motion.div
                  key={chapter.id}
                  custom={slideDir}
                  initial={{ opacity: 0, x: slideDir * 56 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: slideDir * -56 }}
                  transition={{ duration: 0.24 }}
                  className="relative"
                >
                  <div className="relative flex items-end justify-between gap-0 overflow-x-auto px-2 pb-1 pt-[4.25rem] no-scrollbar sm:justify-evenly sm:overflow-visible sm:px-2 sm:pt-20">
                    {pageLevels.map((node, idx) => {
                      const open = isLevelUnlocked(progress, node.id);
                      const nodeStars = starsOnLevel(progress, node.id);
                      const active = selected === node.id;
                      const next = pageLevels[idx + 1];
                      // Path to next is lit only if you've unlocked that next level (progress)
                      const segmentLit = next
                        ? isLevelUnlocked(progress, next.id)
                        : false;

                      return (
                        <div key={node.id} className="flex items-end">
                          <PlatformNode
                            node={node}
                            open={open}
                            active={active}
                            nodeStars={nodeStars}
                            showAvatar={active}
                            profile={profile}
                            onSelect={() => {
                              playMenuClick();
                              setSelected(node.id);
                            }}
                          />
                          {next && (
                            <span
                              aria-hidden
                              className="mb-[3.35rem] ml-1 flex w-3.5 shrink-0 translate-x-1 items-center justify-center sm:mb-[3.45rem] sm:ml-1.5 sm:w-4 sm:translate-x-1.5"
                            >
                              <span
                                className={`h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3 ${
                                  segmentLit
                                    ? 'bg-[#f0b232] shadow-[0_0_6px_rgba(240,178,50,0.65)]'
                                    : 'bg-white/20'
                                }`}
                              />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <button
              type="button"
              aria-label="Next chapter"
              disabled={chapterId === CHAPTERS.length - 1}
              onClick={() => goChapter((chapterId + 1) as ChapterId)}
              className="z-20 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] border-white/20 bg-black/55 text-white shadow-[0_4px_0_rgba(0,0,0,0.5)] backdrop-blur-md disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2.75} />
            </button>
          </div>

          <div className="mt-2 flex justify-center gap-1.5">
            {CHAPTERS.map(ch => (
              <button
                key={ch.id}
                type="button"
                aria-label={`Chapter ${ch.id + 1}`}
                onClick={() => goChapter(ch.id)}
                className={`h-2 rounded-full transition-all ${
                  ch.id === chapterId ? 'w-6 bg-[#f0b232]' : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
          <p className="sr-only">{sport}</p>
        </div>
      </div>

      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="w-full max-w-md overflow-hidden rounded-[1.75rem] border-[3px] border-[#f0b232]/55 bg-[#121316]/97 shadow-[0_12px_0_#0a0a0b,0_0_40px_rgba(240,178,50,0.2)]"
            >
              <div
                className="relative px-5 pb-4 pt-6 text-center"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(240,178,50,0.22) 0%, transparent 70%)',
                }}
              >
                <img
                  src={assetUrl('/icons/trophy-record.png')}
                  alt=""
                  className="mx-auto h-16 w-16 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)]"
                  draggable={false}
                />
                <p className="mt-3 text-[10px] font-black uppercase tracking-[0.28em] text-[#f0b232]">
                  Special Mode
                </p>
                <h2
                  className="mt-1 text-3xl font-black text-white"
                  style={{ textShadow: '0 3px 0 rgba(0,0,0,0.55)' }}
                >
                  Campaign
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-sm font-semibold leading-snug text-white/65">
                  An expedition of championship trivia — who lifted the trophy, not who played where.
                </p>
              </div>

              <div className="space-y-3 px-5 pb-5">
                {[
                  {
                    title: '40 stages',
                    body: 'Climb the path. Earn 2★ to unlock the next stage. Gates at 10 / 20 / 30 / 40 clear each chapter.',
                  },
                  {
                    title: 'Player + championship mix',
                    body: 'Classic Sportivia player trivia (clubs, nations, positions) mixed with who-won-it title questions — trophies for teams, faces for players.',
                  },
                  {
                    title: 'Trophies, never logos',
                    body: 'Team answers stay text + trophy art only — no real club branding.',
                  },
                  {
                    title: 'Gate & finale bonuses',
                    body: 'Clear 10 / 20 / 30 with 2★ for chapter payouts. Beat level 40 for the Crown Finale — the biggest coin + XP drop.',
                  },
                ].map(item => (
                  <div
                    key={item.title}
                    className="rounded-2xl border-2 border-white/10 bg-white/[0.04] px-3.5 py-2.5"
                  >
                    <p className="text-xs font-black text-[#f0b232]">{item.title}</p>
                    <p className="mt-0.5 text-[11px] font-semibold leading-snug text-white/55">
                      {item.body}
                    </p>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={dismissIntro}
                  className="mt-1 flex w-full items-center justify-center rounded-2xl border-[3px] border-white/25 bg-[#f0b232] py-3 text-sm font-black uppercase tracking-wide text-[#3a2600] shadow-[0_4px_0_#8a6814] transition-all hover:translate-y-[1px] hover:shadow-[0_3px_0_#8a6814]"
                >
                  Got it — let&apos;s go
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
