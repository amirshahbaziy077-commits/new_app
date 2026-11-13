import { ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface ConfettiBurstProps {
  active: boolean;
}

const CONFETTI_COLORS = [
  '#F59E0B',
  '#EC4899',
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#EF4444',
  '#14B8A6',
];

export function ConfettiBurst({ active }: ConfettiBurstProps) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 42 }, (_, idx) => ({
        id: idx,
        left: `${(idx * 23) % 100}%`,
        delay: (idx % 7) * 0.08,
        duration: 2.0 + (idx % 5) * 0.3,
        color: CONFETTI_COLORS[idx % CONFETTI_COLORS.length],
        rotate: (idx % 2 === 0 ? 1 : -1) * (180 + (idx % 4) * 90),
        size: 10 + (idx % 4) * 4,
      })),
    []
  );

  return (
    <AnimatePresence>
      {active && (
        <div
          className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
          aria-hidden="true"
        >
          {pieces.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: -40, opacity: 1, rotate: 0, scale: 0.8 }}
              animate={{
                y: '105vh',
                opacity: 0,
                rotate: p.rotate,
                scale: 1,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: 'easeOut',
              }}
              style={{
                position: 'absolute',
                left: p.left,
                width: p.size,
                height: p.size * 0.65,
                backgroundColor: p.color,
                borderRadius: 4,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

interface StarPopProps {
  visible: boolean;
  label?: string;
}

export function StarPop({ visible, label = 'Great job!' }: StarPopProps) {
  const burstRays = useMemo(
    () =>
      Array.from({ length: 8 }, (_, idx) => {
        const angle = (idx * Math.PI * 2) / 8;
        return {
          id: idx,
          x: Math.cos(angle) * 86,
          y: Math.sin(angle) * 52,
          emoji: idx % 2 === 0 ? '⭐' : '✨',
        };
      }),
    []
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scale: 0.4, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.6, opacity: 0, y: -16 }}
          transition={{ type: 'spring', stiffness: 380, damping: 16 }}
          className="pointer-events-none fixed inset-x-0 top-24 z-40 flex justify-center"
        >
          <div className="relative flex items-center gap-3 rounded-3xl bg-amber-400 px-7 py-4 text-slate-900 shadow-xl ring-4 ring-white">
            {burstRays.map((ray) => (
              <motion.span
                key={ray.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
                animate={{ x: ray.x, y: ray.y, opacity: 0, scale: 1.15 }}
                transition={{ duration: 0.75, ease: 'easeOut' }}
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl"
                aria-hidden="true"
              >
                {ray.emoji}
              </motion.span>
            ))}
            <span className="text-4xl leading-none" aria-hidden="true">
              ⭐
            </span>
            <span className="font-display text-2xl font-bold tracking-tight">
              {label}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface AnimatedScoreBadgeProps {
  score: number;
}

export function AnimatedScoreBadge({ score }: AnimatedScoreBadgeProps) {
  const prevScoreRef = useRef(score);
  const [showPlusOne, setShowPlusOne] = useState(false);

  useEffect(() => {
    if (score > prevScoreRef.current) {
      setShowPlusOne(true);
      const t = window.setTimeout(() => setShowPlusOne(false), 750);
      prevScoreRef.current = score;
      return () => window.clearTimeout(t);
    }
    prevScoreRef.current = score;
  }, [score]);

  return (
    <div className="relative flex min-h-[48px] items-center gap-2 rounded-2xl bg-white px-4 py-2 shadow-md">
      <motion.span
        key={`star-${score}`}
        initial={{ scale: 1.35, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 14 }}
        className="text-xl leading-none"
        aria-hidden="true"
      >
        ⭐
      </motion.span>
      <motion.span
        key={`num-${score}`}
        initial={{ scale: 1.35 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 16 }}
        className="font-display text-xl font-bold tabular-nums text-amber-600"
      >
        {score}
      </motion.span>

      <AnimatePresence>
        {showPlusOne && (
          <motion.span
            initial={{ opacity: 0, y: 8, scale: 0.8 }}
            animate={{ opacity: 1, y: -22, scale: 1 }}
            exit={{ opacity: 0, y: -34 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="pointer-events-none absolute -top-1 right-2 font-display text-base font-bold text-emerald-600"
          >
            +1
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ScreenHeaderProps {
  title: string;
  persianSubtitle?: string;
  score?: number;
  onBack: () => void;
  rightSlot?: React.ReactNode;
}

export function ScreenHeader({
  title,
  persianSubtitle,
  score,
  onBack,
  rightSlot,
}: ScreenHeaderProps) {
  return (
    <header className="flex w-full items-center justify-between gap-4 pb-4">
      <motion.button
        type="button"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.93 }}
        onClick={onBack}
        className="inline-flex min-h-[48px] min-w-[48px] items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-base font-bold text-slate-800 shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400 cursor-pointer whitespace-nowrap shrink-0"
      >
        <ArrowLeft className="h-5 w-5 text-slate-700" />
        <span>Back</span>
      </motion.button>

      <div className="flex flex-col items-center text-center">
        <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
          {title}
        </h1>
        {persianSubtitle && (
          <span
            dir="rtl"
            lang="fa"
            className="font-persian text-sm font-bold text-slate-600 sm:text-base"
          >
            {persianSubtitle}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {rightSlot}
        {typeof score === 'number' && <AnimatedScoreBadge score={score} />}
      </div>
    </header>
  );
}
