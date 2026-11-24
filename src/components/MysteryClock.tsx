import React, { useEffect, useRef, useState } from 'react';
import { ClockAnchorMode, ClockSkin, ClockTime } from '../types/game';
import { getHandAngles } from '../utils/clockMath';

interface MysteryClockProps {
  targetTime: ClockTime;
  guessTime?: ClockTime | null;
  showSeconds: boolean;
  proportionalHour?: boolean;
  anchorMode?: ClockAnchorMode;
  revealed: boolean;
  peekActive: boolean;
  skin: ClockSkin;
  /** Incremented each new round so hands do a joyful spring spin-in */
  spinKey: number;
  sizeClassName?: string;
  showLegend?: boolean;
}

interface SpringState {
  value: number;
  velocity: number;
  target: number;
}

function stepSpring(s: SpringState, stiffness: number, damping: number, dt: number): boolean {
  const force = (s.target - s.value) * stiffness;
  const accel = force - s.velocity * damping;
  s.velocity += accel * dt;
  s.value += s.velocity * dt;
  const settled = Math.abs(s.target - s.value) < 0.08 && Math.abs(s.velocity) < 0.08;
  if (settled) {
    s.value = s.target;
    s.velocity = 0;
  }
  return !settled;
}

/** Build SVG arc path for visualizing angle difference between guess & target */
function describeWedge(
  cx: number,
  cy: number,
  radius: number,
  degA: number,
  degB: number
): string | null {
  const normA = ((degA % 360) + 360) % 360;
  const normB = ((degB % 360) + 360) % 360;
  let diff = normB - normA;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  if (Math.abs(diff) < 1.5) return null;

  const startDeg = diff >= 0 ? normA : normB;
  const endDeg = startDeg + Math.abs(diff);

  const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
  const x1 = cx + radius * Math.cos(toRad(startDeg));
  const y1 = cy + radius * Math.sin(toRad(startDeg));
  const x2 = cx + radius * Math.cos(toRad(endDeg));
  const y2 = cy + radius * Math.sin(toRad(endDeg));
  const largeArc = Math.abs(diff) > 180 ? 1 : 0;

  return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

export const MysteryClock: React.FC<MysteryClockProps> = ({
  targetTime,
  guessTime,
  showSeconds,
  proportionalHour = true,
  anchorMode = 'none',
  revealed,
  peekActive,
  skin,
  spinKey,
  sizeClassName = 'w-[252px] h-[252px] sm:w-[292px] sm:h-[292px] md:w-[320px] md:h-[320px]',
  showLegend = true,
}) => {
  const targetAngles = getHandAngles(targetTime, showSeconds, proportionalHour);
  const guessAngles = guessTime
    ? getHandAngles(guessTime, showSeconds, proportionalHour)
    : null;

  // Live 60fps spring-driven angles for real hands
  const [angles, setAngles] = useState({
    hour: targetAngles.hourDeg,
    minute: targetAngles.minuteDeg,
    second: targetAngles.secondDeg,
  });

  // Live 60fps spring-driven angles for ghost guess hands on reveal
  const [ghostAngles, setGhostAngles] = useState({
    hour: 0,
    minute: 0,
    second: 0,
  });

  const springsRef = useRef<{
    hour: SpringState;
    minute: SpringState;
    second: SpringState;
  }>({
    hour: { value: 0, velocity: 0, target: targetAngles.hourDeg },
    minute: { value: 0, velocity: 0, target: targetAngles.minuteDeg },
    second: { value: 0, velocity: 0, target: targetAngles.secondDeg },
  });

  const ghostSpringsRef = useRef<{
    hour: SpringState;
    minute: SpringState;
    second: SpringState;
  }>({
    hour: { value: 0, velocity: 0, target: 0 },
    minute: { value: 0, velocity: 0, target: 0 },
    second: { value: 0, velocity: 0, target: 0 },
  });

  // Trigger playful clockwise spring whirl on every new mystery clock!
  useEffect(() => {
    const s = springsRef.current;
    // Start slightly behind + add a full playful whirl so kids feel the toy clock spin!
    const currentBaseH = Math.floor(s.hour.value / 360) * 360;
    const currentBaseM = Math.floor(s.minute.value / 360) * 360;
    const currentBaseS = Math.floor(s.second.value / 360) * 360;

    s.hour.target = currentBaseH + 360 + targetAngles.hourDeg;
    s.minute.target = currentBaseM + 720 + targetAngles.minuteDeg;
    s.second.target = currentBaseS + 720 + targetAngles.secondDeg;

    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.04);
      lastTime = now;

      const a1 = stepSpring(s.hour, 120, 11.5, dt);
      const a2 = stepSpring(s.minute, 105, 10.5, dt);
      const a3 = stepSpring(s.second, 130, 11.0, dt);

      setAngles({
        hour: s.hour.value,
        minute: s.minute.value,
        second: s.second.value,
      });

      if (a1 || a2 || a3) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinKey, targetAngles.hourDeg, targetAngles.minuteDeg, targetAngles.secondDeg]);

  // Animate ghost hands springing out from 12 o'clock on Reveal!
  useEffect(() => {
    if (!revealed || !guessAngles) {
      ghostSpringsRef.current = {
        hour: { value: 0, velocity: 0, target: 0 },
        minute: { value: 0, velocity: 0, target: 0 },
        second: { value: 0, velocity: 0, target: 0 },
      };
      setGhostAngles({ hour: 0, minute: 0, second: 0 });
      return;
    }

    const g = ghostSpringsRef.current;
    g.hour = { value: 0, velocity: 0, target: guessAngles.hourDeg };
    g.minute = { value: 0, velocity: 0, target: guessAngles.minuteDeg };
    g.second = { value: 0, velocity: 0, target: guessAngles.secondDeg };

    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.04);
      lastTime = now;

      const a1 = stepSpring(g.hour, 115, 12, dt);
      const a2 = stepSpring(g.minute, 105, 11, dt);
      const a3 = stepSpring(g.second, 125, 12, dt);

      setGhostAngles({
        hour: g.hour.value,
        minute: g.minute.value,
        second: g.second.value,
      });

      if (a1 || a2 || a3) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, guessAngles?.hourDeg, guessAngles?.minuteDeg, guessAngles?.secondDeg]);

  const cx = 160;
  const cy = 160;

  const minuteWedge =
    revealed && guessAngles
      ? describeWedge(cx, cy, 106, targetAngles.minuteDeg, guessAngles.minuteDeg)
      : null;

  const hourWedge =
    revealed && guessAngles
      ? describeWedge(cx, cy, 72, targetAngles.hourDeg, guessAngles.hourDeg)
      : null;

  return (
    <div className="flex flex-col items-center">
      <div className={`relative select-none ${sizeClassName}`}>
        <svg
          viewBox="0 0 320 320"
          className="h-full w-full overflow-visible drop-shadow-[0_14px_20px_rgba(15,23,42,0.13)]"
          role="img"
          aria-label="Mystery analog clock"
        >
          <defs>
            <linearGradient id={`outer-${skin.id}`} x1="0" y1="0" x2="0.4" y2="1">
              <stop offset="0%" stopColor={skin.outerRingStart} />
              <stop offset="100%" stopColor={skin.outerRingEnd} />
            </linearGradient>
            <linearGradient id={`face-${skin.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={skin.faceTop} />
              <stop offset="100%" stopColor={skin.faceBottom} />
            </linearGradient>
            <radialGradient id="dialInnerShadow" cx="50%" cy="46%" r="54%">
              <stop offset="82%" stopColor="#000000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.09" />
            </radialGradient>
            <filter id="handShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#1E293B" floodOpacity="0.22" />
            </filter>
          </defs>

          {/* 3D Bottom toy bezel lip */}
          <circle cx={cx} cy={cy + 7} r="150" fill={skin.outerShadow} />

          {/* Main chunky colorful toy casing */}
          <circle cx={cx} cy={cy} r="150" fill={`url(#outer-${skin.id})`} />

          {/* Top glossy shine arc on bezel */}
          <path
            d="M 60 66 A 136 136 0 0 1 260 66"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.35"
          />

          {/* Decorative playful rim dots for certain skins */}
          {skin.decorativeDots &&
            Array.from({ length: 12 }).map((_, i) => {
              const rad = ((i * 30 - 90) * Math.PI) / 180;
              return (
                <circle
                  key={`dot-${i}`}
                  cx={cx + 141 * Math.cos(rad)}
                  cy={cy + 141 * Math.sin(rad)}
                  r="3.2"
                  fill="#FFFFFF"
                  opacity="0.65"
                />
              );
            })}

          {/* Inner turquoise / accent toy ring */}
          <circle cx={cx} cy={cy} r="133" fill={skin.innerRing} />

          {/* Pure blank mystery clock face! */}
          <circle cx={cx} cy={cy} r="122" fill={`url(#face-${skin.id})`} />
          <circle cx={cx} cy={cy} r="122" fill="url(#dialInnerShadow)" />

          {/* Optional subtle starfield for Cosmic Galaxy skin */}
          {skin.starryFace && (
            <g opacity="0.55">
              <circle cx="95" cy="98" r="2" fill="#FEF08A" />
              <circle cx="222" cy="108" r="2.5" fill="#FDE047" />
              <circle cx="115" cy="222" r="2" fill="#93C5FD" />
              <circle cx="218" cy="212" r="2" fill="#F9A8D4" />
              <circle cx="160" cy="82" r="1.8" fill="#FFFFFF" />
              <circle cx="88" cy="166" r="1.8" fill="#FEF08A" />
              <circle cx="232" cy="162" r="1.8" fill="#FFFFFF" />
            </g>
          )}

          {/* Soft angle difference wedges shown on Reveal */}
          {minuteWedge && (
            <path d={minuteWedge} fill="#29B6F6" opacity="0.16" />
          )}
          {hourWedge && (
            <path d={hourWedge} fill="#FF5A5F" opacity="0.15" />
          )}

          {/* Kid-Friendly Progressive Helper Spikes (shown before Reveal based on difficulty!) */}
          {!revealed && anchorMode !== 'none' && (
            <g>
              {anchorMode === 'twelve-spikes' &&
                Array.from({ length: 12 }).map((_, i) => {
                  const isCompass = i % 3 === 0;
                  const isTop = i === 0;
                  const rad = ((i * 30 - 90) * Math.PI) / 180;
                  const rOut = 115;
                  const rIn = isTop ? 99 : isCompass ? 102 : 107;
                  return (
                    <line
                      key={`anchor-12-${i}`}
                      x1={cx + rIn * Math.cos(rad)}
                      y1={cy + rIn * Math.sin(rad)}
                      x2={cx + rOut * Math.cos(rad)}
                      y2={cy + rOut * Math.sin(rad)}
                      stroke={
                        isTop
                          ? '#FF5A5F'
                          : isCompass
                          ? '#F59E0B'
                          : skin.majorTickColor
                      }
                      strokeWidth={isTop ? 6 : isCompass ? 4.8 : 3.2}
                      strokeLinecap="round"
                      opacity={isCompass ? 0.92 : 0.65}
                    />
                  );
                })}

              {anchorMode === 'four-spikes' &&
                [0, 90, 180, 270].map((deg) => {
                  const isTop = deg === 0;
                  const rad = ((deg - 90) * Math.PI) / 180;
                  const rOut = 115;
                  const rIn = isTop ? 100 : 103;
                  return (
                    <line
                      key={`anchor-4-${deg}`}
                      x1={cx + rIn * Math.cos(rad)}
                      y1={cy + rIn * Math.sin(rad)}
                      x2={cx + rOut * Math.cos(rad)}
                      y2={cy + rOut * Math.sin(rad)}
                      stroke={isTop ? '#FF5A5F' : '#F59E0B'}
                      strokeWidth={isTop ? 6 : 4.5}
                      strokeLinecap="round"
                      opacity="0.9"
                    />
                  );
                })}

              {anchorMode === 'top-star' && (
                <g>
                  <line
                    x1={cx}
                    y1={cy - 101}
                    x2={cx}
                    y2={cy - 115}
                    stroke="#F59E0B"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    opacity="0.9"
                  />
                  <circle cx={cx} cy={cy - 108} r="2.2" fill="#FFFDF7" />
                </g>
              )}
            </g>
          )}

          {/* Optional Peek Hint: softly glows 12, 3, 6, 9 compass numbers + 12 spikes for 2s */}
          {peekActive && !revealed && (
            <g className="animate-pulse">
              {Array.from({ length: 12 }).map((_, i) => {
                const rad = ((i * 30 - 90) * Math.PI) / 180;
                return (
                  <circle
                    key={`peek-dot-${i}`}
                    cx={cx + 111 * Math.cos(rad)}
                    cy={cy + 111 * Math.sin(rad)}
                    r={i % 3 === 0 ? 4.5 : 2.6}
                    fill="#F59E0B"
                    opacity={i % 3 === 0 ? 0.9 : 0.55}
                  />
                );
              })}
              {[
                { label: '12', deg: 0 },
                { label: '3', deg: 90 },
                { label: '6', deg: 180 },
                { label: '9', deg: 270 },
              ].map(({ label, deg }) => {
                const rad = ((deg - 90) * Math.PI) / 180;
                return (
                  <text
                    key={`peek-num-${label}`}
                    x={cx + 90 * Math.cos(rad)}
                    y={cy + 90 * Math.sin(rad)}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#F59E0B"
                    fontSize="21"
                    fontWeight="900"
                    opacity="0.88"
                  >
                    {label}
                  </text>
                );
              })}
            </g>
          )}

          {/* MAGIC REVEAL: 60 Tick Marks + 12 Numbers popping in clockwise domino ripple! */}
          {revealed && (
            <g>
              {Array.from({ length: 60 }).map((_, i) => {
                const isMajor = i % 5 === 0;
                const rad = ((i * 6 - 90) * Math.PI) / 180;
                const rOut = 116;
                const rIn = isMajor ? 106 : 111;
                return (
                  <line
                    key={`tick-${i}`}
                    x1={cx + rIn * Math.cos(rad)}
                    y1={cy + rIn * Math.sin(rad)}
                    x2={cx + rOut * Math.cos(rad)}
                    y2={cy + rOut * Math.sin(rad)}
                    stroke={isMajor ? skin.majorTickColor : skin.tickColor}
                    strokeWidth={isMajor ? 3.5 : 1.7}
                    strokeLinecap="round"
                    className="reveal-tick"
                    style={{ animationDelay: `${i * 7}ms` }}
                  />
                );
              })}

              {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, idx) => {
                const rad = ((idx * 30 - 90) * Math.PI) / 180;
                const rNum = 90;
                const x = cx + rNum * Math.cos(rad);
                const y = cy + rNum * Math.sin(rad);
                return (
                  <text
                    key={`num-${num}`}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={skin.numberColor}
                    fontSize={num % 3 === 0 ? '21' : '17'}
                    fontWeight="900"
                    className="reveal-number"
                    style={{ animationDelay: `${idx * 38}ms` }}
                  >
                    {num}
                  </text>
                );
              })}
            </g>
          )}

          {/* GHOST HANDS (Player's Guess!) shown on Reveal for instant visual feedback */}
          {revealed && guessTime && (
            <g opacity="0.62">
              {/* Ghost Hour Hand */}
              <g transform={`rotate(${ghostAngles.hour} ${cx} ${cy})`}>
                <line
                  x1={cx}
                  y1={cy + 8}
                  x2={cx}
                  y2={cy - 64}
                  stroke="#FF5A5F"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray="6 7"
                />
              </g>
              {/* Ghost Minute Hand */}
              <g transform={`rotate(${ghostAngles.minute} ${cx} ${cy})`}>
                <line
                  x1={cx}
                  y1={cy + 10}
                  x2={cx}
                  y2={cy - 98}
                  stroke="#29B6F6"
                  strokeWidth="8.5"
                  strokeLinecap="round"
                  strokeDasharray="6 7"
                />
              </g>
              {/* Ghost Second Hand */}
              {showSeconds && (
                <g transform={`rotate(${ghostAngles.second} ${cx} ${cy})`}>
                  <line
                    x1={cx}
                    y1={cy + 14}
                    x2={cx}
                    y2={cy - 102}
                    stroke="#9B5DE5"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="4 6"
                  />
                  <circle
                    cx={cx}
                    cy={cy - 96}
                    r="6"
                    fill="none"
                    stroke="#9B5DE5"
                    strokeWidth="2.5"
                    strokeDasharray="3 3"
                  />
                </g>
              )}
            </g>
          )}

          {/* REAL CLOCK HANDS — Chunky, Glossy, Spring-Animated! */}
          <g filter="url(#handShadow)">
            {/* HOUR HAND — Coral Red, short & chubby */}
            <g transform={`rotate(${angles.hour} ${cx} ${cy})`}>
              <line
                x1={cx}
                y1={cy + 10}
                x2={cx}
                y2={cy - 64}
                stroke="#E03E44"
                strokeWidth="17"
                strokeLinecap="round"
              />
              <line
                x1={cx}
                y1={cy + 10}
                x2={cx}
                y2={cy - 64}
                stroke="#FF6368"
                strokeWidth="13"
                strokeLinecap="round"
              />
              {/* Gloss highlight stripe */}
              <line
                x1={cx - 2.2}
                y1={cy - 14}
                x2={cx - 2.2}
                y2={cy - 58}
                stroke="#FFA3A6"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.7"
              />
            </g>

            {/* MINUTE HAND — Sky Blue, sleek & longer */}
            <g transform={`rotate(${angles.minute} ${cx} ${cy})`}>
              <line
                x1={cx}
                y1={cy + 12}
                x2={cx}
                y2={cy - 98}
                stroke="#0284C7"
                strokeWidth="13"
                strokeLinecap="round"
              />
              <line
                x1={cx}
                y1={cy + 12}
                x2={cx}
                y2={cy - 98}
                stroke="#38BDF8"
                strokeWidth="9.5"
                strokeLinecap="round"
              />
              <line
                x1={cx - 1.8}
                y1={cy - 16}
                x2={cx - 1.8}
                y2={cy - 92}
                stroke="#BAE6FD"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.75"
              />
            </g>

            {/* SECOND HAND — Playful Purple Lollipop Wand (Time Master mode!) */}
            {showSeconds && (
              <g transform={`rotate(${angles.second} ${cx} ${cy})`}>
                <line
                  x1={cx}
                  y1={cy + 20}
                  x2={cx}
                  y2={cy - 96}
                  stroke="#7B3CC8"
                  strokeWidth="6.5"
                  strokeLinecap="round"
                />
                <line
                  x1={cx}
                  y1={cy + 20}
                  x2={cx}
                  y2={cy - 96}
                  stroke="#A86BF5"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {/* Cute lollipop ball tip */}
                <circle cx={cx} cy={cy - 96} r="9" fill="#7B3CC8" />
                <circle cx={cx} cy={cy - 96} r="7" fill="#B17AEF" />
                <circle cx={cx - 2.2} cy={cy - 98.2} r="2.2" fill="#FFFFFF" opacity="0.75" />
              </g>
            )}
          </g>

          {/* Chunky Toy Center Cap */}
          <circle cx={cx} cy={cy + 2} r="16" fill="rgba(15,23,42,0.16)" />
          <circle cx={cx} cy={cy} r="15.5" fill={skin.centerOuter} />
          <circle cx={cx} cy={cy} r="10" fill={skin.centerInner} />
          <circle cx={cx - 3} cy={cy - 3} r="3.2" fill="#FFFFFF" opacity="0.65" />
        </svg>
      </div>

      {/* Crisp Color-Coded Hand Legend */}
      {showLegend && (
        <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2 text-[11px] font-extrabold text-slate-600">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-0.5 shadow-sm border border-rose-100">
            <span className="inline-block h-2.5 w-4 rounded-full bg-[#FF5A5F]" />
            Hour
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-0.5 shadow-sm border border-sky-100">
            <span className="inline-block h-2 w-5 rounded-full bg-[#29B6F6]" />
            Min
          </span>
          {showSeconds && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-0.5 shadow-sm border border-purple-100">
              <span className="inline-flex items-center">
                <span className="inline-block h-1.5 w-3.5 rounded-full bg-[#9B5DE5]" />
                <span className="-ml-1 inline-block h-2.5 w-2.5 rounded-full bg-[#9B5DE5]" />
              </span>
              Sec
            </span>
          )}
          {revealed && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/85 px-2.5 py-0.5 text-white shadow-sm">
              <span className="inline-block w-4 border-t-2 border-dashed border-sky-300" />
              Your Guess
            </span>
          )}
        </div>
      )}
    </div>
  );
};
