# TickTock Mystery — Apple App Store Launch Playbook

Your native iOS project (`ios/`), 1024×1024 App Icon, universal Splash Screens, `Info.plist` (`ITSAppUsesNonExemptEncryption = false`), Privacy Manifest (`PrivacyInfo.xcprivacy`), Kids Category Parents Gate, and `macos-latest` GitHub Actions workflow are all pre-configured.

---

## Step 1: Enroll in the Apple Developer Program
1. On your Apple Developer account page (`https://developer.apple.com/account`), click **Enroll today**.
2. Choose **Individual / Sole Proprietor** (\$99 USD / year) and complete ID verification via the **Apple Developer** app on your iPhone/Mac.
3. Wait for Apple's confirmation email (typically 24–48 hours).

---

## Step 2: Create the App Record in App Store Connect
1. Open **https://appstoreconnect.apple.com → Apps → `+` → New App**:
   - **Platforms:** iOS
   - **Name:** `TickTock Mystery`
   - **Primary Language:** English (U.S.)
   - **Bundle ID:** `com.ticktockmystery.app` *(register this App ID first under Certificates, Identifiers & Profiles → Identifiers → `+` → App IDs if it doesn't appear in the dropdown)*
   - **SKU:** `ticktock-mystery-001`
   - **User Access:** Full Access

---

## Step 3: Build & Upload to App Store Connect (Choose Xcode OR GitHub Actions)

### Option A — Xcode on Your Mac *(Fastest & Easiest!)*
1. Install **Xcode** (free from the Mac App Store) and CocoaPods:
   ```bash
   brew install cocoapods
   ```
2. Sync & open the workspace:
   ```bash
   cd /Users/ronaldrony/Games/ticktock-mystery
   npm run build && npx cap sync ios
   npm run cap:open:ios
   ```
3. In Xcode:
   - Click **App** (blue project icon) → **Signing & Capabilities** → check **Automatically manage signing** → choose your Apple Developer **Team**.
   - Make sure the build target at the top is **Any iOS Device (arm64)**.
   - Click **Product → Archive**.
   - When the Organizer opens, click **Distribute App → App Store Connect → Upload**!

### Option B — Cloud Build via GitHub Actions *(No Local Xcode Needed)*
Add these 7 secrets under **GitHub Repo → Settings → Secrets and variables → Actions**, then run **Build iOS App Store Release (.ipa)**:
- `APPLE_TEAM_ID` — 10-character Team ID from Apple Developer Membership page
- `APPLE_DIST_CERT_P12_BASE64` — Base64-encoded Apple Distribution `.p12` certificate
- `APPLE_DIST_CERT_PASSWORD` — Password used when exporting `.p12`
- `APPLE_PROVISIONING_PROFILE_BASE64` — Base64-encoded App Store Distribution `.mobileprovision` for `com.ticktockmystery.app`
- `APPLE_PROVISIONING_PROFILE_NAME` — Exact name of that Provisioning Profile
- `APP_STORE_CONNECT_API_KEY_ID` — Key ID from App Store Connect → Users & Access → Integrations → App Store Connect API
- `APP_STORE_CONNECT_ISSUER_ID` — Issuer ID from the same page
- `APP_STORE_CONNECT_API_KEY_P8` — Full text contents of the downloaded `AuthKey_XXXXXX.p8` file

---

## Step 4: Copy-Paste App Store Connect Listing Details

- **App Name (30 chars):** `TickTock Mystery`
- **Subtitle (30 chars):** `Fun Analog Clock Game for Kids`
- **Promotional Text (170 chars):**  
  `Guess the mystery clock with Pip the Owl! Watch hidden numbers pop onto the dial, earn stars, and unlock playful toy clock skins — 100% offline & ad-free.`
- **Keywords (100 chars):**  
  `clock,tell time,kids,analog,learning,math,educational,puzzle,owl,children,toddler,angles,offline`
- **Primary Category:** `Games` → Subcategory: `Family` (Secondary: `Education`)
- **Made for Kids:** Check **Yes** → Select **Ages 6–8** (or **Ages 9–11**)
- **Age Rating:** **4+** (answer `None` to all content descriptors)
- **Privacy Policy URL:**  
  `https://ronald-rony.github.io/ticktock-mystery/privacy-policy.html`
- **Support URL:**  
  `https://ronald-rony.github.io/ticktock-mystery/`
- **App Privacy ("Nutrition Label"):** Select **"No, we do not collect data from this app"**
- **App Review Notes (helpful for Apple's Kids Category reviewer):**
  ```text
  TickTock Mystery is a 100% offline, ad-free, tracking-free educational clock game for kids.
  No login or account is required.
  The Parents & Privacy section (green shield icon in the top-right corner of the Home screen) is protected by a multiplication Parents Gate.
  ```
- **Screenshots:** Capture 3–4 screenshots on **iPhone 6.9"** and **iPad 13"** (using Xcode's Simulator or a physical device) showing the Home Screen, Little Sprout guessing, Magic Number Reveal, and Trophy Room.

Click **Add for Review → Submit to App Review**!
