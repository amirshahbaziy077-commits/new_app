import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { KotlinSourceModal } from './components/KotlinSourceModal';
import { AlphabetScreen } from './screens/AlphabetScreen';
import { ChallengeModeScreen } from './screens/ChallengeModeScreen';
import { FlashcardScreen } from './screens/FlashcardScreen';
import { GameCategorySelectScreen } from './screens/GameCategorySelectScreen';
import { GuessWordScreen } from './screens/GuessWordScreen';
import { HomeScreen, ScreenRoute } from './screens/HomeScreen';
import { MatchPairsScreen } from './screens/MatchPairsScreen';
import { ParentZoneScreen } from './screens/ParentZoneScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { RewardsScreen } from './screens/RewardsScreen';
import { SpellWordScreen } from './screens/SpellWordScreen';
import { TapRightOneScreen } from './screens/TapRightOneScreen';
import { setSoundEnabled } from './utils/audio';
import {
  computeTotalStars,
  evaluateUnlockedBadges,
  GameScores,
  loadProgress,
  PersistedProgress,
  resetProgressStorage,
  saveProgress,
  UserProfile,
} from './utils/storage';

export default function App() {
  const [route, setRoute] = useState<ScreenRoute>({ name: 'home' });
  const [kotlinModalOpen, setKotlinModalOpen] = useState(false);
  const [progress, setProgress] = useState<PersistedProgress>(() => loadProgress());

  useEffect(() => {
    setSoundEnabled(progress.soundEnabled);
    saveProgress(progress);
  }, [progress]);

  const totalStars = computeTotalStars(
    progress.gameScores,
    progress.challengeStars
  );

  const incrementScore = (game: keyof GameScores, delta = 1) => {
    setProgress((prev) => {
      const updated: PersistedProgress = {
        ...prev,
        gameScores: {
          ...prev.gameScores,
          [game]: prev.gameScores[game] + delta,
        },
      };
      return {
        ...updated,
        unlockedBadgeIds: evaluateUnlockedBadges(updated),
      };
    });
  };

  const handleAddChallengeStars = (delta: number) => {
    setProgress((prev) => {
      const updated: PersistedProgress = {
        ...prev,
        challengeStars: prev.challengeStars + delta,
      };
      return {
        ...updated,
        unlockedBadgeIds: evaluateUnlockedBadges(updated),
      };
    });
  };

  const handleUpdateChallengeBest = (score: number) => {
    setProgress((prev) => ({
      ...prev,
      challengeBestScore: Math.max(prev.challengeBestScore, score),
    }));
  };

  const handleSaveProfile = (userProfile: UserProfile) => {
    setProgress((prev) => ({
      ...prev,
      userProfile,
    }));
  };

  const handleExploreLetter = (letter: string) => {
    setProgress((prev) => {
      if (prev.exploredLetters.includes(letter)) return prev;
      const updated: PersistedProgress = {
        ...prev,
        exploredLetters: [...prev.exploredLetters, letter],
      };
      return {
        ...updated,
        unlockedBadgeIds: evaluateUnlockedBadges(updated),
      };
    });
  };

  const handleToggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    setProgress((prev) => ({
      ...prev,
      soundEnabled: enabled,
    }));
  };

  const handleResetProgress = () => {
    const fresh = resetProgressStorage();
    setProgress({
      ...fresh,
      soundEnabled: progress.soundEnabled,
    });
  };

  const routeKey =
    route.name === 'flashcards'
      ? `flashcards-${route.categoryId}`
      : route.name === 'game-select'
      ? `game-select-${route.game}`
      : 'categoryFilter' in route
      ? `${route.name}-${route.categoryFilter}`
      : route.name;

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={routeKey}
          initial={{ opacity: 0, x: route.name === 'home' ? -24 : 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: route.name === 'home' ? 24 : -28 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          {route.name === 'home' && (
            <HomeScreen
              totalScore={totalStars}
              unlockedBadgeCount={progress.unlockedBadgeIds.length}
              gameScores={progress.gameScores}
              challengeBestScore={progress.challengeBestScore}
              userProfile={progress.userProfile}
              onNavigate={setRoute}
              onOpenKotlinModal={() => setKotlinModalOpen(true)}
            />
          )}

          {route.name === 'flashcards' && (
            <FlashcardScreen
              categoryId={route.categoryId}
              onBack={() => setRoute({ name: 'home' })}
            />
          )}

          {route.name === 'alphabet' && (
            <AlphabetScreen
              exploredLetters={progress.exploredLetters}
              onExploreLetter={handleExploreLetter}
              onBack={() => setRoute({ name: 'home' })}
            />
          )}

          {route.name === 'rewards' && (
            <RewardsScreen
              totalStars={totalStars}
              gameScores={progress.gameScores}
              unlockedBadgeIds={progress.unlockedBadgeIds}
              exploredLettersCount={progress.exploredLetters.length}
              onBack={() => setRoute({ name: 'home' })}
            />
          )}

          {route.name === 'parents' && (
            <ParentZoneScreen
              soundEnabled={progress.soundEnabled}
              totalStars={totalStars}
              onToggleSound={handleToggleSound}
              onResetProgress={handleResetProgress}
              onBack={() => setRoute({ name: 'home' })}
            />
          )}

          {route.name === 'game-select' && (
            <GameCategorySelectScreen
              game={route.game}
              score={totalStars}
              onSelectCategory={(categoryFilter) => {
                const gameName = route.game;
                if (gameName === 'guess') {
                  setRoute({ name: 'guess', categoryFilter });
                } else if (gameName === 'match') {
                  setRoute({ name: 'match', categoryFilter });
                } else if (gameName === 'listen') {
                  setRoute({ name: 'listen', categoryFilter });
                } else {
                  setRoute({ name: 'spell', categoryFilter });
                }
              }}
              onBack={() => setRoute({ name: 'home' })}
            />
          )}

          {route.name === 'guess' && (
            <GuessWordScreen
              categoryFilter={route.categoryFilter}
              score={progress.gameScores.guess}
              onAddScore={(delta) => incrementScore('guess', delta)}
              onBack={() => setRoute({ name: 'game-select', game: 'guess' })}
              onGoHome={() => setRoute({ name: 'home' })}
            />
          )}

          {route.name === 'match' && (
            <MatchPairsScreen
              categoryFilter={route.categoryFilter}
              score={progress.gameScores.match}
              onAddScore={(delta) => incrementScore('match', delta)}
              onBack={() => setRoute({ name: 'game-select', game: 'match' })}
              onGoHome={() => setRoute({ name: 'home' })}
            />
          )}

          {route.name === 'listen' && (
            <TapRightOneScreen
              categoryFilter={route.categoryFilter}
              score={progress.gameScores.listen}
              onAddScore={(delta) => incrementScore('listen', delta)}
              onBack={() => setRoute({ name: 'game-select', game: 'listen' })}
              onGoHome={() => setRoute({ name: 'home' })}
            />
          )}

          {route.name === 'spell' && (
            <SpellWordScreen
              categoryFilter={route.categoryFilter}
              score={progress.gameScores.spell}
              onAddScore={(delta) => incrementScore('spell', delta)}
              onBack={() => setRoute({ name: 'game-select', game: 'spell' })}
              onGoHome={() => setRoute({ name: 'home' })}
            />
          )}

          {route.name === 'challenge' && (
            <ChallengeModeScreen
              totalStars={totalStars}
              bestScore={progress.challengeBestScore}
              onAddChallengeStars={handleAddChallengeStars}
              onUpdateBestScore={handleUpdateChallengeBest}
              onBack={() => setRoute({ name: 'home' })}
            />
          )}

          {route.name === 'profile' && (
            <ProfileScreen
              profile={progress.userProfile}
              totalStars={totalStars}
              onSaveProfile={handleSaveProfile}
              onBack={() => setRoute({ name: 'home' })}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <KotlinSourceModal
        open={kotlinModalOpen}
        onClose={() => setKotlinModalOpen(false)}
      />
    </>
  );
}
