import React from 'react';
import { Home, RotateCcw, Star, Timer, Trophy } from 'lucide-react';
import { RoundResult } from '../types/game';
import { PipMascot } from './PipMascot';
import { soundEngine } from '../utils/soundEngine';

interface DashSummaryModalProps {
  results: RoundResult[];
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const DashSummaryModal: React.FC<DashSummaryModalProps> = ({
  results,
  onPlayAgain,
  onGoHome,
}) => {
  const totalStars = results.reduce((sum, r) => sum + r.stars, 0);
  const maxStars = results.length * 3;
  const avgAcc = Math.round(
    results.reduce((sum, r) => sum + r.accuracy, 0) / Math.max(1, results.length)
  );
  const totalSec = (
    results.reduce((sum, r) => sum + r.timeTakenMs, 0) / 1000
  ).toFixed(1);

  const mood = totalStars >= 11 ? 'celebrate' : totalStars >= 7 ? 'close' : 'idle';
  const headline =
    totalStars >= 13
      ? 'TIME SUPERSTAR!'
      : totalStars >= 10
      ? 'AWESOME DASH!'
      : totalStars >= 6
      ? 'GREAT EXPLORING!'
      : 'NICE PRACTICE!';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="5-Round Dash Summary"
    >
      <div className="animate-pop-in w-full max-w-md overflow-hidden rounded-[34px] border-4 border-white bg-[#FFF9ED] p-5 text-center shadow-2xl">
        <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-b from-[#FFE047] to-[#FFC800] shadow-md">
          <Trophy className="h-9 w-9 text-amber-950" />
        </div>

        <h2 className="text-2xl font-black tracking-tight text-slate-800">
          {headline}
        </h2>
        <p className="mt-0.5 text-sm font-bold text-slate-500">
          5-Round Mystery Dash Complete!
        </p>

        <div className="my-4 flex justify-center">
          <PipMascot
            mood={mood}
            size="md"
            message={`You earned ${totalStars} out of ${maxStars} stars!`}
          />
        </div>

        {/* Round-by-round star pills */}
        <div className="mb-4 flex justify-center gap-2">
          {results.map((r, i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-2xl border-2 border-amber-200 bg-white px-2.5 py-2 shadow-sm"
            >
              <span className="text-[10px] font-black text-slate-400">
                #{i + 1}
              </span>
              <div className="mt-0.5 flex gap-0.5">
                {[1, 2, 3].map((s) => (
                  <Star
                    key={s}
                    className={`h-3.5 w-3.5 ${
                      s <= r.stars
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="mt-0.5 text-xs font-black text-slate-700">
                {r.accuracy}%
              </span>
            </div>
          ))}
        </div>

        {/* Big stat cards */}
        <div className="mb-5 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-amber-100/80 p-2.5">
            <div className="text-xl font-black text-amber-700">
              ⭐ {totalStars}
            </div>
            <div className="text-[10px] font-extrabold uppercase text-amber-900/60">
              Stars Won
            </div>
          </div>
          <div className="rounded-2xl bg-sky-100/80 p-2.5">
            <div className="text-xl font-black text-sky-700">{avgAcc}%</div>
            <div className="text-[10px] font-extrabold uppercase text-sky-900/60">
              Accuracy
            </div>
          </div>
          <div className="rounded-2xl bg-purple-100/80 p-2.5">
            <div className="flex items-center justify-center gap-1 text-xl font-black text-purple-700">
              <Timer className="h-4 w-4" />
              {totalSec}s
            </div>
            <div className="text-[10px] font-extrabold uppercase text-purple-900/60">
              Total Time
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonPop();
              onGoHome();
            }}
            className="toy-btn toy-btn-white flex items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-black text-slate-700"
          >
            <Home className="h-5 w-5" />
            Worlds
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonPop();
              onPlayAgain();
            }}
            className="toy-btn toy-btn-green flex items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-black text-white"
          >
            <RotateCcw className="h-5 w-5" />
            Dash Again!
          </button>
        </div>
      </div>
    </div>
  );
};
