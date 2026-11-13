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
  playTapPop,
  playWinFanfare,
  playWrongTone,
  speakWord,
} from '../utils/audio';

interface MatchPairsScreenProps {
  categoryFilter: GameCategoryFilter;
  score: number;
  onAddScore: (delta: number) => void;
  onBack: () => void;
  onGoHome: () => void;
}

interface MemoryCard {
  uid: string;
  wordId: string;
  kind: 'emoji' | 'word';
  display: string;
  english: string;
  isMatched: boolean;
}

const TOTAL_SESSION_WORDS = 30;

function createBoardFromPool(pool: WordItem[], offset: number): MemoryCard[] {
  const slice = pool.slice(offset, offset + 4);
  const cards: MemoryCard[] = slice.flatMap((w) => [
    {
      uid: `${offset}-${w.id}-emoji`,
      wordId: w.id,
      kind: 'emoji',
      display: w.emoji,
      english: w.english,
      isMatched: false,
    },
    {
      uid: `${offset}-${w.id}-word`,
      wordId: w.id,
      kind: 'word',
      display: w.english,
      english: w.english,
      isMatched: false,
    },
  ]);
  return shuffleArray(cards);
}

export function MatchPairsScreen({
  categoryFilter,
  score,
  onAddScore,
  onBack,
  onGoHome,
}: MatchPairsScreenProps) {
  const topicMeta = getCategoryFilterLabel(categoryFilter);
  const [sessionPool, setSessionPool] = useState<WordItem[]>(() =>
    shuffleArray(getVocabularyPool(categoryFilter)).slice(0, TOTAL_SESSION_WORDS)
  );
  const [poolOffset, setPoolOffset] = useState(0);
  const [cards, setCards] = useState<MemoryCard[]>(() =>
    createBoardFromPool(sessionPool, 0)
  );
  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [matchedTotal, setMatchedTotal] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const [starMessage, setStarMessage] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handlePlayAgain = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    const freshPool = shuffleArray(getVocabularyPool(categoryFilter)).slice(
      0,
      TOTAL_SESSION_WORDS
    );
    setSessionPool(freshPool);
    setPoolOffset(0);
    setCards(createBoardFromPool(freshPool, 0));
    setFlippedUids([]);
    setIsLocked(false);
    setMatchedTotal(0);
    setHasWon(false);
    setStarMessage(null);
  }, [categoryFilter]);

  const handleCardTap = (card: MemoryCard) => {
    if (isLocked || card.isMatched || flippedUids.includes(card.uid)) {
      return;
    }

    playTapPop();
    const nextFlipped = [...flippedUids, card.uid];
    setFlippedUids(nextFlipped);

    if (nextFlipped.length === 2) {
      const [firstUid, secondUid] = nextFlipped;
      const firstCard = cards.find((c) => c.uid === firstUid);
      const secondCard = cards.find((c) => c.uid === secondUid);

      if (!firstCard || !secondCard) return;

      if (firstCard.wordId === secondCard.wordId) {
        playCorrectDing();
        speakWord(firstCard.english);
        onAddScore(1);
        const nextTotal = matchedTotal + 1;
        setMatchedTotal(nextTotal);
        setStarMessage(`${firstCard.english}! +1 ⭐`);
        window.setTimeout(() => setStarMessage(null), 850);

        const updatedCards = cards.map((c) =>
          c.wordId === firstCard.wordId ? { ...c, isMatched: true } : c
        );
        setCards(updatedCards);
        setFlippedUids([]);

        if (updatedCards.every((c) => c.isMatched)) {
          const nextOffset = poolOffset + updatedCards.length / 2;
          if (nextOffset >= TOTAL_SESSION_WORDS) {
            timerRef.current = window.setTimeout(() => {
              setHasWon(true);
              playWinFanfare();
            }, 500);
          } else {
            setIsLocked(true);
            timerRef.current = window.setTimeout(() => {
              setPoolOffset(nextOffset);
              setCards(createBoardFromPool(sessionPool, nextOffset));
              setFlippedUids([]);
              setIsLocked(false);
            }, 700);
          }
        }
      } else {
        setIsLocked(true);
        playWrongTone();
        timerRef.current = window.setTimeout(() => {
          setFlippedUids([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const progressPercent = (matchedTotal / TOTAL_SESSION_WORDS) * 100;

  return (
    <FantasyBackground theme="match" className="px-4 py-6 sm:px-8 sm:py-8">
      <ConfettiBurst active={hasWon} />
      <StarPop visible={Boolean(starMessage)} label={starMessage ?? ''} />

      <div className="mx-auto flex max-w-4xl flex-col items-center space-y-6">
        <ScreenHeader
          title="🧩 Match the Pairs"
          persianSubtitle="جفت‌ها را پیدا کن"
          score={score}
          onBack={onBack}
        />

        <div className="w-full max-w-2xl space-y-2">
          <div className="flex items-center justify-between text-base font-bold text-teal-900">
            <span>
              Words Matched · {topicMeta.emoji} {topicMeta.title}
            </span>
            <span className="tabular-nums">
              {matchedTotal} / {TOTAL_SESSION_WORDS}
            </span>
          </div>
          <div className="h-5 w-full overflow-hidden rounded-full bg-white p-1 shadow-inner">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            />
          </div>
        </div>

        {hasWon ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="flex w-full max-w-xl flex-col items-center rounded-[2rem] bg-white p-10 text-center shadow-2xl"
          >
            <span className="text-[90px] leading-none" aria-hidden="true">
              🎉
            </span>
            <h2 className="font-display mt-4 text-5xl font-bold text-emerald-600">
              You Win!
            </h2>
            <p
              dir="rtl"
              lang="fa"
              className="font-persian mt-3 text-2xl font-bold text-slate-700"
            >
              آفرین! هر ۳۰ جفت کلمه را پیدا کردی!
            </p>
            <div className="mt-5 rounded-2xl bg-amber-50 px-6 py-3 font-display text-2xl font-bold text-amber-700">
              Final Score: {matchedTotal} / {TOTAL_SESSION_WORDS} · ⭐ +{matchedTotal}
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                onClick={handlePlayAgain}
                className="min-h-[60px] rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 px-8 py-4 font-display text-2xl font-bold text-white shadow-lg cursor-pointer"
              >
                Play Again
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                onClick={onGoHome}
                className="min-h-[60px] rounded-2xl bg-slate-100 px-8 py-4 font-display text-2xl font-bold text-slate-800 shadow cursor-pointer"
              >
                Home
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="grid w-full max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
            {cards.map((card) => {
              const isRevealed =
                card.isMatched || flippedUids.includes(card.uid);

              return (
                <motion.button
                  key={card.uid}
                  type="button"
                  whileTap={!isRevealed ? { scale: 0.93 } : undefined}
                  onClick={() => handleCardTap(card)}
                  className="perspective-1000 h-36 w-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400 rounded-3xl cursor-pointer sm:h-40"
                  aria-label={isRevealed ? card.display : 'Hidden card'}
                >
                  <div
                    className={`preserve-3d relative h-full w-full transition-transform duration-500 ${
                      isRevealed ? 'rotate-y-180' : ''
                    }`}
                  >
                    <div className="backface-hidden absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-4 border-white bg-gradient-to-br from-teal-400 to-emerald-500 shadow-lg">
                      <span
                        className="text-5xl leading-none text-white drop-shadow"
                        aria-hidden="true"
                      >
                        ❓
                      </span>
                    </div>

                    <div
                      className={`backface-hidden rotate-y-180 absolute inset-0 flex items-center justify-center rounded-3xl border-4 p-3 shadow-lg ${
                        card.isMatched
                          ? 'border-emerald-400 bg-emerald-50'
                          : 'border-teal-200 bg-white'
                      }`}
                    >
                      {card.kind === 'emoji' ? (
                        <span className="select-none text-6xl leading-none sm:text-7xl">
                          {card.display}
                        </span>
                      ) : (
                        <span className="font-display text-xl font-bold text-slate-900 sm:text-2xl">
                          {card.display}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </FantasyBackground>
  );
}
