import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Music2,
  Sparkles,
  MousePointerClick,
  Eye,
  Users,
  MessageSquare,
  Timer,
  RotateCcw,
} from 'lucide-react';
import type { Sport } from '../types';
import { SportBackground } from './SportBackground';
import { SportBall } from './SportBall';
import { useSettings } from '../hooks/useSettings';
import { playMenuBack, playMenuClick, playMenuConfirm } from '../lib/menuAudio';
import { SPORT_ACCENT } from '../lib/sportTheme';

interface SettingsScreenProps {
  sport: Sport;
  onBack: () => void;
}

function Toggle({
  on,
  accent,
  onToggle,
}: {
  on: boolean;
  accent: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={e => {
        e.stopPropagation();
        playMenuClick();
        onToggle();
      }}
      className="relative w-11 rounded-full border-2 transition-colors shrink-0"
      style={{
        height: '1.625rem',
        background: on ? accent : '#2b2d31',
        borderColor: on ? `${accent}cc` : '#3f4147',
        boxShadow: on ? `0 2px 0 ${accent}44` : '0 2px 0 #0c0d0f',
      }}
    >
      <span
        className="absolute top-[2px] left-[2px] w-[1.125rem] h-[1.125rem] rounded-full bg-[#f2f3f5] transition-transform"
        style={{ transform: on ? 'translateX(1.125rem)' : 'translateX(0)' }}
      />
    </button>
  );
}

function SettingRow({
  icon: Icon,
  title,
  detail,
  children,
  onClick,
  dimmed,
  last,
}: {
  icon: typeof Volume2;
  title: string;
  detail: string;
  children: ReactNode;
  onClick?: () => void;
  dimmed?: boolean;
  last?: boolean;
}) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={
        onClick
          ? () => {
              playMenuClick();
              onClick();
            }
          : undefined
      }
      onKeyDown={
        onClick
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                playMenuClick();
                onClick();
              }
            }
          : undefined
      }
      className={`flex items-center gap-3 px-3.5 py-2.5 w-full text-left transition-colors ${
        !last ? 'border-b border-[#2b2d31]' : ''
      } ${onClick ? 'cursor-pointer hover:bg-white/[0.03]' : ''} ${dimmed ? 'opacity-45' : ''}`}
    >
      <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#232428] border-2 border-[#3f4147] shrink-0">
        <Icon className="w-3.5 h-3.5 text-[#949ba4]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-[#f2f3f5] leading-none">{title}</p>
        <p className="text-[10px] font-semibold text-[#949ba4] mt-1 leading-snug">{detail}</p>
      </div>
      <div
        className="shrink-0"
        onClick={e => {
          if (onClick) e.stopPropagation();
        }}
        onKeyDown={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function VolumeSlider({
  value,
  accent,
  disabled,
  onChange,
  label,
  last,
}: {
  value: number;
  accent: string;
  disabled?: boolean;
  onChange: (v: number) => void;
  label: string;
  last?: boolean;
}) {
  const pct = Math.round(value * 100);
  return (
    <div
      className={`px-3.5 pb-2.5 -mt-0.5 ${!last ? 'border-b border-[#2b2d31]' : ''} ${
        disabled ? 'opacity-40 pointer-events-none' : ''
      }`}
    >
      <div className="ml-11">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-black uppercase tracking-[0.14em] text-[#5c5e66]">
            {label}
          </span>
          <span className="text-[10px] font-black font-mono text-[#b5bac1] tabular-nums">{pct}%</span>
        </div>
        <div className="relative h-1.5 rounded-full bg-[#2b2d31] border border-[#3f4147] overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-[width]"
            style={{ width: `${pct}%`, background: accent }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={pct}
            onChange={e => onChange(Number(e.target.value) / 100)}
            aria-label={label}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-1.5">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#5c5e66] px-1">
        {title}
      </p>
      <div className="rounded-2xl border-[2.5px] border-[#3f4147] bg-[#1a1b1f]/92 shadow-[0_4px_0_#0c0d0f] overflow-hidden">
        {children}
      </div>
    </section>
  );
}

export function SettingsScreen({ sport, onBack }: SettingsScreenProps) {
  const { settings, update, reset } = useSettings();
  const accent = SPORT_ACCENT[sport];
  const audioLocked = settings.muted;

  function back() {
    playMenuBack();
    onBack();
  }

  return (
    <div className="relative h-svh overflow-hidden">
      <SportBackground sport={sport} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a0a0b]/40 via-transparent to-[#0a0a0b]" />

      {/* About-style top bar */}
      <div className="relative z-30 flex items-center justify-between px-4 sm:px-6 py-3 backdrop-blur-md bg-[#0a0a0b]/55 border-b border-white/5">
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
          <span className="text-sm font-extrabold text-[#f2f3f5] tracking-tight">Settings</span>
        </div>

        {/* Spacer to mirror About's right control width */}
        <div className="w-[4.5rem] sm:w-[5.25rem]" aria-hidden />
      </div>

      <div className="relative z-10 h-[calc(100svh-3.25rem)] flex flex-col max-w-lg mx-auto px-4 py-3 sm:py-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 min-h-0 flex flex-col justify-center gap-3"
        >
          <Section title="Audio">
            <SettingRow
              icon={settings.muted ? VolumeX : Volume2}
              title="Mute all"
              detail="Silence music, sounds, and taps"
              onClick={() => update({ muted: !settings.muted })}
            >
              <Toggle
                on={settings.muted}
                accent="#ed4245"
                onToggle={() => update({ muted: !settings.muted })}
              />
            </SettingRow>

            <SettingRow
              icon={Music2}
              title="Menu music"
              detail="Background track on home"
              onClick={() => update({ musicEnabled: !settings.musicEnabled })}
              dimmed={audioLocked}
            >
              <Toggle
                on={settings.musicEnabled && !audioLocked}
                accent={accent}
                onToggle={() => update({ musicEnabled: !settings.musicEnabled })}
              />
            </SettingRow>
            <VolumeSlider
              label="Music volume"
              value={settings.musicVolume}
              accent={accent}
              disabled={audioLocked || !settings.musicEnabled}
              onChange={v => update({ musicVolume: v })}
            />

            <SettingRow
              icon={Sparkles}
              title="Sound effects"
              detail="Correct, wrong, skip, streaks"
              onClick={() => update({ sfxEnabled: !settings.sfxEnabled })}
              dimmed={audioLocked}
            >
              <Toggle
                on={settings.sfxEnabled && !audioLocked}
                accent={accent}
                onToggle={() => update({ sfxEnabled: !settings.sfxEnabled })}
              />
            </SettingRow>
            <VolumeSlider
              label="Effects volume"
              value={settings.sfxVolume}
              accent={accent}
              disabled={audioLocked || !settings.sfxEnabled}
              onChange={v => update({ sfxVolume: v })}
            />

            <SettingRow
              icon={MousePointerClick}
              title="Menu sounds"
              detail="Clicks and confirms"
              onClick={() => update({ menuSoundsEnabled: !settings.menuSoundsEnabled })}
              dimmed={audioLocked}
            >
              <Toggle
                on={settings.menuSoundsEnabled && !audioLocked}
                accent={accent}
                onToggle={() => update({ menuSoundsEnabled: !settings.menuSoundsEnabled })}
              />
            </SettingRow>

            <SettingRow
              icon={Timer}
              title="Clock ticks"
              detail="Soft ticks near time-up"
              onClick={() => update({ clockTicks: !settings.clockTicks })}
              dimmed={audioLocked || !settings.sfxEnabled}
              last
            >
              <Toggle
                on={settings.clockTicks && !audioLocked && settings.sfxEnabled}
                accent={accent}
                onToggle={() => update({ clockTicks: !settings.clockTicks })}
              />
            </SettingRow>
          </Section>

          <Section title="Display">
            <SettingRow
              icon={Eye}
              title="Reduce motion"
              detail="Calmer animations"
              onClick={() => update({ reduceMotion: !settings.reduceMotion })}
            >
              <Toggle
                on={settings.reduceMotion}
                accent={accent}
                onToggle={() => update({ reduceMotion: !settings.reduceMotion })}
              />
            </SettingRow>

            <SettingRow
              icon={Users}
              title="Online count"
              detail="Players online on home"
              onClick={() => update({ showOnlineCount: !settings.showOnlineCount })}
            >
              <Toggle
                on={settings.showOnlineCount}
                accent={accent}
                onToggle={() => update({ showOnlineCount: !settings.showOnlineCount })}
              />
            </SettingRow>

            <SettingRow
              icon={MessageSquare}
              title="Match tips"
              detail="Footer hints while you play"
              onClick={() => update({ showHints: !settings.showHints })}
              last
            >
              <Toggle
                on={settings.showHints}
                accent={accent}
                onToggle={() => update({ showHints: !settings.showHints })}
              />
            </SettingRow>
          </Section>

          <button
            type="button"
            onClick={() => {
              playMenuConfirm();
              reset();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-[2.5px] border-[#3f4147] bg-[#1a1b1f]/80 text-[#949ba4] hover:text-[#f2f3f5] hover:border-[#5c5e66] font-black text-[11px] uppercase tracking-[0.14em] shadow-[0_3px_0_#0c0d0f] hover:translate-y-[1px] hover:shadow-[0_2px_0_#0c0d0f] transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to defaults
          </button>
        </motion.div>
      </div>
    </div>
  );
}
