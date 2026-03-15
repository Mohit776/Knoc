# Client Handover Checklist

This document contains a list of all accounts, keys, and assets the client needs to provide before the final app is handed over and published under their ownership.

## 1. App Identity & Branding
_Basic details required to configure the app for app stores._

- [ ] **App Name:** The exact name that will appear on the user's home screen.
- [ ] **Package Name (Android) / Bundle Identifier (iOS):** Usually in reverse domain format (e.g., `com.clientcompany.knoc`).

**Asset Requirements:**
- [ ] **App Icon (iOS & Android Base):** 1024x1024px PNG. No transparency.
- [ ] **Android Adaptive Icon (Foreground):** 1080x1080px PNG. Transparent background.
- [ ] **Splash Screen Image:** 1280x1280px PNG. Transparent background.
- [ ] **Android Push Notification Icon:** 96x96px PNG. Monochrome with transparency.
*(See Section 3 for detailed asset specifications)*

## 2. Firebase (Database, Authentication & Notifications)
_The backend, database, OTP authentication, and push notifications for the app. The client must create a Google account and set up a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)._

**Step 2A: Upgrade to Blaze Plan (Required for OTP)**
The client must upgrade their Firebase project to the **Blaze (Pay-as-you-go) Plan** and add a valid billing account in the Firebase console. This is strictly required by Google to allow sending SMS OTPs, although the first 10k messages per month are free.

**Step 2B: Enable Services**
- In the Firebase Console, go to **Authentication** -> **Sign-in Method** -> Enable **Phone Number**.
- Go to **Firestore Database** -> Create a database (Start in Production mode) -> Add a collection named `qr_codes` and another named `knoc_logs`.

**Step 2C: App Configuration Files**
- [ ] **Android App File:** In Firebase Project Settings, create an Android app with the exact Package Name (e.g., `com.knoc.app`) and download the **`google-services.json`** file. Place this in the root of the React Native app.
- [ ] **iOS App File:** In Firebase Project Settings, create an iOS app with the exact Bundle Identifier and download the **`GoogleService-Info.plist`** file. Place this in the root of the React Native app.

**Step 2D: Python Script Service Account (For the QR Generator)**
- [ ] **Service Account Key:** In Firebase Project Settings, go to the **Service accounts** tab. Click **Generate new private key**. It will download a JSON file. Rename this file to **`firebase-service-account.json`** and place it in the root of your `qr_generator` python folder.

## 3. Detailed Asset Specifications

### 1. App Icon (iOS & Android Base)
This is the main icon that users click to open your app on their home screen.
- **Dimensions:** 1024 x 1024 pixels
- **Format:** PNG
- **Requirements:**
  - No transparency (especially for iOS, it must have a solid background color).
  - Avoid rounding the corners yourself; iOS and Android will automatically apply their own border radius/masks.

### 2. Android Adaptive Icon (Foreground)
Android uses a two-layer system (foreground image + solid background color) to create those cool visual effects when users swipe or drag icons.
- **Dimensions:** 1080 x 1080 pixels
- **Format:** PNG
- **Requirements:**
  - Transparent background (only include your logo/letter in the image).
  - **Safe Zone:** Ensure the core graphic of the logo fits perfectly within the center 72% (778 x 778 px circle). Anything outside this circle might get cut off depending on the device's icon shape (circle, squircle, teardrop).
  - Set the background color separately in `app.json` under `adaptiveIcon.backgroundColor` (currently `#E6F4FE`).

### 3. Splash Screen Image
This is the image/logo users see while the app is loading.
- **Dimensions:** If it's a centered logo (like your current setup): Approx. 1280 x 1280 pixels or a wide variant like 1200 x 400 pixels.
- **Format:** PNG
- **Requirements:**
  - Transparent background is best.
  - In your `app.json`, it currently restricts the width to 200 points on screen and keeps it centered on a white background.

### 4. Android Push Notification Icon
This is the tiny icon that appears in the Android top status bar when a user receives a push notification (like when a visitor arrives).
- **Dimensions:** 96 x 96 pixels
- **Format:** PNG
- **Requirements:**
  - **CRITICAL:** It MUST be monochrome with transparency (only solid white on a transparent background). If you supply a regular colored logo, Android will display it as a solid white square or glitch it out.

## 4. App Publishing Accounts
_Developer accounts required if the client wants the app published under their own company name._
- [ ] **Google Play Developer Account:** Requires a one-time $25 fee. The client must invite you as an Admin/Developer to their Play Console.
- [ ] **Apple Developer Program (For iOS):** Requires a $99/year fee. The client must invite your Apple ID to their App Store Connect as an Admin.

## 5. Expo & EAS Account
_Expo Application Services is used to build the app in the cloud._
- [ ] **Expo Account:** The client should create a free account at [expo.dev](https://expo.dev/).
- [ ] **Access:** Either invite the developer to their organization/project, or the developer can transfer ownership of the current Expo project to the client's account at the end of the project.

## 6. App Navigation Flow

App opens → `index.tsx` checks `AsyncStorage`:

```text
├─ No session & not guest → 📱 Login screen
│   └─ After OTP → /welcome
│       └─ After onboard-qr → sets "has_onboarded" → 🏠 Home
│
├─ Has session/guest but NOT onboarded → 📋 Welcome/Onboard screen
│   └─ After onboard-qr → sets "has_onboarded" → 🏠 Home
│
├─ Has session/guest AND onboarded → 🏠 Home (DIRECT!)
│
└─ Logout → clears everything → 📱 Back to Login
```
