import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Sport, GameMode, BotDifficulty } from './types';
import { PageTransition } from './components/PageTransition';
import { HomeScreen } from './components/HomeScreen';
import { GameScreen } from './components/GameScreen';
import { BallRainIntro } from './components/BallRainIntro';
import { StoreScreen } from './components/StoreScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { AboutScreen } from './components/AboutScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { CareerScreen } from './components/CareerScreen';
import { CardPacksScreen } from './components/CardPacksScreen';
import { CardWagerScreen } from './components/CardWagerScreen';
import {
  loadProfile,
  equipCharacter,
  equipPet,
  unequipPet,
  purchaseCharacter,
  purchasePet,
  updatePlayerName,
  saveCreativeLoadout,
  saveAthleteLoadout,
  saveRabbitVariant,
  saveDogVariant,
} from './lib/profileStorage';
import type { PlayerProfile } from './types/profile';
import type { CharacterId, PetId, RabbitVariantId, DogVariantId } from './types/profile';
import type { CreativeLoadout } from './types/creativeCharacter';
import type { AthleteLoadout } from './types/athleteCharacter';
import { stakeFromKey, type CardWagerAgreement } from './lib/cardWager';
import { botName } from './lib/botOpponent';
import { useDuel } from './hooks/useDuel';
import { useAmbientMusic } from './hooks/useAmbientMusic';
import { useOnlineCount } from './hooks/useOnlineCount';
import { useSettings } from './hooks/useSettings';

type Screen =
  | 'home'
  | 'about'
  | 'settings'
  | 'store'
  | 'career'
  | 'cards'
  | 'lobby'
  | 'wager'
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
  const [cardWager, setCardWager] = useState<CardWagerAgreement | null>(null);
  const startedMatchRef = useRef<string | null>(null);

  const duel = useDuel({
    playerName: profile.playerName,
    characterId: profile.equippedCharacter,
    sport,
  });

  const online = useOnlineCount();
  const { settings } = useSettings();

  useAmbientMusic(screen === 'wager' ? 'lobby' : screen);

  useEffect(() => {
    if (
      screen === 'home' ||
      screen === 'store' ||
      screen === 'about' ||
      screen === 'settings' ||
      screen === 'career' ||
      screen === 'cards' ||
      screen === 'wager' ||
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

    const you = duel.match.players.find(p => p.id === duel.lobby?.youId);
    const opp = duel.match.players.find(p => p.id !== duel.lobby?.youId);
    setCardWager({
      yourCard: stakeFromKey(you?.wagerCardKey),
      opponentCard: stakeFromKey(opp?.wagerCardKey),
    });
    setScreen('intro');
  }, [duel.match, duel.lobby?.youId]);

  useEffect(() => {
    if (mode !== 'duel' || screen !== 'game' || duel.lobby?.status !== 'lobby') return;
    startedMatchRef.current = null;
    setDuelSeed(null);
    setCardWager(null);
    setScreen('lobby');
  }, [duel.lobby?.status, mode, screen]);

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
      setCardWager(null);
      startedMatchRef.current = null;
      setScreen('lobby');
      return;
    }
    setMode(m);
    if (m === 'bot' && difficulty) setBotDifficulty(difficulty);
    setDuelSeed(null);
    setCardWager(null);
    if (m === 'bot') {
      setScreen('wager');
      return;
    }
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
      setCardWager(null);
      setScreen('lobby');
      return;
    }
    if (mode === 'bot') {
      setCardWager(null);
      setScreen('wager');
      return;
    }
    setScreen('intro');
  }

  function handleHome() {
    if (mode === 'duel') duel.leaveLobby();
    startedMatchRef.current = null;
    setDuelSeed(null);
    setCardWager(null);
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

  function handleSaveCreativeLoadout(loadout: CreativeLoadout) {
    setProfile(saveCreativeLoadout(loadout));
  }

  function handleSaveAthleteLoadout(loadout: AthleteLoadout) {
    setProfile(saveAthleteLoadout(loadout));
  }

  function handleSaveRabbitVariant(variant: RabbitVariantId) {
    setProfile(saveRabbitVariant(variant));
  }

  function handleSaveDogVariant(variant: DogVariantId) {
    setProfile(saveDogVariant(variant));
  }

  function handleSaveName(name: string) {
    setProfile(updatePlayerName(name));
  }

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
              onOpenCards={() => setScreen('cards')}
              onOpenStore={() => setScreen('store')}
              onOpenCareer={() => setScreen('career')}
              onOpenAbout={() => setScreen('about')}
              onOpenSettings={() => setScreen('settings')}
              onSaveName={handleSaveName}
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
              onSaveRabbitVariant={handleSaveRabbitVariant}
              onSaveDogVariant={handleSaveDogVariant}
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

        {screen === 'cards' && (
          <PageTransition key="cards" variant="menu">
            <CardPacksScreen
              profile={profile}
              initialSport={sport}
              onBack={() => setScreen('home')}
              onProfileChange={setProfile}
            />
          </PageTransition>
        )}

        {screen === 'lobby' && (
          <PageTransition key="lobby" variant="menu">
            <LobbyScreen
              sport={sport}
              status={duel.status}
              error={duel.error}
              lobby={duel.lobby}
              you={duel.you}
              profile={profile}
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

        {screen === 'wager' && (
          <PageTransition key="wager" variant="play">
            <CardWagerScreen
              profile={profile}
              sport={sport}
              modeLabel="VS AI"
              opponentLabel={botName(botDifficulty)}
              botDifficulty={botDifficulty}
              onBack={() => setScreen('home')}
              onSkip={() => {
                setCardWager(null);
                setScreen('intro');
              }}
              onConfirm={agreement => {
                setCardWager(
                  agreement.yourCard && agreement.opponentCard ? agreement : null,
                );
                setScreen('intro');
              }}
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
              rabbitVariant={profile.rabbitVariant}
              dogVariant={profile.dogVariant}
              seedKey={mode === 'duel' ? duelSeed ?? undefined : undefined}
              opponentName={duel.opponent?.name}
              opponentScore={duel.opponentScore}
              opponentFinished={duel.opponentFinished}
              duelResult={duel.duelResult}
              cardWager={cardWager}
              onScoreChange={mode === 'duel' ? duel.reportScore : undefined}
              onDuelFinished={mode === 'duel' ? duel.reportFinish : undefined}
              onHome={handleHome}
              onReplay={handleReplay}
              onProfileChange={handleProfileChange}
            />
          </PageTransition>
        )}
      </AnimatePresence>
    </div>
  );
}
