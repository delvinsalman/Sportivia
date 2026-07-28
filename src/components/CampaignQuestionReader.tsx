import { useCallback, useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  campaignVoiceSupported,
  speakCampaignQuestion,
  stopCampaignVoice,
  warmCampaignVoice,
} from '../lib/campaignVoice';
import { effectiveSfxVolume, subscribeSettings } from '../lib/settings';
import { loadSettings } from '../lib/settings';

interface CampaignQuestionReaderProps {
  /** Unique id for the current question — triggers auto-read on change. */
  questionKey: string;
  lead?: string;
  prompt: string;
  /** Only speak while the match is live. */
  enabled: boolean;
}

export function CampaignQuestionReader({
  questionKey,
  lead,
  prompt,
  enabled,
}: CampaignQuestionReaderProps) {
  const [speaking, setSpeaking] = useState(false);
  const [supported] = useState(() => campaignVoiceSupported());
  const [voiceOn, setVoiceOn] = useState(() => loadSettings().campaignVoiceEnabled !== false);

  useEffect(() => {
    warmCampaignVoice();
    return subscribeSettings(() => {
      const on = loadSettings().campaignVoiceEnabled !== false;
      setVoiceOn(on);
      if (!on) {
        stopCampaignVoice();
        setSpeaking(false);
      }
    });
  }, []);

  const canSpeak = supported && voiceOn && enabled && effectiveSfxVolume() > 0;

  const readAloud = useCallback(() => {
    if (!canSpeak || !prompt.trim()) return;
    speakCampaignQuestion(
      { lead, prompt },
      {
        onStart: () => setSpeaking(true),
        onEnd: () => setSpeaking(false),
      },
    );
  }, [canSpeak, lead, prompt]);

  // Auto-read each new question ASAP (timed mode — no artificial pause)
  useEffect(() => {
    if (!canSpeak) {
      stopCampaignVoice();
      setSpeaking(false);
      return;
    }
    readAloud();
    return () => {
      stopCampaignVoice();
      setSpeaking(false);
    };
  }, [questionKey, canSpeak, readAloud]);

  // Stop if leaving play / mute
  useEffect(() => {
    if (!enabled) {
      stopCampaignVoice();
      setSpeaking(false);
    }
  }, [enabled]);

  if (!supported || !voiceOn) return null;

  return (
    <button
      type="button"
      onClick={readAloud}
      disabled={!canSpeak}
      aria-label={speaking ? 'Reading question' : 'Read question aloud'}
      title="Read question aloud"
      className={`campaign-voice-chip relative inline-flex min-h-11 items-center gap-2 rounded-full border-[2.5px] px-3 py-2 shadow-[0_3px_0_rgba(0,0,0,0.4)] transition ${
        speaking
          ? 'border-[#f0b232]/70 bg-[#f0b232]/20 text-[#ffe08a]'
          : 'border-white/20 bg-black/45 text-white/75 hover:border-[#f0b232]/45 hover:text-[#f0b232]'
      } disabled:opacity-40`}
    >
      <Volume2 className="h-4 w-4 shrink-0" strokeWidth={2.5} />
      <span className="campaign-voice-bars" aria-hidden data-active={speaking ? '1' : '0'}>
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="text-[10px] font-black uppercase tracking-[0.14em]">
        {speaking ? 'Reading' : 'Listen'}
      </span>
      {speaking && (
        <motion.span
          aria-hidden
          className="absolute inset-0 -z-10 rounded-full bg-[#f0b232]/15"
          animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.04, 1] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </button>
  );
}
