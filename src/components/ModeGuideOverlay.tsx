import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { assetUrl } from '../lib/assetUrl';
import { playMenuBack } from '../lib/menuAudio';
import { PAGE_TRANSITION } from '../lib/pageTransitions';

export interface ModeGuideCard {
  key: string;
  label: string;
  tone: string;
  icon: string;
  detail: string;
  blurb: string;
  howTo: string[];
  live?: boolean;
}

interface ModeGuideOverlayProps {
  card: ModeGuideCard;
  onClose: () => void;
  onPlay?: () => void;
}

/** Demo media per mode key — video preferred, image fallback. */
const MODE_DEMO: Record<string, { video?: string; image?: string; caption: string }> = {
  daily: { video: '/demos/match-stars.mp4', caption: 'Shared daily board' },
  quick: { video: '/demos/match-stars.mp4', image: '/guides/quickplay.png', caption: 'Fast 10-question run' },
  clue: { video: '/demos/modes.mp4', caption: 'Clues unlock over time' },
  training: { video: '/demos/match-stars.mp4', caption: 'Practice · no rewards' },
  timed: { video: '/demos/match-stars.mp4', caption: 'Ranked timed board' },
  bot: { video: '/demos/vs-ai-duels.mp4', caption: 'Race the bot' },
  duel: { video: '/demos/vs-ai-duels.mp4', image: '/guides/duel.png', caption: 'Live 1v1' },
  'duel-friend': { video: '/demos/vs-ai-duels.mp4', image: '/guides/duel.png', caption: 'Private room duel' },
  'duel-random': { video: '/demos/vs-ai-duels.mp4', image: '/guides/duel.png', caption: 'Public matchmaking' },
};

function DemoPanel({
  video,
  image,
  caption,
  tone,
}: {
  video?: string;
  image?: string;
  caption: string;
  tone: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const src = video ? assetUrl(video) : '';

  useEffect(() => {
    const el = ref.current;
    if (!el || !src) return;
    void el.play().catch(() => {});
  }, [src]);

  return (
    <figure className="flex w-full flex-col">
      <div
        className="relative overflow-hidden rounded-[1.35rem] border-[2.5px] bg-black shadow-[0_5px_0_#0c0d0f]"
        style={{ borderColor: `${tone}66` }}
      >
        {video ? (
          <video
            ref={ref}
            key={src}
            src={src.includes('?') ? src : `${src}?v=1`}
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            className="aspect-[16/11] w-full object-cover sm:aspect-[16/10]"
          />
        ) : image ? (
          <img
            src={assetUrl(image)}
            alt=""
            draggable={false}
            className="aspect-[16/11] w-full object-cover object-top sm:aspect-[16/10]"
          />
        ) : (
          <div className="flex aspect-[16/11] items-center justify-center bg-[#121316] sm:aspect-[16/10]">
            <p className="text-sm font-bold text-[#5c5e66]">Demo</p>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3.5 pb-3 pt-10">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/80">
            {caption}
          </p>
        </div>
      </div>
    </figure>
  );
}

export function ModeGuideOverlay({ card, onClose }: ModeGuideOverlayProps) {
  function close() {
    playMenuBack();
    onClose();
  }

  const demo = MODE_DEMO[card.key] ?? MODE_DEMO[card.key.split('-')[0]!] ?? {
    video: '/demos/modes.mp4',
    caption: 'Mode preview',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[70] overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#0a0b0e]" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 18% 20%, ${card.tone}26 0%, transparent 55%),
            radial-gradient(ellipse 55% 45% at 88% 70%, ${card.tone}14 0%, transparent 55%)
          `,
        }}
      />

      {/* Soft ambient icons — corners only, keep center crisp */}
      <div className="pointer-events-none absolute -left-8 bottom-[6%] opacity-[0.06] blur-[0.4px]">
        <img
          src={assetUrl(card.icon)}
          alt=""
          draggable={false}
          className="h-36 w-36 object-contain sm:h-44 sm:w-44"
        />
      </div>
      <div className="pointer-events-none absolute -right-6 top-[8%] opacity-[0.05] blur-[0.4px]">
        <img
          src={assetUrl(card.icon)}
          alt=""
          draggable={false}
          className="h-28 w-28 object-contain sm:h-36 sm:w-36"
        />
      </div>

      <button
        type="button"
        onClick={close}
        className="fixed top-0 left-0 z-[71] m-3 flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border-[2.5px] border-[#3f4147] bg-[#1e1f22]/90 px-3 py-2 text-xs font-black text-[#b5bac1] shadow-[0_3px_0_#1a1b1f] backdrop-blur-sm sm:m-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <motion.main
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={PAGE_TRANSITION}
        className="relative z-10 mx-auto flex h-svh w-full max-w-6xl flex-col justify-center px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(3.75rem,calc(env(safe-area-inset-top)+2.75rem))] sm:px-8"
      >
        <div className="grid items-center gap-7 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:gap-9 lg:gap-12">
          {/* Left — crisp info */}
          <div className="min-w-0">
            <div className="flex items-center gap-3.5">
              <img
                src={assetUrl(card.icon)}
                alt=""
                draggable={false}
                className="h-14 w-14 object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.4)] sm:h-16 sm:w-16"
                style={{ filter: `drop-shadow(0 0 16px ${card.tone}55)` }}
              />
              <div className="min-w-0">
                <p
                  className="text-[11px] font-black uppercase tracking-[0.22em]"
                  style={{ color: card.tone }}
                >
                  Mode tip
                </p>
                <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-2">
                  <h1 className="truncate text-3xl font-black tracking-tight text-[#f2f3f5] sm:text-4xl">
                    {card.label}
                  </h1>
                  {card.live && (
                    <span
                      className="flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider sm:text-[11px]"
                      style={{
                        borderColor: `${card.tone}88`,
                        background: `${card.tone}1f`,
                        color: card.tone,
                      }}
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        <span
                          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                          style={{ background: card.tone }}
                        />
                        <span
                          className="relative inline-flex h-1.5 w-1.5 rounded-full"
                          style={{ background: card.tone }}
                        />
                      </span>
                      Live
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-[#7a7d86] sm:text-[13px]">
              {card.detail}
            </p>

            <p className="mt-5 max-w-lg text-[15px] font-semibold leading-relaxed text-[#b5bac1] sm:text-base">
              {card.blurb}
            </p>

            <div className="mt-6 space-y-3">
              {card.howTo.map((step, index) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...PAGE_TRANSITION, delay: 0.05 + index * 0.04 }}
                  className="flex items-start gap-3"
                >
                  <span
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-[#0b0c0e]"
                    style={{ background: card.tone }}
                  >
                    {index + 1}
                  </span>
                  <p className="pt-0.5 text-[14px] font-semibold leading-snug text-[#d7dae0] sm:text-[15px]">
                    {step}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right — demo */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...PAGE_TRANSITION, delay: 0.06 }}
            className="min-w-0"
          >
            <DemoPanel
              video={demo.video}
              image={demo.image}
              caption={demo.caption}
              tone={card.tone}
            />
          </motion.div>
        </div>
      </motion.main>
    </motion.div>
  );
}
