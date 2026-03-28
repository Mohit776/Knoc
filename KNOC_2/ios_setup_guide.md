# Comprehensive iOS Configuration Guide for Trueknoc

This guide covers everything you need to do to successfully configure, build, and run the Trueknoc app for iOS devices. It accounts for your current Expo setup, Firebase Authentication (Phone/OTP), and Expo Push Notifications.

> [!IMPORTANT]  
> **Prerequisites:** 
> - You **must** have an active Apple Developer Program membership ($99/year) to build and deploy to physical iOS devices or the App Store.
> - A Mac is generally required to run iOS simulators locally, although strictly using EAS (Expo Application Services) allows you to build without one.

---

## 1. Firebase iOS Setup

Since your app uses `@react-native-firebase/app` and `@react-native-firebase/auth` alongside `expo-notifications`, push notifications and silent APNs pings (used to verify OTPs) need to be configured properly.

### Step 1.1: Add an iOS App to Firebase
1. Go to your [Firebase Console](https://console.firebase.google.com/).
2. Open your project and click **Add app** -> **iOS**.
3. **Apple bundle ID**: Enter exactly `com.trueknoc.myapp` (this matches your `app.json`).
4. **App nickname**: Optionally, name it something like "Trueknoc iOS".
5. **App Store ID**: Leave blank for now unless you already have your App Store Connect listing created.
6. Click **Register app**.

### Step 1.2: Download the Config File
1. Download the `GoogleService-Info.plist` file.
2. Move this file directly into the root directory of your project (where `app.json` is located). 
3. *Note: Ensure the file is named exactly `GoogleService-Info.plist` with no numbers like `(1)` attached.* Your `app.json` is already configured to read this.

---

## 2. Apple Push Notifications (APNs) Configuration

To support OTP auto-verification and backend push notifications, we need an APNs Authentication Key.

### Step 2.1: Create an APNs Key
1. Go to the [Apple Developer Portal -> Keys](https://developer.apple.com/account/resources/authkeys/list).
2. Click the **+** to add a new key.
3. Give it a name like "Trueknoc APNs Key".
4. Check the box next to **Apple Push Notifications service (APNs)**.
5. Click **Continue**, then **Register**.
6. **Download** the `.p8` key file. *Keep this safe; you can only download it once!*
7. Note down the **Key ID** (visible on the confirmation page) and your Apple **Team ID** (found in your Developer account membership details).

### Step 2.2: Upload APNs Key to Firebase
1. Back in the [Firebase Console](https://console.firebase.google.com/), go to **Project Settings** (gear icon) -> **Cloud Messaging** tab.
2. Scroll down to the **Apple app configuration** section.
3. Under **APNs Authentication Key**, click **Upload**.
4. Upload the `.p8` file you downloaded.
5. Enter your **Key ID** and **Team ID**.
6. Click **Upload**.

---

## 3. Expo & App Store Connect Setup

Expo Application Services (EAS) will handle all the heavy lifting of code-signing and compiling.

### Step 3.1: Initialize EAS for iOS
If you haven't already linked your Apple Developer Account with EAS, run the following in your terminal:
```bash
eas credentials
```
Select **iOS** and follow the prompts to log in to your Apple account. EAS will automatically generate:
- Distribution Certificates
- Provisioning Profiles
- Push Notification entitlements

### Step 3.2: Verify `app.json` Configuration
Your `app.json` is mostly ready, but please ensure a couple of key properties are double-checked. You already have:
```json
"ios": {
  "bundleIdentifier": "com.trueknoc.myapp",
  "googleServicesFile": "./GoogleService-Info.plist",
  "infoPlist": {
    "UIBackgroundModes": [
      "remote-notification",
      "fetch"
    ]
  },
  "entitlements": {
    "aps-environment": "production"
  }
}
```
> [!TIP]
> The `aps-environment` entitlement and `UIBackgroundModes` are explicitly required by Firebase Phone Auth (to catch the silent push payload) and Push Notifications. Your current configuration serves this perfectly.

---

## 4. Building the App

### Option A: Build for Simulators (Local Testing without Apple Dev Account)
If you don't have a paid developer account yet and want to test on a Mac iOS Simulator:
1. Ensure your `eas.json` has a simulator profile:
   ```json
   "build": {
     "simulator": {
       "ios": {
         "simulator": true
       }
     }
   }
   ```
2. Run the build:
   ```bash
   eas build --profile simulator --platform ios
   ```
3. Once completed, EAS will give you a tarball (`.tar.gz`). Extract it and drag the `.app` file onto your running iOS Simulator.

### Option B: Build for Real Devices / TestFlight
To build the application to test on your own physical iPhone or share via TestFlight:
```bash
eas build --platform ios
```
EAS will prompt you through selecting your Apple Developer Team and setting up provisioning. Once it compiles, it will usually offer to automatically submit to TestFlight if configure it, or it will provide an `.ipa` file.

## 5. Summary Checklist before Deployment

- [ ] Does `GoogleService-Info.plist` exist in the root folder without extra characters in its name?
- [ ] Is the APNs `.p8` key uploaded to Firebase settings?
- [ ] Have you run `eas credentials` to prepare your certificates?
- [ ] Are permissions clearly defined (like the Camera permission you already set in `app.json`)?

Once these are completed, your React Native / Expo application will successfully support native iOS functionality matching Android.
