export type DifficultyId = 'sprout' | 'fox' | 'owl' | 'master';

export type PlayMode = 'endless' | 'dash';

export type ClockSkinId = 'sunny' | 'berry' | 'ocean' | 'dino' | 'cosmic';

export type MascotMood =
  | 'idle'
  | 'thinking'
  | 'excited'
  | 'celebrate'
  | 'close'
  | 'oops';

export interface ClockTime {
  hour: number; // 1..12
  minute: number; // 0..59
  second: number; // 0..59
}

export type ClockAnchorMode = 'twelve-spikes' | 'four-spikes' | 'top-star' | 'none';

export interface DifficultyConfig {
  id: DifficultyId;
  name: string;
  tagline: string;
  ageHint: string;
  emoji: string;
  minuteStep: number;
  showSeconds: boolean;
  /** Whether hour hand moves smoothly with minutes (realistic) or snaps softly */
  proportionalHour: boolean;
  /** Progressive visual helper spikes on the clock face to keep it kid-friendly */
  anchorMode: ClockAnchorMode;
  cardBg: string;
  cardBorder: string;
  badgeBg: string;
  accentText: string;
  starMultiplier: number;
}

export interface ClockSkin {
  id: ClockSkinId;
  name: string;
  emoji: string;
  starsRequired: number;
  outerRingStart: string;
  outerRingEnd: string;
  outerShadow: string;
  innerRing: string;
  faceTop: string;
  faceBottom: string;
  numberColor: string;
  tickColor: string;
  majorTickColor: string;
  centerOuter: string;
  centerInner: string;
  decorativeDots?: boolean;
  starryFace?: boolean;
}

export interface RoundResult {
  target: ClockTime;
  guess: ClockTime;
  difficulty: DifficultyId;
  accuracy: number; // 0..100
  stars: number; // 0..3
  timeTakenMs: number;
  diffSeconds: number;
  diffText: string;
  usedPeek: boolean;
  isExact: boolean;
  newBadges: string[];
  newSkins: ClockSkinId[];
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  emoji: string;
  bg: string;
}

export interface PlayerProgress {
  totalStars: number;
  totalRounds: number;
  totalAccuracySum: number;
  currentStreak: number;
  bestStreak: number;
  fastestBullseyeMs: number | null;
  noPeekStreak: number;
  roundsByDifficulty: Record<DifficultyId, number>;
  unlockedBadges: string[];
  selectedSkin: ClockSkinId;
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
}
