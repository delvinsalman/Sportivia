import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Sport, GameMode, BotDifficulty } from './types';
import { PageTransition } from './components/PageTransition';
import { HomeScreen } from './components/HomeScreen';
import { GameScreen } from './components/GameScreen';
import { BallRainIntro } from './components/BallRainIntro';
import { DuelVersusScreen } from './components/DuelVersusScreen';
import { StoreScreen } from './components/StoreScreen';
import { CharacterCardsScreen } from './components/CharacterCardsScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { CoinStakeScreen } from './components/CoinStakeScreen';
import { AboutScreen } from './components/AboutScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { CareerScreen } from './components/CareerScreen';
import { UnlockShowcase, type UnlockReveal } from './components/UnlockShowcase';
import {
  loadProfile,
  equipCharacter,
  equipPet,
  unequipPet,
  purchaseCharacter,
  applyCharacterStatUpgrades,
  purchasePet,
  updatePlayerName,
  saveCreativeLoadout,
  saveAthleteLoadout,
  saveBobLoadout,
  saveRabbitVariant,
  saveMakoVariant,
  saveDogVariant,
  lockCoinStake,
  releaseCoinStake,
} from './lib/profileStorage';
import type { PlayerProfile } from './types/profile';
import type { CharacterId, PetId, RabbitVariantId, MakoVariantId, DogVariantId } from './types/profile';
import type { StatPending } from './lib/characterCards';
import type { CreativeLoadout } from './types/creativeCharacter';
import type { AthleteLoadout } from './types/athleteCharacter';
import type { BobLoadout } from './types/bobCharacter';
import { useDuel } from './hooks/useDuel';
import { useAmbientMusic } from './hooks/useAmbientMusic';
import { useOnlineCount } from './hooks/useOnlineCount';
import { useSettings } from './hooks/useSettings';
import { playUnlockFanfare } from './lib/menuAudio';

type Screen =
  | 'home'
  | 'about'
  | 'settings'
  | 'store'
  | 'cards'
  | 'career'
  | 'lobby'
  | 'bot-stake'
  | 'duel-versus'
  | 'intro'
  | 'game';

const modeLabels: Record<GameMode, string> = {
  training: 'TRAINING',
  daily: 'DAILY',
  timed: 'RANKED',
  bot: 'VS AI',
  duel: 'DUEL',
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [sport, setSport] = useState<Sport>('soccer');
  const [mode, setMode] = useState<GameMode>('training');
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('beginner');
  const [profile, setProfile] = useState<PlayerProfile>(loadProfile);
  const [gameKey, setGameKey] = useState(0);
  const [duelSeed, setDuelSeed] = useState<string | null>(null);
  const [unlockReveal, setUnlockReveal] = useState<UnlockReveal | null>(null);
  const startedMatchRef = useRef<string | null>(null);

  const duel = useDuel({
    playerName: profile.playerName,
    characterId: profile.equippedCharacter,
    sport,
    profile,
  });

  const online = useOnlineCount();
  const { settings } = useSettings();

  useAmbientMusic(screen);

  useEffect(() => {
    if (
      screen === 'home' ||
      screen === 'store' ||
      screen === 'cards' ||
      screen === 'about' ||
      screen === 'settings' ||
      screen === 'career' ||
      screen === 'lobby'
    ) {
      setProfile(loadProfile());
    }
  }, [screen]);

  useEffect(() => {
    if (!duel.match) return;
    if (startedMatchRef.current === duel.match.seed) return;
    startedMatchRef.current = duel.match.seed;
    setSport(duel.match.sport);
    setDuelSeed(duel.match.seed);
    setMode('duel');

    const youId = duel.lobby?.youId ?? duel.you?.id;
    const youPlayer =
      duel.match.players.find(p => p.id === youId) ??
      duel.match.players[0];
    const oppPlayer = duel.match.players.find(p => p.id !== youPlayer?.id);
    const locked = lockCoinStake({
      mode: 'duel',
      amount: youPlayer?.wagerCoins ?? 0,
      opponentAmount: oppPlayer?.wagerCoins ?? 0,
    });
    setProfile(locked.profile);

    setScreen('duel-versus');
  }, [duel.match, duel.lobby?.youId, duel.you?.id]);

  // Joiners inherit the host's sport so boards match the room.
  useEffect(() => {
    if (duel.lobby?.sport) setSport(duel.lobby.sport);
  }, [duel.lobby?.sport]);

  // Kick back to lobby only if the match was abandoned — keep results visible after finish.
  useEffect(() => {
    if (mode !== 'duel') return;
    if (screen !== 'game' && screen !== 'duel-versus' && screen !== 'intro') return;
    if (duel.duelResult) return;
    if (duel.lobby?.status === 'lobby' || (!duel.lobby && duel.status === 'idle')) {
      startedMatchRef.current = null;
      setDuelSeed(null);
      setProfile(releaseCoinStake());
      setScreen('lobby');
    }
  }, [duel.lobby, duel.lobby?.status, duel.status, duel.duelResult, mode, screen]);

  function refreshProfile() {
    setProfile(loadProfile());
  }

  function handleProfileChange(nextProfile?: PlayerProfile) {
    setProfile(nextProfile ?? loadProfile());
  }

  function handleStart(m: GameMode, difficulty?: BotDifficulty) {
    if (m === 'duel') {
      setMode('duel');
      setDuelSeed(null);
      startedMatchRef.current = null;
      setScreen('lobby');
      return;
    }
    setMode(m);
    if (m === 'bot' && difficulty) {
      setBotDifficulty(difficulty);
      setScreen('bot-stake');
      return;
    }
    setDuelSeed(null);
    setScreen('intro');
  }

  function handleBotStakeConfirm(stake: number) {
    const locked = lockCoinStake({
      mode: 'bot',
      amount: stake,
      difficulty: botDifficulty,
    });
    if (!locked.ok) {
      setProfile(locked.profile);
      return;
    }
    setProfile(locked.profile);
    setDuelSeed(null);
    setScreen('intro');
  }

  const handleIntroComplete = useCallback(() => {
    setGameKey(k => k + 1);
    setScreen('game');
  }, []);

  const handleVersusComplete = useCallback(() => {
    setScreen('intro');
  }, []);

  function handleReplay() {
    if (mode === 'duel') {
      duel.requestRematch();
      startedMatchRef.current = null;
      setDuelSeed(null);
      setProfile(releaseCoinStake());
      setScreen('lobby');
      return;
    }
    if (mode === 'bot') {
      setScreen('bot-stake');
      return;
    }
    setScreen('intro');
  }

  function handleHome() {
    if (mode === 'duel') duel.leaveLobby();
    startedMatchRef.current = null;
    setDuelSeed(null);
    setProfile(releaseCoinStake());
    setScreen('home');
    refreshProfile();
  }

  function handlePurchase(id: CharacterId) {
    const { ok, profile: next } = purchaseCharacter(id);
    if (ok) {
      setProfile(next);
      playUnlockFanfare();
      setUnlockReveal({ kind: 'character', id });
    }
  }

  function handleApplyStatUpgrades(id: CharacterId, pending: StatPending) {
    const { ok, profile: next } = applyCharacterStatUpgrades(id, pending);
    if (ok) setProfile(next);
    return ok;
  }

  function handleEquip(id: CharacterId) {
    setProfile(equipCharacter(id));
  }

  function handlePurchasePet(id: PetId) {
    const { ok, profile: next } = purchasePet(id);
    if (ok) {
      setProfile(next);
      playUnlockFanfare();
      setUnlockReveal({ kind: 'pet', id });
    }
  }

  function handleEquipPet(id: PetId) {
    setProfile(equipPet(id));
  }

  function handleUnequipPet() {
    setProfile(unequipPet());
  }

  function handleSaveCreativeLoadout(loadout: CreativeLoadout) {
    setProfile(saveCreativeLoadout(loadout));
  }

  function handleSaveAthleteLoadout(loadout: AthleteLoadout) {
    setProfile(saveAthleteLoadout(loadout));
  }

  function handleSaveBobLoadout(loadout: BobLoadout) {
    setProfile(saveBobLoadout(loadout));
  }

  function handleSaveRabbitVariant(variant: RabbitVariantId) {
    setProfile(saveRabbitVariant(variant));
  }

  function handleSaveMakoVariant(variant: MakoVariantId) {
    setProfile(saveMakoVariant(variant));
  }

  function handleSaveDogVariant(variant: DogVariantId) {
    setProfile(saveDogVariant(variant));
  }

  function handleSaveName(name: string) {
    setProfile(updatePlayerName(name));
  }

  const clearUnlockReveal = useCallback(() => setUnlockReveal(null), []);

  return (
    <div className="relative min-h-svh overflow-hidden bg-[#0a0a0b]">
      <AnimatePresence mode="wait">
        {screen === 'home' && (
          <PageTransition key="home" variant="menu">
            <HomeScreen
              sport={sport}
              onSportChange={setSport}
              onStart={handleStart}
              profile={profile}
              onOpenStore={() => setScreen('store')}
              onOpenCards={() => setScreen('cards')}
              onOpenCareer={() => setScreen('career')}
              onOpenAbout={() => setScreen('about')}
              onOpenSettings={() => setScreen('settings')}
              onSaveName={handleSaveName}
              onProfileChange={setProfile}
              online={settings.showOnlineCount ? online : null}
            />
          </PageTransition>
        )}

        {screen === 'settings' && (
          <PageTransition key="settings" variant="menu">
            <SettingsScreen
              sport={sport}
              onBack={() => setScreen('home')}
              onPromoRedeemed={refreshProfile}
            />
          </PageTransition>
        )}

        {screen === 'about' && (
          <PageTransition key="about" variant="menu">
            <AboutScreen
              sport={sport}
              profile={profile}
              onBack={() => setScreen('home')}
              onPlay={() => setScreen('home')}
            />
          </PageTransition>
        )}

        {screen === 'store' && (
          <PageTransition key="store" variant="menu">
            <StoreScreen
              sport={sport}
              profile={profile}
              onBack={() => setScreen('home')}
              onPurchaseCharacter={handlePurchase}
              onEquipCharacter={handleEquip}
              onPurchasePet={handlePurchasePet}
              onEquipPet={handleEquipPet}
              onUnequipPet={handleUnequipPet}
              onSaveCreativeLoadout={handleSaveCreativeLoadout}
              onSaveAthleteLoadout={handleSaveAthleteLoadout}
              onSaveBobLoadout={handleSaveBobLoadout}
              onSaveRabbitVariant={handleSaveRabbitVariant}
              onSaveMakoVariant={handleSaveMakoVariant}
              onSaveDogVariant={handleSaveDogVariant}
            />
          </PageTransition>
        )}

        {screen === 'cards' && (
          <PageTransition key="cards" variant="menu">
            <CharacterCardsScreen
              sport={sport}
              profile={profile}
              onBack={() => setScreen('home')}
              onPurchaseCharacter={handlePurchase}
              onApplyStatUpgrades={handleApplyStatUpgrades}
              onEquipCharacter={handleEquip}
            />
          </PageTransition>
        )}

        {screen === 'career' && (
          <PageTransition key="career" variant="menu">
            <CareerScreen
              sport={sport}
              profile={profile}
              onBack={() => setScreen('home')}
              onSportChange={setSport}
            />
          </PageTransition>
        )}

        {screen === 'lobby' && (
          <PageTransition key="lobby" variant="menu">
            <LobbyScreen
              sport={sport}
              profile={profile}
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
              onSetWager={duel.setWager}
            />
          </PageTransition>
        )}

        {screen === 'bot-stake' && (
          <PageTransition key="bot-stake" variant="menu">
            <CoinStakeScreen
              sport={sport}
              difficulty={botDifficulty}
              profile={profile}
              onBack={() => setScreen('home')}
              onConfirm={handleBotStakeConfirm}
            />
          </PageTransition>
        )}

        {screen === 'duel-versus' && duel.match && (
          <PageTransition key="duel-versus" variant="play" className="fixed inset-0 z-50">
            <DuelVersusScreen
              sport={sport}
              profile={profile}
              match={duel.match}
              youId={duel.lobby?.youId ?? duel.you?.id ?? duel.match.players[0]?.id ?? ''}
              onComplete={handleVersusComplete}
            />
          </PageTransition>
        )}

        {screen === 'intro' && (
          <PageTransition key="intro" variant="play" className="fixed inset-0 z-50">
            <BallRainIntro
              sport={sport}
              mode={modeLabels[mode]}
              detail={mode === 'bot' ? botDifficulty.toUpperCase() : undefined}
              onComplete={handleIntroComplete}
            />
          </PageTransition>
        )}

        {screen === 'game' && (
          <PageTransition key={`game-${sport}-${mode}-${gameKey}`} variant="game">
            <GameScreen
              sport={sport}
              mode={mode}
              botDifficulty={botDifficulty}
              equippedCharacter={profile.equippedCharacter}
              equippedPet={profile.equippedPet}
              creativeLoadout={profile.creativeLoadout}
              athleteLoadout={profile.athleteLoadout}
              bobLoadout={profile.bobLoadout}
              rabbitVariant={profile.rabbitVariant}
              makoVariant={profile.makoVariant}
              dogVariant={profile.dogVariant}
              seedKey={mode === 'duel' ? duelSeed ?? undefined : undefined}
              opponentName={duel.opponent?.name}
              opponentScore={duel.opponentScore}
              opponentFinished={duel.opponentFinished}
              duelResult={duel.duelResult}
              onScoreChange={mode === 'duel' ? duel.reportScore : undefined}
              onDuelFinished={mode === 'duel' ? duel.reportFinish : undefined}
              onHome={handleHome}
              onReplay={handleReplay}
              onProfileChange={handleProfileChange}
            />
          </PageTransition>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {unlockReveal && (
          <UnlockShowcase
            key={`${unlockReveal.kind}-${unlockReveal.id}`}
            reveal={unlockReveal}
            sport={sport}
            creativeLoadout={profile.creativeLoadout}
            athleteLoadout={profile.athleteLoadout}
            bobLoadout={profile.bobLoadout}
            rabbitVariant={profile.rabbitVariant}
            makoVariant={profile.makoVariant}
            dogVariant={profile.dogVariant}
            onDone={clearUnlockReveal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
