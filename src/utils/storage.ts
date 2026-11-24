import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { CLOCK_SKINS } from '../data/gameData';
import { ClockSkinId, DifficultyId, PlayerProgress } from '../types/game';

const STORAGE_KEY = 'ticktock_mystery_progress_v1';

export const DEFAULT_PROGRESS: PlayerProgress = {
  totalStars: 0,
  totalRounds: 0,
  totalAccuracySum: 0,
  currentStreak: 0,
  bestStreak: 0,
  fastestBullseyeMs: null,
  noPeekStreak: 0,
  roundsByDifficulty: {
    sprout: 0,
    fox: 0,
    owl: 0,
    master: 0,
  },
  unlockedBadges: [],
  selectedSkin: 'sunny',
  soundEnabled: true,
  musicEnabled: true,
  hapticsEnabled: true,
};

export async function loadProgress(): Promise<PlayerProgress> {
  try {
    let raw: string | null = null;
    if (Capacitor.isNativePlatform()) {
      const res = await Preferences.get({ key: STORAGE_KEY });
      raw = res.value;
    } else if (typeof window !== 'undefined') {
      raw = window.localStorage.getItem(STORAGE_KEY);
    }
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<PlayerProgress>;
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      roundsByDifficulty: {
        ...DEFAULT_PROGRESS.roundsByDifficulty,
        ...(parsed.roundsByDifficulty || {}),
      },
      unlockedBadges: Array.isArray(parsed.unlockedBadges)
        ? parsed.unlockedBadges
        : [],
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export async function saveProgress(progress: PlayerProgress): Promise<void> {
  const serialized = JSON.stringify(progress);
  try {
    if (Capacitor.isNativePlatform()) {
      await Preferences.set({ key: STORAGE_KEY, value: serialized });
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, serialized);
    }
  } catch {
    // Gracefully ignore storage quota errors
  }
}

export function getUnlockedSkins(totalStars: number): ClockSkinId[] {
  return CLOCK_SKINS.filter((s) => totalStars >= s.starsRequired).map((s) => s.id);
}

/**
 * Updates PlayerProgress after a round and returns any newly unlocked badges & skins.
 */
export function applyRoundToProgress(
  prev: PlayerProgress,
  params: {
    difficulty: DifficultyId;
    accuracy: number;
    stars: number;
    timeTakenMs: number;
    usedPeek: boolean;
    isExact: boolean;
    dashCompletedStars?: number;
  }
): {
  next: PlayerProgress;
  newBadges: string[];
  newSkins: ClockSkinId[];
} {
  const prevSkins = new Set(getUnlockedSkins(prev.totalStars));

  const nextStars = prev.totalStars + params.stars;
  const nextRounds = prev.totalRounds + 1;
  const nextAccuracySum = prev.totalAccuracySum + params.accuracy;
  const isGreat = params.stars >= 2;
  const nextStreak = isGreat ? prev.currentStreak + 1 : 0;
  const nextBestStreak = Math.max(prev.bestStreak, nextStreak);
  const nextNoPeekStreak =
    !params.usedPeek && params.accuracy >= 90 ? prev.noPeekStreak + 1 : 0;

  let nextFastest = prev.fastestBullseyeMs;
  if (params.isExact || params.accuracy >= 98) {
    if (nextFastest === null || params.timeTakenMs < nextFastest) {
      nextFastest = params.timeTakenMs;
    }
  }

  const roundsByDifficulty = {
    ...prev.roundsByDifficulty,
    [params.difficulty]: (prev.roundsByDifficulty[params.difficulty] || 0) + 1,
  };

  const nextSkinsAll = getUnlockedSkins(nextStars);
  const newSkins = nextSkinsAll.filter((id) => !prevSkins.has(id));

  const ownedBadges = new Set(prev.unlockedBadges);
  const newBadges: string[] = [];

  const maybeAward = (id: string, condition: boolean) => {
    if (condition && !ownedBadges.has(id)) {
      ownedBadges.add(id);
      newBadges.push(id);
    }
  };

  maybeAward('first_tick', nextRounds >= 1);
  maybeAward('bullseye', params.isExact);
  maybeAward('hot_streak', nextStreak >= 5);
  maybeAward('lightning_owl', params.accuracy >= 90 && params.timeTakenMs <= 6000);
  maybeAward('sprout_champ', roundsByDifficulty.sprout >= 5);
  maybeAward('fox_champ', roundsByDifficulty.fox >= 5);
  maybeAward('owl_champ', roundsByDifficulty.owl >= 5);
  maybeAward(
    'master_sorcerer',
    params.difficulty === 'master' && params.accuracy >= 90
  );
  maybeAward('no_peek_pro', nextNoPeekStreak >= 3);
  maybeAward('star_collector', nextStars >= 15);
  maybeAward('clock_collector', nextSkinsAll.length >= 3);
  maybeAward(
    'dash_hero',
    params.dashCompletedStars !== undefined && params.dashCompletedStars >= 12
  );

  const next: PlayerProgress = {
    ...prev,
    totalStars: nextStars,
    totalRounds: nextRounds,
    totalAccuracySum: nextAccuracySum,
    currentStreak: nextStreak,
    bestStreak: nextBestStreak,
    fastestBullseyeMs: nextFastest,
    noPeekStreak: nextNoPeekStreak,
    roundsByDifficulty,
    unlockedBadges: Array.from(ownedBadges),
  };

  return { next, newBadges, newSkins };
}
