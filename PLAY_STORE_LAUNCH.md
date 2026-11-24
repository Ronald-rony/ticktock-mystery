# TickTock Mystery — Google Play Store Launch Playbook

Everything in this repository is pre-configured for **Google Play Store (Families Policy)** submission:
- Native Android project in `android/` targeting **Android 15 (API 35)** (`minSdk 24`, `targetSdk 35`)
- Zero Advertising ID (`AD_ID` explicitly stripped in `AndroidManifest.xml`), zero ads, zero tracking, 100% offline
- 123 adaptive icons & splash screens pre-generated inside `android/app/src/main/res/`
- Original, 100% copyright-free procedural kids music + sound effects
- Play Console graphics ready in `play-store-assets/`:
  - `play-store-assets/app-icon-512x512.png` (512×512 PNG)
  - `play-store-assets/feature-graphic-1024x500.png` (1024×500 PNG)

---

## Step 1: Build Your Signed `.aab` (Choose Local OR Cloud)

### Option A — Build Locally on Your Mac (One-Time Setup)
Install Java 21 + Android Studio (or Android command-line tools):
```bash
brew install --cask temurin@21 android-studio
```
1. Open **Android Studio** once so it installs Android SDK Platform 35, then open `/Users/ronaldrony/Games/ticktock-mystery/android`.
2. Create your Play Store upload signing key (once):
   ```bash
   cd /Users/ronaldrony/Games/ticktock-mystery
   ./scripts/create-upload-keystore.sh
   ```
3. Build the signed Play Store App Bundle (`.aab`):
   ```bash
   npm run build && npx cap copy android
   cd android && ./gradlew bundleRelease
   ```
   Your upload-ready file will be at:
   `android/app/build/outputs/bundle/release/app-release.aab`

### Option B — Build in the Cloud via GitHub Actions (No Local Android Studio Needed!)
1. Push this project to a GitHub repo.
2. Add 4 repository secrets (`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`) — or run unsigned first to test the build.
3. Open **GitHub → Actions → Build Google Play Release (.aab) → Run workflow** and download `app-release.aab` from Artifacts!

---

## Step 2: Host Your Privacy Policy URL (Required by Play Console)
Google Play requires a public HTTPS link to your Privacy Policy for every Families app.
- Ready-to-host webpage: `public/privacy-policy.html`
- Fastest free option: enable **GitHub Pages** or drop `public/privacy-policy.html` onto **Netlify Drop** / **Cloudflare Pages**, and paste the resulting `https://.../privacy-policy.html` URL into Play Console.

---

## Step 3: Copy-Paste Google Play Console Listing Details

### Main Store Listing
- **App Name:** `TickTock Mystery`
- **Short Description (76/80 chars):**  
  `Guess the mystery analog clock with Pip the Owl! Fun angle game for kids.`
- **Full Description:**
  ```text
  Can you tell time when the numbers vanish?!

  Meet Pip the Owl in TickTock Mystery — a joyful, colorful analog clock guessing game designed just for kids! Look closely at the bouncy coral Hour hand, sky-blue Minute hand, and purple lollipop Second hand, guess the secret time, and watch all 12 hidden numbers pop onto the clock face in a rainbow wave to see how close you got!

  WHY KIDS & PARENTS LOVE TICKTOCK MYSTERY:
  • 4 Kid-Friendly Worlds:
    🐣 Little Sprout (Easy) — Quarter hours with 12 friendly helper spikes
    🦊 Clever Fox (Medium) — 5-minute jumps with 4 compass spikes
    🦉 Angle Owl (Tricky) — Every minute with just a top 12 star marker
    🚀 Time Master (Master) — All 3 hands on a pure blank mystery clock!
  • Helpful Peek Button: Tap Peek anytime to briefly glow 12, 3, 6, and 9!
  • Magic Number Reveal: Watch hidden ticks & numbers pop in plus glowing Ghost Hands showing your guess side-by-side!
  • Cheerful Original Kids Music & Toy Sound Effects (with separate Music & SFX toggles)
  • 2 Play Modes: Relaxed Free Play + exciting 5-Round Mystery Dash!
  • Unlockable Rewards: Collect stars to unlock 12 playful badges & 5 colorful toy clock skins!

  100% KID-SAFE & PRIVACY-FIRST:
  • Zero ads, zero in-app purchases, zero external links
  • Zero tracking or personal data collected
  • Built-in Grown-Ups Only Parents Gate
  • Works 100% offline — perfect for road trips and flights!
  ```
- **App Category:** `Games` → `Educational`
- **App Icon:** Upload `play-store-assets/app-icon-512x512.png`
- **Feature Graphic:** Upload `play-store-assets/feature-graphic-1024x500.png`
- **Screenshots:** Capture 2–4 phone screenshots (`1080×1920` or `390×844` scaled) and 2 tablet screenshots from the running app (`Home Screen`, `Little Sprout Guessing`, `Magic Number Reveal`, `Trophy Room`).

### App Content Declarations (Exact Answers)
- **Privacy Policy:** Paste your hosted `privacy-policy.html` URL
- **Ads:** `No, my app does not contain ads`
- **App Access:** `All functionality is available without special access`
- **Content Rating (IARC):** Complete questionnaire selecting `No` to violence/fear/language/gambling/user-interaction → yields **Everyone / PEGI 3**
- **Target Audience & Content:**
  - Target age groups: **5 and under**, **6–8**, **9–12** (and optionally 13+)
  - Designed for Families program: **Yes**
- **Data Safety:**
  - Does your app collect or share any of the required user data types? → **No**
- **Advertising ID:** `No` (explicitly stripped in `AndroidManifest.xml`)

---

## Step 4: Upload & Roll Out
1. In **Google Play Console**, go to **Test and release → Testing → Closed testing** (note: personal Play developer accounts created after Nov 2023 require 12 testers opted in for 14 days before Production access; Organization accounts can release straight to **Production**).
2. Create a new release, upload `app-release.aab`, enter release notes (`Initial launch of TickTock Mystery!`), and click **Start rollout**.
