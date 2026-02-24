# Client Handover Checklist

This document contains a list of all accounts, keys, and assets the client needs to provide before the final app is handed over and published under their ownership.

## 1. App Identity & Branding
_Basic details required to configure the app for app stores._
- [ ] **App Name:** The exact name that will appear on the user's home screen.
- [ ] **Package Name (Android) / Bundle Identifier (iOS):** Usually in reverse domain format (e.g., `com.clientcompany.knoc`).
- [ ] **App Icon:** A high-resolution PNG (1024x1024px) without a transparent background.
- [ ] **Splash Screen Logo:** A high-resolution PNG with a transparent background.

## 2. Supabase (Database & Authentication)
_The backend and database for the app. The client must create a free account at [supabase.com](https://supabase.com/)._
- [ ] **Supabase Project URL** (e.g., `https://xxxx.supabase.co`)
- [ ] **Supabase Anon Public Key** (e.g., `eyJhbGci...`)
> **Note to Developer:** Once you have these, update the EAS Dashboard environment variables. You will also need to run the SQL scripts in the new Supabase project to recreate the tables and schema.

## 3. Firebase (Push Notifications)
_Required for sending push notifications. The client must create a free account at [console.firebase.google.com](https://console.firebase.google.com/)._
- [ ] **For Android:** Create an Android app with the exact Package Name (from Step 1) and provide the **`google-services.json`** file.
- [ ] **For iOS (if applicable):** Create an iOS app with the exact Bundle Identifier and provide the **`GoogleService-Info.plist`** file.

## 4. App Publishing Accounts
_Developer accounts required if the client wants the app published under their own company name._
- [ ] **Google Play Developer Account:** Requires a one-time $25 fee. The client must invite you as an Admin/Developer to their Play Console.
- [ ] **Apple Developer Program (For iOS):** Requires a $99/year fee. The client must invite your Apple ID to their App Store Connect as an Admin.

## 5. Expo & EAS Account
_Expo Application Services is used to build the app in the cloud._
- [ ] **Expo Account:** The client should create a free account at [expo.dev](https://expo.dev/).
- [ ] **Access:** Either invite the developer to their organization/project, or the developer can transfer ownership of the current Expo project to the client's account at the end of the project.





App opens → index.tsx checks AsyncStorage:

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


1. App Icon (iOS & Android Base)
This is the main icon that users click to open your app on their home screen.

Dimensions: 1024 x 1024 pixels
Format: PNG
Requirements:
No transparency (especially for iOS, it must have a solid background color).
Avoid rounding the corners yourself; iOS and Android will automatically apply their own border radius/masks.
2. Android Adaptive Icon (Foreground)
Android uses a two-layer system (foreground image + solid background color) to create those cool visual effects when users swipe or drag icons.

Dimensions: 1080 x 1080 pixels
Format: PNG
Requirements:
Transparent background (only include your logo/letter in the image).
Safe Zone: Ensure the core graphic of the logo fits perfectly within the center 72% (778 x 778 px circle). Anything outside this circle might get cut off depending on the device's icon shape (circle, squircle, teardrop).
Set the background color separately in 

app.json
 under adaptiveIcon.backgroundColor (currently #E6F4FE).
3. Splash Screen Image
This is the image/logo users see while the app is loading.

Dimensions:
If it's a centered logo (like your current setup): Approx. 1280 x 1280 pixels or a wide variant like 1200 x 400 pixels.
Format: PNG
Requirements:
Transparent background is best.
In your 

app.json
, it currently restricts the width to 200 points on screen and keeps it centered on a white background.
4. Android Push Notification Icon
This is the tiny icon that appears in the Android top status bar when a user receives a push notification (like when a visitor arrives).

Dimensions: 96 x 96 pixels
Format: PNG
Requirements:
CRITICAL: It MUST be monochrome with transparency (only solid white on a transparent background).
If you supply a regular colored logo, Android will display it as a solid white square or glitch it out.
5. Web Favicon (Optional)
This applies if you are hosting the Expo app on the web.

Dimensions: 256 x 256 pixels (or standard 64x64 or 48x48)
Format: PNG or ICO
Requirements: Square, can be transparent.
Summary Checklist for the Designer:
icon.png (1024x1024, NO transparency)
adaptive-icon-foreground.png (1080x1080, Transparent BG, graphic in center 778x778)
splash.png (e.g., 1280x1280, Transparent BG)
notification-icon.png (96x96, Transparent BG, Solid White Graphic ONLY)
