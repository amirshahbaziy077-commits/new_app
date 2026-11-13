import { Code2, Settings, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { AnimatedScoreBadge } from '../components/CelebrationEffects';
import { FantasyBackground } from '../components/FantasyBackground';
import { CATEGORIES, CategoryId, GameCategoryFilter } from '../data/vocabulary';
import { playTapPop, speakWord } from '../utils/audio';
import {
  calculateAgeFromSlashBirthDate,
  GameScores,
  UserProfile,
} from '../utils/storage';
import { GameKind } from './GameCategorySelectScreen';

export type ScreenRoute =
  | { name: 'home' }
  | { name: 'flashcards'; categoryId: CategoryId }
  | { name: 'alphabet' }
  | { name: 'rewards' }
  | { name: 'parents' }
  | { name: 'game-select'; game: GameKind }
  | { name: 'guess'; categoryFilter: GameCategoryFilter }
  | { name: 'match'; categoryFilter: GameCategoryFilter }
  | { name: 'listen'; categoryFilter: GameCategoryFilter }
  | { name: 'spell'; categoryFilter: GameCategoryFilter }
  | { name: 'challenge' }
  | { name: 'profile' };

interface HomeScreenProps {
  totalScore: number;
  unlockedBadgeCount: number;
  gameScores: GameScores;
  challengeBestScore: number;
  userProfile: UserProfile;
  onNavigate: (route: ScreenRoute) => void;
  onOpenKotlinModal: () => void;
}

const GAME_CARDS = [
  {
    route: 'guess' as const,
    title: 'Guess the Word',
    persian: 'حدس کلمه',
    emoji: '🎮',
    gradient: 'from-violet-500 to-purple-600',
    description: 'Look at the emoji and pick the word',
  },
  {
    route: 'match' as const,
    title: 'Match the Pairs',
    persian: 'جفت‌ها را پیدا کن',
    emoji: '🧩',
    gradient: 'from-teal-400 to-emerald-600',
    description: 'Flip cards and match words with emojis',
  },
  {
    route: 'listen' as const,
    title: 'Tap the Right One',
    persian: 'گوش کن و بزن',
    emoji: '🎯',
    gradient: 'from-sky-500 to-blue-600',
    description: 'Listen carefully and tap the matching emoji',
  },
  {
    route: 'spell' as const,
    title: 'Spell the Word',
    persian: 'املای کلمه',
    emoji: '🔤',
    gradient: 'from-amber-400 to-orange-500',
    description: 'Tap letters in order to build the word',
  },
];

export function HomeScreen({
  totalScore,
  unlockedBadgeCount,
  gameScores,
  challengeBestScore,
  userProfile,
  onNavigate,
  onOpenKotlinModal,
}: HomeScreenProps) {
  return (
    <FantasyBackground theme="home" className="px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Top Bar: Animated Global Star Score, My Rewards, Parents, Kotlin Source */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <AnimatedScoreBadge score={totalScore} />

            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => {
                playTapPop();
                onNavigate({ name: 'rewards' });
              }}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2.5 font-display text-lg font-bold text-white shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>My Rewards 🏆</span>
              {unlockedBadgeCount > 0 && (
                <span className="rounded-xl bg-white/25 px-2 py-0.5 text-sm tabular-nums">
                  {unlockedBadgeCount}
                </span>
              )}
            </motion.button>
            {(() => {
              const hasProfile = userProfile.firstName.trim().length > 0;
              const liveAge = userProfile.birthDate
                ? calculateAgeFromSlashBirthDate(userProfile.birthDate)
                : userProfile.age;
              const showAge = hasProfile && liveAge !== null && liveAge >= 0;

              return (
                <div className="inline-flex flex-wrap items-center gap-2 rounded-2xl bg-white p-1.5 shadow-md ring-2 ring-indigo-200">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => {
                      playTapPop();
                      onNavigate({ name: 'profile' });
                    }}
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-xl px-2.5 py-1 font-display text-base font-bold text-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400 cursor-pointer whitespace-nowrap"
                  >
                    <span className="text-2xl leading-none" aria-hidden="true">
                      {userProfile.avatar || '🦊'}
                    </span>
                    <span className="max-w-[140px] truncate">
                      {hasProfile ? `Hi ${userProfile.firstName.trim()}!` : 'Profile'}
                    </span>
                  </motion.button>

                  {showAge && (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => speakWord(`I am ${liveAge} years old.`, 0.8)}
                      aria-label={`Speak my age: I am ${liveAge} years old`}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1 font-display text-sm font-bold text-white shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 cursor-pointer whitespace-nowrap"
                    >
                      <Volume2 className="h-4 w-4" />
                      <span className="tabular-nums">{liveAge} Years</span>
                    </motion.button>
                  )}
                </div>
              );
            })()}
          </div>

          <div className="flex items-center gap-2.5">
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.93 }}
              onClick={onOpenKotlinModal}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Code2 className="h-4 w-4 text-indigo-600" />
              <span className="hidden sm:inline">Kotlin Source</span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => {
                playTapPop();
                onNavigate({ name: 'parents' });
              }}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Settings className="h-4 w-4 text-slate-600" />
              <span>Parents</span>
            </motion.button>
          </div>
        </div>

        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="text-center"
        >
          <h1
            dir="rtl"
            lang="fa"
            className="font-persian text-4xl font-extrabold leading-snug tracking-tight text-indigo-700 drop-shadow-sm sm:text-5xl text-center"
          >
            به کلاس زبان انگلیسی خوش آمدید
          </h1>
        </motion.div>

        {/* Alphabet (A-Z) Featured Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 360, damping: 18 }}
          onClick={() => {
            playTapPop();
            onNavigate({ name: 'alphabet' });
          }}
          className="flex w-full items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-500 px-6 py-5 text-left text-white shadow-lg transition-shadow hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400 cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <span
              className="flex h-16 w-16 shrink-0 select-none items-center justify-center rounded-2xl bg-white/20"
              aria-hidden="true"
            >
              <motion.span
                animate={{ y: [-6, 6, -6] }}
                transition={{
                  duration: 1.75,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="inline-block text-4xl leading-none drop-shadow-sm"
              >
                🔤
              </motion.span>
            </span>
            <div>
              <div className="font-display text-2xl font-bold sm:text-3xl">
                Alphabet 🔤
              </div>
              <p className="text-sm font-semibold text-white/90 sm:text-base">
                Learn A to Z letters, words, and sounds
              </p>
              <p
                dir="rtl"
                lang="fa"
                className="font-persian mt-0.5 text-base font-bold text-white/95 sm:hidden"
              >
                الفبای انگلیسی (A–Z)
              </p>
            </div>
          </div>
          <span
            dir="rtl"
            lang="fa"
            className="font-persian hidden text-xl font-bold text-white/95 sm:inline"
          >
            الفبای انگلیسی (A–Z)
          </span>
        </motion.button>

        {/* 5 Categories Section (Animals, Fruits, Colors, Numbers, Objects) */}
        <section aria-labelledby="categories-heading" className="space-y-4">
          <div className="flex items-baseline justify-between gap-4">
            <h2
              id="categories-heading"
              className="font-display text-2xl font-bold text-slate-800 sm:text-3xl"
            >
              Word Cards
            </h2>
            <span
              dir="rtl"
              lang="fa"
              className="font-persian text-lg font-bold text-slate-600"
            >
              کارت‌های کلمات
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
            {CATEGORIES.map((category, index) => (
              <motion.button
                key={category.id}
                type="button"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: index * 0.05,
                  type: 'spring',
                  stiffness: 320,
                  damping: 20,
                }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  playTapPop();
                  onNavigate({ name: 'flashcards', categoryId: category.id });
                }}
                className={`flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-3xl bg-gradient-to-br ${category.cardGradient} p-5 text-white shadow-lg transition-shadow hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500 cursor-pointer`}
              >
                <motion.span
                  animate={{ y: [-6, 6, -6] }}
                  transition={{
                    duration: 1.75 + index * 0.12,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="text-6xl leading-none drop-shadow-sm"
                  aria-hidden="true"
                >
                  {category.emoji}
                </motion.span>
                <span className="font-display text-2xl font-bold tracking-wide">
                  {category.title}
                </span>
                <span
                  dir="rtl"
                  lang="fa"
                  className="font-persian text-lg font-bold text-white/95"
                >
                  {category.persianTitle}
                </span>
                <span className="text-xs font-bold text-white/85 tabular-nums">
                  {category.words.length} words
                </span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Prominent Challenge Mode (Hard Questions) Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 360, damping: 18 }}
          onClick={() => {
            playTapPop();
            onNavigate({ name: 'challenge' });
          }}
          className="flex w-full items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 px-6 py-5 text-left text-white shadow-xl ring-4 ring-white/60 transition-shadow hover:shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-400 cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <span
              className="flex h-18 w-18 shrink-0 select-none items-center justify-center rounded-2xl bg-white/25"
              aria-hidden="true"
            >
              <motion.span
                animate={{ y: [-6, 6, -6] }}
                transition={{
                  duration: 1.75,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="inline-block text-4xl leading-none drop-shadow-sm"
              >
                🏆
              </motion.span>
            </span>
            <div>
              <div className="font-display text-2xl font-bold sm:text-3xl">
                Challenge Mode 🏆
              </div>
              <p className="text-sm font-semibold text-white/95 sm:text-base">
                10 Hard Questions · 2:00 Timer · Win Red Trophy (+5 ⭐)
              </p>
              <p
                dir="rtl"
                lang="fa"
                className="font-persian mt-0.5 text-base font-bold text-white sm:hidden"
              >
                سوالات سخت · رکورد: {challengeBestScore}/10
              </p>
            </div>
          </div>

          <div className="hidden shrink-0 flex-col items-end text-right sm:flex">
            <span
              dir="rtl"
              lang="fa"
              className="font-persian text-xl font-bold text-white"
            >
              سوالات سخت
            </span>
            <span className="mt-1 rounded-xl bg-white/25 px-3 py-1 font-display text-sm font-bold tabular-nums text-white">
              🏆 Best: {challengeBestScore}/10
            </span>
          </div>
        </motion.button>

        {/* Games Section */}
        <section aria-labelledby="games-heading" className="space-y-4 pb-6">
          <div className="flex items-baseline justify-between gap-4">
            <h2
              id="games-heading"
              className="font-display text-2xl font-bold text-slate-800 sm:text-3xl"
            >
              Games
            </h2>
            <span
              dir="rtl"
              lang="fa"
              className="font-persian text-lg font-bold text-slate-600"
            >
              بازی‌های سرگرم‌کننده
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            {GAME_CARDS.map((game, index) => {
              const currentScore = gameScores[game.route];
              return (
                <motion.button
                  key={game.route}
                  type="button"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.12 + index * 0.05,
                    type: 'spring',
                    stiffness: 280,
                    damping: 22,
                  }}
                  whileHover={{ scale: 1.03, y: -3 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    playTapPop();
                    onNavigate({ name: 'game-select', game: game.route });
                  }}
                  className={`flex min-h-[132px] items-center justify-between gap-4 rounded-3xl bg-gradient-to-br ${game.gradient} p-6 text-left text-white shadow-lg transition-shadow hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500 cursor-pointer`}
                >
                  <div className="flex items-center gap-5">
                    <span
                      className="flex h-20 w-20 shrink-0 select-none items-center justify-center rounded-2xl bg-white/20"
                      aria-hidden="true"
                    >
                      <motion.span
                        animate={{ y: [-6, 6, -6] }}
                        transition={{
                          duration: 1.75 + index * 0.12,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="inline-block text-5xl leading-none drop-shadow-sm"
                      >
                        {game.emoji}
                      </motion.span>
                    </span>
                    <div className="space-y-1">
                      <div className="font-display text-2xl font-bold sm:text-3xl">
                        {game.title}
                      </div>
                      <div
                        dir="rtl"
                        lang="fa"
                        className="font-persian text-lg font-bold text-white/95"
                      >
                        {game.persian}
                      </div>
                      <p className="text-sm font-semibold text-white/90">
                        {game.description}
                      </p>
                    </div>
                  </div>

                  {currentScore > 0 && (
                    <div className="flex shrink-0 flex-col items-center rounded-2xl bg-white/25 px-3.5 py-2">
                      <span className="text-xl leading-none" aria-hidden="true">
                        ⭐
                      </span>
                      <span className="font-display text-xl font-bold tabular-nums">
                        {currentScore}
                      </span>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </section>
      </div>
    </FantasyBackground>
  );
}
