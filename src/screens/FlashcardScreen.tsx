import { ChevronLeft, ChevronRight, Grid, Layers, RotateCw, Volume2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { ScreenHeader } from '../components/CelebrationEffects';
import { FantasyBackground } from '../components/FantasyBackground';
import { CATEGORIES, CategoryId } from '../data/vocabulary';
import { playTapPop, speakWord } from '../utils/audio';

interface FlashcardScreenProps {
  categoryId: CategoryId;
  onBack: () => void;
}

export function FlashcardScreen({ categoryId, onBack }: FlashcardScreenProps) {
  const category =
    CATEGORIES.find((item) => item.id === categoryId) ?? CATEGORIES[0];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  const words = category.words;
  const word = words[currentIndex];

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setViewMode('card');
  }, [categoryId]);

  const handlePrevious = () => {
    playTapPop();
    setDirection(-1);
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + words.length) % words.length);
  };

  const handleNext = () => {
    playTapPop();
    setDirection(1);
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % words.length);
  };

  const handleListen = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakWord(word.english);
  };

  const handleCardFlip = () => {
    playTapPop();
    setIsFlipped((prev) => !prev);
  };

  return (
    <FantasyBackground
      theme="flashcards"
      categoryId={category.id}
      className="px-4 py-6 sm:px-8 sm:py-8"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center space-y-5">
        <ScreenHeader
          title={`${category.emoji} ${category.title}`}
          persianSubtitle={category.persianTitle}
          onBack={onBack}
          rightSlot={
            <div className="rounded-2xl bg-white px-4 py-2.5 font-display text-lg font-bold tabular-nums text-slate-700 shadow-md">
              {currentIndex + 1} / {words.length}
            </div>
          }
        />

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 rounded-2xl bg-white/95 p-1.5 shadow-md">
          <button
            type="button"
            onClick={() => {
              playTapPop();
              setViewMode('card');
            }}
            className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 py-2 font-display text-base font-bold transition-colors cursor-pointer ${
              viewMode === 'card'
                ? `${category.buttonBgClass} text-white shadow`
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Flashcard</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playTapPop();
              setViewMode('list');
            }}
            className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 py-2 font-display text-base font-bold transition-colors cursor-pointer ${
              viewMode === 'list'
                ? `${category.buttonBgClass} text-white shadow`
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Grid className="h-4 w-4" />
            <span>All {words.length} Words</span>
          </button>
        </div>

        {viewMode === 'card' ? (
          <>
            {/* 3D Flip Flashcard with Spring Change Animation */}
            <div className="w-full max-w-xl py-2">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={word.id}
                  custom={direction}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.22}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -60) {
                      handleNext();
                    } else if (info.offset.x > 60) {
                      handlePrevious();
                    }
                  }}
                  initial={{
                    opacity: 0,
                    scale: 0.88,
                    x: direction > 0 ? 50 : -50,
                  }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{
                    opacity: 0,
                    scale: 0.88,
                    x: direction > 0 ? -50 : 50,
                  }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  className="perspective-1000 w-full touch-pan-y"
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={handleCardFlip}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCardFlip();
                      }
                    }}
                    className="preserve-3d relative min-h-[390px] w-full cursor-pointer transition-transform duration-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400 rounded-[2rem]"
                    style={{
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                    aria-label={
                      isFlipped
                        ? `Persian translation: ${word.persian}. Tap to flip back.`
                        : `${word.english}. Tap card to flip for Persian translation.`
                    }
                  >
                    {/* Front Face: Emoji + English + Listen */}
                    <div className="backface-hidden absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] bg-white px-8 py-9 text-center shadow-2xl">
                      <div
                        className="mb-5 select-none text-[100px] leading-none"
                        role="img"
                        aria-label={word.english}
                      >
                        {word.emoji}
                      </div>

                      <h2
                        className={`font-display text-[40px] font-bold leading-tight ${category.accentTextClass}`}
                      >
                        {word.english}
                      </h2>

                      <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-slate-400">
                        <RotateCw className="h-4 w-4" />
                        <span>Tap card to reveal Persian</span>
                      </div>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.93 }}
                        onClick={handleListen}
                        className={`mt-6 inline-flex min-h-[58px] items-center gap-3 rounded-2xl px-8 py-3.5 font-display text-2xl font-bold text-white shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400 cursor-pointer ${category.buttonBgClass}`}
                      >
                        <Volume2 className="h-7 w-7" />
                        <span>🔊 Listen</span>
                      </motion.button>
                    </div>

                    {/* Back Face: 3D Flipped RTL Persian Translation */}
                    <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] border-4 border-white bg-gradient-to-br from-white to-amber-50 px-8 py-9 text-center shadow-2xl">
                      <div className="mb-4 select-none text-[82px] leading-none">
                        {word.emoji}
                      </div>

                      <p
                        dir="rtl"
                        lang="fa"
                        className="font-persian text-[38px] font-extrabold text-slate-900"
                      >
                        {word.persian}
                      </p>

                      <p
                        className={`font-display mt-2 text-2xl font-bold ${category.accentTextClass}`}
                      >
                        {word.english}
                      </p>

                      <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-slate-500">
                        <RotateCw className="h-4 w-4" />
                        <span>Tap card to flip back</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Previous & Next Buttons */}
            <div className="flex w-full max-w-xl items-center justify-between gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.93 }}
                onClick={handlePrevious}
                className="flex min-h-[60px] flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-display text-xl font-bold text-slate-800 shadow-lg transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400 cursor-pointer"
              >
                <ChevronLeft className="h-6 w-6" />
                <span>Previous</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.93 }}
                onClick={handleNext}
                className="flex min-h-[60px] flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-display text-xl font-bold text-slate-800 shadow-lg transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="h-6 w-6" />
              </motion.button>
            </div>
          </>
        ) : (
          <div className="grid w-full grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4">
            {words.map((item, idx) => (
              <motion.button
                key={item.id}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  playTapPop();
                  speakWord(item.english);
                  setCurrentIndex(idx);
                }}
                className={`flex flex-col items-center justify-between rounded-3xl border-4 p-4 text-center shadow-md cursor-pointer ${
                  idx === currentIndex
                    ? 'border-sky-400 bg-sky-50'
                    : 'border-white bg-white'
                }`}
              >
                <span className="select-none text-5xl leading-none" aria-hidden="true">
                  {item.emoji}
                </span>
                <span
                  className={`font-display mt-2 text-xl font-bold leading-tight ${category.accentTextClass}`}
                >
                  {item.english}
                </span>
                <span
                  dir="rtl"
                  lang="fa"
                  className="font-persian mt-1 text-base font-bold text-slate-600"
                >
                  {item.persian}
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </FantasyBackground>
  );
}
