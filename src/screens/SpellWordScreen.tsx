import { Eraser, Lightbulb, Volume2 } from 'lucide-react';
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

interface SpellWordScreenProps {
  categoryFilter: GameCategoryFilter;
  score: number;
  onAddScore: (delta: number) => void;
  onBack: () => void;
  onGoHome: () => void;
}

interface LetterTile {
  uid: string;
  char: string;
  used: boolean;
}

const TOTAL_ROUNDS = 30;

function createSpellingSession(categoryFilter: GameCategoryFilter): WordItem[] {
  const pool = getVocabularyPool(categoryFilter);
  const shortAlpha = pool.filter((w) => /^[A-Za-z]{3,7}$/.test(w.english));
  const allAlpha = pool.filter((w) => /^[A-Za-z]+$/.test(w.english));

  if (shortAlpha.length >= TOTAL_ROUNDS) {
    return shuffleArray(shortAlpha).slice(0, TOTAL_ROUNDS);
  }

  const base = shuffleArray(allAlpha);
  const session: WordItem[] = [...base];
  while (session.length < TOTAL_ROUNDS && base.length > 0) {
    session.push(...shuffleArray(base));
  }
  return session.slice(0, TOTAL_ROUNDS);
}

function buildTilesForWord(word: string): LetterTile[] {
  const letters = word.toUpperCase().split('');
  const tiles = letters.map((char, idx) => ({
    uid: `${idx}-${char}-${Math.random().toString(36).slice(2, 6)}`,
    char,
    used: false,
  }));
  return shuffleArray(tiles);
}

export function SpellWordScreen({
  categoryFilter,
  score,
  onAddScore,
  onBack,
  onGoHome,
}: SpellWordScreenProps) {
  const topicMeta = getCategoryFilterLabel(categoryFilter);
  const [sessionWords, setSessionWords] = useState<WordItem[]>(() =>
    createSpellingSession(categoryFilter)
  );
  const [roundIndex, setRoundIndex] = useState(0);
  const [sessionStars, setSessionStars] = useState(0);
  const word = sessionWords[roundIndex];

  const [tiles, setTiles] = useState<LetterTile[]>(() =>
    buildTilesForWord(word.english)
  );
  const [placedTileUids, setPlacedTileUids] = useState<(string | null)[]>(() =>
    Array(word.english.length).fill(null)
  );
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong'>(
    'playing'
  );
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

  const handleRestart = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    const fresh = createSpellingSession(categoryFilter);
    setSessionWords(fresh);
    setRoundIndex(0);
    setSessionStars(0);
    setTiles(buildTilesForWord(fresh[0].english));
    setPlacedTileUids(Array(fresh[0].english.length).fill(null));
    setStatus('playing');
    setShowStar(false);
    setIsGameComplete(false);
  }, [categoryFilter]);

  const handleClear = () => {
    if (status === 'correct' || isGameComplete) return;
    playTapPop();
    setTiles((prev) => prev.map((t) => ({ ...t, used: false })));
    setPlacedTileUids(Array(word.english.length).fill(null));
    setStatus('playing');
  };

  const handleHint = () => {
    if (status === 'correct' || isGameComplete) return;
    const firstLetter = word.english[0].toUpperCase();

    const currentFirstTile = placedTileUids[0]
      ? tiles.find((t) => t.uid === placedTileUids[0])
      : null;
    if (currentFirstTile?.char === firstLetter) {
      speakWord(word.english);
      return;
    }

    const matchingTile = tiles.find((t) => t.char === firstLetter);
    if (!matchingTile) return;

    playTapPop();
    setTiles((prev) =>
      prev.map((t) => ({ ...t, used: t.uid === matchingTile.uid }))
    );
    const nextBoxes = Array(word.english.length).fill(null) as (string | null)[];
    nextBoxes[0] = matchingTile.uid;
    setPlacedTileUids(nextBoxes);
    setStatus('playing');
  };

  const handleTileTap = (tile: LetterTile) => {
    if (tile.used || status === 'correct' || isGameComplete) return;

    const emptySlotIndex = placedTileUids.findIndex((u) => u === null);
    if (emptySlotIndex === -1) return;

    playTapPop();
    const updatedTiles = tiles.map((t) =>
      t.uid === tile.uid ? { ...t, used: true } : t
    );
    const updatedBoxes = [...placedTileUids];
    updatedBoxes[emptySlotIndex] = tile.uid;

    setTiles(updatedTiles);
    setPlacedTileUids(updatedBoxes);

    if (updatedBoxes.every((u) => u !== null)) {
      const assembled = updatedBoxes
        .map((uid) => updatedTiles.find((t) => t.uid === uid)?.char ?? '')
        .join('');

      if (assembled === word.english.toUpperCase()) {
        setStatus('correct');
        playCorrectDing();
        speakWord(word.english);
        onAddScore(1);
        setSessionStars((prev) => prev + 1);
        setShowStar(true);

        timerRef.current = window.setTimeout(() => {
          setShowStar(false);
          if (roundIndex + 1 >= TOTAL_ROUNDS) {
            setIsGameComplete(true);
            playWinFanfare();
          } else {
            const nextIdx = roundIndex + 1;
            const nextWord = sessionWords[nextIdx];
            setRoundIndex(nextIdx);
            setTiles(buildTilesForWord(nextWord.english));
            setPlacedTileUids(Array(nextWord.english.length).fill(null));
            setStatus('playing');
          }
        }, 1250);
      } else {
        setStatus('wrong');
        playWrongTone();
      }
    } else {
      setStatus('playing');
    }
  };

  const handleBoxTap = (boxIndex: number) => {
    if (status === 'correct' || isGameComplete) return;
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
    setStatus('playing');
  };

  const completedRounds = isGameComplete ? TOTAL_ROUNDS : roundIndex;
  const progressPercent = (completedRounds / TOTAL_ROUNDS) * 100;

  return (
    <FantasyBackground theme="spell" className="px-4 py-6 sm:px-8 sm:py-8">
      <ConfettiBurst active={isGameComplete} />
      <StarPop visible={showStar} label={`${word.english}! +1 ⭐`} />

      <div className="mx-auto flex max-w-3xl flex-col items-center space-y-6">
        <ScreenHeader
          title="🔤 Spell the Word"
          persianSubtitle="املای کلمه"
          score={score}
          onBack={onBack}
        />

        <div className="w-full max-w-xl space-y-2">
          <div className="flex items-center justify-between text-base font-bold text-slate-700">
            <span>
              Word · {topicMeta.emoji} {topicMeta.title}
            </span>
            <span className="tabular-nums">
              {Math.min(roundIndex + 1, TOTAL_ROUNDS)} / {TOTAL_ROUNDS}
            </span>
          </div>
          <div className="h-5 w-full overflow-hidden rounded-full bg-white p-1 shadow-inner">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
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
            <h2 className="font-display mt-4 text-4xl font-bold text-orange-600">
              You Win!
            </h2>
            <p
              dir="rtl"
              lang="fa"
              className="font-persian mt-2 text-2xl font-bold text-slate-700"
            >
              آفرین! هر ۳۰ کلمه املا را کامل کردی!
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
                className="min-h-[56px] rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-8 py-3.5 font-display text-2xl font-bold text-white shadow-lg cursor-pointer"
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
            <motion.div
              key={word.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20 }}
              className={`flex w-full max-w-xl flex-col items-center rounded-[2rem] px-8 py-7 text-center shadow-xl transition-colors ${
                status === 'correct' ? 'bg-emerald-100' : 'bg-white'
              }`}
            >
              <span
                className="select-none text-[96px] leading-none"
                role="img"
                aria-label={word.english}
              >
                {word.emoji}
              </span>
              <p
                dir="rtl"
                lang="fa"
                className="font-persian mt-3 text-[28px] font-bold text-slate-800"
              >
                {word.persian}
              </p>

              <button
                type="button"
                onClick={() => speakWord(word.english)}
                className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-amber-100 px-4 py-2 font-display text-base font-bold text-amber-800 hover:bg-amber-200 cursor-pointer"
              >
                <Volume2 className="h-5 w-5" />
                <span>Hear Word</span>
              </button>
            </motion.div>

            <div
              className={`flex flex-wrap items-center justify-center gap-3 ${
                status === 'wrong' ? 'animate-kid-shake' : ''
              }`}
            >
              {placedTileUids.map((uid, index) => {
                const tile = uid ? tiles.find((t) => t.uid === uid) : null;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleBoxTap(index)}
                    className={`flex h-16 w-14 items-center justify-center rounded-2xl border-4 font-display text-3xl font-bold shadow-md transition-all sm:h-20 sm:w-16 sm:text-4xl ${
                      status === 'correct'
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : status === 'wrong'
                        ? 'border-rose-400 bg-rose-50 text-rose-700'
                        : tile
                        ? 'border-amber-400 bg-white text-slate-900 cursor-pointer hover:bg-amber-50'
                        : 'border-dashed border-amber-300 bg-white/75 text-slate-400'
                    }`}
                    aria-label={tile ? `Remove letter ${tile.char}` : 'Empty letter slot'}
                  >
                    {tile ? tile.char : '_'}
                  </button>
                );
              })}
            </div>

            <div className="flex min-h-[32px] items-center justify-center">
              {status === 'wrong' && (
                <span className="rounded-xl bg-rose-100 px-4 py-1.5 font-display text-lg font-bold text-rose-700">
                  Almost! Tap Clear or tap a box to fix it.
                </span>
              )}
            </div>

            <div className="flex max-w-xl flex-wrap items-center justify-center gap-3 rounded-3xl bg-white/95 p-5 shadow-md">
              {tiles.map((tile) => (
                <motion.button
                  key={tile.uid}
                  type="button"
                  disabled={tile.used || status === 'correct'}
                  whileHover={!tile.used ? { scale: 1.08 } : undefined}
                  whileTap={!tile.used ? { scale: 0.92 } : undefined}
                  onClick={() => handleTileTap(tile)}
                  className={`flex h-16 w-14 items-center justify-center rounded-2xl font-display text-3xl font-bold shadow-md transition-all sm:h-18 sm:w-16 ${
                    tile.used
                      ? 'bg-slate-200 text-slate-400 opacity-40 shadow-none'
                      : 'bg-gradient-to-b from-amber-400 to-orange-500 text-white cursor-pointer hover:brightness-105'
                  }`}
                >
                  {tile.char}
                </motion.button>
              ))}
            </div>

            <div className="flex w-full max-w-md items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleClear}
                className="flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-display text-xl font-bold text-slate-700 shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.96] cursor-pointer"
              >
                <Eraser className="h-5 w-5 text-rose-500" />
                <span>Clear</span>
              </button>

              <button
                type="button"
                onClick={handleHint}
                className="flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-400 px-6 py-3.5 font-display text-xl font-bold text-slate-900 shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.96] cursor-pointer"
              >
                <Lightbulb className="h-5 w-5 text-amber-900" />
                <span>Hint</span>
              </button>
            </div>
          </>
        )}
      </div>
    </FantasyBackground>
  );
}
