import React, { useMemo, useState } from 'react';
import { ShieldCheck, Trash2, X } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface ParentsGateModalProps {
  onClose: () => void;
  onResetProgress: () => void;
}

/**
 * Apple App Store Kids Category & Google Play Families Policy compliant Parents Gate.
 * Prevents young children from accidentally resetting progress or viewing parent-facing privacy info.
 */
export const ParentsGateModal: React.FC<ParentsGateModalProps> = ({
  onClose,
  onResetProgress,
}) => {
  const challenge = useMemo(() => {
    const a = 4 + Math.floor(Math.random() * 5); // 4..8
    const b = 5 + Math.floor(Math.random() * 5); // 5..9
    return { a, b, answer: a * b };
  }, []);

  const [input, setInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(input.trim()) === challenge.answer) {
      soundEngine.playButtonPop();
      setUnlocked(true);
      setWrong(false);
    } else {
      setWrong(true);
      setInput('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Parents Gate and Privacy Information"
    >
      <div className="animate-pop-in w-full max-w-md overflow-hidden rounded-[30px] border-4 border-white bg-[#FFF9ED] p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            <h2 className="text-lg font-black text-slate-800">
              {unlocked ? 'Parents & Kid-Safe Privacy' : 'Grown-Ups Only'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="toy-btn toy-btn-white flex h-9 w-9 items-center justify-center rounded-xl text-slate-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!unlocked ? (
          <form onSubmit={handleVerify} className="mt-4 space-y-3">
            <p className="text-sm font-bold text-slate-600">
              To enter the Parents area, please solve this quick math check:
            </p>
            <div className="rounded-2xl bg-white p-4 text-center shadow-sm border-2 border-amber-100">
              <div className="text-2xl font-black text-slate-800">
                What is {challenge.a} × {challenge.b}?
              </div>
              <input
                type="number"
                inputMode="numeric"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setWrong(false);
                }}
                placeholder="Type answer..."
                className="mt-3 w-40 rounded-xl border-2 border-slate-300 px-3 py-2 text-center text-xl font-black text-slate-800 focus:border-sky-400 focus:outline-none"
                autoFocus
              />
              {wrong && (
                <p className="mt-2 text-xs font-bold text-rose-500">
                  Not quite — try again!
                </p>
              )}
            </div>
            <button
              type="submit"
              className="toy-btn toy-btn-sky w-full rounded-2xl py-3 text-base font-black text-white"
            >
              Unlock Parents Area
            </button>
          </form>
        ) : (
          <div className="mt-4 space-y-3 text-sm font-semibold text-slate-600">
            <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/80 p-3.5 text-emerald-900">
              <h3 className="font-black text-emerald-800">
                100% Kid-Safe & Privacy-First
              </h3>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs font-bold">
                <li>Zero ads, zero in-app purchases, zero external links.</li>
                <li>Zero analytics, tracking SDKs, or personal data collection.</li>
                <li>Works 100% offline — all progress stays strictly on this device.</li>
                <li>Designed for COPPA, Apple Kids Category & Google Play Families compliance.</li>
              </ul>
            </div>

            <div className="rounded-2xl border-2 border-slate-200 bg-white p-3.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Progress Management
              </h3>
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-rose-200 bg-rose-50 py-2.5 text-xs font-black text-rose-600 hover:bg-rose-100"
                >
                  <Trash2 className="h-4 w-4" />
                  Reset All Stars & Badges
                </button>
              ) : (
                <div className="mt-2 space-y-2">
                  <p className="text-xs font-bold text-rose-600">
                    Are you sure? This clears all stars, streaks, badges, and skins on this device.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="rounded-xl bg-slate-100 py-2 text-xs font-black text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onResetProgress();
                        onClose();
                      }}
                      className="rounded-xl bg-rose-500 py-2 text-xs font-black text-white"
                    >
                      Yes, Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
