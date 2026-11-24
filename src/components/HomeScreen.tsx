import React, { useEffect, useState } from 'react';
import {
  Flame,
  Music,
  Palette,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { CLOCK_SKINS, DIFFICULTIES } from '../data/gameData';
import {
  ClockTime,
  DifficultyId,
  PlayMode,
  PlayerProgress,
} from '../types/game';
import { MysteryClock } from './MysteryClock';
import { PipMascot } from './PipMascot';
import { soundEngine } from '../utils/soundEngine';
import { haptics } from '../utils/haptics';

interface HomeScreenProps {
  progress: PlayerProgress;
  playMode: PlayMode;
  onChangePlayMode: (mode: PlayMode) => void;
  onStartGame: (difficulty: DifficultyId) => void;
  onOpenTrophies: (tab: 'badges' | 'skins') => void;
  onOpenParents: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

const DEMO_TIMES: ClockTime[] = [
  { hour: 10, minute: 10, second: 35 },
  { hour: 2, minute: 45, second: 18 },
  { hour: 7, minute: 20, second: 52 },
  { hour: 4, minute: 5, second: 42 },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  progress,
  playMode,
  onChangePlayMode,
  onStartGame,
  onOpenTrophies,
  onOpenParents,
  onToggleSound,
  onToggleMusic,
}) => {
  const [demoIdx, setDemoIdx] = useState(0);
  const activeSkin =
    CLOCK_SKINS.find((s) => s.id === progress.selectedSkin) || CLOCK_SKINS[0];

  // Gently whirl the mini hero clock every 3.8s so the title screen feels alive!
  useEffect(() => {
    const id = window.setInterval(() => {
      setDemoIdx((prev) => (prev + 1) % DEMO_TIMES.length);
    }, 3800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="safe-top safe-bottom mx-auto flex min-h-full w-full max-w-2xl flex-col px-4 pb-6 pt-3">
      {/* Top Status & Controls Bar */}
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonPop();
              onOpenTrophies('badges');
            }}
            className="toy-btn toy-btn-white flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-sm font-black text-amber-600"
            aria-label={`Total stars: ${progress.totalStars}`}
          >
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="tabular-nums">{progress.totalStars}</span>
          </button>

          {progress.bestStreak > 0 && (
            <div className="flex items-center gap-1 rounded-2xl border-2 border-orange-200 bg-white/90 px-2.5 py-1.5 text-sm font-black text-orange-600 shadow-sm">
              <Flame className="h-4 w-4 fill-orange-500 text-orange-500" />
              <span className="tabular-nums">{progress.bestStreak}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonPop();
              onOpenTrophies('skins');
            }}
            aria-label="Clock Skins"
            className="toy-btn toy-btn-white flex h-10 w-10 items-center justify-center rounded-2xl text-pink-500"
          >
            <Palette className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonPop();
              onOpenTrophies('badges');
            }}
            aria-label="Trophy Room"
            className="toy-btn toy-btn-sunny flex h-10 w-10 items-center justify-center rounded-2xl text-amber-950"
          >
            <Trophy className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onToggleMusic}
            aria-label={progress.musicEnabled ? 'Mute kids music' : 'Play kids music'}
            title={progress.musicEnabled ? 'Music On' : 'Music Off'}
            className={`toy-btn toy-btn-white relative flex h-10 w-10 items-center justify-center rounded-2xl ${
              progress.musicEnabled ? 'text-purple-500' : 'text-slate-400'
            }`}
          >
            <Music className="h-5 w-5" />
            {!progress.musicEnabled && (
              <span className="pointer-events-none absolute h-0.5 w-6 rotate-45 rounded-full bg-rose-400" />
            )}
          </button>
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={progress.soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
            title={progress.soundEnabled ? 'Sound Effects On' : 'Sound Effects Off'}
            className="toy-btn toy-btn-white flex h-10 w-10 items-center justify-center rounded-2xl text-sky-600"
          >
            {progress.soundEnabled ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5 text-slate-400" />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonPop();
              onOpenParents();
            }}
            aria-label="Parents & Privacy Info"
            className="toy-btn toy-btn-white flex h-10 w-10 items-center justify-center rounded-2xl text-emerald-600"
          >
            <ShieldCheck className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Hero Section: Animated Mystery Clock + Title + Pip */}
      <section className="mt-3 flex flex-col items-center text-center">
        <div className="relative flex items-center justify-center">
          <MysteryClock
            targetTime={DEMO_TIMES[demoIdx]}
            showSeconds={true}
            revealed={false}
            peekActive={false}
            skin={activeSkin}
            spinKey={demoIdx}
            sizeClassName="w-[146px] h-[146px] sm:w-[168px] sm:h-[168px]"
            showLegend={false}
          />
          <div className="absolute -right-8 -top-2">
            <PipMascot mood="excited" size="sm" />
          </div>
          <span
            className="animate-sparkle absolute -left-5 top-3 text-2xl select-none"
            aria-hidden="true"
          >
            ✨
          </span>
        </div>

        <h1 className="mt-2.5 text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">
          <span className="text-[#FF5A5F]">Tick</span>
          <span className="text-[#29B6F6]">Tock</span>{' '}
          <span className="text-[#9B5DE5]">Mystery</span>
        </h1>
        <p className="mt-1 max-w-sm text-sm font-extrabold text-slate-500">
          No numbers! No ticks! Can you guess the secret time just from the angles?
        </p>
      </section>

      {/* Play Mode Selector: Free Play vs 5-Round Dash */}
      <div className="mx-auto mt-4 grid w-full max-w-md grid-cols-2 gap-2 rounded-3xl border-2 border-amber-200/80 bg-white/85 p-1.5 shadow-sm">
        <button
          type="button"
          onClick={() => {
            soundEngine.playButtonPop();
            haptics.tapLight();
            onChangePlayMode('endless');
          }}
          className={`flex items-center justify-center gap-1.5 rounded-2xl py-2.5 text-sm font-black transition-all ${
            playMode === 'endless'
              ? 'bg-gradient-to-b from-[#52C8FA] to-[#29B6F6] text-white shadow-md'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Free Play
        </button>
        <button
          type="button"
          onClick={() => {
            soundEngine.playButtonPop();
            haptics.tapLight();
            onChangePlayMode('dash');
          }}
          className={`flex items-center justify-center gap-1.5 rounded-2xl py-2.5 text-sm font-black transition-all ${
            playMode === 'dash'
              ? 'bg-gradient-to-b from-[#FFE047] to-[#FFC800] text-amber-950 shadow-md'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Zap className="h-4 w-4" />
          5-Round Dash
        </button>
      </div>

      {/* Playful Difficulty World Cards */}
      <section className="mt-4 flex-1">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
            Pick Your World
          </h2>
          <span className="text-xs font-extrabold text-slate-400">
            {playMode === 'dash' ? '5 quick rounds • 15 ⭐ max' : 'Play at your own pace'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {DIFFICULTIES.map((diff) => {
            const played = progress.roundsByDifficulty[diff.id] || 0;
            return (
              <button
                key={diff.id}
                type="button"
                onClick={() => {
                  soundEngine.playButtonPop();
                  haptics.tapMedium();
                  onStartGame(diff.id);
                }}
                className={`toy-btn group flex items-center justify-between rounded-[26px] border-3 ${diff.cardBorder} bg-gradient-to-br ${diff.cardBg} p-3.5 text-left shadow-[0_5px_0_rgba(15,23,42,0.12)]`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/90 text-3xl shadow-sm transition-transform group-hover:scale-105">
                    {diff.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-black leading-tight text-slate-800">
                        {diff.name}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase text-white ${diff.badgeBg}`}
                      >
                        {diff.ageHint}
                      </span>
                    </div>
                    <p className={`mt-0.5 text-xs font-extrabold ${diff.accentText}`}>
                      {diff.tagline}
                    </p>
                    {played > 0 && (
                      <p className="mt-0.5 text-[11px] font-bold text-slate-500">
                        {played} {played === 1 ? 'mystery' : 'mysteries'} solved
                      </p>
                    )}
                  </div>
                </div>

                <div className="ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/90 text-slate-700 shadow-sm">
                  <Play className="h-5 w-5 fill-current" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Kid-safe offline footer pill */}
      <footer className="mt-4 flex items-center justify-center gap-2 text-[11px] font-extrabold text-slate-400">
        <span>🛡️ 100% Kid-Safe</span>
        <span>•</span>
        <span>No Ads</span>
        <span>•</span>
        <span>Works Offline</span>
      </footer>
    </div>
  );
};
