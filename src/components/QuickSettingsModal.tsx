import React from 'react';
import { Music, Palette, ShieldCheck, Volume2, VolumeX, X } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface QuickSettingsModalProps {
  musicEnabled: boolean;
  soundEnabled: boolean;
  showHomeShortcuts?: boolean;
  onToggleMusic: () => void;
  onToggleSound: () => void;
  onOpenSkins?: () => void;
  onOpenParents?: () => void;
  onClose: () => void;
}

export const QuickSettingsModal: React.FC<QuickSettingsModalProps> = ({
  musicEnabled,
  soundEnabled,
  showHomeShortcuts = true,
  onToggleMusic,
  onToggleSound,
  onOpenSkins,
  onOpenParents,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Game Settings"
      onClick={onClose}
    >
      <div
        className="animate-pop-in w-full max-w-xs overflow-hidden rounded-[30px] border-4 border-white bg-[#FFF9ED] p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-800">Settings</h2>
          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonPop();
              onClose();
            }}
            aria-label="Close Settings"
            className="toy-btn toy-btn-white flex h-9 w-9 items-center justify-center rounded-xl text-slate-500"
          >
            <X className="h-5 w-5 stroke-[3]" />
          </button>
        </div>

        <div className="space-y-2.5">
          {/* Kids Music Toggle Row */}
          <button
            type="button"
            onClick={onToggleMusic}
            className="flex w-full items-center justify-between rounded-2xl border-2 border-purple-100 bg-white px-3.5 py-3 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  musicEnabled
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <Music className="h-5 w-5" />
              </span>
              <span className="text-sm font-black text-slate-700">Kids Music</span>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                musicEnabled
                  ? 'bg-[#58CC02] text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {musicEnabled ? 'On' : 'Off'}
            </span>
          </button>

          {/* Sound Effects Toggle Row */}
          <button
            type="button"
            onClick={onToggleSound}
            className="flex w-full items-center justify-between rounded-2xl border-2 border-sky-100 bg-white px-3.5 py-3 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  soundEnabled
                    ? 'bg-sky-100 text-sky-600'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {soundEnabled ? (
                  <Volume2 className="h-5 w-5" />
                ) : (
                  <VolumeX className="h-5 w-5" />
                )}
              </span>
              <span className="text-sm font-black text-slate-700">Sound FX</span>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                soundEnabled
                  ? 'bg-[#58CC02] text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {soundEnabled ? 'On' : 'Off'}
            </span>
          </button>

          {/* Optional Home Shortcuts: Clock Skins & Parents Gate */}
          {showHomeShortcuts && onOpenSkins && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playButtonPop();
                onClose();
                onOpenSkins();
              }}
              className="flex w-full items-center justify-between rounded-2xl border-2 border-pink-100 bg-white px-3.5 py-3 shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-100 text-pink-500">
                  <Palette className="h-5 w-5" />
                </span>
                <span className="text-sm font-black text-slate-700">Clock Skins</span>
              </div>
              <span className="text-xs font-black text-pink-500">Browse →</span>
            </button>
          )}

          {showHomeShortcuts && onOpenParents && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playButtonPop();
                onClose();
                onOpenParents();
              }}
              className="flex w-full items-center justify-between rounded-2xl border-2 border-emerald-100 bg-white px-3.5 py-3 shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <span className="text-sm font-black text-slate-700">Parents & Privacy</span>
              </div>
              <span className="text-xs font-black text-emerald-600">Open →</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
