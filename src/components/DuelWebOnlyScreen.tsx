import { ArrowLeft, ExternalLink, Swords } from 'lucide-react';
import { LIVE_SITE_URL } from '../lib/platformBuild';
import { playMenuBack, playMenuConfirm } from '../lib/menuAudio';

interface DuelWebOnlyScreenProps {
  onBack: () => void;
}

export function DuelWebOnlyScreen({ onBack }: DuelWebOnlyScreenProps) {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-[#0a0a0b]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(237,66,69,0.22), transparent 42%), radial-gradient(circle at 80% 75%, rgba(88,101,242,0.16), transparent 40%), linear-gradient(160deg, #12080a 0%, #0a0a0b 55%, #0b1018 100%)',
        }}
      />

      <button
        type="button"
        onClick={() => {
          playMenuBack();
          onBack();
        }}
        className="relative z-20 m-3 flex min-h-11 w-fit items-center gap-1.5 rounded-full border-[2.5px] border-[#3f4147] bg-[#1e1f22] px-3 py-2 text-xs font-black text-[#b5bac1] shadow-[0_3px_0_#1a1b1f] sm:m-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <main className="relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 pb-16 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border-[3px] border-[#ed4245]/70 bg-[#ed4245]/15 shadow-[0_4px_0_rgba(143,30,34,0.55)]">
          <Swords className="h-8 w-8 text-[#ed4245]" strokeWidth={2.5} />
        </div>

        <p className="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#ed4245]">
          1v1 Duel
        </p>
        <h1 className="text-3xl font-black tracking-tight text-[#f2f3f5] sm:text-4xl">
          Live multiplayer isn’t available here
        </h1>
        <p className="mt-4 text-sm font-semibold leading-relaxed text-[#b5bac1] sm:text-base">
          Playing against someone live is hard to support on this platform. Visit{' '}
          <span className="font-black text-[#f0b232]">sportivia.xyz</span> to play 1v1 Duel against
          real players — every other Sportivia mode works right here.
        </p>

        <a
          href={LIVE_SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playMenuConfirm()}
          className="mt-8 inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border-[3px] border-white/20 bg-gradient-to-b from-[#ffe08a] via-[#f0b232] to-[#d4921a] px-8 text-base font-black text-[#3a2600] shadow-[0_5px_0_#8a6814] transition-all hover:translate-y-[1px] hover:shadow-[0_4px_0_#8a6814]"
        >
          Play on sportivia.xyz
          <ExternalLink className="h-4 w-4" strokeWidth={2.75} />
        </a>

        <button
          type="button"
          onClick={() => {
            playMenuBack();
            onBack();
          }}
          className="mt-3 min-h-12 rounded-2xl border-[2.5px] border-[#3f4147] bg-[#1e1f22] px-6 text-sm font-black text-[#b5bac1] shadow-[0_3px_0_#0c0d0f] transition-all hover:translate-y-[1px] hover:text-[#f2f3f5]"
        >
          Back to game modes
        </button>
      </main>
    </div>
  );
}
