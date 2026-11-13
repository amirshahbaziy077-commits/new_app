import { RotateCcw, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ScreenHeader } from '../components/CelebrationEffects';
import { FantasyBackground } from '../components/FantasyBackground';

interface ParentZoneScreenProps {
  soundEnabled: boolean;
  totalStars: number;
  onToggleSound: (enabled: boolean) => void;
  onResetProgress: () => void;
  onBack: () => void;
}

export function ParentZoneScreen({
  soundEnabled,
  totalStars,
  onToggleSound,
  onResetProgress,
  onBack,
}: ParentZoneScreenProps) {
  const mathChallenge = useMemo(() => {
    const a = 4 + Math.floor(Math.random() * 6);
    const b = 3 + Math.floor(Math.random() * 7);
    return { a, b, answer: a + b };
  }, []);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [answerInput, setAnswerInput] = useState('');
  const [gateError, setGateError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number.parseInt(answerInput.trim(), 10);
    if (numeric === mathChallenge.answer) {
      setIsUnlocked(true);
      setGateError(null);
    } else {
      setGateError('Incorrect answer. Please try again.');
    }
  };

  return (
    <FantasyBackground theme="parents" className="px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-2xl flex-col items-center space-y-6">
        <ScreenHeader
          title="Parent Zone"
          persianSubtitle="بخش والدین و تنظیمات"
          onBack={onBack}
        />

        {!isUnlocked ? (
          <form
            onSubmit={handleGateSubmit}
            className="w-full rounded-[2rem] bg-white p-8 text-center shadow-xl"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
              <ShieldCheck className="h-9 w-9" />
            </div>

            <h2 className="font-display mt-4 text-3xl font-bold text-slate-900">
              Parent Check
            </h2>
            <p className="mt-2 text-base font-semibold text-slate-600">
              Please solve this math question to continue:
            </p>

            <div className="my-6 rounded-2xl bg-sky-50 px-6 py-5 font-display text-4xl font-bold text-slate-900">
              What is {mathChallenge.a} + {mathChallenge.b}?
            </div>

            <input
              type="number"
              inputMode="numeric"
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              placeholder="Enter answer"
              className="w-full max-w-xs rounded-2xl border-2 border-slate-300 px-5 py-3.5 text-center font-display text-2xl font-bold text-slate-900 focus:border-indigo-500 focus:outline-none"
              autoFocus
            />

            {gateError && (
              <p className="mt-3 text-sm font-bold text-rose-600">{gateError}</p>
            )}

            <div className="mt-6">
              <button
                type="submit"
                className="min-h-[54px] rounded-2xl bg-indigo-600 px-8 py-3 font-display text-xl font-bold text-white shadow-lg hover:bg-indigo-700 cursor-pointer"
              >
                Enter Settings
              </button>
            </div>
          </form>
        ) : (
          <div className="w-full space-y-5">
            {/* Sound Toggle Card */}
            <div className="flex items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                  {soundEnabled ? (
                    <Volume2 className="h-7 w-7" />
                  ) : (
                    <VolumeX className="h-7 w-7" />
                  )}
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900">
                    Sound &amp; Voice
                  </h3>
                  <p className="text-sm font-semibold text-slate-600">
                    Turn game sound effects and pronunciation ON or OFF
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onToggleSound(!soundEnabled)}
                className={`min-h-[48px] min-w-[96px] rounded-2xl px-5 py-2.5 font-display text-lg font-bold text-white shadow transition-colors cursor-pointer ${
                  soundEnabled
                    ? 'bg-emerald-500 hover:bg-emerald-600'
                    : 'bg-slate-400 hover:bg-slate-500'
                }`}
              >
                {soundEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Reset Progress Card */}
            <div className="rounded-3xl bg-white p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                    <RotateCcw className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-slate-900">
                      Reset Progress
                    </h3>
                    <p className="text-sm font-semibold text-slate-600">
                      Current Stars: {totalStars} · Clear all stars, scores, and badges
                    </p>
                  </div>
                </div>

                {!confirmReset && (
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmReset(true);
                      setResetDone(false);
                    }}
                    className="min-h-[48px] rounded-2xl bg-rose-500 px-5 py-2.5 font-display text-base font-bold text-white shadow hover:bg-rose-600 cursor-pointer whitespace-nowrap"
                  >
                    Reset
                  </button>
                )}
              </div>

              {confirmReset && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-rose-50 p-4">
                  <span className="text-sm font-bold text-rose-800">
                    Are you sure? This will reset all stars and badges to zero.
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onResetProgress();
                        setConfirmReset(false);
                        setResetDone(true);
                      }}
                      className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white shadow-sm cursor-pointer"
                    >
                      Yes, Reset Everything
                    </button>
                  </div>
                </div>
              )}

              {resetDone && (
                <p className="text-sm font-bold text-emerald-700">
                  Progress has been reset.
                </p>
              )}
            </div>

            {/* About App Card */}
            <div className="rounded-3xl bg-white p-6 shadow-lg space-y-2">
              <h3 className="font-display text-xl font-bold text-slate-900">
                About Learn English!
              </h3>
              <p className="text-sm font-semibold leading-relaxed text-slate-600">
                Learn English! helps children ages 3 to 8 build everyday English vocabulary
                with clear US English pronunciation, Persian translations, A–Z alphabet
                cards, and four playful games. All progress is stored locally on this
                device with no ads or dark patterns.
              </p>
              <p
                dir="rtl"
                lang="fa"
                className="font-persian pt-1 text-sm font-bold text-slate-600"
              >
                این برنامه برای یادگیری شاد و تعاملی زبان انگلیسی کودکان ۳ تا ۸ سال همراه با ترجمه فارسی طراحی شده است.
              </p>
            </div>
          </div>
        )}
      </div>
    </FantasyBackground>
  );
}
