import React, { useRef } from 'react';
import { Minus, Plus } from 'lucide-react';
import { ClockTime, DifficultyConfig } from '../types/game';
import { pad2 } from '../utils/clockMath';
import { soundEngine } from '../utils/soundEngine';
import { haptics } from '../utils/haptics';

interface TimeControlsProps {
  guess: ClockTime;
  onChange: (next: ClockTime) => void;
  config: DifficultyConfig;
  disabled?: boolean;
}

/**
 * Reusable hold-to-repeat tactile button so kids can tap OR press-and-hold!
 */
const HoldButton: React.FC<{
  onStep: () => void;
  disabled?: boolean;
  className: string;
  ariaLabel: string;
  children: React.ReactNode;
}> = ({ onStep, disabled, className, ariaLabel, children }) => {
  const timerRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const didHoldRef = useRef(false);

  const clearTimers = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    timerRef.current = null;
    intervalRef.current = null;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    didHoldRef.current = false;
    onStep();
    timerRef.current = window.setTimeout(() => {
      didHoldRef.current = true;
      intervalRef.current = window.setInterval(() => {
        onStep();
      }, 95);
    }, 340);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onStep();
    }
  };

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      onPointerDown={handlePointerDown}
      onPointerUp={clearTimers}
      onPointerLeave={clearTimers}
      onPointerCancel={clearTimers}
      onKeyDown={handleKeyDown}
      className={className}
    >
      {children}
    </button>
  );
};

export const TimeControls: React.FC<TimeControlsProps> = ({
  guess,
  onChange,
  config,
  disabled = false,
}) => {
  const stepHour = (delta: number) => {
    const nextHour = ((guess.hour - 1 + delta + 12) % 12) + 1;
    soundEngine.playTick('hour', delta > 0);
    haptics.tapLight();
    onChange({ ...guess, hour: nextHour });
  };

  const stepMinute = (delta: number) => {
    const step = config.minuteStep;
    const nextMin = (guess.minute + delta * step + 60) % 60;
    soundEngine.playTick('minute', delta > 0);
    haptics.tapLight();
    onChange({ ...guess, minute: nextMin });
  };

  const stepSecond = (delta: number) => {
    const nextSec = (guess.second + delta + 60) % 60;
    soundEngine.playTick('second', delta > 0);
    haptics.tapLight();
    onChange({ ...guess, second: nextSec });
  };

  const setQuarterMinute = (m: number) => {
    if (disabled) return;
    soundEngine.playTick('minute', m >= guess.minute);
    haptics.tapLight();
    onChange({ ...guess, minute: m });
  };

  // Little Sprout (Easy): Ultra-friendly big Hour stepper + 4 giant Quarter-Hour buttons!
  if (config.id === 'sprout') {
    return (
      <div className="w-full space-y-2.5">
        {/* Big Coral Hour Stepper */}
        <div className="toy-card flex items-center justify-between rounded-3xl px-3.5 py-2.5 border-rose-200 bg-gradient-to-b from-white to-rose-50/70">
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-6 rounded-full bg-[#FF5A5F] shadow-sm" />
            <span className="text-xs font-black uppercase tracking-wider text-rose-500">
              Hour
            </span>
          </div>
          <div className="flex items-center gap-3">
            <HoldButton
              onStep={() => stepHour(-1)}
              disabled={disabled}
              ariaLabel="Decrease hour"
              className="toy-btn toy-btn-coral flex h-12 w-12 items-center justify-center rounded-2xl text-white disabled:opacity-50"
            >
              <Minus className="h-6 w-6 stroke-[3.5]" />
            </HoldButton>
            <div className="min-w-[54px] text-center text-4xl font-black tabular-nums text-rose-600">
              {guess.hour}
            </div>
            <HoldButton
              onStep={() => stepHour(1)}
              disabled={disabled}
              ariaLabel="Increase hour"
              className="toy-btn toy-btn-coral flex h-12 w-12 items-center justify-center rounded-2xl text-white disabled:opacity-50"
            >
              <Plus className="h-6 w-6 stroke-[3.5]" />
            </HoldButton>
          </div>
        </div>

        {/* 4 Giant Squishy Sky-Blue Quarter-Hour Pills */}
        <div className="toy-card rounded-3xl p-2.5 border-sky-200 bg-gradient-to-b from-white to-sky-50/70">
          <div className="mb-1.5 flex items-center justify-center gap-1.5">
            <span className="h-2.5 w-7 rounded-full bg-[#29B6F6]" />
            <span className="text-[11px] font-black uppercase tracking-wider text-sky-600">
              Pick the Minute
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[0, 15, 30, 45].map((m) => {
              const selected = guess.minute === m;
              return (
                <button
                  key={m}
                  type="button"
                  disabled={disabled}
                  onClick={() => setQuarterMinute(m)}
                  className={`toy-btn rounded-2xl py-3 text-xl font-black tabular-nums transition-colors ${
                    selected
                      ? 'toy-btn-sky text-white ring-2 ring-sky-300 ring-offset-1'
                      : 'toy-btn-white text-sky-700 hover:bg-sky-50'
                  }`}
                >
                  :{pad2(m)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Medium, Hard & Master: Color-coded chunky tumblers with holdable -/+ AND quick slide scrubbers!
  const isMaster = config.showSeconds;

  return (
    <div
      className={`grid w-full gap-2.5 ${
        isMaster ? 'grid-cols-3' : 'grid-cols-2'
      }`}
    >
      {/* HOUR CARD */}
      <div className="toy-card flex flex-col items-center rounded-3xl border-rose-200 bg-gradient-to-b from-white to-rose-50/70 px-2 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-full bg-[#FF5A5F]" />
          <span className="text-[11px] font-black uppercase tracking-wider text-rose-500">
            Hour
          </span>
        </div>

        <div className="my-1.5 flex w-full items-center justify-between gap-1">
          <HoldButton
            onStep={() => stepHour(-1)}
            disabled={disabled}
            ariaLabel="Decrease hour"
            className="toy-btn toy-btn-coral flex h-11 w-10 shrink-0 items-center justify-center rounded-2xl text-white sm:h-12 sm:w-12 disabled:opacity-50"
          >
            <Minus className="h-5 w-5 stroke-[3.5]" />
          </HoldButton>
          <span className="text-3xl font-black tabular-nums text-rose-600 sm:text-4xl">
            {guess.hour}
          </span>
          <HoldButton
            onStep={() => stepHour(1)}
            disabled={disabled}
            ariaLabel="Increase hour"
            className="toy-btn toy-btn-coral flex h-11 w-10 shrink-0 items-center justify-center rounded-2xl text-white sm:h-12 sm:w-12 disabled:opacity-50"
          >
            <Plus className="h-5 w-5 stroke-[3.5]" />
          </HoldButton>
        </div>

        <input
          type="range"
          min={1}
          max={12}
          step={1}
          value={guess.hour}
          disabled={disabled}
          aria-label="Hour slider"
          onChange={(e) => {
            const val = Number(e.target.value);
            soundEngine.playTick('hour', val >= guess.hour);
            onChange({ ...guess, hour: val });
          }}
          className="mt-0.5 h-2.5 w-full cursor-pointer accent-[#FF5A5F]"
        />
      </div>

      {/* MINUTE CARD */}
      <div className="toy-card flex flex-col items-center rounded-3xl border-sky-200 bg-gradient-to-b from-white to-sky-50/70 px-2 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-5 rounded-full bg-[#29B6F6]" />
          <span className="text-[11px] font-black uppercase tracking-wider text-sky-600">
            Min
          </span>
        </div>

        <div className="my-1.5 flex w-full items-center justify-between gap-1">
          <HoldButton
            onStep={() => stepMinute(-1)}
            disabled={disabled}
            ariaLabel="Decrease minute"
            className="toy-btn toy-btn-sky flex h-11 w-10 shrink-0 items-center justify-center rounded-2xl text-white sm:h-12 sm:w-12 disabled:opacity-50"
          >
            <Minus className="h-5 w-5 stroke-[3.5]" />
          </HoldButton>
          <span className="text-3xl font-black tabular-nums text-sky-600 sm:text-4xl">
            {pad2(guess.minute)}
          </span>
          <HoldButton
            onStep={() => stepMinute(1)}
            disabled={disabled}
            ariaLabel="Increase minute"
            className="toy-btn toy-btn-sky flex h-11 w-10 shrink-0 items-center justify-center rounded-2xl text-white sm:h-12 sm:w-12 disabled:opacity-50"
          >
            <Plus className="h-5 w-5 stroke-[3.5]" />
          </HoldButton>
        </div>

        <input
          type="range"
          min={0}
          max={60 - config.minuteStep}
          step={config.minuteStep}
          value={guess.minute}
          disabled={disabled}
          aria-label="Minute slider"
          onChange={(e) => {
            const val = Number(e.target.value);
            soundEngine.playTick('minute', val >= guess.minute);
            onChange({ ...guess, minute: val });
          }}
          className="mt-0.5 h-2.5 w-full cursor-pointer accent-[#29B6F6]"
        />
      </div>

      {/* SECOND CARD (Time Master Mode!) */}
      {isMaster && (
        <div className="toy-card flex flex-col items-center rounded-3xl border-purple-200 bg-gradient-to-b from-white to-purple-50/70 px-2 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center">
              <span className="h-1.5 w-3 rounded-full bg-[#9B5DE5]" />
              <span className="-ml-1 h-2.5 w-2.5 rounded-full bg-[#9B5DE5]" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-600">
              Sec
            </span>
          </div>

          <div className="my-1.5 flex w-full items-center justify-between gap-1">
            <HoldButton
              onStep={() => stepSecond(-1)}
              disabled={disabled}
              ariaLabel="Decrease second"
              className="toy-btn toy-btn-grape flex h-11 w-9 shrink-0 items-center justify-center rounded-2xl text-white sm:h-12 sm:w-11 disabled:opacity-50"
            >
              <Minus className="h-5 w-5 stroke-[3.5]" />
            </HoldButton>
            <span className="text-3xl font-black tabular-nums text-purple-600 sm:text-4xl">
              {pad2(guess.second)}
            </span>
            <HoldButton
              onStep={() => stepSecond(1)}
              disabled={disabled}
              ariaLabel="Increase second"
              className="toy-btn toy-btn-grape flex h-11 w-9 shrink-0 items-center justify-center rounded-2xl text-white sm:h-12 sm:w-11 disabled:opacity-50"
            >
              <Plus className="h-5 w-5 stroke-[3.5]" />
            </HoldButton>
          </div>

          <input
            type="range"
            min={0}
            max={59}
            step={1}
            value={guess.second}
            disabled={disabled}
            aria-label="Second slider"
            onChange={(e) => {
              const val = Number(e.target.value);
              soundEngine.playTick('second', val >= guess.second);
              onChange({ ...guess, second: val });
            }}
            className="mt-0.5 h-2.5 w-full cursor-pointer accent-[#9B5DE5]"
          />
        </div>
      )}
    </div>
  );
};
