import { ClockTime, DifficultyConfig } from '../types/game';

const TWELVE_HOURS_IN_SECONDS = 12 * 3600; // 43,200

export function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

export function formatClockTime(time: ClockTime, showSeconds: boolean): string {
  const h = time.hour.toString();
  const m = pad2(time.minute);
  if (showSeconds) {
    return `${h}:${m}:${pad2(time.second)}`;
  }
  return `${h}:${m}`;
}

/**
 * Convert ClockTime to seconds since 12:00:00 (0 .. 43199).
 */
export function toSeconds12(time: ClockTime, includeSeconds: boolean): number {
  const h = time.hour % 12;
  const s = includeSeconds ? time.second : 0;
  return h * 3600 + time.minute * 60 + s;
}

/**
 * Exact analog hand angles in degrees (0 = 12 o'clock, clockwise).
 */
export function getHandAngles(
  time: ClockTime,
  showSeconds: boolean,
  proportionalHour = true
): { hourDeg: number; minuteDeg: number; secondDeg: number } {
  const h = time.hour % 12;
  const s = showSeconds ? time.second : 0;
  const secondDeg = s * 6;
  const minuteDeg = time.minute * 6 + (showSeconds ? s * 0.1 : 0);
  const hourDeg = proportionalHour
    ? h * 30 + time.minute * 0.5 + (showSeconds ? s / 120 : 0)
    : h * 30;
  return { hourDeg, minuteDeg, secondDeg };
}

/**
 * Shortest circular angular difference in degrees (0..180).
 */
export function shortestAngleDiff(a: number, b: number): number {
  const d = Math.abs(((a - b) % 360 + 540) % 360 - 180);
  return d;
}

/**
 * Compute accuracy percentage (0..100), stars (0..3), and friendly diff label.
 * Uses circular time distance + individual hand closeness so kids get intuitive, fair scores!
 */
export function evaluateGuess(
  target: ClockTime,
  guess: ClockTime,
  config: DifficultyConfig
): {
  accuracy: number;
  stars: number;
  diffSeconds: number;
  diffText: string;
  isExact: boolean;
} {
  const tSec = toSeconds12(target, config.showSeconds);
  const gSec = toSeconds12(guess, config.showSeconds);

  const rawDiff = Math.abs(tSec - gSec);
  const diffSeconds = Math.min(rawDiff, TWELVE_HOURS_IN_SECONDS - rawDiff);

  const isExact =
    target.hour === guess.hour &&
    target.minute === guess.minute &&
    (!config.showSeconds || target.second === guess.second);

  // Calculate per-hand circular accuracy so guessing the minute hand right even if hour is off by 1 still feels fair,
  // while keeping total time closeness the primary driver!
  const tAngles = getHandAngles(target, config.showSeconds, config.proportionalHour);
  const gAngles = getHandAngles(guess, config.showSeconds, config.proportionalHour);

  const hourAcc = Math.max(0, 1 - shortestAngleDiff(tAngles.hourDeg, gAngles.hourDeg) / 180);
  const minAcc = Math.max(0, 1 - shortestAngleDiff(tAngles.minuteDeg, gAngles.minuteDeg) / 180);
  const secAcc = Math.max(0, 1 - shortestAngleDiff(tAngles.secondDeg, gAngles.secondDeg) / 180);

  let accuracy: number;
  if (isExact) {
    accuracy = 100;
  } else if (config.showSeconds) {
    // Master mode: 45% hour, 35% minute, 20% second
    const blended = hourAcc * 0.45 + minAcc * 0.35 + secAcc * 0.2;
    // Also factor in total time closeness softly
    const timeCloseness = Math.max(0, 1 - diffSeconds / 7200);
    accuracy = Math.round(Math.min(99, (blended * 0.72 + timeCloseness * 0.28) * 100));
  } else {
    // Standard modes: 55% hour angle + 45% minute angle, gently boosted by total time closeness
    const blended = hourAcc * 0.55 + minAcc * 0.45;
    const timeCloseness = Math.max(0, 1 - diffSeconds / 5400);
    accuracy = Math.round(Math.min(99, (blended * 0.7 + timeCloseness * 0.3) * 100));
  }

  // Stars threshold calibrated to feel rewarding and fair for kids!
  let stars = 0;
  if (isExact || accuracy >= 95) {
    stars = 3;
  } else if (accuracy >= 82) {
    stars = 2;
  } else if (accuracy >= 65) {
    stars = 1;
  }

  // Friendly difference label
  let diffText = 'SPOT ON! Bullseye!';
  if (!isExact) {
    const totalMins = Math.floor(diffSeconds / 60);
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    const secs = diffSeconds % 60;

    const parts: string[] = [];
    if (hrs > 0) parts.push(`${hrs} ${hrs === 1 ? 'hr' : 'hrs'}`);
    if (mins > 0) parts.push(`${mins} ${mins === 1 ? 'min' : 'mins'}`);
    if (config.showSeconds && secs > 0 && hrs === 0) {
      parts.push(`${secs} ${secs === 1 ? 'sec' : 'secs'}`);
    }
    diffText = parts.length > 0 ? `Off by ${parts.join(' ')}` : 'Just a hair off!';
  }

  return { accuracy, stars, diffSeconds, diffText, isExact };
}

/**
 * Generates a fresh playful mystery time for the given difficulty, avoiding repeats.
 */
export function generateMysteryTime(
  config: DifficultyConfig,
  previous?: ClockTime | null
): ClockTime {
  for (let attempt = 0; attempt < 12; attempt++) {
    const hour = Math.floor(Math.random() * 12) + 1;
    const stepCount = Math.floor(60 / config.minuteStep);
    const minute = Math.floor(Math.random() * stepCount) * config.minuteStep;
    const second = config.showSeconds ? Math.floor(Math.random() * 60) : 0;

    if (
      !previous ||
      previous.hour !== hour ||
      previous.minute !== minute ||
      (config.showSeconds && previous.second !== second)
    ) {
      return { hour, minute, second };
    }
  }
  return { hour: 3, minute: 15, second: 0 };
}
