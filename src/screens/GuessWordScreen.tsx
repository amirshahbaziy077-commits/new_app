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

interface GuessWordScreenProps {
  categoryFilter: GameCategoryFilter;
  score: number;
  onAddScore: (delta: number) => void;
  onBack: () => void;
  onGoHome: () => void;
}

interface QuestionRound {
  target: WordItem;
  options: WordItem[];
}

const TOTAL_ROUNDS = 30;

function createSessionQuestions(categoryFilter: GameCategoryFilter): QuestionRound[] {
  const pool = getVocabularyPool(categoryFilter);
  const chosenWords = shuffleArray(pool).slice(0, TOTAL_ROUNDS);
  return chosenWords.map((target) => {
    const distractors = shuffleArray(
      pool.filter((w) => w.id !== target.id)
    ).slice(0, 3);
    return {
      target,
      options: shuffleArray([target, ...distractors]),
    };
  });
}

export function GuessWordScreen({
  categoryFilter,
  score,
  onAddScore,
  onBack,
  onGoHome,
}: GuessWordScreenProps) {
  const topicMeta = getCategoryFilterLabel(categoryFilter);
  const [questions, setQuestions] = useState<QuestionRound[]>(() =>
    createSessionQuestions(categoryFilter)
  );
  const [roundIndex, setRoundIndex] = useState(0);
  const [sessionStars, setSessionStars] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [shakingId, setShakingId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [showStar, setShowStar] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const round = questions[roundIndex];

  const startNewGame = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    setQuestions(createSessionQuestions(categoryFilter));
    setRoundIndex(0);
    setSessionStars(0);
    setSelectedId(null);
    setWrongIds([]);
    setShakingId(null);
    setFeedbackMessage(null);
    setShowStar(false);
    setIsGameComplete(false);
  }, [categoryFilter]);

  const handleOptionClick = (option: WordItem) => {
    if (selectedId === round.target.id || isGameComplete) return;

    if (option.id === round.target.id) {
      setSelectedId(option.id);
      setFeedbackMessage(null);
      setShakingId(null);
      playCorrectDing();
      speakWord(round.target.english);
      onAddScore(1);
      setSessionStars((prev) => prev + 1);
      setShowStar(true);

      timerRef.current = window.setTimeout(() => {
        setShowStar(false);
        if (roundIndex + 1 >= TOTAL_ROUNDS) {
          setIsGameComplete(true);
          playWinFanfare();
        } else {
          setRoundIndex((prev) => prev + 1);
          setSelectedId(null);
          setWrongIds([]);
        }
      }, 950);
    } else {
      if (!wrongIds.includes(option.id)) {
        setWrongIds((prev) => [...prev, option.id]);
      }
      setShakingId(option.id);
      setFeedbackMessage('Try again!');
      playWrongTone();
      window.setTimeout(() => {
        setShakingId((prev) => (prev === option.id ? null : prev));
      }, 480);
    }
  };

  const completedRounds = isGameComplete ? TOTAL_ROUNDS : roundIndex;
  const progressPercent = (completedRounds / TOTAL_ROUNDS) * 100;

  return (
    <FantasyBackground theme="guess" className="px-4 py-6 sm:px-8 sm:py-8">
      <ConfettiBurst active={isGameComplete} />
      <StarPop visible={showStar} label="Awesome! +1 ⭐" />

      <div className="mx-auto flex max-w-3xl flex-col items-center space-y-6">
        <ScreenHeader
          title="🎮 Guess the Word"
          persianSubtitle="حدس کلمه"
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
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500"
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
            <h2 className="font-display mt-4 text-4xl font-bold text-violet-700">
              You Win!
            </h2>
            <p
              dir="rtl"
              lang="fa"
              className="font-persian mt-2 text-2xl font-bold text-slate-700"
            >
              آفرین! هر ۳۰ مرحله را تمام کردی!
            </p>
            <div className="mt-5 rounded-2xl bg-amber-50 px-6 py-3 font-display text-2xl font-bold text-amber-700">
              Final Score: {sessionStars} / {TOTAL_ROUNDS} · ⭐ +{sessionStars}
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                onClick={startNewGame}
                className="min-h-[56px] rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-8 py-3.5 font-display text-2xl font-bold text-white shadow-lg cursor-pointer"
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
          <div className="w-full max-w-xl space-y-6">
            <motion.div
              key={round.target.id}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20 }}
              className="flex flex-col items-center rounded-[2rem] bg-white px-8 py-8 shadow-xl"
            >
              <span
                className="select-none text-[104px] leading-none"
                role="img"
                aria-label="Guess this word"
              >
                {round.target.emoji}
              </span>
              <p className="mt-4 font-display text-xl font-bold text-slate-600">
                Which English word matches this?
              </p>
            </motion.div>

            <div className="flex min-h-[36px] items-center justify-center">
              {feedbackMessage && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-2xl bg-rose-100 px-5 py-2 font-display text-xl font-bold text-rose-700"
                >
                  {feedbackMessage}
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {round.options.map((option) => {
                const isCorrectSelected =
                  selectedId === option.id && option.id === round.target.id;
                const isWrongSelected = wrongIds.includes(option.id);
                const isShaking = shakingId === option.id;

                let buttonStyles =
                  'bg-white text-slate-900 hover:bg-violet-50 border-2 border-violet-200';
                if (isCorrectSelected) {
                  buttonStyles =
                    'bg-emerald-500 text-white border-2 border-emerald-600';
                } else if (isWrongSelected) {
                  buttonStyles =
                    'bg-rose-500 text-white border-2 border-rose-600';
                }

                return (
                  <motion.button
                    key={option.id}
                    type="button"
                    whileHover={
                      !isCorrectSelected && !isWrongSelected
                        ? { scale: 1.03 }
                        : undefined
                    }
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleOptionClick(option)}
                    className={`min-h-[76px] rounded-3xl px-6 py-4 font-display text-2xl font-bold shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400 cursor-pointer sm:text-3xl ${buttonStyles} ${
                      isShaking ? 'animate-kid-shake' : ''
                    }`}
                  >
                    {option.english}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </FantasyBackground>
  );
}
