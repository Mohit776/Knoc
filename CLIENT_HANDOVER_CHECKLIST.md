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
