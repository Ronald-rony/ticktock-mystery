import React, { useState } from 'react';
import { Award, Check, Flame, Lock, Palette, Star, Timer, Trophy, X } from 'lucide-react';
import { BADGES, CLOCK_SKINS } from '../data/gameData';
import { ClockSkinId, PlayerProgress } from '../types/game';
import { soundEngine } from '../utils/soundEngine';
import { haptics } from '../utils/haptics';

interface TrophyModalProps {
  progress: PlayerProgress;
  initialTab?: 'badges' | 'skins';
  onSelectSkin: (skinId: ClockSkinId) => void;
  onClose: () => void;
}

export const TrophyModal: React.FC<TrophyModalProps> = ({
  progress,
  initialTab = 'badges',
  onSelectSkin,
  onClose,
}) => {
  const [tab, setTab] = useState<'badges' | 'skins'>(initialTab);
  const avgAccuracy =
    progress.totalRounds > 0
      ? Math.round(progress.totalAccuracySum / progress.totalRounds)
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-3 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Trophies and Clock Skins"
    >
      <div className="animate-pop-in flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-[32px] border-4 border-white bg-[#FFF9ED] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[#FFE047] to-[#FFC800] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 text-amber-500 shadow-sm">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-amber-950">Trophy Room</h2>
              <p className="text-xs font-bold text-amber-900/80">
                Earn stars to unlock badges & toy clocks!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonPop();
              onClose();
            }}
            aria-label="Close Trophy Room"
            className="toy-btn toy-btn-white flex h-10 w-10 items-center justify-center rounded-2xl text-slate-600"
          >
            <X className="h-5 w-5 stroke-[3]" />
          </button>
        </div>

        {/* Summary Stats Row */}
        <div className="grid grid-cols-4 gap-2 px-4 pt-4">
          <div className="flex flex-col items-center rounded-2xl bg-white p-2.5 shadow-sm border-2 border-amber-100">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            <span className="mt-0.5 text-lg font-black text-slate-800">
              {progress.totalStars}
            </span>
            <span className="text-[10px] font-extrabold uppercase text-slate-400">
              Stars
            </span>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-white p-2.5 shadow-sm border-2 border-orange-100">
            <Flame className="h-5 w-5 fill-orange-500 text-orange-500" />
            <span className="mt-0.5 text-lg font-black text-slate-800">
              {progress.bestStreak}
            </span>
            <span className="text-[10px] font-extrabold uppercase text-slate-400">
              Best Run
            </span>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-white p-2.5 shadow-sm border-2 border-sky-100">
            <Award className="h-5 w-5 text-sky-500" />
            <span className="mt-0.5 text-lg font-black text-slate-800">
              {avgAccuracy}%
            </span>
            <span className="text-[10px] font-extrabold uppercase text-slate-400">
              Avg Acc
            </span>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-white p-2.5 shadow-sm border-2 border-purple-100">
            <Timer className="h-5 w-5 text-purple-500" />
            <span className="mt-0.5 text-lg font-black text-slate-800">
              {progress.fastestBullseyeMs
                ? `${(progress.fastestBullseyeMs / 1000).toFixed(1)}s`
                : '—'}
            </span>
            <span className="text-[10px] font-extrabold uppercase text-slate-400">
              Fastest
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-4 mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-amber-100/70 p-1.5">
          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonPop();
              setTab('badges');
            }}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-black transition-all ${
              tab === 'badges'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-amber-900/70 hover:text-amber-950'
            }`}
          >
            <Award className="h-4 w-4" />
            Badges ({progress.unlockedBadges.length}/{BADGES.length})
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonPop();
              setTab('skins');
            }}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-black transition-all ${
              tab === 'skins'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-amber-900/70 hover:text-amber-950'
            }`}
          >
            <Palette className="h-4 w-4" />
            Clock Skins
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="nice-scroll flex-1 overflow-y-auto p-4">
          {tab === 'badges' ? (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {BADGES.map((badge) => {
                const unlocked = progress.unlockedBadges.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`flex flex-col items-center rounded-2xl border-2 p-3 text-center transition-transform ${
                      unlocked
                        ? 'border-amber-200 bg-white shadow-sm'
                        : 'border-slate-200/70 bg-slate-100/70 opacity-65'
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${
                        unlocked ? badge.bg : 'bg-slate-200 grayscale'
                      }`}
                    >
                      {unlocked ? badge.emoji : '🔒'}
                    </div>
                    <h3 className="mt-2 text-xs font-black text-slate-800">
                      {badge.name}
                    </h3>
                    <p className="mt-0.5 text-[11px] font-semibold leading-tight text-slate-500">
                      {badge.description}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2.5">
              {CLOCK_SKINS.map((skin) => {
                const unlocked = progress.totalStars >= skin.starsRequired;
                const selected = progress.selectedSkin === skin.id;
                return (
                  <button
                    key={skin.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => {
                      if (!unlocked) return;
                      soundEngine.playButtonPop();
                      haptics.tapMedium();
                      onSelectSkin(skin.id);
                    }}
                    className={`flex w-full items-center justify-between rounded-2xl border-3 p-3 text-left transition-all ${
                      selected
                        ? 'border-[#58CC02] bg-lime-50/90 shadow-sm'
                        : unlocked
                        ? 'border-white bg-white shadow-sm hover:border-sky-200'
                        : 'border-slate-200 bg-slate-100/80 opacity-75'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Mini visual preview swatch of the clock skin */}
                      <div
                        className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-md"
                        style={{
                          background: `linear-gradient(180deg, ${skin.outerRingStart}, ${skin.outerRingEnd})`,
                        }}
                      >
                        <div
                          className="flex h-11 w-11 items-center justify-center rounded-full"
                          style={{ background: skin.innerRing }}
                        >
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
                            style={{ background: skin.faceTop }}
                          >
                            {skin.emoji}
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-800">
                          {skin.name}
                        </h3>
                        {unlocked ? (
                          <p className="text-xs font-bold text-emerald-600">
                            {selected ? 'Equipped right now!' : 'Tap to equip!'}
                          </p>
                        ) : (
                          <p className="text-xs font-bold text-slate-500">
                            Unlock at ⭐ {skin.starsRequired} stars ({progress.totalStars}/{skin.starsRequired})
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {selected ? (
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#58CC02] text-white shadow-sm">
                          <Check className="h-5 w-5 stroke-[3.5]" />
                        </span>
                      ) : unlocked ? (
                        <span className="rounded-xl bg-sky-100 px-3 py-1.5 text-xs font-black text-sky-700">
                          Use
                        </span>
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                          <Lock className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
