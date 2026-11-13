import { REWARD_BADGES } from '../data/vocabulary';

export interface GameScores {
  guess: number;
  match: number;
  listen: number;
  spell: number;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar: string;
  birthDate: string;
  age: number | null;
}

export interface PersistedProgress {
  gameScores: GameScores;
  challengeStars: number;
  challengeBestScore: number;
  userProfile: UserProfile;
  exploredLetters: string[];
  unlockedBadgeIds: string[];
  soundEnabled: boolean;
}

const STORAGE_KEY = 'learn_english_kids_progress_v1';

export const DEFAULT_PROGRESS: PersistedProgress = {
  gameScores: {
    guess: 0,
    match: 0,
    listen: 0,
    spell: 0,
  },
  challengeStars: 0,
  challengeBestScore: 0,
  userProfile: {
    firstName: '',
    lastName: '',
    avatar: '🦊',
    birthDate: '',
    age: null,
  },
  exploredLetters: [],
  unlockedBadgeIds: [],
  soundEnabled: true,
};

export function calculateAgeFromSlashBirthDate(birthDate: string): number | null {
  const parts = birthDate.split('/');
  if (parts.length !== 3) return null;
  const birthYear = Number(parts[0]);
  const birthMonth = Number(parts[1]);
  const birthDay = Number(parts[2]);
  if (!Number.isFinite(birthYear) || !Number.isFinite(birthMonth) || !Number.isFinite(birthDay)) {
    return null;
  }

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

export function computeTotalStars(
  scores: GameScores,
  challengeStars = 0
): number {
  return (
    scores.guess +
    scores.match +
    scores.listen +
    scores.spell +
    challengeStars
  );
}

export function evaluateUnlockedBadges(progress: PersistedProgress): string[] {
  const totalStars = computeTotalStars(
    progress.gameScores,
    progress.challengeStars
  );
  const gamesPlayedWithStars = Object.values(progress.gameScores).filter((v) => v > 0).length;
  const alphabetCount = progress.exploredLetters.length;

  const unlocked = new Set(progress.unlockedBadgeIds);

  for (const badge of REWARD_BADGES) {
    if (badge.requiredStars !== undefined && totalStars >= badge.requiredStars) {
      unlocked.add(badge.id);
    }
    if (
      badge.requiredAlphabetCount !== undefined &&
      alphabetCount >= badge.requiredAlphabetCount
    ) {
      unlocked.add(badge.id);
    }
    if (
      badge.requiredGamesPlayed !== undefined &&
      gamesPlayedWithStars >= badge.requiredGamesPlayed
    ) {
      unlocked.add(badge.id);
    }
  }

  return Array.from(unlocked);
}

export function loadProgress(): PersistedProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<PersistedProgress>;
    const merged: PersistedProgress = {
      gameScores: {
        guess: Number(parsed.gameScores?.guess) || 0,
        match: Number(parsed.gameScores?.match) || 0,
        listen: Number(parsed.gameScores?.listen) || 0,
        spell: Number(parsed.gameScores?.spell) || 0,
      },
      challengeStars: Number(parsed.challengeStars) || 0,
      challengeBestScore: Math.min(10, Math.max(0, Number(parsed.challengeBestScore) || 0)),
      userProfile: (() => {
        const savedBirthDate =
          typeof parsed.userProfile?.birthDate === 'string'
            ? parsed.userProfile.birthDate
            : '';
        const computedAge = savedBirthDate
          ? calculateAgeFromSlashBirthDate(savedBirthDate)
          : null;
        return {
          firstName:
            typeof parsed.userProfile?.firstName === 'string'
              ? parsed.userProfile.firstName
              : '',
          lastName:
            typeof parsed.userProfile?.lastName === 'string'
              ? parsed.userProfile.lastName
              : '',
          avatar:
            typeof parsed.userProfile?.avatar === 'string' &&
            parsed.userProfile.avatar.length > 0
              ? parsed.userProfile.avatar
              : '🦊',
          birthDate: savedBirthDate,
          age:
            computedAge !== null
              ? computedAge
              : typeof parsed.userProfile?.age === 'number' &&
                parsed.userProfile.age >= 0
              ? parsed.userProfile.age
              : null,
        };
      })(),
      exploredLetters: Array.isArray(parsed.exploredLetters)
        ? parsed.exploredLetters.filter((x): x is string => typeof x === 'string')
        : [],
      unlockedBadgeIds: Array.isArray(parsed.unlockedBadgeIds)
        ? parsed.unlockedBadgeIds.filter((x): x is string => typeof x === 'string')
        : [],
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
    };
    merged.unlockedBadgeIds = evaluateUnlockedBadges(merged);
    return merged;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: PersistedProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors
  }
}

export function resetProgressStorage(): PersistedProgress {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }
  return DEFAULT_PROGRESS;
}
