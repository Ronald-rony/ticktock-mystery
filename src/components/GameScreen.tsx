import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Flame,
  Lightbulb,
  Music,
  Sparkles,
  Star,
  Timer,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  BADGES,
  CLOCK_SKINS,
  DIFFICULTY_MAP,
  PIP_MESSAGES,
  pickRandom,
} from '../data/gameData';
import {
  ClockTime,
  DifficultyId,
  MascotMood,
  PlayMode,
  PlayerProgress,
  RoundResult,
} from '../types/game';
import {
  evaluateGuess,
  formatClockTime,
  generateMysteryTime,
} from '../utils/clockMath';
import { soundEngine } from '../utils/soundEngine';
import { musicEngine } from '../utils/musicEngine';
import { haptics } from '../utils/haptics';
import { MysteryClock } from './MysteryClock';
import { PipMascot } from './PipMascot';
import { TimeControls } from './TimeControls';

interface GameScreenProps {
  difficultyId: DifficultyId;
  playMode: PlayMode;
  progress: PlayerProgress;
  onExit: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onRoundComplete: (
    result: Omit<RoundResult, 'newBadges' | 'newSkins'>,
    dashCompletedStars?: number
  ) => { newBadges: string[]; newSkins: typeof CLOCK_SKINS[number]['id'][] };
  onDashFinished: (results: RoundResult[]) => void;
}

const DASH_TOTAL_ROUNDS = 5;

export const GameScreen: React.FC<GameScreenProps> = ({
  difficultyId,
  playMode,
  progress,
  onExit,
  onToggleSound,
  onToggleMusic,
  onRoundComplete,
  onDashFinished,
}) => {
  const config = DIFFICULTY_MAP[difficultyId];
  const activeSkin =
    CLOCK_SKINS.find((s) => s.id === progress.selectedSkin) || CLOCK_SKINS[0];

  const [targetTime, setTargetTime] = useState<ClockTime>(() =>
    generateMysteryTime(config, null)
  );
  const [guess, setGuess] = useState<ClockTime>({
    hour: 12,
    minute: 0,
    second: 0,
  });
  const [spinKey, setSpinKey] = useState(1);
  const [revealed, setRevealed] = useState(false);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [dashResults, setDashResults] = useState<RoundResult[]>([]);

  // Optional friendly compass peek
  const [peekActive, setPeekActive] = useState(false);
  const [usedPeek, setUsedPeek] = useState(false);
  const peekTimerRef = useRef<number | null>(null);

  // Calm elapsed timer
  const roundStartRef = useRef<number>(Date.now());
  const [elapsedSec, setElapsedSec] = useState(0);

  // Expressive mascot state
  const [mood, setMood] = useState<MascotMood>('thinking');
  const [pipMsg, setPipMsg] = useState<string>(() =>
    pickRandom(config.showSeconds ? PIP_MESSAGES.masterIntro : PIP_MESSAGES.intro)
  );

  // Play spring spin sound on mount
  useEffect(() => {
    soundEngine.playSpinWhoosh();
    return () => {
      if (peekTimerRef.current) window.clearTimeout(peekTimerRef.current);
    };
  }, []);

  // Calm timer tick while guessing
  useEffect(() => {
    if (revealed) return;
    roundStartRef.current = Date.now();
    setElapsedSec(0);
    const id = window.setInterval(() => {
      setElapsedSec((Date.now() - roundStartRef.current) / 1000);
    }, 100);
    return () => window.clearInterval(id);
  }, [spinKey, revealed]);

  const handleGuessChange = (next: ClockTime) => {
    setGuess(next);
    if (mood !== 'excited') {
      setMood('excited');
    }
  };

  const handlePeek = () => {
    if (revealed || peekActive) return;
    soundEngine.playPeek();
    haptics.tapLight();
    setUsedPeek(true);
    setPeekActive(true);
    setMood('idle');
    setPipMsg(pickRandom(PIP_MESSAGES.peek));
    if (peekTimerRef.current) window.clearTimeout(peekTimerRef.current);
    peekTimerRef.current = window.setTimeout(() => {
      setPeekActive(false);
    }, 1800);
  };

  const handleSubmitGuess = () => {
    if (revealed) return;
    const timeTakenMs = Math.max(300, Date.now() - roundStartRef.current);
    const evaluation = evaluateGuess(targetTime, guess, config);

    const isLastDashRound =
      playMode === 'dash' && dashResults.length + 1 >= DASH_TOTAL_ROUNDS;
    const dashCompletedStars = isLastDashRound
      ? dashResults.reduce((sum, r) => sum + r.stars, 0) + evaluation.stars
      : undefined;

    const baseResult: Omit<RoundResult, 'newBadges' | 'newSkins'> = {
      target: targetTime,
      guess,
      difficulty: difficultyId,
      accuracy: evaluation.accuracy,
      stars: evaluation.stars,
      timeTakenMs,
      diffSeconds: evaluation.diffSeconds,
      diffText: evaluation.diffText,
      usedPeek,
      isExact: evaluation.isExact,
    };

    const { newBadges, newSkins } = onRoundComplete(
      baseResult,
      dashCompletedStars
    );

    const fullResult: RoundResult = {
      ...baseResult,
      newBadges,
      newSkins,
    };

    setRevealed(true);
    setPeekActive(false);
    setRoundResult(fullResult);

    if (playMode === 'dash') {
      setDashResults((prev) => [...prev, fullResult]);
    }

    // Play domino number reveal + celebration audio & haptics (duck music briefly!)
    musicEngine.duck(1250);
    soundEngine.playRevealRipple();
    soundEngine.playCelebrate(evaluation.stars, evaluation.isExact);
    if (newBadges.length > 0 || newSkins.length > 0) {
      window.setTimeout(() => soundEngine.playBadgeUnlock(), 720);
    }
    haptics.celebrate(evaluation.stars);

    // Expressive Pip reaction
    if (evaluation.isExact) {
      setMood('celebrate');
      setPipMsg(pickRandom(PIP_MESSAGES.exact));
    } else if (evaluation.stars === 3) {
      setMood('celebrate');
      setPipMsg(pickRandom(PIP_MESSAGES.threeStar));
    } else if (evaluation.stars === 2) {
      setMood('close');
      setPipMsg(pickRandom(PIP_MESSAGES.twoStar));
    } else if (evaluation.stars === 1) {
      setMood('close');
      setPipMsg(pickRandom(PIP_MESSAGES.oneStar));
    } else {
      setMood('oops');
      setPipMsg(pickRandom(PIP_MESSAGES.tryAgain));
    }
  };

  const handleNextRound = () => {
    soundEngine.playButtonPop();
    haptics.tapMedium();

    if (playMode === 'dash' && dashResults.length >= DASH_TOTAL_ROUNDS) {
      onDashFinished(dashResults);
      return;
    }

    const nextTarget = generateMysteryTime(config, targetTime);
    setTargetTime(nextTarget);
    setGuess({ hour: 12, minute: 0, second: 0 });
    setRevealed(false);
    setRoundResult(null);
    setUsedPeek(false);
    setPeekActive(false);
    setMood('thinking');
    setPipMsg(
      pickRandom(config.showSeconds ? PIP_MESSAGES.masterIntro : PIP_MESSAGES.intro)
    );
    setSpinKey((k) => k + 1);
    soundEngine.playSpinWhoosh();
  };

  const currentDashIndex =
    playMode === 'dash'
      ? Math.min(DASH_TOTAL_ROUNDS, revealed ? dashResults.length : dashResults.length + 1)
      : 0;

  return (
    <div className="safe-top safe-bottom mx-auto flex min-h-full w-full max-w-xl flex-col justify-between px-3.5 pb-4 pt-2.5 sm:px-5">
      {/* Top Game Header */}
      <header className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            soundEngine.playButtonPop();
            onExit();
          }}
          aria-label="Back to Worlds"
          className="toy-btn toy-btn-white flex h-10 w-10 items-center justify-center rounded-2xl text-slate-600"
        >
          <ArrowLeft className="h-5 w-5 stroke-[3]" />
        </button>

        {/* Center World / Dash Progress Pill */}
        <div className="flex items-center gap-2 rounded-2xl border-2 border-white bg-white/90 px-3 py-1.5 shadow-sm">
          <span className="text-base">{config.emoji}</span>
          {playMode === 'dash' ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-700">
                {currentDashIndex}/{DASH_TOTAL_ROUNDS}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: DASH_TOTAL_ROUNDS }).map((_, i) => {
                  const res = dashResults[i];
                  return (
                    <span
                      key={i}
                      className={`h-2.5 w-2.5 rounded-full transition-all ${
                        res
                          ? res.stars >= 2
                            ? 'bg-[#58CC02] scale-110'
                            : 'bg-amber-400'
                          : i === dashResults.length && !revealed
                          ? 'bg-sky-400 animate-pulse'
                          : 'bg-slate-200'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <span className="text-xs font-black text-slate-700 sm:text-sm">
              {config.name}
            </span>
          )}
        </div>

        {/* Right HUD: Streak, Stars, Timer, Mute */}
        <div className="flex items-center gap-1.5">
          {progress.currentStreak > 0 && (
            <div className="flex items-center gap-0.5 rounded-2xl bg-orange-100 px-2 py-1 text-xs font-black text-orange-600">
              <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
              <span className="tabular-nums">{progress.currentStreak}</span>
            </div>
          )}

          <div className="flex items-center gap-1 rounded-2xl bg-amber-100 px-2 py-1 text-xs font-black text-amber-700">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="tabular-nums">{progress.totalStars}</span>
          </div>

          <div className="hidden items-center gap-1 rounded-2xl bg-white/85 px-2 py-1 text-xs font-black tabular-nums text-slate-500 sm:flex">
            <Timer className="h-3.5 w-3.5 text-sky-500" />
            {elapsedSec.toFixed(1)}s
          </div>

          <button
            type="button"
            onClick={onToggleMusic}
            aria-label={progress.musicEnabled ? 'Mute kids music' : 'Play kids music'}
            title={progress.musicEnabled ? 'Music On' : 'Music Off'}
            className={`toy-btn toy-btn-white relative flex h-10 w-10 items-center justify-center rounded-2xl ${
              progress.musicEnabled ? 'text-purple-500' : 'text-slate-400'
            }`}
          >
            <Music className="h-4 w-4" />
            {!progress.musicEnabled && (
              <span className="pointer-events-none absolute h-0.5 w-5 rotate-45 rounded-full bg-rose-400" />
            )}
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            aria-label={progress.soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
            className="toy-btn toy-btn-white flex h-10 w-10 items-center justify-center rounded-2xl text-sky-600"
          >
            {progress.soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4 text-slate-400" />
            )}
          </button>
        </div>
      </header>

      {/* Pip Mascot Encouragement Strip */}
      <div className="mt-2 flex items-center justify-center">
        <PipMascot mood={mood} message={pipMsg} size="sm" compact />
      </div>

      {/* Hero Centerpiece: The Mystery Analog Clock */}
      <div className="my-2 flex flex-col items-center justify-center">
        <MysteryClock
          targetTime={targetTime}
          guessTime={revealed ? guess : null}
          showSeconds={config.showSeconds}
          proportionalHour={config.proportionalHour}
          anchorMode={config.anchorMode}
          revealed={revealed}
          peekActive={peekActive}
          skin={activeSkin}
          spinKey={spinKey}
          sizeClassName="w-[232px] h-[232px] sm:w-[276px] sm:h-[276px] md:w-[300px] md:h-[300px]"
        />
      </div>

      {/* Bottom Interactive Area: Guess Controls OR Juicy Reveal Card */}
      <div className="mt-1 w-full">
        {!revealed ? (
          <div className="space-y-2.5">
            <TimeControls
              guess={guess}
              onChange={handleGuessChange}
              config={config}
            />

            {/* Action Row: Friendly Peek + Giant Squishy Submit */}
            <div className="flex items-center gap-2.5 pt-0.5">
              <button
                type="button"
                onClick={handlePeek}
                disabled={peekActive}
                title="Briefly glow the 12, 3, 6, 9 dots"
                className="toy-btn toy-btn-sunny flex h-14 shrink-0 items-center justify-center gap-1.5 rounded-2xl px-4 text-sm font-black text-amber-950 disabled:opacity-60"
              >
                <Lightbulb className="h-5 w-5" />
                <span>Peek</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitGuess}
                className="toy-btn toy-btn-green flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl text-lg font-black tracking-wide text-white"
              >
                <Check className="h-6 w-6 stroke-[3.5]" />
                <span>CHECK MY GUESS!</span>
              </button>
            </div>
          </div>
        ) : (
          roundResult && (
            <div className="animate-pop-in space-y-2.5">
              {/* Juicy Reveal Breakdown Card */}
              <div className="toy-card rounded-3xl p-3.5">
                {/* Top row: Stars + Accuracy + Time */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`h-7 w-7 transition-transform ${
                          s <= roundResult.stars
                            ? 'fill-amber-400 text-amber-400 drop-shadow-sm scale-110'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-2xl px-3 py-1 text-base font-black tabular-nums ${
                        roundResult.accuracy >= 95
                          ? 'bg-emerald-100 text-emerald-700'
                          : roundResult.accuracy >= 80
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {roundResult.accuracy}% Match
                    </span>
                    <span className="flex items-center gap-1 rounded-2xl bg-slate-100 px-2.5 py-1 text-xs font-black tabular-nums text-slate-600">
                      <Timer className="h-3.5 w-3.5 text-sky-500" />
                      {(roundResult.timeTakenMs / 1000).toFixed(1)}s
                    </span>
                  </div>
                </div>

                {/* Comparison Pills: Your Guess vs Real Time */}
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/70 px-3 py-2 text-center">
                    <div className="text-[10px] font-black uppercase tracking-wider text-sky-600">
                      Your Guess
                    </div>
                    <div className="text-xl font-black tabular-nums text-slate-800">
                      {formatClockTime(roundResult.guess, config.showSeconds)}
                    </div>
                  </div>
                  <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/80 px-3 py-2 text-center">
                    <div className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                      Secret Time
                    </div>
                    <div className="text-xl font-black tabular-nums text-emerald-700">
                      {formatClockTime(roundResult.target, config.showSeconds)}
                    </div>
                  </div>
                </div>

                {/* Diff summary pill */}
                <div className="mt-2 text-center text-xs font-black text-slate-500">
                  {roundResult.isExact ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-0.5 text-emerald-700">
                      <Sparkles className="h-3.5 w-3.5" />
                      {roundResult.diffText}
                    </span>
                  ) : (
                    <span>{roundResult.diffText}</span>
                  )}
                </div>

                {/* Newly Unlocked Badges / Skins Toast! */}
                {(roundResult.newBadges.length > 0 ||
                  roundResult.newSkins.length > 0) && (
                  <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-100 via-yellow-100 to-pink-100 px-3 py-2 text-xs font-black text-amber-950">
                    {roundResult.newBadges.map((bId) => {
                      const b = BADGES.find((x) => x.id === bId);
                      return b ? (
                        <span
                          key={bId}
                          className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-0.5 shadow-sm"
                        >
                          {b.emoji} New Badge: {b.name}!
                        </span>
                      ) : null;
                    })}
                    {roundResult.newSkins.map((sId) => {
                      const s = CLOCK_SKINS.find((x) => x.id === sId);
                      return s ? (
                        <span
                          key={sId}
                          className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-0.5 shadow-sm"
                        >
                          {s.emoji} Unlocked Skin: {s.name}!
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* Next Mystery / Finish Dash Button */}
              <button
                type="button"
                onClick={handleNextRound}
                className="toy-btn toy-btn-sky flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-lg font-black tracking-wide text-white"
              >
                {playMode === 'dash' && dashResults.length >= DASH_TOTAL_ROUNDS ? (
                  <>
                    <Trophy className="h-6 w-6" />
                    <span>OPEN MY TREASURE!</span>
                  </>
                ) : (
                  <>
                    <span>NEXT MYSTERY</span>
                    <ArrowRight className="h-6 w-6 stroke-[3]" />
                  </>
                )}
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};
