import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Sport, GameMode } from './types';
import { HomeScreen } from './components/HomeScreen';
import { GameScreen } from './components/GameScreen';
import { BallRainIntro } from './components/BallRainIntro';
import { StoreScreen } from './components/StoreScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { AboutScreen } from './components/AboutScreen';
import {
  loadProfile,
  equipCharacter,
  equipPet,
  unequipPet,
  purchaseCharacter,
  purchasePet,
  updatePlayerName,
} from './lib/profileStorage';
import type { PlayerProfile } from './types/profile';
import type { CharacterId, PetId } from './types/profile';
import { useDuel } from './hooks/useDuel';
import { useAmbientMusic } from './hooks/useAmbientMusic';

type Screen = 'home' | 'about' | 'store' | 'lobby' | 'intro' | 'game';

const modeLabels: Record<GameMode, string> = {
  training: 'TRAINING',
  daily: 'DAILY',
  timed: 'RANKED',
  duel: 'DUEL',
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [sport, setSport] = useState<Sport>('soccer');
  const [mode, setMode] = useState<GameMode>('training');
  const [profile, setProfile] = useState<PlayerProfile>(loadProfile);
  const [gameKey, setGameKey] = useState(0);
  const [duelSeed, setDuelSeed] = useState<string | null>(null);
  const startedMatchRef = useRef<string | null>(null);

  const duel = useDuel({
    playerName: profile.playerName,
    characterId: profile.equippedCharacter,
    sport,
  });

  useAmbientMusic(screen);

  useEffect(() => {
    if (screen === 'home' || screen === 'store' || screen === 'about') setProfile(loadProfile());
  }, [screen]);

  // When both players ready, server sends start → go to intro/game
  useEffect(() => {
    if (!duel.match) return;
    if (startedMatchRef.current === duel.match.seed) return;
    startedMatchRef.current = duel.match.seed;
    setSport(duel.match.sport);
    setDuelSeed(duel.match.seed);
    setMode('duel');
    setScreen('intro');
  }, [duel.match]);

  function refreshProfile() {
    setProfile(loadProfile());
  }

  function handleStart(m: GameMode) {
    if (m === 'duel') {
      setMode('duel');
      setDuelSeed(null);
      startedMatchRef.current = null;
      setScreen('lobby');
      return;
    }
    setMode(m);
    setDuelSeed(null);
    setScreen('intro');
  }

  const handleIntroComplete = useCallback(() => {
    setGameKey(k => k + 1);
    setScreen('game');
  }, []);

  function handleReplay() {
    if (mode === 'duel') {
      duel.requestRematch();
      startedMatchRef.current = null;
      setDuelSeed(null);
      setScreen('lobby');
      return;
    }
    setScreen('intro');
  }

  function handleHome() {
    if (mode === 'duel') duel.leaveLobby();
    startedMatchRef.current = null;
    setDuelSeed(null);
    setScreen('home');
    refreshProfile();
  }

  function handlePurchase(id: CharacterId) {
    const { ok, profile: next } = purchaseCharacter(id);
    if (ok) setProfile(next);
  }

  function handleEquip(id: CharacterId) {
    setProfile(equipCharacter(id));
  }

  function handlePurchasePet(id: PetId) {
    const { ok, profile: next } = purchasePet(id);
    if (ok) setProfile(next);
  }

  function handleEquipPet(id: PetId) {
    setProfile(equipPet(id));
  }

  function handleUnequipPet() {
    setProfile(unequipPet());
  }

  function handleSaveName(name: string) {
    setProfile(updatePlayerName(name));
  }

  return (
    <div className="min-h-svh bg-[#0a0a0b]">
      <AnimatePresence mode="wait">
        {screen === 'home' && (
          <HomeScreen
            key="home"
            sport={sport}
            onSportChange={setSport}
            onStart={handleStart}
            profile={profile}
            onOpenStore={() => setScreen('store')}
            onOpenAbout={() => setScreen('about')}
            onSaveName={handleSaveName}
          />
        )}

        {screen === 'about' && (
          <AboutScreen
            key="about"
            sport={sport}
            profile={profile}
            onBack={() => setScreen('home')}
            onPlay={() => setScreen('home')}
          />
        )}

        {screen === 'store' && (
          <StoreScreen
            key="store"
            sport={sport}
            profile={profile}
            onBack={() => setScreen('home')}
            onPurchaseCharacter={handlePurchase}
            onEquipCharacter={handleEquip}
            onPurchasePet={handlePurchasePet}
            onEquipPet={handleEquipPet}
            onUnequipPet={handleUnequipPet}
          />
        )}

        {screen === 'lobby' && (
          <LobbyScreen
            key="lobby"
            sport={sport}
            status={duel.status}
            error={duel.error}
            lobby={duel.lobby}
            you={duel.you}
            onBack={() => {
              duel.leaveLobby();
              setScreen('home');
            }}
            onCreate={() => duel.createLobby()}
            onJoin={code => duel.joinLobby(code)}
            onReady={ready => duel.setReady(ready)}
            onLeave={() => duel.leaveLobby()}
          />
        )}

        {screen === 'intro' && (
          <BallRainIntro
            key="intro"
            sport={sport}
            mode={modeLabels[mode]}
            onComplete={handleIntroComplete}
          />
        )}

        {screen === 'game' && (
          <GameScreen
            key={`${sport}-${mode}-${gameKey}`}
            sport={sport}
            mode={mode}
            equippedCharacter={profile.equippedCharacter}
            equippedPet={profile.equippedPet}
            seedKey={mode === 'duel' ? duelSeed ?? undefined : undefined}
            opponentName={duel.opponent?.name}
            opponentScore={duel.opponentScore}
            opponentFinished={duel.opponentFinished}
            duelResult={duel.duelResult}
            onScoreChange={mode === 'duel' ? duel.reportScore : undefined}
            onDuelFinished={mode === 'duel' ? duel.reportFinish : undefined}
            onHome={handleHome}
            onReplay={handleReplay}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
