# Knoc — iOS Setup Guide 🍎

This guide covers all the code changes made and the remaining manual steps you need to complete to get the Knoc app running on iOS.

---

## ✅ Code Changes Already Applied

### 1. [app.json](file:///d:/Projects/Knoc/KNOC_2/app.json) — iOS Configuration
```diff:app.json
{
  "expo": {
    "name": "KNOC",
    "slug": "KNOC",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/main_logo/new_logo.png",
    "scheme": "knoc",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "googleServicesFile": "./google-services.json",
      "adaptiveIcon": {
        "backgroundColor": "#FFFFFF",
        "foregroundImage": "./assets/main_logo/adaptive_screen.png"
      },
      "edgeToEdgeEnabled": true,
      "predictiveBackGestureEnabled": false,
      "package": "com.knoc.app"
    },
    "web": {
      "output": "static",
      "favicon": "./assets/main_logo/icon_app.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/main_logo/splase_logo.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff",
          "dark": {
            "backgroundColor": "#000000"
          }
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/main_logo/notification_logo.png",
          "color": "#431BB8"
        }
      ],
      "@react-native-firebase/app",
      "@react-native-firebase/auth"
    ],
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true
    },
    "extra": {
      "router": {},
      "eas": {
        "projectId": "8fc41524-ec08-4732-a91f-43aa808af971"
      }
    }
  }
}
===
{
  "expo": {
    "name": "KNOC",
    "slug": "KNOC",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/main_logo/new_logo.png",
    "scheme": "knoc",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.knoc.app",
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
    },
    "android": {
      "googleServicesFile": "./google-services.json",
      "adaptiveIcon": {
        "backgroundColor": "#FFFFFF",
        "foregroundImage": "./assets/main_logo/adaptive_screen.png"
      },
      "edgeToEdgeEnabled": true,
      "predictiveBackGestureEnabled": false,
      "package": "com.knoc.app"
    },
    "web": {
      "output": "static",
      "favicon": "./assets/main_logo/icon_app.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/main_logo/splase_logo.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff",
          "dark": {
            "backgroundColor": "#000000"
          }
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/main_logo/notification_logo.png",
          "color": "#431BB8"
        }
      ],
      "@react-native-firebase/app",
      "@react-native-firebase/auth"
    ],
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true
    },
    "extra": {
      "router": {},
      "eas": {
        "projectId": "8fc41524-ec08-4732-a91f-43aa808af971"
      }
    }
  }
}
```

Added:
- **`bundleIdentifier`**: `com.knoc.app` — must match the one registered in your Firebase iOS app and Apple Developer account.
- **`googleServicesFile`**: Points to [./GoogleService-Info.plist](file:///d:/Projects/Knoc/KNOC_2/GoogleService-Info.plist) (already present in the project root).
- **`UIBackgroundModes`**: `remote-notification` and `fetch` — required by iOS to allow push notifications to wake the app.
- **`aps-environment`**: Set to `production` — this is the APNs entitlement needed for push notifications.

### 2. Notify API — APNs Payload for iOS Push Notifications
render_diffs(file:///d:/Projects/Knoc/knoc/app/api/notify/[qr_id]/route.ts)

Added an `apns` block to the FCM message. Without this, iOS devices would **not** receive push notifications even if they had a valid FCM token. The `apns-priority: 10` header ensures immediate delivery.

### 3. [eas.json](file:///d:/Projects/Knoc/KNOC_2/eas.json) — EAS Build Configuration
Created [eas.json](file:///d:/Projects/Knoc/KNOC_2/eas.json) with three build profiles:
- **`development`** — Builds a dev client for the iOS Simulator.
- **`preview`** — Builds an internal distribution `.ipa` for testing on real devices.
- **`production`** — Builds the final App Store binary.

---

## 🔧 Manual Steps You Need to Complete

### Step 1: Apple Developer Account Setup
You need an [Apple Developer Program](https://developer.apple.com/programs/) membership ($99/year).

1. Log in to [App Store Connect](https://appstoreconnect.apple.com/) and create a new App with Bundle ID `com.knoc.app`.
2. Note down your **Apple Team ID** (found in Membership details).

### Step 2: Configure APNs in Firebase
Firebase uses Apple Push Notification service (APNs) to deliver push notifications on iOS. You need to link them.

> [!IMPORTANT]
> **This step is critical.** Without it, push notifications will NOT work on iOS even though the code is correct.

**Option A: APNs Authentication Key (Recommended)**
1. Go to [Apple Developer → Keys](https://developer.apple.com/account/resources/authkeys/list).
2. Create a new key → Check **Apple Push Notifications service (APNs)** → Register.
3. Download the `.p8` key file. Note the **Key ID**.
4. In the [Firebase Console](https://console.firebase.google.com/) → Project Settings → Cloud Messaging tab → Under **Apple app configuration**, upload the `.p8` key.
5. Enter the **Key ID** and your **Team ID**.

**Option B: APNs Certificate (Legacy)**
1. In Apple Developer → Certificates → Create a new Push Notification certificate (Production).
2. Download and export as `.p12`.
3. Upload the `.p12` in Firebase Console → Cloud Messaging → Apple app configuration.

### Step 3: Update [eas.json](file:///d:/Projects/Knoc/KNOC_2/eas.json) Submission Config
Open [eas.json](file:///d:/Projects/Knoc/KNOC_2/eas.json) and replace the placeholder values under `submit.production.ios`:
- `appleId` → Your Apple ID email
- `ascAppId` → The App Store Connect app ID (numeric, found in App Store Connect → App Information)
- `appleTeamId` → Your Apple Developer Team ID

### Step 4: Build & Run

**For Simulator (development):**
```bash
cd KNOC_2
npx eas build --profile development --platform ios
```

**For Real Device Testing (preview):**
```bash
npx eas build --profile preview --platform ios
```

> [!NOTE]
> Push notifications do NOT work on the iOS Simulator. You must use a real device for testing notifications.

**For App Store (production):**
```bash
npx eas build --profile production --platform ios
npx eas submit --platform ios
```

---

## 📋 Checklist Summary

| Step | Description | Status |
|------|-------------|--------|
| 1 | [app.json](file:///d:/Projects/Knoc/KNOC_2/app.json) iOS config (bundleIdentifier, googleServicesFile, entitlements) | ✅ Done |
| 2 | [GoogleService-Info.plist](file:///d:/Projects/Knoc/KNOC_2/GoogleService-Info.plist) in project root | ✅ Already present |
| 3 | APNs payload added to Notify API route | ✅ Done |
| 4 | [eas.json](file:///d:/Projects/Knoc/KNOC_2/eas.json) created with iOS build profiles | ✅ Done |
| 5 | Apple Developer account & App Store Connect app | ⬜ Manual |
| 6 | Upload APNs key (.p8) to Firebase Console | ⬜ Manual |
| 7 | Update [eas.json](file:///d:/Projects/Knoc/KNOC_2/eas.json) with Apple credentials | ⬜ Manual |
| 8 | Run `eas build --platform ios` | ⬜ Manual |
