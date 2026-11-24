# TickTock Mystery — App Store & Google Play Store Readiness Guide

TickTock Mystery is pre-configured with **Capacitor 6** for native iOS (App Store) and Android (Google Play Store) packaging, complete with store-ready icons, splash screen, native haptics, safe-area layout, offline persistence, and a Kids Category Parents Gate.

---

## 1. App Identity & Store Metadata

- **App Name:** TickTock Mystery
- **Bundle ID / Application ID:** `com.ticktockmystery.app` (configurable in `capacitor.config.ts`)
- **Primary Category:** Games → Educational / Family (or Education)
- **Age Rating:** **4+** (Apple App Store — Kids Category: Ages 6–8 & 9–11) / **Everyone (PEGI 3)** (Google Play Families)
- **Short Description (80 chars):**  
  `Guess the mystery analog clock with no numbers! Fun angle game for kids.`
- **Full Description:**  
  Can you tell time when all the numbers disappear?!  
  Meet **Pip the Owl** in **TickTock Mystery** — a cheerful, colorful analog clock guessing game built just for kids! Look closely at the bouncy coral Hour hand, sky-blue Minute hand, and purple lollipop Second hand, guess the secret time, and watch all 12 hidden numbers pop onto the clock face to see how close you got!
  - **4 Playful Worlds:** Little Sprout (quarter-hours), Clever Fox (5-minute steps), Angle Owl (exact minutes), and Time Master (Hour, Minute & Second!).
  - **2 Fun Modes:** Relaxed Free Play & exciting 5-Round Mystery Dash.
  - **Unlockable Rewards:** Earn stars to unlock 12 collectible badges and 5 colorful toy clock skins (Sunny Toy, Berry Pop, Ocean Splash, Dino Meadow, Cosmic Galaxy).
  - **100% Kid-Safe:** Zero ads, zero tracking, zero in-app purchases, and works completely offline!

---

## 2. Pre-Generated Store Assets

Located in `resources/` (standard `@capacitor/assets` format):
- `resources/icon.png` — 1024×1024 App Store & Play Store master icon (no rounded mask, edge-to-edge).
- `resources/icon-foreground.png` — 1024×1024 Android Adaptive Icon foreground.
- `resources/icon-background.png` — 1024×1024 Android Adaptive Icon background.
- `resources/splash.png` — 2732×2732 universal iOS/Android splash screen.
- `public/icons/` — 180×180 Apple Touch Icon, 192×192 and 512×512 PWA icons.

---

## 3. Build & Generate Native iOS / Android Projects

```bash
# 1. Build optimized production web bundle
npm run build

# 2. Add native platforms (first time only)
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android

# 3. Generate all native Xcode & Android mipmap/splash sizes from resources/
npx @capacitor/assets generate --ios --android

# 4. Sync web bundle & native plugins
npm run cap:sync

# 5. Open in Xcode (iOS) or Android Studio (Android)
npm run cap:open:ios
npm run cap:open:android
```

---

## 4. Store Compliance Checklist

### Apple App Store (Kids Category)
- **App Privacy ("Nutrition Label"):** Select **"Data Not Collected"**.
- **Parents Gate:** Built-in multiplication gate protects the Parents & Privacy modal (`src/components/ParentsGateModal.tsx`).
- **Orientation:** Supports Portrait on iPhone and Portrait/Landscape on iPad with responsive layouts and safe-area insets.
- **No External Links / Third-Party Ads:** Verified zero external URLs or ad SDKs.

### Google Play Store (Families Policy)
- **Target Audience:** Select children age groups (e.g., 5 and under, 6–8, 9–12).
- **Data Safety Form:** Declare **"No, this app does not collect or share user data"**.
- **Ads Declaration:** Select **"No, my app does not contain ads"**.
- **Offline Support:** Full offline gameplay + local persistence via `@capacitor/preferences`.
