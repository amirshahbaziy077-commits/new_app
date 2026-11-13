import { Calendar, CheckCircle2, Save, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { ScreenHeader } from '../components/CelebrationEffects';
import { FantasyBackground } from '../components/FantasyBackground';
import { playCorrectDing, playTapPop } from '../utils/audio';
import { UserProfile } from '../utils/storage';

interface ProfileScreenProps {
  profile: UserProfile;
  totalStars: number;
  onSaveProfile: (updated: UserProfile) => void;
  onBack: () => void;
}

const AVATAR_OPTIONS: ReadonlyArray<string> = [
  '🦊',
  '🐱',
  '🐶',
  '🦁',
  '🐼',
  '🦄',
  '🦸‍♂️',
  '🤖',
  '🚀',
  '🌟',
  '⚽',
  '🎨',
  '🍕',
  '👽',
  '🐸',
];

const ENGLISH_NAME_REGEX = /^[a-zA-Z\s]+$/;

function getTodayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function slashDateToIso(slashDate: string): string {
  const parts = slashDate.split('/');
  if (parts.length !== 3) return '';
  return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
}

function isoDateToSlash(isoDate: string): string {
  const parts = isoDate.split('-');
  if (parts.length !== 3) return '';
  return `${parts[0]}/${parts[1].padStart(2, '0')}/${parts[2].padStart(2, '0')}`;
}

function calculateAgeFromIso(isoDate: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
  const [yStr, mStr, dStr] = isoDate.split('-');
  const birthYear = Number(yStr);
  const birthMonth = Number(mStr);
  const birthDay = Number(dStr);
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  if (
    birthYear > todayYear ||
    (birthYear === todayYear &&
      (birthMonth > todayMonth ||
        (birthMonth === todayMonth && birthDay > todayDay)))
  ) {
    return null;
  }

  let age = todayYear - birthYear;
  if (
    todayMonth < birthMonth ||
    (todayMonth === birthMonth && todayDay < birthDay)
  ) {
    age -= 1;
  }
  return Math.max(0, age);
}

function toPersianDigits(num: number): string {
  const digits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, (d) => digits[Number(d)] ?? d);
}

export function ProfileScreen({
  profile,
  totalStars,
  onSaveProfile,
  onBack,
}: ProfileScreenProps) {
  const todayIso = useMemo(() => getTodayIsoDate(), []);
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar || '🦊');
  const [birthDateIso, setBirthDateIso] = useState(() =>
    profile.birthDate ? slashDateToIso(profile.birthDate) : ''
  );
  const [futureDateError, setFutureDateError] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);

  const calculatedAge = useMemo(
    () => (birthDateIso ? calculateAgeFromIso(birthDateIso) : profile.age),
    [birthDateIso, profile.age]
  );

  const formattedBirthDate = useMemo(
    () => (birthDateIso ? isoDateToSlash(birthDateIso) : ''),
    [birthDateIso]
  );

  const firstHasInvalidChars =
    firstName.length > 0 && !ENGLISH_NAME_REGEX.test(firstName);
  const lastHasInvalidChars =
    lastName.length > 0 && !ENGLISH_NAME_REGEX.test(lastName);

  const firstIsValid =
    ENGLISH_NAME_REGEX.test(firstName) && firstName.trim().length > 0;
  const lastIsValid =
    ENGLISH_NAME_REGEX.test(lastName) && lastName.trim().length > 0;
  const canSave = firstIsValid && lastIsValid && !futureDateError;

  const handleDateChange = (rawIso: string) => {
    setSavedBanner(false);
    if (!rawIso) {
      setBirthDateIso('');
      setFutureDateError(false);
      return;
    }
    if (rawIso > todayIso) {
      setFutureDateError(true);
      return;
    }
    setFutureDateError(false);
    setBirthDateIso(rawIso);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;

    playCorrectDing();
    onSaveProfile({
      firstName: firstName.trim().replace(/\s+/g, ' '),
      lastName: lastName.trim().replace(/\s+/g, ' '),
      avatar: selectedAvatar,
      birthDate: formattedBirthDate,
      age: calculatedAge,
    });
    setSavedBanner(true);
    window.setTimeout(() => setSavedBanner(false), 2600);
  };

  return (
    <FantasyBackground theme="profile" className="px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center space-y-6">
        <ScreenHeader
          title="👤 User Profile"
          persianSubtitle="پروفایل کاربری"
          score={totalStars}
          onBack={onBack}
        />

        {/* Live Profile Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="flex w-full items-center gap-5 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white shadow-xl"
        >
          <motion.div
            key={selectedAvatar}
            initial={{ scale: 0.7, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 14 }}
            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white/25 text-6xl leading-none shadow-inner ring-4 ring-white/40"
          >
            {selectedAvatar}
          </motion.div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/85">
              <Sparkles className="h-4 w-4" />
              <span>English Learner Card</span>
            </div>
            <div className="truncate font-display text-2xl font-bold sm:text-3xl">
              {firstIsValid || lastIsValid
                ? `${firstName.trim()} ${lastName.trim()}`.trim()
                : 'Your English Name'}
            </div>
            <p className="font-display text-sm font-bold text-white/90 tabular-nums">
              {calculatedAge !== null ? `🎂 ${calculatedAge} years old · ` : ''}
              ⭐ {totalStars} Total Stars
            </p>
          </div>
        </motion.div>

        <form
          onSubmit={handleSave}
          className="w-full space-y-6 rounded-[2rem] bg-white p-6 shadow-xl sm:p-8"
        >
          {/* 15-Avatar Clean 5x3 Grid */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Choose Your Avatar ({AVATAR_OPTIONS.length})
              </h2>
              <span
                dir="rtl"
                lang="fa"
                className="font-persian text-base font-bold text-slate-600"
              >
                آواتار خودت را انتخاب کن
              </span>
            </div>

            <div className="grid grid-cols-5 gap-3 rounded-3xl border-2 border-indigo-100 bg-slate-50/90 p-3.5">
              {AVATAR_OPTIONS.map((emoji) => {
                const isSelected = selectedAvatar === emoji;
                return (
                  <motion.button
                    key={emoji}
                    type="button"
                    animate={{ scale: isSelected ? 1.12 : 1 }}
                    whileHover={{ scale: isSelected ? 1.14 : 1.07 }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 16 }}
                    onClick={() => {
                      playTapPop();
                      setSelectedAvatar(emoji);
                    }}
                    aria-label={`Select avatar ${emoji}`}
                    aria-pressed={isSelected}
                    className={`flex aspect-square items-center justify-center rounded-2xl text-4xl leading-none transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400 ${
                      isSelected
                        ? 'border-4 border-indigo-600 bg-indigo-50 shadow-lg ring-4 ring-amber-300'
                        : 'border-2 border-slate-200 bg-white hover:border-indigo-300'
                    }`}
                  >
                    {emoji}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* English-only Name Fields */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* First Name */}
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <label
                  htmlFor="profile-first-name"
                  className="font-display text-lg font-bold text-slate-800"
                >
                  First Name
                </label>
                <span
                  dir="rtl"
                  lang="fa"
                  className="font-persian text-sm font-bold text-slate-600"
                >
                  نام
                </span>
              </div>
              <input
                id="profile-first-name"
                type="text"
                dir="ltr"
                lang="en"
                inputMode="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setSavedBanner(false);
                }}
                placeholder="e.g., Ali"
                aria-invalid={firstHasInvalidChars}
                className={`w-full rounded-2xl border-3 px-4 py-3.5 font-display text-xl font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                  firstHasInvalidChars
                    ? 'border-rose-500 bg-rose-50 focus:border-rose-600'
                    : firstIsValid
                    ? 'border-emerald-400 bg-emerald-50/40 focus:border-emerald-500'
                    : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:bg-white'
                }`}
              />
              {firstHasInvalidChars ? (
                <p className="text-sm font-bold text-rose-600">
                  Please write in English / لطفاً به انگلیسی بنویسید
                </p>
              ) : (
                <p className="text-xs font-semibold text-slate-500">
                  English letters only (A–Z)
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <label
                  htmlFor="profile-last-name"
                  className="font-display text-lg font-bold text-slate-800"
                >
                  Last Name
                </label>
                <span
                  dir="rtl"
                  lang="fa"
                  className="font-persian text-sm font-bold text-slate-600"
                >
                  نام خانوادگی
                </span>
              </div>
              <input
                id="profile-last-name"
                type="text"
                dir="ltr"
                lang="en"
                inputMode="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setSavedBanner(false);
                }}
                placeholder="e.g., Rezaei"
                aria-invalid={lastHasInvalidChars}
                className={`w-full rounded-2xl border-3 px-4 py-3.5 font-display text-xl font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                  lastHasInvalidChars
                    ? 'border-rose-500 bg-rose-50 focus:border-rose-600'
                    : lastIsValid
                    ? 'border-emerald-400 bg-emerald-50/40 focus:border-emerald-500'
                    : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:bg-white'
                }`}
              />
              {lastHasInvalidChars ? (
                <p className="text-sm font-bold text-rose-600">
                  Please write in English / لطفاً به انگلیسی بنویسید
                </p>
              ) : (
                <p className="text-xs font-semibold text-slate-500">
                  English letters only (A–Z)
                </p>
              )}
            </div>
          </div>

          {/* Date of Birth + Automatic Age Calculation */}
          <div className="space-y-2.5">
            <div className="flex items-baseline justify-between gap-2">
              <label
                htmlFor="profile-dob"
                className="font-display text-lg font-bold text-slate-800"
              >
                Date of Birth
              </label>
              <span
                dir="rtl"
                lang="fa"
                className="font-persian text-sm font-bold text-slate-600"
              >
                تاریخ تولد
              </span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Calendar className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-600" />
                <input
                  id="profile-dob"
                  type="date"
                  max={todayIso}
                  value={birthDateIso}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className={`w-full rounded-2xl border-3 py-3.5 pl-12 pr-4 font-display text-xl font-bold text-slate-900 focus:outline-none transition-colors cursor-pointer ${
                    futureDateError
                      ? 'border-rose-500 bg-rose-50'
                      : birthDateIso
                      ? 'border-indigo-400 bg-indigo-50/40 focus:border-indigo-600'
                      : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:bg-white'
                  }`}
                />
              </div>

              {formattedBirthDate && (
                <div className="rounded-2xl bg-slate-100 px-4 py-3 font-display text-lg font-bold tabular-nums text-slate-700">
                  📅 {formattedBirthDate}
                </div>
              )}
            </div>

            {futureDateError && (
              <p className="text-sm font-bold text-rose-600">
                Please select a valid past birth date / تاریخ تولد نمی‌تواند در آینده باشد
              </p>
            )}

            {calculatedAge !== null && !futureDateError && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-50 px-4 py-3 font-display text-lg font-bold text-indigo-800 ring-2 ring-indigo-200"
              >
                <span>
                  🎂 Age: {calculatedAge} years old / سن:{' '}
                  {toPersianDigits(calculatedAge)} سال
                </span>
              </motion.div>
            )}
          </div>

          {savedBanner && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-100 px-4 py-3 font-display text-lg font-bold text-emerald-800"
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span>Profile Saved! · پروفایل ذخیره شد</span>
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={!canSave}
            whileHover={canSave ? { scale: 1.02 } : undefined}
            whileTap={canSave ? { scale: 0.96 } : undefined}
            className="flex min-h-[58px] w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-4 font-display text-2xl font-bold text-white shadow-lg transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
          >
            <Save className="h-6 w-6" />
            <span>Save Profile / ذخیره</span>
          </motion.button>
        </form>
      </div>
    </FantasyBackground>
  );
}
