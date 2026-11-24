import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

class HapticsManager {
  private enabled = true;

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  private vibrateWeb(pattern: number | number[]) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore on unsupported browsers
      }
    }
  }

  public async tapLight() {
    if (!this.enabled) return;
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    } else {
      this.vibrateWeb(10);
    }
  }

  public async tapMedium() {
    if (!this.enabled) return;
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
    } else {
      this.vibrateWeb(18);
    }
  }

  public async celebrate(stars: number) {
    if (!this.enabled) return;
    if (Capacitor.isNativePlatform()) {
      const type =
        stars >= 2 ? NotificationType.Success : NotificationType.Warning;
      await Haptics.notification({ type }).catch(() => {});
    } else {
      if (stars >= 3) this.vibrateWeb([20, 40, 25, 40, 40]);
      else if (stars >= 2) this.vibrateWeb([18, 35, 22]);
      else this.vibrateWeb(15);
    }
  }
}

export const haptics = new HapticsManager();
