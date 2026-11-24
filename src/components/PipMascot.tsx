import React from 'react';
import { MascotMood } from '../types/game';

interface PipMascotProps {
  mood: MascotMood;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean;
}

export const PipMascot: React.FC<PipMascotProps> = ({
  mood,
  message,
  size = 'md',
  compact = false,
}) => {
  const px = size === 'lg' ? 88 : size === 'sm' ? 54 : 68;
  const isJumping = mood === 'celebrate';
  const isExcited = mood === 'excited' || mood === 'close';

  return (
    <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'} max-w-full`}>
      <div
        className={`relative shrink-0 ${isJumping ? 'pip-jump' : 'pip-bob'}`}
        style={{ width: px, height: px }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 120 120" className="h-full w-full drop-shadow-md overflow-visible">
          <defs>
            <linearGradient id="pipBodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E56" />
              <stop offset="100%" stopColor="#D97028" />
            </linearGradient>
            <linearGradient id="pipBellyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFF5E1" />
              <stop offset="100%" stopColor="#FDE2B8" />
            </linearGradient>
          </defs>

          {/* Celebratory sparkles */}
          {mood === 'celebrate' && (
            <g className="animate-sparkle" style={{ transformOrigin: '60px 60px' }}>
              <path
                d="M12 24 L15 16 L18 24 L26 27 L18 30 L15 38 L12 30 L4 27 Z"
                fill="#FFC800"
              />
              <path
                d="M104 18 L106.5 12 L109 18 L115 20.5 L109 23 L106.5 29 L104 23 L98 20.5 Z"
                fill="#FF5A5F"
              />
              <circle cx="98" cy="42" r="4" fill="#38D9D6" />
            </g>
          )}

          {/* Little feet */}
          <ellipse cx="45" cy="108" rx="9" ry="5" fill="#F59E0B" />
          <ellipse cx="75" cy="108" rx="9" ry="5" fill="#F59E0B" />

          {/* Left & Right Wings */}
          <ellipse
            cx="20"
            cy={mood === 'celebrate' ? '52' : '74'}
            rx="14"
            ry="22"
            transform={
              mood === 'celebrate'
                ? 'rotate(-42 20 52)'
                : isExcited
                ? 'rotate(-20 20 74)'
                : 'rotate(14 20 74)'
            }
            fill="#CC621D"
          />
          <ellipse
            cx="100"
            cy={mood === 'celebrate' ? '52' : '74'}
            rx="14"
            ry="22"
            transform={
              mood === 'celebrate'
                ? 'rotate(42 100 52)'
                : isExcited
                ? 'rotate(20 100 74)'
                : 'rotate(-14 100 74)'
            }
            fill="#CC621D"
          />

          {/* Cute Owl Ear Tufts */}
          <path d="M28 34 L22 14 L44 25 Z" fill="#D97028" stroke="#D97028" strokeWidth="4" strokeLinejoin="round" />
          <path d="M92 34 L98 14 L76 25 Z" fill="#D97028" stroke="#D97028" strokeWidth="4" strokeLinejoin="round" />

          {/* Main plump body */}
          <ellipse cx="60" cy="64" rx="42" ry="44" fill="url(#pipBodyGrad)" />

          {/* Gloss highlight on top of head */}
          <ellipse cx="49" cy="30" rx="14" ry="6" fill="#FFFFFF" opacity="0.28" transform="rotate(-12 49 30)" />

          {/* Cream heart-shaped face mask & belly */}
          <ellipse cx="60" cy="83" rx="25" ry="20" fill="url(#pipBellyGrad)" />
          <circle cx="44" cy="54" r="18" fill="#FFF7E6" />
          <circle cx="76" cy="54" r="18" fill="#FFF7E6" />

          {/* Belly feather scallops */}
          <path
            d="M48 82 Q52 87 56 82 M64 82 Q68 87 72 82 M56 91 Q60 96 64 91"
            stroke="#E5B27A"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Eyes */}
          {mood === 'celebrate' ? (
            /* Happy crescent laughing eyes */
            <g>
              <path
                d="M35 55 Q44 43 53 55"
                stroke="#3B2314"
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M67 55 Q76 43 85 55"
                stroke="#3B2314"
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          ) : (
            <g className="pip-eye-blink">
              {/* Left eye */}
              <circle cx="44" cy="54" r="11" fill="#2D1B12" />
              <circle
                cx={mood === 'thinking' ? '47' : '41'}
                cy={mood === 'thinking' ? '50' : '50'}
                r="4"
                fill="#FFFFFF"
              />
              <circle cx="48" cy="58" r="1.8" fill="#FFFFFF" opacity="0.85" />

              {/* Right eye */}
              <circle cx="76" cy="54" r="11" fill="#2D1B12" />
              <circle
                cx={mood === 'thinking' ? '79' : '73'}
                cy={mood === 'thinking' ? '50' : '50'}
                r="4"
                fill="#FFFFFF"
              />
              <circle cx="80" cy="58" r="1.8" fill="#FFFFFF" opacity="0.85" />
            </g>
          )}

          {/* Expressive eyebrows */}
          {mood === 'thinking' && (
            <g>
              <path d="M33 38 Q44 34 53 40" stroke="#9A4311" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <path d="M68 41 Q78 39 87 37" stroke="#9A4311" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            </g>
          )}
          {mood === 'oops' && (
            <g>
              <path d="M34 41 Q44 37 52 35" stroke="#9A4311" strokeWidth="3.2" strokeLinecap="round" fill="none" />
              <path d="M86 41 Q76 37 68 35" stroke="#9A4311" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* Rosy cheeks */}
          <ellipse cx="30" cy="64" rx="6" ry="3.8" fill="#FF797D" opacity="0.55" />
          <ellipse cx="90" cy="64" rx="6" ry="3.8" fill="#FF797D" opacity="0.55" />

          {/* Cute glossy beak */}
          <path
            d={
              mood === 'celebrate' || mood === 'close'
                ? 'M54 61 Q60 56 66 61 L60 72 Z'
                : 'M55 61 Q60 57 65 61 L60 69 Z'
            }
            fill="#FFC800"
            stroke="#E59800"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {(mood === 'celebrate' || mood === 'close') && (
            <ellipse cx="60" cy="66" rx="3" ry="2.2" fill="#FF5A5F" />
          )}

          {/* Curious question mark bubble when thinking */}
          {mood === 'thinking' && (
            <text
              x="98"
              y="26"
              fontSize="24"
              fontWeight="900"
              fill="#F59E0B"
              stroke="#FFFFFF"
              strokeWidth="3"
              paintOrder="stroke"
            >
              ?
            </text>
          )}
        </svg>
      </div>

      {message && (
        <div
          key={message}
          className="animate-pop-in relative rounded-2xl border-2 border-amber-200 bg-white/95 px-3.5 py-2 shadow-sm"
        >
          {/* Speech bubble tail */}
          <div
            className="absolute -left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-45 border-b-2 border-l-2 border-amber-200 bg-white"
            aria-hidden="true"
          />
          <p className="relative z-10 text-xs font-extrabold leading-snug text-slate-700 sm:text-sm">
            {message}
          </p>
        </div>
      )}
    </div>
  );
};
