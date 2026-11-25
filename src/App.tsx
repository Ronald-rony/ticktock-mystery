import React, { useEffect, useState } from 'react';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import {
  ClockSkinId,
  DifficultyId,
  PlayMode,
  PlayerProgress,
  RoundResult,
} from './types/game';
import {
  DEFAULT_PROGRESS,
  applyRoundToProgress,
  loadProgress,
  saveProgress,
} from './utils/storage';
import { soundEngine } from './utils/soundEngine';
import { musicEngine } from './utils/musicEngine';
import { haptics } from './utils/haptics';
import { ConfettiCanvas } from './components/ConfettiCanvas';
import { HomeScreen } from './components/HomeScreen';
import { GameScreen } from './components/GameScreen';
import { TrophyModal } from './components/TrophyModal';
import { DashSummaryModal } from './components/DashSummaryModal';
import { ParentsGateModal } from './components/ParentsGateModal';

export default function App() {
  const [progress, setProgress] = useState<PlayerProgress>(DEFAULT_PROGRESS);
  const [loaded, setLoaded] = useState(false);

  const [screen, setScreen] = useState<'home' | 'game'>('home');
  const [difficulty, setDifficulty] = useState<DifficultyId>('sprout');
  const [playMode, setPlayMode] = useState<PlayMode>('endless');
  const [gameSessionKey, setGameSessionKey] = useState(1);

  const [trophyModalTab, setTrophyModalTab] = useState<'badges' | 'skins' | null>(
    null
  );
  const [parentsOpen, setParentsOpen] = useState(false);
  const [dashSummary, setDashSummary] = useState<RoundResult[] | null>(null);

  const [confettiKey, setConfettiKey] = useState(0);
  const [confettiIntensity, setConfettiIntensity] = useState<
    'big' | 'medium' | 'small'
  >('big');

  // Load saved offline progress + initialize native Capacitor bars/splash
  useEffect(() => {
    let active = true;
    loadProgress().then((data) => {
      if (!active) return;
      setProgress(data);
      soundEngine.setEnabled(data.soundEnabled);
      musicEngine.setEnabled(data.musicEnabled);
      haptics.setEnabled(data.hapticsEnabled);
      setLoaded(true);
      if (Capacitor.isNativePlatform() && data.musicEnabled) {
        musicEngine.unlockAndStart();
      }
    });

    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Light }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#FFF9ED' }).catch(() => {});
      SplashScreen.hide().catch(() => {});
    }

    return () => {
      active = false;
    };
  }, []);

  // Unlock kids background music cleanly on first user interaction (click, touchend, pointerdown, keydown)
  useEffect(() => {
    if (!loaded) return;
    const handleGesture = () => {
      musicEngine.unlockAndStart();
    };
    window.addEventListener('click', handleGesture, { passive: true });
    window.addEventListener('touchend', handleGesture, { passive: true });
    window.addEventListener('pointerdown', handleGesture, { passive: true });
    window.addEventListener('keydown', handleGesture, { passive: true });
    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('touchend', handleGesture);
      window.removeEventListener('pointerdown', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };
  }, [loaded]);

  // Pause music when app goes to background (Google Play & App Store quality requirement)
  useEffect(() => {
    const onVisChange = () => {
      musicEngine.setSuspended(document.hidden);
    };
    document.addEventListener('visibilitychange', onVisChange);

    let stateHandle: { remove: () => Promise<void> } | null = null;
    if (Capacitor.isNativePlatform()) {
      CapApp.addListener('appStateChange', ({ isActive }) => {
        musicEngine.setSuspended(!isActive);
      })
        .then((h) => {
          stateHandle = h;
        })
        .catch(() => {});
    }

    return () => {
      document.removeEventListener('visibilitychange', onVisChange);
      if (stateHandle) stateHandle.remove().catch(() => {});
    };
  }, []);

  // Android hardware Back button support (closes modals -> returns Home -> exits cleanly)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let backHandle: { remove: () => Promise<void> } | null = null;

    CapApp.addListener('backButton', () => {
      if (parentsOpen) {
        setParentsOpen(false);
      } else if (trophyModalTab) {
        setTrophyModalTab(null);
      } else if (dashSummary) {
        setDashSummary(null);
        setScreen('home');
      } else if (screen === 'game') {
        setScreen('home');
      } else {
        CapApp.exitApp().catch(() => {});
      }
    })
      .then((h) => {
        backHandle = h;
      })
      .catch(() => {});

    return () => {
      if (backHandle) backHandle.remove().catch(() => {});
    };
  }, [parentsOpen, trophyModalTab, dashSummary, screen]);

  const triggerConfetti = (intensity: 'big' | 'medium' | 'small' = 'big') => {
    setConfettiIntensity(intensity);
    setConfettiKey((k) => k + 1);
  };

  const updateProgress = (updater: (prev: PlayerProgress) => PlayerProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      saveProgress(next);
      return next;
    });
  };

  const handleToggleSound = () => {
    updateProgress((prev) => {
      const nextSound = !prev.soundEnabled;
      soundEngine.setEnabled(nextSound);
      if (nextSound) soundEngine.playButtonPop();
      return { ...prev, soundEnabled: nextSound };
    });
  };

  const handleToggleMusic = () => {
    updateProgress((prev) => {
      const nextMusic = !prev.musicEnabled;
      musicEngine.setEnabled(nextMusic);
      if (nextMusic) {
        musicEngine.unlockAndStart();
      }
      soundEngine.playButtonPop();
      return { ...prev, musicEnabled: nextMusic };
    });
  };

  const handleStartGame = (diff: DifficultyId) => {
    setDifficulty(diff);
    setDashSummary(null);
    setGameSessionKey((k) => k + 1);
    setScreen('game');
  };

  const handleRoundComplete = (
    result: Omit<RoundResult, 'newBadges' | 'newSkins'>,
    dashCompletedStars?: number
  ) => {
    const applied = applyRoundToProgress(progress, {
      difficulty: result.difficulty,
      accuracy: result.accuracy,
      stars: result.stars,
      timeTakenMs: result.timeTakenMs,
      usedPeek: result.usedPeek,
      isExact: result.isExact,
      dashCompletedStars,
    });
    setProgress(applied.next);
    saveProgress(applied.next);

    if (result.isExact || result.stars === 3) {
      triggerConfetti('big');
    } else if (result.stars === 2) {
      triggerConfetti('medium');
    }

    return { newBadges: applied.newBadges, newSkins: applied.newSkins };
  };

  const handleDashFinished = (results: RoundResult[]) => {
    setDashSummary(results);
    const totalStars = results.reduce((s, r) => s + r.stars, 0);
    if (totalStars >= 8) {
      triggerConfetti('big');
      musicEngine.duck(1400);
      soundEngine.playBadgeUnlock();
    }
  };

  const handleSelectSkin = (skinId: ClockSkinId) => {
    updateProgress((prev) => ({ ...prev, selectedSkin: skinId }));
  };

  const handleResetProgress = () => {
    const fresh = { ...DEFAULT_PROGRESS };
    setProgress(fresh);
    soundEngine.setEnabled(true);
    musicEngine.setEnabled(true);
    haptics.setEnabled(true);
    saveProgress(fresh);
  };

  if (!loaded) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-cream">
        <div className="text-xl font-black text-amber-500 animate-pulse">
          TickTock Mystery...
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-y-auto overflow-x-hidden">
      {/* Subtle playful pastel background clouds */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -left-12 top-12 h-44 w-44 rounded-full bg-sky-200/35 blur-2xl" />
        <div className="absolute -right-12 top-28 h-52 w-52 rounded-full bg-amber-200/40 blur-2xl" />
        <div className="absolute bottom-10 left-1/3 h-48 w-48 rounded-full bg-pink-200/30 blur-2xl" />
      </div>

      <ConfettiCanvas burstKey={confettiKey} intensity={confettiIntensity} />

      {screen === 'home' ? (
        <HomeScreen
          progress={progress}
          playMode={playMode}
          onChangePlayMode={setPlayMode}
          onStartGame={handleStartGame}
          onOpenTrophies={(tab) => setTrophyModalTab(tab)}
          onOpenParents={() => setParentsOpen(true)}
          onToggleSound={handleToggleSound}
          onToggleMusic={handleToggleMusic}
        />
      ) : (
        <GameScreen
          key={`${difficulty}-${playMode}-${gameSessionKey}`}
          difficultyId={difficulty}
          playMode={playMode}
          progress={progress}
          onExit={() => {
            setDashSummary(null);
            setScreen('home');
          }}
          onToggleSound={handleToggleSound}
          onToggleMusic={handleToggleMusic}
          onRoundComplete={handleRoundComplete}
          onDashFinished={handleDashFinished}
        />
      )}

      {trophyModalTab && (
        <TrophyModal
          progress={progress}
          initialTab={trophyModalTab}
          onSelectSkin={handleSelectSkin}
          onClose={() => setTrophyModalTab(null)}
        />
      )}

      {dashSummary && (
        <DashSummaryModal
          results={dashSummary}
          onPlayAgain={() => {
            setDashSummary(null);
            setGameSessionKey((k) => k + 1);
          }}
          onGoHome={() => {
            setDashSummary(null);
            setScreen('home');
          }}
        />
      )}

      {parentsOpen && (
        <ParentsGateModal
          onClose={() => setParentsOpen(false)}
          onResetProgress={handleResetProgress}
        />
      )}
    </div>
  );
}
