import { Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ConfettiBurst,
  ScreenHeader,
  StarPop,
} from '../components/CelebrationEffects';
import { FantasyBackground } from '../components/FantasyBackground';
import {
  GameCategoryFilter,
  getCategoryFilterLabel,
  getVocabularyPool,
  shuffleArray,
  WordItem,
} from '../data/vocabulary';
import {
  playCorrectDing,
  playWinFanfare,
  playWrongTone,
  speakWord,
} from '../utils/audio';

interface TapRightOneScreenProps {
  categoryFilter: GameCategoryFilter;
  score: number;
  onAddScore: (delta: number) => void;
  onBack: () => void;
  onGoHome: () => void;
}

interface ListenRound {
  target: WordItem;
  options: WordItem[];
}

const TOTAL_ROUNDS = 30;

function createListenSession(categoryFilter: GameCategoryFilter): ListenRound[] {
  const pool = getVocabularyPool(categoryFilter);
  const chosen = shuffleArray(pool).slice(0, TOTAL_ROUNDS);
  return chosen.map((target) => {
    const distractors = shuffleArray(
      pool.filter((w) => w.id !== target.id)
    ).slice(0, 3);
    return {
      target,
      options: shuffleArray([target, ...distractors]),
    };
  });
}

export function TapRightOneScreen({
  categoryFilter,
  score,
  onAddScore,
  onBack,
  onGoHome,
}: TapRightOneScreenProps) {
  const topicMeta = getCategoryFilterLabel(categoryFilter);
  const [rounds, setRounds] = useState<ListenRound[]>(() =>
    createListenSession(categoryFilter)
  );
  const [roundIndex, setRoundIndex] = useState(0);
  const [sessionStars, setSessionStars] = useState(0);
  const [correctId, setCorrectId] = useState<string | null>(null);
  const [shakingId, setShakingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showStar, setShowStar] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);

  const timerRef = useRef<number | null>(null);
  const round = rounds[roundIndex];

  useEffect(() => {
    if (isGameComplete) return;
    const speakTimer = window.setTimeout(() => {
      speakWord(round.target.english);
    }, 220);

    return () => {
      window.clearTimeout(speakTimer);
    };
  }, [round, isGameComplete]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleHearAgain = useCallback(() => {
    speakWord(round.target.english);
  }, [round.target.english]);

  const handleRestart = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    setRounds(createListenSession(categoryFilter));
    setRoundIndex(0);
    setSessionStars(0);
    setCorrectId(null);
    setShakingId(null);
    setFeedback(null);
    setShowStar(false);
    setIsGameComplete(false);
  }, [categoryFilter]);

  const handleOptionTap = (option: WordItem) => {
    if (correctId || isGameComplete) return;

    if (option.id === round.target.id) {
      setCorrectId(option.id);
      setFeedback(null);
      setShakingId(null);
      playCorrectDing();
      speakWord(round.target.english);
      onAddScore(1);
      setSessionStars((prev) => prev + 1);
      setShowStar(true);

      timerRef.current = window.setTimeout(() => {
        setShowStar(false);
        setCorrectId(null);
        if (roundIndex + 1 >= TOTAL_ROUNDS) {
          setIsGameComplete(true);
          playWinFanfare();
        } else {
          setRoundIndex((prev) => prev + 1);
        }
      }, 1050);
    } else {
      setShakingId(option.id);
      setFeedback('Try again');
      playWrongTone();
      window.setTimeout(() => {
        setShakingId((prev) => (prev === option.id ? null : prev));
      }, 500);
    }
  };

  const completedRounds = isGameComplete ? TOTAL_ROUNDS : roundIndex;
  const progressPercent = (completedRounds / TOTAL_ROUNDS) * 100;

  return (
    <FantasyBackground theme="listen" className="px-4 py-6 sm:px-8 sm:py-8">
      <ConfettiBurst active={isGameComplete} />
      <StarPop visible={showStar} label={`${round.target.english}! +1 ⭐`} />

      <div className="mx-auto flex max-w-3xl flex-col items-center space-y-6">
        <ScreenHeader
          title="🎯 Tap the Right One"
          persianSubtitle="گوش کن و درست را انتخاب کن"
          score={score}
          onBack={onBack}
        />

        <div className="w-full max-w-xl space-y-2">
          <div className="flex items-center justify-between text-base font-bold text-slate-700">
            <span>
              Round · {topicMeta.emoji} {topicMeta.title}
            </span>
            <span className="tabular-nums">
              {Math.min(roundIndex + 1, TOTAL_ROUNDS)} / {TOTAL_ROUNDS}
            </span>
          </div>
          <div className="h-5 w-full overflow-hidden rounded-full bg-white p-1 shadow-inner">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            />
          </div>
        </div>

        {isGameComplete ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="flex w-full max-w-xl flex-col items-center rounded-[2rem] bg-white p-10 text-center shadow-2xl"
          >
            <span className="text-[90px] leading-none" aria-hidden="true">
              🏆
            </span>
            <h2 className="font-display mt-4 text-4xl font-bold text-sky-700">
              You Win!
            </h2>
            <p
              dir="rtl"
              lang="fa"
              className="font-persian mt-2 text-2xl font-bold text-slate-700"
            >
              آفرین! هر ۳۰ کلمه شنیداری را انجام دادی!
            </p>
            <div className="mt-5 rounded-2xl bg-amber-50 px-6 py-3 font-display text-2xl font-bold text-amber-700">
              Final Score: {sessionStars} / {TOTAL_ROUNDS} · ⭐ +{sessionStars}
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleRestart}
                className="min-h-[56px] rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-3.5 font-display text-2xl font-bold text-white shadow-lg cursor-pointer"
              >
                Play Again
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                onClick={onGoHome}
                className="min-h-[56px] rounded-2xl bg-slate-100 px-8 py-3.5 font-display text-2xl font-bold text-slate-800 shadow cursor-pointer"
              >
                Home
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="flex w-full max-w-xl flex-col items-center rounded-[2rem] bg-white px-8 py-7 text-center shadow-xl">
              <p className="font-display text-2xl font-bold text-slate-800">
                Listen carefully and tap the matching emoji!
              </p>
              <p
                dir="rtl"
                lang="fa"
                className="font-persian mt-1 text-lg font-bold text-slate-600"
              >
                گوش بده و شکلک درست را لمس کن
              </p>

              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleHearAgain}
                className="mt-5 inline-flex min-h-[60px] items-center gap-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-4 font-display text-2xl font-bold text-white shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400 cursor-pointer"
              >
                <Volume2 className="h-7 w-7" />
                <span>🔊 Hear Again</span>
              </motion.button>
            </div>

            <div className="flex min-h-[40px] items-center justify-center">
              {feedback && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-2xl bg-rose-100 px-6 py-2 font-display text-xl font-bold text-rose-700"
                >
                  {feedback}
                </motion.div>
              )}
            </div>

            <div className="grid w-full max-w-2xl grid-cols-2 gap-4 sm:gap-5">
              {round.options.map((option) => {
                const isCorrect = correctId === option.id;
                const isShaking = shakingId === option.id;

                return (
                  <motion.button
                    key={option.id}
                    type="button"
                    whileHover={!correctId ? { scale: 1.04, y: -4 } : undefined}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleOptionTap(option)}
                    className={`flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-[2rem] border-4 p-6 shadow-xl transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400 cursor-pointer ${
                      isCorrect
                        ? 'border-emerald-500 bg-emerald-100'
                        : isShaking
                        ? 'border-rose-400 bg-rose-50 animate-kid-shake'
                        : 'border-white bg-white hover:border-sky-200'
                    }`}
                    aria-label={`Option ${option.english}`}
                  >
                    <span className="select-none text-[88px] leading-none">
                      {option.emoji}
                    </span>
                    {isCorrect && (
                      <span className="font-display text-2xl font-bold text-emerald-700">
                        {option.english} ✓
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </FantasyBackground>
  );
}
