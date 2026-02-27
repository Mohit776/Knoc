# Knoc - Smart Doorbell & Visitor Management System 🚪📲

Knoc is a comprehensive ecosystem designed to replace traditional doorbells with a smart, QR-based visitor management system. It relies heavily on physical QR codes that visitors can scan, instantly connecting them with the property owner via push notifications.

---

## 🌟 Core Features & System Flow

The Knoc system is broken down into three major interactive phases:

### Phase 1: Administration & Setup (`qr_generator`)
- **QR Code Generation:** An admin uses a Python tool to mass-generate unique QR codes (format: `KNO` + 10 hex characters).
- **Database Initialization:** The tool registers each unique code in the Firebase Firestore database with an empty profile. 
- **Print & Deploy:** These physical QR codes are then placed at the location (e.g., an office door, an apartment gate).

### Phase 2: User Onboarding (`KNOC_2` - Mobile App)
- **OTP Authentication:** Users sign up or log in to the React Native application using their phone number via Firebase Authentication.
- **Link a QR Code:** A new user scans or manually types in the ID of the physical QR code deployed at their door, "claiming" it.
- **Profile Setup:** The user adds their name and location (e.g., "Apt 4B").
- **Device Registration:** The app silently registers the user's mobile device for Push Notifications via FCM (Firebase Cloud Messaging), linking the physical QR code directly to their phone.

### Phase 3: The Visitor Experience (`knoc` - Web App)
- **Scan & Alert:** A visitor arrives at the door, scans the QR code with their camera, and is redirected to a personalized Next.js web page (e.g., `yoursite.com/qr/KNO123...`).
- **Ring the Bell:** The visitor taps an "Alarm/Knoc" button on the webpage.
- **Instant Notification:** A Next.js API route triggers an FCM push notification straight to the homeowner's mobile device.
- **Two-Way Interaction:** The homeowner's phone lights up with a "Visitor is here!" alert. They can open the app and tap **"Coming"** or **"Ignore"**.
- **Real-Time Feedback:** The visitor's webpage continuously polls the backend and updates immediately, showing a banner: *"The owner is on their way!"* or *"The owner is currently unavailable."*

---

## 🏗️ Technical Architecture

This repository is divided into three main components:

### 1. `KNOC_2/` (Mobile App)
An Expo / React Native application that serves as the primary mobile client for the property owners.
- **Stack:** React Native, Expo, Expo Router.
- **Auth:** Firebase Phone Number OTP.
- **Database:** Firebase Firestore (for syncing QR data, logs, and FCM tokens).
- **Push Notifications:** Native integration via Expo Push + Firebase Cloud Messaging (FCM).
- **Setup:** `cd KNOC_2 && npm install && npx expo start`

### 2. `knoc/` (Web/Backend App)
A Next.js 15+ web application that acts as both the frontend for the visitor and the backend notification dispatcher.
- **Stack:** Next.js (App Router), React, Tailwind CSS.
- **Database:** Firebase Admin SDK (server-side DB operations).
- **API Routes:** Endpoints to handle the doorbell ring and response polling.
- **Setup:** `cd knoc && npm install && npm run dev`

### 3. `qr_generator/` (QR Utility)
A Python utility folder to generate QR codes and pair them with IDs in Firestore.
- **Stack:** Python.
- **Auth:** Requires a Firebase Service Account key (`firebase-service-account.json`) to communicate securely with the backend.

---

## 🚀 Prerequisites & Installation

To run this project, you will need:
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Python](https://www.python.org/) 3.x
- [Expo CLI](https://expo.dev/) installed globally or run via `npx`
- A configured Firebase project on the **Blaze (Pay-as-you-go) plan** (required limitations regarding SMS OTP verification).

### Getting Started

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Knoc
   ```

2. **Configure Environment Variables:**
   You will need to configure `.env` files for both the Next.js and Expo applications containing keys for Firebase/Supabase as required. 
   *(See `CLIENT_HANDOVER_CHECKLIST.md` for full Firebase setup instructions).*

3. **Start the Visitor Web App:**
   ```bash
   cd knoc
   npm install
   npm run dev
   ```

4. **Start the Homeowner Mobile App:**
   ```bash
   cd ../KNOC_2
   npm install
   npx expo start
   ```

---

## 📄 Client Handover & Deployment

If you are deploying this for production or handing it over to a client, **please review the `CLIENT_HANDOVER_CHECKLIST.md`** file located at the root of the project. It contains crucial instructions regarding:
- App identity & branding configuration (Icons, Package Names).
- Step-by-step setup for Firebase (Database, Authentication, & Notifications).
- Setting up the Service Account for the Python Script.
- Developer account prerequisites for App Store & Google Play publishing.
