import { Clock, Eraser, RotateCcw, Trophy, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ConfettiBurst,
  ScreenHeader,
  StarPop,
} from '../components/CelebrationEffects';
import { FantasyBackground } from '../components/FantasyBackground';
import {
  ALL_WORDS,
  getCategoryFilterLabel,
  shuffleArray,
  WordItem,
} from '../data/vocabulary';
import {
  playCorrectDing,
  playTapPop,
  playWinFanfare,
  playWrongTone,
  speakWord,
} from '../utils/audio';

interface ChallengeModeScreenProps {
  totalStars: number;
  bestScore: number;
  onAddChallengeStars: (delta: number) => void;
  onUpdateBestScore: (score: number) => void;
  onBack: () => void;
}

type ChallengeQuestion =
  | {
      kind: 'persian-choice';
      word: WordItem;
      options: WordItem[];
    }
  | {
      kind: 'scramble';
      word: WordItem;
    }
  | {
      kind: 'audio-emoji';
      word: WordItem;
      options: WordItem[];
    }
  | {
      kind: 'missing-letter';
      word: WordItem;
      missingIndex: number;
      missingChar: string;
      letterOptions: string[];
    };

type ChallengeQuestionKind = ChallengeQuestion['kind'];

interface LetterTile {
  uid: string;
  char: string;
  used: boolean;
}

const TOTAL_QUESTIONS = 10;
const TIME_LIMIT_SECONDS = 120;
const PERFECT_BONUS_STARS = 5;
const ALPHABET_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function pickFourWordOptions(
  target: WordItem,
  requireDistinctEmoji: boolean
): WordItem[] {
  const sameCategory = shuffleArray(
    ALL_WORDS.filter(
      (w) =>
        w.id !== target.id &&
        w.categoryId === target.categoryId &&
        w.english.toLowerCase() !== target.english.toLowerCase()
    )
  );
  const otherWords = shuffleArray(
    ALL_WORDS.filter(
      (w) =>
        w.id !== target.id &&
        w.categoryId !== target.categoryId &&
        w.english.toLowerCase() !== target.english.toLowerCase()
    )
  );

  const distractors: WordItem[] = [];
  const seenEnglish = new Set<string>([target.english.toLowerCase()]);
  const seenEmojis = new Set<string>([target.emoji]);

  for (const candidate of [...sameCategory, ...otherWords]) {
    const enKey = candidate.english.toLowerCase();
    if (seenEnglish.has(enKey)) continue;
    if (requireDistinctEmoji && seenEmojis.has(candidate.emoji)) continue;
    seenEnglish.add(enKey);
    seenEmojis.add(candidate.emoji);
    distractors.push(candidate);
    if (distractors.length === 3) break;
  }

  return shuffleArray([target, ...distractors]);
}

function buildMissingLetterData(word: WordItem): {
  missingIndex: number;
  missingChar: string;
  letterOptions: string[];
} {
  const upper = word.english.toUpperCase();
  const interiorIndices = Array.from(
    { length: Math.max(0, upper.length - 2) },
    (_, i) => i + 1
  );
  const fallbackIndices = Array.from({ length: upper.length }, (_, i) => i);
  const candidateIndices =
    interiorIndices.length > 0 ? interiorIndices : fallbackIndices;
  const missingIndex =
    candidateIndices[Math.floor(Math.random() * candidateIndices.length)];
  const missingChar = upper[missingIndex];

  const wrongLetters = shuffleArray(
    ALPHABET_LETTERS.filter((ch) => ch !== missingChar)
  ).slice(0, 2);

  return {
    missingIndex,
    missingChar,
    letterOptions: shuffleArray([missingChar, ...wrongLetters]),
  };
}

function buildChallengeQuestions(): ChallengeQuestion[] {
  const baseKinds: ChallengeQuestionKind[] = [
    'persian-choice',
    'scramble',
    'audio-emoji',
    'missing-letter',
  ];
  const extraKinds = shuffleArray([...baseKinds]).slice(0, 2);
  const plannedKinds = shuffleArray([
    ...baseKinds,
    ...baseKinds,
    ...extraKinds,
  ]);

  const emojiCounts = new Map<string, number>();
  for (const w of ALL_WORDS) {
    emojiCounts.set(w.emoji, (emojiCounts.get(w.emoji) ?? 0) + 1);
  }

  const singleWordPool = shuffleArray(
    ALL_WORDS.filter((w) => /^[A-Za-z]{4,10}$/.test(w.english))
  );
  const singleWordFallbackPool = shuffleArray(
    ALL_WORDS.filter((w) => /^[A-Za-z]{3,10}$/.test(w.english))
  );
  const uniqueEmojiPool = shuffleArray(
    ALL_WORDS.filter((w) => (emojiCounts.get(w.emoji) ?? 0) === 1)
  );
  const generalPool = shuffleArray([...ALL_WORDS]);

  const usedWordIds = new Set<string>();

  const takeWordFrom = (pools: WordItem[][]): WordItem => {
    for (const pool of pools) {
      const found = pool.find((w) => !usedWordIds.has(w.id));
      if (found) {
        usedWordIds.add(found.id);
        return found;
      }
    }
    const fallback = ALL_WORDS.find((w) => !usedWordIds.has(w.id)) ?? ALL_WORDS[0];
    usedWordIds.add(fallback.id);
    return fallback;
  };

  return plannedKinds.slice(0, TOTAL_QUESTIONS).map((kind): ChallengeQuestion => {
    if (kind === 'scramble') {
      const target = takeWordFrom([singleWordPool, singleWordFallbackPool]);
      return {
        kind: 'scramble',
        word: target,
      };
    }

    if (kind === 'missing-letter') {
      const target = takeWordFrom([singleWordPool, singleWordFallbackPool]);
      const missingData = buildMissingLetterData(target);
      return {
        kind: 'missing-letter',
        word: target,
        ...missingData,
      };
    }

    if (kind === 'audio-emoji') {
      const target = takeWordFrom([uniqueEmojiPool, generalPool]);
      return {
        kind: 'audio-emoji',
        word: target,
        options: pickFourWordOptions(target, true),
      };
    }

    const target = takeWordFrom([generalPool]);
    return {
      kind: 'persian-choice',
      word: target,
      options: pickFourWordOptions(target, false),
    };
  });
}

function buildScrambledTiles(word: string): LetterTile[] {
  const upper = word.toUpperCase();
  const letters = upper.split('');
  let shuffled = shuffleArray(letters);

  if (letters.length > 1 && shuffled.join('') === upper) {
    shuffled = [...letters.slice(1), letters[0]];
  }

  return shuffled.map((char, idx) => ({
    uid: `${idx}-${char}-${Math.random().toString(36).slice(2, 6)}`,
    char,
    used: false,
  }));
}

function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

interface TierOutcome {
  emoji: string;
  headline: string;
  persianNote: string;
  accentClass: string;
}

function getTierOutcome(score: number): TierOutcome {
  switch (score) {
    case 10:
      return {
        emoji: '🏆',
        headline: 'Champion! 10 / 10!',
        persianNote: 'فوق‌العاده! قهرمان سوالات سخت شدی! (+۵ ستاره جایزه)',
        accentClass: 'text-red-600',
      };
    case 9:
      return {
        emoji: '🌟',
        headline: 'Amazing Job!',
        persianNote: 'عالی بود! فقط یک قدم تا نمره کامل!',
        accentClass: 'text-amber-600',
      };
    case 8:
      return {
        emoji: '😃',
        headline: 'Great Work!',
        persianNote: 'آفرین! خیلی خوب جواب دادی!',
        accentClass: 'text-emerald-600',
      };
    case 7:
      return {
        emoji: '😊',
        headline: 'Nice Effort!',
        persianNote: 'خوب بود! ادامه بده!',
        accentClass: 'text-sky-600',
      };
    case 6:
      return {
        emoji: '😐',
        headline: 'Not Bad!',
        persianNote: 'بد نبود، دفعه بعد بهتر می‌شی!',
        accentClass: 'text-indigo-600',
      };
    case 5:
      return {
        emoji: '🫤',
        headline: 'Halfway There!',
        persianNote: 'نصف سوال‌ها رو درست زدی، تمرین بیشتر کن!',
        accentClass: 'text-amber-700',
      };
    case 4:
      return {
        emoji: '😕',
        headline: 'Keep Practicing!',
        persianNote: 'می‌تونی خیلی بهتر از این بشی!',
        accentClass: 'text-orange-600',
      };
    case 3:
      return {
        emoji: '😢',
        headline: 'Tricky Challenge!',
        persianNote: 'سوالات سخت بودن، دوباره امتحان کن!',
        accentClass: 'text-rose-600',
      };
    case 2:
      return {
        emoji: '🥺',
        headline: 'Almost Got It!',
        persianNote: 'ناامید نشو، یه بار دیگه بازی کن!',
        accentClass: 'text-rose-600',
      };
    case 1:
      return {
        emoji: '🫠',
        headline: 'Tough Round!',
        persianNote: 'کلمه‌ها رو مرور کن و دوباره برگرد!',
        accentClass: 'text-rose-700',
      };
    default:
      return {
        emoji: '💪',
        headline: 'Keep Going!',
        persianNote: 'بیشتر تلاش کن',
        accentClass: 'text-rose-700',
      };
  }
}

function RedTrophyEmblem() {
  return (
    <motion.div
      animate={{ scale: [1, 1.09, 1], y: [0, -8, 0] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      className="relative flex h-36 w-36 items-center justify-center"
      aria-label="Red Trophy"
    >
      <motion.div
        animate={{ opacity: [0.45, 0.85, 0.45], scale: [0.95, 1.15, 0.95] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-full bg-gradient-to-br from-red-400 via-rose-500 to-amber-300 blur-xl"
      />
      <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-red-500 via-rose-600 to-red-700 shadow-2xl ring-4 ring-red-200">
        <svg
          viewBox="0 0 80 80"
          className="h-22 w-22 drop-shadow-md"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="redCupGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FCA5A5" />
              <stop offset="40%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#991B1B" />
            </linearGradient>
          </defs>
          {/* Left Handle */}
          <path
            d="M20 20 C10 20 9 36 22 39"
            fill="none"
            stroke="#FECACA"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          {/* Right Handle */}
          <path
            d="M60 20 C70 20 71 36 58 39"
            fill="none"
            stroke="#FECACA"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          {/* Trophy Cup Body */}
          <path
            d="M21 15 H59 V31 C59 44 50 52 40 52 C30 52 21 44 21 31 Z"
            fill="url(#redCupGrad)"
            stroke="#FEE2E2"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Stem & Base */}
          <rect x="35" y="51" width="10" height="10" rx="2" fill="#FECACA" />
          <rect
            x="25"
            y="60"
            width="30"
            height="8"
            rx="4"
            fill="#FEF2F2"
            stroke="#DC2626"
            strokeWidth="2"
          />
          {/* Star Shine */}
          <text
            x="40"
            y="38"
            textAnchor="middle"
            fontSize="16"
            fill="#FEF08A"
          >
            ★
          </text>
        </svg>
        <span
          className="absolute -bottom-1 -right-1 text-3xl leading-none drop-shadow"
          aria-hidden="true"
        >
          🏆
        </span>
      </div>
    </motion.div>
  );
}

export function ChallengeModeScreen({
  totalStars,
  bestScore,
  onAddChallengeStars,
  onUpdateBestScore,
  onBack,
}: ChallengeModeScreenProps) {
  const [attemptId, setAttemptId] = useState(0);
  const [questions, setQuestions] = useState<ChallengeQuestion[]>(() =>
    buildChallengeQuestions()
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [challengeScore, setChallengeScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS);
  const [isFinished, setIsFinished] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [bonusAwarded, setBonusAwarded] = useState(false);

  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [roundOutcome, setRoundOutcome] = useState<'idle' | 'correct' | 'wrong'>(
    'idle'
  );
  const [showStar, setShowStar] = useState(false);

  const currentQuestion = questions[questionIndex];
  const [tiles, setTiles] = useState<LetterTile[]>(() =>
    currentQuestion.kind === 'scramble'
      ? buildScrambledTiles(currentQuestion.word.english)
      : []
  );
  const [placedTileUids, setPlacedTileUids] = useState<(string | null)[]>(() =>
    currentQuestion.kind === 'scramble'
      ? Array(currentQuestion.word.english.length).fill(null)
      : []
  );

  const advanceTimerRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const bestScoreRef = useRef(bestScore);

  useEffect(() => {
    bestScoreRef.current = bestScore;
  }, [bestScore]);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  const finishChallenge = useCallback(
    (finalScore: number, timedOut: boolean) => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = null;
      }
      setIsTimeUp(timedOut);
      setIsFinished(true);
      setShowStar(false);

      if (finalScore > bestScoreRef.current) {
        setIsNewRecord(true);
        onUpdateBestScore(finalScore);
      }

      if (!timedOut && finalScore === TOTAL_QUESTIONS) {
        setBonusAwarded(true);
        onAddChallengeStars(PERFECT_BONUS_STARS);
        playWinFanfare();
      } else if (timedOut) {
        playWrongTone();
      } else if (finalScore >= 7) {
        playWinFanfare();
      } else {
        playTapPop();
      }
    },
    [onAddChallengeStars, onUpdateBestScore]
  );

  // 2-minute countdown timer
  useEffect(() => {
    if (isFinished) return;

    const intervalId = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(intervalId);
          finishChallenge(scoreRef.current, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isFinished, finishChallenge]);

  // Auto-play English audio on Audio Recognition questions
  useEffect(() => {
    if (isFinished || isTimeUp || timeLeft <= 0) return;
    if (currentQuestion.kind !== 'audio-emoji') return;
    const timer = window.setTimeout(() => {
      speakWord(currentQuestion.word.english);
    }, 220);
    return () => window.clearTimeout(timer);
  }, [attemptId, questionIndex, isFinished, isTimeUp, currentQuestion]);

  const setupQuestionState = useCallback((q: ChallengeQuestion) => {
    setSelectedChoiceId(null);
    setSelectedLetter(null);
    setRoundOutcome('idle');
    setShowStar(false);
    if (q.kind === 'scramble') {
      setTiles(buildScrambledTiles(q.word.english));
      setPlacedTileUids(Array(q.word.english.length).fill(null));
    } else {
      setTiles([]);
      setPlacedTileUids([]);
    }
  }, []);

  const handleRestart = () => {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    playTapPop();
    const fresh = buildChallengeQuestions();
    scoreRef.current = 0;
    setAttemptId((prev) => prev + 1);
    setQuestions(fresh);
    setQuestionIndex(0);
    setChallengeScore(0);
    setTimeLeft(TIME_LIMIT_SECONDS);
    setIsFinished(false);
    setIsTimeUp(false);
    setIsNewRecord(false);
    setBonusAwarded(false);
    setupQuestionState(fresh[0]);
  };

  const advanceAfterQuestion = (updatedScore: number) => {
    advanceTimerRef.current = window.setTimeout(() => {
      setShowStar(false);
      if (questionIndex + 1 >= TOTAL_QUESTIONS) {
        finishChallenge(updatedScore, false);
      } else {
        const nextIdx = questionIndex + 1;
        setQuestionIndex(nextIdx);
        setupQuestionState(questions[nextIdx]);
      }
    }, 950);
  };

  const handleChoicePick = (option: WordItem) => {
    if (
      isFinished ||
      isTimeUp ||
      timeLeft <= 0 ||
      roundOutcome !== 'idle' ||
      (currentQuestion.kind !== 'persian-choice' &&
        currentQuestion.kind !== 'audio-emoji')
    ) {
      return;
    }

    setSelectedChoiceId(option.id);
    const isCorrect = option.id === currentQuestion.word.id;

    if (isCorrect) {
      const nextScore = scoreRef.current + 1;
      scoreRef.current = nextScore;
      setChallengeScore(nextScore);
      setRoundOutcome('correct');
      setShowStar(true);
      playCorrectDing();
      speakWord(currentQuestion.word.english);
      onAddChallengeStars(1);
      advanceAfterQuestion(nextScore);
    } else {
      setRoundOutcome('wrong');
      playWrongTone();
      advanceAfterQuestion(scoreRef.current);
    }
  };

  const handleMissingLetterPick = (letter: string) => {
    if (
      isFinished ||
      isTimeUp ||
      timeLeft <= 0 ||
      roundOutcome !== 'idle' ||
      currentQuestion.kind !== 'missing-letter'
    ) {
      return;
    }

    setSelectedLetter(letter);
    const isCorrect = letter === currentQuestion.missingChar;

    if (isCorrect) {
      const nextScore = scoreRef.current + 1;
      scoreRef.current = nextScore;
      setChallengeScore(nextScore);
      setRoundOutcome('correct');
      setShowStar(true);
      playCorrectDing();
      speakWord(currentQuestion.word.english);
      onAddChallengeStars(1);
      advanceAfterQuestion(nextScore);
    } else {
      setRoundOutcome('wrong');
      playWrongTone();
      advanceAfterQuestion(scoreRef.current);
    }
  };

  const handleTileTap = (tile: LetterTile) => {
    if (
      isFinished ||
      isTimeUp ||
      timeLeft <= 0 ||
      tile.used ||
      roundOutcome !== 'idle' ||
      currentQuestion.kind !== 'scramble'
    ) {
      return;
    }

    const emptySlot = placedTileUids.findIndex((u) => u === null);
    if (emptySlot === -1) return;

    playTapPop();
    const updatedTiles = tiles.map((t) =>
      t.uid === tile.uid ? { ...t, used: true } : t
    );
    const updatedBoxes = [...placedTileUids];
    updatedBoxes[emptySlot] = tile.uid;

    setTiles(updatedTiles);
    setPlacedTileUids(updatedBoxes);

    if (updatedBoxes.every((u) => u !== null)) {
      const assembled = updatedBoxes
        .map((uid) => updatedTiles.find((t) => t.uid === uid)?.char ?? '')
        .join('');

      if (assembled === currentQuestion.word.english.toUpperCase()) {
        const nextScore = scoreRef.current + 1;
        scoreRef.current = nextScore;
        setChallengeScore(nextScore);
        setRoundOutcome('correct');
        setShowStar(true);
        playCorrectDing();
        speakWord(currentQuestion.word.english);
        onAddChallengeStars(1);
        advanceAfterQuestion(nextScore);
      } else {
        setRoundOutcome('wrong');
        playWrongTone();
        advanceAfterQuestion(scoreRef.current);
      }
    }
  };

  const handleBoxTap = (boxIndex: number) => {
    if (isFinished || isTimeUp || timeLeft <= 0 || roundOutcome !== 'idle') {
      return;
    }
    const uid = placedTileUids[boxIndex];
    if (!uid) return;

    playTapPop();
    setPlacedTileUids((prev) => {
      const next = [...prev];
      next[boxIndex] = null;
      return next;
    });
    setTiles((prev) =>
      prev.map((t) => (t.uid === uid ? { ...t, used: false } : t))
    );
  };

  const handleClearScramble = () => {
    if (
      isFinished ||
      isTimeUp ||
      timeLeft <= 0 ||
      roundOutcome !== 'idle' ||
      currentQuestion.kind !== 'scramble'
    ) {
      return;
    }
    playTapPop();
    setTiles((prev) => prev.map((t) => ({ ...t, used: false })));
    setPlacedTileUids(Array(currentQuestion.word.english.length).fill(null));
  };

  const controlsDisabled = isFinished || isTimeUp || timeLeft <= 0;
  const displayedBest = Math.max(bestScore, isFinished ? challengeScore : 0);
  const tier = getTierOutcome(challengeScore);
  const progressPercent = isFinished
    ? 100
    : (questionIndex / TOTAL_QUESTIONS) * 100;
  const categoryMeta = getCategoryFilterLabel(currentQuestion.word.categoryId);
  const isPerfectScore = isFinished && challengeScore === TOTAL_QUESTIONS;

  return (
    <FantasyBackground theme="challenge" className="px-4 py-6 sm:px-8 sm:py-8">
      <ConfettiBurst active={isPerfectScore} />
      <StarPop
        visible={showStar && !isFinished}
        label={`${currentQuestion.word.english}! +1 ⭐`}
      />

      <div className="mx-auto flex max-w-3xl flex-col items-center space-y-5">
        <ScreenHeader
          title="🏆 Challenge Mode"
          persianSubtitle="سوالات سخت"
          score={totalStars}
          onBack={onBack}
        />

        {/* Best Score + Countdown Timer Bar */}
        <div className="flex w-full max-w-xl flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-md">
          <div className="inline-flex items-center gap-2 rounded-xl bg-amber-100 px-3.5 py-2 font-display text-base font-bold text-amber-800">
            <Trophy className="h-5 w-5 text-amber-600" />
            <span className="tabular-nums">
              🏆 Best Score: {displayedBest}/10
            </span>
          </div>

          <div
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 font-display text-lg font-bold tabular-nums transition-colors ${
              timeLeft <= 15
                ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-400'
                : timeLeft <= 30
                ? 'bg-amber-100 text-amber-800'
                : 'bg-indigo-100 text-indigo-800'
            }`}
          >
            <Clock className="h-5 w-5" />
            <span>{formatCountdown(timeLeft)}</span>
          </div>
        </div>

        {/* Question Progress */}
        <div className="w-full max-w-xl space-y-2">
          <div className="flex items-center justify-between text-base font-bold text-slate-700">
            <span className="tabular-nums">
              Question {Math.min(questionIndex + 1, TOTAL_QUESTIONS)} /{' '}
              {TOTAL_QUESTIONS}
            </span>
            <span className="tabular-nums text-rose-700">
              Score: {challengeScore} / {TOTAL_QUESTIONS}
            </span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-white p-1 shadow-inner">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            />
          </div>
        </div>

        {isFinished ? (
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="flex w-full max-w-xl flex-col items-center rounded-[2rem] bg-white px-7 py-9 text-center shadow-2xl"
          >
            {isTimeUp && (
              <div className="mb-4 rounded-2xl bg-rose-100 px-5 py-2.5 text-center ring-2 ring-rose-300">
                <p className="font-display text-2xl font-bold text-rose-700">
                  ⏰ Time&apos;s Up!
                </p>
                <p
                  dir="rtl"
                  lang="fa"
                  className="font-persian text-base font-bold text-rose-600"
                >
                  وقت تمام شد!
                </p>
              </div>
            )}

            {isPerfectScore ? (
              <RedTrophyEmblem />
            ) : (
              <motion.span
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 16 }}
                className="select-none text-[96px] leading-none"
                role="img"
                aria-label={`Score ${challengeScore} out of 10`}
              >
                {tier.emoji}
              </motion.span>
            )}

            <h2
              className={`font-display mt-4 text-4xl font-bold ${tier.accentClass}`}
            >
              {tier.headline}
            </h2>

            <div className="mt-3 rounded-2xl bg-slate-100 px-6 py-2.5 font-display text-3xl font-bold tabular-nums text-slate-900">
              {challengeScore} / {TOTAL_QUESTIONS}
            </div>

            <p
              dir="rtl"
              lang="fa"
              className="font-persian mt-3 text-2xl font-bold text-slate-800"
            >
              {tier.persianNote}
            </p>

            {bonusAwarded && (
              <div className="mt-4 rounded-2xl bg-gradient-to-r from-red-500 to-amber-500 px-5 py-2.5 font-display text-xl font-bold text-white shadow-md">
                ⭐ +{PERFECT_BONUS_STARS} Bonus Stars Added!
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <div className="rounded-xl bg-amber-100 px-4 py-2 font-display text-lg font-bold text-amber-800 tabular-nums">
                🏆 Best Score: {displayedBest}/10
              </div>
              {isNewRecord && (
                <div className="rounded-xl bg-emerald-100 px-4 py-2 font-display text-lg font-bold text-emerald-700">
                  🎉 New Record!
                </div>
              )}
            </div>

            <div className="mt-7 flex w-full flex-wrap justify-center gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleRestart}
                className="inline-flex min-h-[56px] items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 px-7 py-3.5 font-display text-xl font-bold text-white shadow-lg cursor-pointer"
              >
                <RotateCcw className="h-5 w-5" />
                <span>Play Again · دوباره بازی کن</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => {
                  playTapPop();
                  onBack();
                }}
                className="min-h-[56px] rounded-2xl bg-slate-100 px-7 py-3.5 font-display text-xl font-bold text-slate-800 shadow cursor-pointer"
              >
                Home
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Question Prompt Card */}
            <motion.div
              key={`${questionIndex}-${currentQuestion.kind}-${currentQuestion.word.id}`}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20 }}
              className={`flex w-full max-w-xl flex-col items-center rounded-[2rem] px-7 py-7 text-center shadow-xl transition-colors ${
                roundOutcome === 'correct'
                  ? 'bg-emerald-100'
                  : roundOutcome === 'wrong'
                  ? 'bg-rose-100'
                  : 'bg-white'
              }`}
            >
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="rounded-xl bg-indigo-100 px-3 py-1 font-display text-sm font-bold text-indigo-800">
                  {categoryMeta.emoji} {categoryMeta.title}
                </span>
                <span className="rounded-xl bg-rose-100 px-3 py-1 font-display text-sm font-bold text-rose-700">
                  {currentQuestion.kind === 'persian-choice'
                    ? 'Reverse Translation'
                    : currentQuestion.kind === 'scramble'
                    ? 'Scrambled Letters'
                    : currentQuestion.kind === 'audio-emoji'
                    ? 'Audio Recognition'
                    : 'Missing Letter'}
                </span>
              </div>

              {currentQuestion.kind === 'persian-choice' && (
                <>
                  <p
                    dir="rtl"
                    lang="fa"
                    className="font-persian mt-5 text-4xl font-extrabold text-slate-900 sm:text-5xl"
                  >
                    {currentQuestion.word.persian}
                  </p>
                  <p className="mt-2 font-display text-base font-bold text-slate-500">
                    Pick the matching English word!
                  </p>
                </>
              )}

              {currentQuestion.kind === 'scramble' && (
                <>
                  <span
                    className="mt-4 select-none text-[72px] leading-none sm:text-[84px]"
                    role="img"
                    aria-label={currentQuestion.word.english}
                  >
                    {currentQuestion.word.emoji}
                  </span>
                  <p
                    dir="rtl"
                    lang="fa"
                    className="font-persian mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl"
                  >
                    {currentQuestion.word.persian}
                  </p>
                  <p className="mt-2 font-display text-base font-bold text-slate-500">
                    Tap the scrambled letters in the right order!
                  </p>
                </>
              )}

              {currentQuestion.kind === 'audio-emoji' && (
                <>
                  <motion.button
                    type="button"
                    disabled={controlsDisabled}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => speakWord(currentQuestion.word.english)}
                    className="mt-5 inline-flex min-h-[68px] items-center gap-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 px-7 py-4 font-display text-2xl font-bold text-white shadow-lg cursor-pointer disabled:opacity-50"
                  >
                    <Volume2 className="h-7 w-7" />
                    <span>Listen &amp; Pick Emoji</span>
                  </motion.button>
                  <p
                    dir="rtl"
                    lang="fa"
                    className="font-persian mt-3 text-lg font-bold text-slate-600"
                  >
                    به تلفظ گوش بده و شکل درست را انتخاب کن!
                  </p>
                </>
              )}

              {currentQuestion.kind === 'missing-letter' && (
                <>
                  <span
                    className="mt-4 select-none text-[72px] leading-none sm:text-[84px]"
                    role="img"
                    aria-label={currentQuestion.word.english}
                  >
                    {currentQuestion.word.emoji}
                  </span>
                  <div
                    className="mt-4 flex flex-wrap items-center justify-center gap-2"
                    aria-label="Word with missing letter"
                  >
                    {currentQuestion.word.english
                      .toUpperCase()
                      .split('')
                      .map((ch, idx) => {
                        const isBlank = idx === currentQuestion.missingIndex;
                        const revealed =
                          isBlank &&
                          (roundOutcome === 'correct' || roundOutcome === 'wrong');
                        return (
                          <span
                            key={idx}
                            className={`flex h-13 w-11 items-center justify-center rounded-xl border-2 font-display text-2xl font-bold sm:h-15 sm:w-12 sm:text-3xl ${
                              isBlank
                                ? roundOutcome === 'correct'
                                  ? 'border-emerald-500 bg-emerald-500 text-white'
                                  : roundOutcome === 'wrong'
                                  ? 'border-rose-500 bg-rose-500 text-white'
                                  : 'border-dashed border-amber-500 bg-amber-50 text-amber-700'
                                : 'border-slate-200 bg-slate-100 text-slate-900'
                            }`}
                          >
                            {isBlank ? (revealed ? ch : '_') : ch}
                          </span>
                        );
                      })}
                  </div>
                  <p className="mt-3 font-display text-base font-bold text-slate-500">
                    Tap the missing letter!
                  </p>
                </>
              )}

              {roundOutcome === 'wrong' && (
                <p className="mt-3 rounded-xl bg-white/80 px-4 py-1.5 font-display text-xl font-bold text-rose-700">
                  Correct Answer:{' '}
                  {currentQuestion.kind === 'audio-emoji'
                    ? `${currentQuestion.word.emoji} ${currentQuestion.word.english}`
                    : currentQuestion.word.english}
                </p>
              )}
            </motion.div>

            {/* Question Interaction Area */}
            {currentQuestion.kind === 'persian-choice' && (
              <div className="grid w-full max-w-xl grid-cols-1 gap-3.5 sm:grid-cols-2">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedChoiceId === option.id;
                  const isAnswer = option.id === currentQuestion.word.id;

                  let buttonClasses =
                    'bg-white text-slate-900 hover:bg-amber-50 border-4 border-white';
                  if (roundOutcome !== 'idle') {
                    if (isAnswer) {
                      buttonClasses =
                        'bg-emerald-500 text-white border-4 border-emerald-300';
                    } else if (isSelected) {
                      buttonClasses =
                        'bg-rose-500 text-white border-4 border-rose-300';
                    } else {
                      buttonClasses =
                        'bg-white/75 text-slate-400 border-4 border-white/60';
                    }
                  }

                  return (
                    <motion.button
                      key={option.id}
                      type="button"
                      disabled={controlsDisabled || roundOutcome !== 'idle'}
                      whileHover={
                        !controlsDisabled && roundOutcome === 'idle'
                          ? { scale: 1.03 }
                          : undefined
                      }
                      whileTap={
                        !controlsDisabled && roundOutcome === 'idle'
                          ? { scale: 0.95 }
                          : undefined
                      }
                      onClick={() => handleChoicePick(option)}
                      className={`min-h-[76px] rounded-2xl px-6 py-4 font-display text-2xl font-bold shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-400 cursor-pointer disabled:cursor-default ${buttonClasses}`}
                    >
                      {option.english}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {currentQuestion.kind === 'audio-emoji' && (
              <div className="grid w-full max-w-xl grid-cols-2 gap-4">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedChoiceId === option.id;
                  const isAnswer = option.id === currentQuestion.word.id;

                  let buttonClasses =
                    'bg-white hover:bg-sky-50 border-4 border-white';
                  if (roundOutcome !== 'idle') {
                    if (isAnswer) {
                      buttonClasses =
                        'bg-emerald-500 border-4 border-emerald-300';
                    } else if (isSelected) {
                      buttonClasses = 'bg-rose-500 border-4 border-rose-300';
                    } else {
                      buttonClasses =
                        'bg-white/70 opacity-60 border-4 border-white/60';
                    }
                  }

                  return (
                    <motion.button
                      key={option.id}
                      type="button"
                      disabled={controlsDisabled || roundOutcome !== 'idle'}
                      whileHover={
                        !controlsDisabled && roundOutcome === 'idle'
                          ? { scale: 1.04 }
                          : undefined
                      }
                      whileTap={
                        !controlsDisabled && roundOutcome === 'idle'
                          ? { scale: 0.94 }
                          : undefined
                      }
                      onClick={() => handleChoicePick(option)}
                      aria-label={option.english}
                      className={`flex min-h-[112px] items-center justify-center rounded-3xl px-4 py-5 shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400 cursor-pointer disabled:cursor-default ${buttonClasses}`}
                    >
                      <span className="select-none text-6xl leading-none">
                        {option.emoji}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {currentQuestion.kind === 'missing-letter' && (
              <div className="grid w-full max-w-xl grid-cols-3 gap-4">
                {currentQuestion.letterOptions.map((letter) => {
                  const isSelected = selectedLetter === letter;
                  const isAnswer = letter === currentQuestion.missingChar;

                  let buttonClasses =
                    'bg-white text-slate-900 hover:bg-amber-50 border-4 border-white';
                  if (roundOutcome !== 'idle') {
                    if (isAnswer) {
                      buttonClasses =
                        'bg-emerald-500 text-white border-4 border-emerald-300';
                    } else if (isSelected) {
                      buttonClasses =
                        'bg-rose-500 text-white border-4 border-rose-300';
                    } else {
                      buttonClasses =
                        'bg-white/75 text-slate-400 border-4 border-white/60';
                    }
                  }

                  return (
                    <motion.button
                      key={letter}
                      type="button"
                      disabled={controlsDisabled || roundOutcome !== 'idle'}
                      whileHover={
                        !controlsDisabled && roundOutcome === 'idle'
                          ? { scale: 1.05 }
                          : undefined
                      }
                      whileTap={
                        !controlsDisabled && roundOutcome === 'idle'
                          ? { scale: 0.94 }
                          : undefined
                      }
                      onClick={() => handleMissingLetterPick(letter)}
                      className={`min-h-[84px] rounded-2xl px-4 py-4 font-display text-4xl font-extrabold shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 cursor-pointer disabled:cursor-default ${buttonClasses}`}
                    >
                      {letter}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {currentQuestion.kind === 'scramble' && (
              <div className="flex w-full max-w-xl flex-col items-center space-y-5">
                {/* Answer Letter Slots */}
                <div
                  className={`flex flex-wrap items-center justify-center gap-2.5 ${
                    roundOutcome === 'wrong' ? 'animate-kid-shake' : ''
                  }`}
                >
                  {placedTileUids.map((uid, idx) => {
                    const tile = uid ? tiles.find((t) => t.uid === uid) : null;
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={controlsDisabled || roundOutcome !== 'idle'}
                        onClick={() => handleBoxTap(idx)}
                        className={`flex h-15 w-12 items-center justify-center rounded-2xl border-4 font-display text-2xl font-bold shadow-md transition-all sm:h-18 sm:w-14 sm:text-3xl ${
                          roundOutcome === 'correct'
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : roundOutcome === 'wrong'
                            ? 'border-rose-400 bg-rose-50 text-rose-700'
                            : tile
                            ? 'border-rose-400 bg-white text-slate-900 cursor-pointer hover:bg-rose-50'
                            : 'border-dashed border-rose-300 bg-white/80 text-slate-400'
                        }`}
                        aria-label={
                          tile ? `Remove letter ${tile.char}` : 'Empty letter slot'
                        }
                      >
                        {tile ? tile.char : '_'}
                      </button>
                    );
                  })}
                </div>

                {/* Scrambled Letter Tiles */}
                <div className="flex w-full flex-wrap items-center justify-center gap-2.5 rounded-3xl bg-white/95 p-5 shadow-md">
                  {tiles.map((tile) => (
                    <motion.button
                      key={tile.uid}
                      type="button"
                      disabled={
                        controlsDisabled || tile.used || roundOutcome !== 'idle'
                      }
                      whileHover={
                        !controlsDisabled && !tile.used && roundOutcome === 'idle'
                          ? { scale: 1.08 }
                          : undefined
                      }
                      whileTap={
                        !controlsDisabled && !tile.used && roundOutcome === 'idle'
                          ? { scale: 0.92 }
                          : undefined
                      }
                      onClick={() => handleTileTap(tile)}
                      className={`flex h-14 w-12 items-center justify-center rounded-2xl font-display text-2xl font-bold shadow-md transition-all sm:h-16 sm:w-14 sm:text-3xl ${
                        tile.used || controlsDisabled
                          ? 'bg-slate-200 text-slate-400 opacity-40 shadow-none'
                          : 'bg-gradient-to-b from-rose-500 to-amber-500 text-white cursor-pointer hover:brightness-105'
                      }`}
                    >
                      {tile.char}
                    </motion.button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={controlsDisabled || roundOutcome !== 'idle'}
                  onClick={handleClearScramble}
                  className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl bg-white px-7 py-3 font-display text-lg font-bold text-slate-700 shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.96] cursor-pointer disabled:opacity-50"
                >
                  <Eraser className="h-5 w-5 text-rose-500" />
                  <span>Clear Letters</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </FantasyBackground>
  );
}
