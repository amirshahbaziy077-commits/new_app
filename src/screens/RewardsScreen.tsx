import { Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { ScreenHeader } from '../components/CelebrationEffects';
import { FantasyBackground } from '../components/FantasyBackground';
import { REWARD_BADGES } from '../data/vocabulary';
import { GameScores } from '../utils/storage';

interface RewardsScreenProps {
  totalStars: number;
  gameScores: GameScores;
  unlockedBadgeIds: string[];
  exploredLettersCount: number;
  onBack: () => void;
}

export function RewardsScreen({
  totalStars,
  gameScores,
  unlockedBadgeIds,
  exploredLettersCount,
  onBack,
}: RewardsScreenProps) {
  return (
    <FantasyBackground theme="rewards" className="px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-4xl flex-col items-center space-y-6">
        <ScreenHeader
          title="🏆 My Rewards"
          persianSubtitle="جایزه‌ها و نشان‌های من"
          onBack={onBack}
        />

        {/* Total Star Banner */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="flex w-full flex-col items-center justify-between gap-6 rounded-[2rem] bg-gradient-to-r from-amber-400 to-orange-500 p-7 text-white shadow-xl sm:flex-row"
        >
          <div className="flex items-center gap-5">
            <span className="text-7xl leading-none" aria-hidden="true">
              ⭐
            </span>
            <div>
              <div className="font-display text-4xl font-bold tabular-nums sm:text-5xl">
                {totalStars} Stars
              </div>
              <p
                dir="rtl"
                lang="fa"
                className="font-persian mt-1 text-xl font-bold text-white/95"
              >
                مجموع ستاره‌های تو
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-2xl bg-white/20 px-5 py-3 text-sm font-bold">
            <span>🎮 Guess: {gameScores.guess}</span>
            <span>🧩 Match: {gameScores.match}</span>
            <span>🎯 Listen: {gameScores.listen}</span>
            <span>🔤 Spell: {gameScores.spell}</span>
          </div>
        </motion.div>

        {/* Badges Heading */}
        <div className="flex w-full items-baseline justify-between">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Badges ({unlockedBadgeIds.length} / {REWARD_BADGES.length})
          </h2>
          <span className="text-sm font-bold text-slate-600 tabular-nums">
            Alphabet Explored: {exploredLettersCount} / 26
          </span>
        </div>

        {/* Badge Grid */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REWARD_BADGES.map((badge, index) => {
            const isUnlocked = unlockedBadgeIds.includes(badge.id);

            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex flex-col items-center rounded-3xl border-4 p-6 text-center shadow-lg transition-all ${
                  isUnlocked
                    ? 'border-amber-300 bg-white'
                    : 'border-slate-200 bg-slate-100/80 opacity-80'
                }`}
              >
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-full text-5xl ${
                    isUnlocked ? 'bg-amber-100' : 'bg-slate-200 grayscale'
                  }`}
                >
                  {isUnlocked ? badge.emoji : <Lock className="h-8 w-8 text-slate-500" />}
                </div>

                <h3 className="font-display mt-4 text-2xl font-bold text-slate-900">
                  {badge.title}
                </h3>
                <p
                  dir="rtl"
                  lang="fa"
                  className="font-persian mt-1 text-base font-bold text-amber-700"
                >
                  {badge.persianTitle}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-600">
                  {badge.description}
                </p>

                <span
                  className={`mt-4 font-display text-sm font-bold ${
                    isUnlocked ? 'text-emerald-600' : 'text-slate-500'
                  }`}
                >
                  {isUnlocked ? 'Unlocked ✓' : 'Locked'}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </FantasyBackground>
  );
}
