import { Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { ScreenHeader } from '../components/CelebrationEffects';
import { FantasyBackground } from '../components/FantasyBackground';
import { ALPHABET_ITEMS, AlphabetItem } from '../data/vocabulary';
import { playTapPop, speakAlphabetItem } from '../utils/audio';

interface AlphabetScreenProps {
  exploredLetters: string[];
  onExploreLetter: (letter: string) => void;
  onBack: () => void;
}

export function AlphabetScreen({
  exploredLetters,
  onExploreLetter,
  onBack,
}: AlphabetScreenProps) {
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const handleTap = (item: AlphabetItem) => {
    playTapPop();
    setActiveLetter(item.letter);
    speakAlphabetItem(item.letter, item.word);
    onExploreLetter(item.letter);
  };

  return (
    <FantasyBackground theme="alphabet" className="px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center space-y-6">
        <ScreenHeader
          title="🔤 Alphabet A–Z"
          persianSubtitle="الفبای انگلیسی"
          onBack={onBack}
          rightSlot={
            <div className="rounded-2xl bg-white px-4 py-2.5 font-display text-base font-bold tabular-nums text-indigo-700 shadow-md">
              {exploredLetters.length} / 26
            </div>
          }
        />

        <div className="flex w-full items-center justify-between rounded-2xl bg-white/95 px-5 py-3 shadow-md">
          <p className="font-display text-lg font-bold text-slate-800">
            Tap any letter to hear its sound and word!
          </p>
          <span
            dir="rtl"
            lang="fa"
            className="font-persian hidden text-base font-bold text-slate-600 sm:inline"
          >
            روی هر حرف بزن تا صدایش را بشنوی
          </span>
        </div>

        {/* Scrollable A–Z Grid */}
        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {ALPHABET_ITEMS.map((item, idx) => {
            const isActive = activeLetter === item.letter;
            const isExplored = exploredLetters.includes(item.letter);

            return (
              <motion.button
                key={item.letter}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.015, 0.3) }}
                whileHover={{ scale: 1.04, y: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTap(item)}
                className={`relative flex flex-col items-center justify-between rounded-3xl border-4 p-4 text-center shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400 cursor-pointer ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-50'
                    : isExplored
                    ? 'border-emerald-200 bg-white'
                    : 'border-white bg-white hover:border-sky-200'
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-display text-3xl font-bold text-indigo-600">
                    {item.pair}
                  </span>
                  <Volume2 className="h-5 w-5 text-sky-500" />
                </div>

                <span
                  className="my-2 select-none text-5xl leading-none"
                  role="img"
                  aria-label={item.word}
                >
                  {item.emoji}
                </span>

                <div className="space-y-0.5">
                  <div className="font-display text-xl font-bold text-slate-900">
                    {item.word}
                  </div>
                  <div
                    dir="rtl"
                    lang="fa"
                    className="font-persian text-base font-bold text-slate-600"
                  >
                    {item.persian}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </FantasyBackground>
  );
}
