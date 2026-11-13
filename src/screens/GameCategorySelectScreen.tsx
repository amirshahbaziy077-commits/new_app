import { motion } from 'motion/react';
import { ScreenHeader } from '../components/CelebrationEffects';
import { FantasyBackground, FantasyTheme } from '../components/FantasyBackground';
import { ALL_WORDS, CATEGORIES, GameCategoryFilter } from '../data/vocabulary';
import { playTapPop } from '../utils/audio';

export type GameKind = 'guess' | 'match' | 'listen' | 'spell';

interface GameCategorySelectScreenProps {
  game: GameKind;
  score: number;
  onSelectCategory: (filter: GameCategoryFilter) => void;
  onBack: () => void;
}

const GAME_META: Record<
  GameKind,
  { title: string; persian: string; theme: FantasyTheme }
> = {
  guess: {
    title: '🎮 Guess the Word',
    persian: 'حدس کلمه',
    theme: 'guess',
  },
  match: {
    title: '🧩 Match the Pairs',
    persian: 'جفت‌ها را پیدا کن',
    theme: 'match',
  },
  listen: {
    title: '🎯 Tap the Right One',
    persian: 'گوش کن و بزن',
    theme: 'listen',
  },
  spell: {
    title: '🔤 Spell the Word',
    persian: 'املای کلمه',
    theme: 'spell',
  },
};

export function GameCategorySelectScreen({
  game,
  score,
  onSelectCategory,
  onBack,
}: GameCategorySelectScreenProps) {
  const meta = GAME_META[game];

  return (
    <FantasyBackground theme={meta.theme} className="px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-4xl flex-col items-center space-y-6">
        <ScreenHeader
          title={meta.title}
          persianSubtitle={meta.persian}
          score={score}
          onBack={onBack}
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="w-full rounded-3xl bg-white px-6 py-5 text-center shadow-lg"
        >
          <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
            Choose a Topic to Play!
          </h2>
          <p
            dir="rtl"
            lang="fa"
            className="font-persian mt-1 text-lg font-bold text-slate-600"
          >
            یک موضوع برای بازی انتخاب کن!
          </p>
        </motion.div>

        {/* 5 Category Options */}
        <div className="grid w-full grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3">
          {CATEGORIES.map((category, index) => (
            <motion.button
              key={category.id}
              type="button"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: index * 0.04,
                type: 'spring',
                stiffness: 320,
                damping: 20,
              }}
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => {
                playTapPop();
                onSelectCategory(category.id);
              }}
              className={`flex min-h-[172px] flex-col items-center justify-center gap-2 rounded-3xl bg-gradient-to-br ${category.cardGradient} p-5 text-white shadow-lg transition-shadow hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500 cursor-pointer`}
            >
              <motion.span
                animate={{ y: [-4, 4, -4] }}
                transition={{
                  duration: 2.3 + index * 0.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="text-5xl leading-none drop-shadow-sm sm:text-6xl"
                aria-hidden="true"
              >
                {category.emoji}
              </motion.span>
              <span className="font-display text-2xl font-bold">
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
                {category.words.length} words · 30 rounds
              </span>
            </motion.button>
          ))}

          {/* 6th Option: All Words Challenge Mode */}
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.22,
              type: 'spring',
              stiffness: 320,
              damping: 20,
            }}
            whileHover={{ scale: 1.04, y: -3 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => {
              playTapPop();
              onSelectCategory('all');
            }}
            className="flex min-h-[172px] flex-col items-center justify-center gap-2 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-5 text-white shadow-lg transition-shadow hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500 cursor-pointer"
          >
            <motion.span
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="text-5xl leading-none drop-shadow-sm sm:text-6xl"
              aria-hidden="true"
            >
              🌟
            </motion.span>
            <span className="font-display text-2xl font-bold">All Words</span>
            <span
              dir="rtl"
              lang="fa"
              className="font-persian text-lg font-bold text-white/95"
            >
              همه کلمات
            </span>
            <span className="text-xs font-bold text-white/90 tabular-nums">
              {ALL_WORDS.length} words · Challenge
            </span>
          </motion.button>
        </div>
      </div>
    </FantasyBackground>
  );
}
