# KNOC System — Full Flow Audit

## System Architecture

```mermaid
graph TD
    subgraph QR Generator ["🔲 QR Generator (Python/Streamlit)"]
        GEN["generate_qr.py"]
    end

    subgraph Firestore ["🔥 Firebase Firestore"]
        QR_CODES["qr_codes collection"]
        KNOC_LOGS["knoc_logs collection"]
    end

    subgraph NextJS ["🌐 Next.js Web App (knoc/)"]
        QR_PAGE["QR Page /qr/[qr_id]"]
        API_NOTIFY["POST /api/notify/[qr_id]"]
        API_LOG_GET["GET /api/knoc-log/[log_id]"]
        API_LOG_PATCH["PATCH /api/knoc-log/[log_id]"]
        API_LOGS_LIST["GET /api/knoc-logs/[qr_id]"]
    end

    subgraph Mobile ["📱 React Native App (KNOC_2/)"]
        LOGIN["Login Screen"]
        OTP["OTP Screen"]
        WELCOME["Welcome Screen"]
        ONBOARD["Onboard QR Screen"]
        HOME["Home Screen"]
        SETTINGS["Settings Screen"]
    end

    GEN -->|"Creates doc with qr_id as doc ID"| QR_CODES

    QR_PAGE -->|"Reads QR data"| QR_CODES
    QR_PAGE -->|"Visitor presses Alarm"| API_NOTIFY
    API_NOTIFY -->|"1. Reads fcm_token"| QR_CODES
    API_NOTIFY -->|"2. Creates knoc_log"| KNOC_LOGS
    API_NOTIFY -->|"3. Sends FCM push"| HOME
    API_LOG_GET -->|"Polls for response"| KNOC_LOGS

    LOGIN -->|"Sends OTP"| OTP
    OTP -->|"Existing user"| HOME
    OTP -->|"New user"| WELCOME
    WELCOME --> ONBOARD
    ONBOARD -->|"Links QR + saves FCM token"| QR_CODES
    ONBOARD --> HOME
    HOME -->|"Reads logs"| KNOC_LOGS
    HOME -->|"Renews FCM token"| QR_CODES
    HOME -->|"Coming/Ignore response"| KNOC_LOGS
```

---

## Complete Flow Walkthrough

### Phase 1: QR Code Generation ✅
**File:** [generate_qr.py](file:///d:/Projects/Knoc/qr_generator/generate_qr.py)

1. Admin generates QR codes via Streamlit UI
2. Each QR gets a unique ID: `KNO` + 10 hex chars (e.g., `KNO8A2C3F1B2D`)
3. QR encodes URL: `{BASE_URL}/qr/{qr_id}`
4. Firestore document created with **doc ID = qr_id**:
   ```json
   {
     "qr_id": "KNO8A2C3F1B2D",
     "name": null,
     "location": null,
     "phone_number": null,
     "created_at": serverTimestamp
   }
   ```

> [!IMPORTANT]
> The document ID **equals** the `qr_id` field. This is critical because later the mobile app uses this ID for `.doc(id).update()`. The previous bug was using the `qr_id` *field* instead of `doc.id` in some places — these don't always match if there were manual edits to the DB.

---

### Phase 2: Mobile App Signup Flow

#### Step 2a: Login → OTP ✅
**Files:** [login.tsx](file:///d:/Projects/Knoc/KNOC_2/app/login.tsx) → [otp.tsx](file:///d:/Projects/Knoc/KNOC_2/app/otp.tsx)

1. User enters phone → Firebase sends OTP
2. User enters OTP → Firebase verifies
3. OTP screen checks if phone exists in `qr_codes` collection

#### Step 2b: Existing User Path ✅ (Fixed)
**File:** [otp.tsx](file:///d:/Projects/Knoc/KNOC_2/app/otp.tsx#L83-L122)

1. Phone found in DB → user exists
2. Gets FCM token via [registerForPushNotificationsAsync()](file:///d:/Projects/Knoc/KNOC_2/lib/notifications.ts#16-62)
3. Saves FCM token to Firestore using **document ID** (`existingDoc.id`)
4. Stores `linked_qr_id` = **document ID** in AsyncStorage
5. Navigates to Home

#### Step 2c: New User Path ✅
**Files:** [otp.tsx](file:///d:/Projects/Knoc/KNOC_2/app/otp.tsx#L124-L125) → [welcome.tsx](file:///d:/Projects/Knoc/KNOC_2/app/welcome.tsx) → [onboard-qr.tsx](file:///d:/Projects/Knoc/KNOC_2/app/onboard-qr.tsx)

1. Phone NOT in DB → new user
2. Navigates to Welcome → user taps "Onboard Your QR Code"
3. Onboard screen: user enters QR ID, name, location
4. Gets FCM token
5. Updates Firestore doc (using the typed QR ID as doc ID) with: phone, name, location, fcm_token
6. Stores `linked_qr_id` = QR code ID in AsyncStorage

---

### Phase 3: Home Screen ✅ (Fixed)
**File:** [home.tsx](file:///d:/Projects/Knoc/KNOC_2/app/(Tabs)/home.tsx)

1. Loads `linked_qr_id` from AsyncStorage (fast path)
2. If missing, queries Firestore by phone → stores **document ID** (fixed!)
3. Re-registers FCM token on every app load
4. Fetches knoc_logs for the QR ID
5. Listens for push notifications → shows "Coming/Ignore" banner

---

### Phase 4: Visitor Scans QR (Next.js Web) ✅
**Files:** [page.tsx](file:///d:/Projects/Knoc/knoc/app/qr/[qr_id]/page.tsx) → [ActionButtons.tsx](file:///d:/Projects/Knoc/knoc/app/qr/[qr_id]/ActionButtons.tsx)

1. Visitor scans QR → opens `yoursite.com/qr/KNO8A2C3F1B2D`
2. Server component fetches QR data from Firestore
3. Shows location info + Alarm button
4. Visitor presses Alarm → calls `POST /api/notify/[qr_id]`

---

### Phase 5: Notification Flow ✅
**File:** [notify route](file:///d:/Projects/Knoc/knoc/app/api/notify/[qr_id]/route.ts)

1. API reads QR doc → gets `fcm_token`
2. Creates `knoc_logs` entry with `qr_id`, `action`, `response: null`
3. Sends FCM push notification to the mobile app
4. Returns `logId` to the web client

---

### Phase 6: Response Polling ✅
**Files:** [ActionButtons.tsx](file:///d:/Projects/Knoc/knoc/app/qr/[qr_id]/ActionButtons.tsx) → [knoc-log route](file:///d:/Projects/Knoc/knoc/app/api/knoc-log/[log_id]/route.ts)

1. Web client polls `GET /api/knoc-log/[log_id]` every 3 seconds
2. Mobile user taps "Coming" or "Ignore" → updates Firestore log directly
3. Next poll picks up `response: "coming"` or `"ignored"`
4. Web shows appropriate banner to visitor

---

## 🐛 Issues Found & Fixed

### ✅ Issue 1: Document ID vs Data Field Mismatch (FIXED)
| Location | Before | After |
|---|---|---|
| [otp.tsx:108](file:///d:/Projects/Knoc/KNOC_2/app/otp.tsx#L113-L117) | `existingData.qr_id \|\| existingQrId` | `existingDoc.id` |
| [home.tsx:97-100](file:///d:/Projects/Knoc/KNOC_2/app/(Tabs)/home.tsx#L97-L103) | `data.qr_id` | `snapshot.docs[0].id` |

**Impact**: FCM token saves, log fetches, and all `.doc(id).update()` calls would silently fail if `doc.id ≠ data.qr_id`.

### ✅ Issue 2: Silent FCM Save Failures (FIXED)
Added try/catch + logging around all FCM token save operations across [otp.tsx](file:///d:/Projects/Knoc/KNOC_2/app/otp.tsx), [home.tsx](file:///d:/Projects/Knoc/KNOC_2/app/%28Tabs%29/home.tsx), and [onboard-qr.tsx](file:///d:/Projects/Knoc/KNOC_2/app/onboard-qr.tsx).

---

## ⚠️ Remaining Issues / Warnings

### Issue 3: Notify API Uses `qrData.qr_id` not the URL param for `knoc_logs`
**File:** [notify route](file:///d:/Projects/Knoc/knoc/app/api/notify/[qr_id]/route.ts#L33)

```typescript
qr_id: qrId,  // This is from URL param (= document ID)
```

The notify API uses `qrId` (from the URL parameter, which IS the document ID) when creating `knoc_logs`. This is **correct** because the QR URL contains the doc ID.

**BUT** there's a subtle issue: On the mobile app side, [home.tsx:125](file:///d:/Projects/Knoc/KNOC_2/app/(Tabs)/home.tsx#L125) queries `knoc_logs` with:
```typescript
.where('qr_id', '==', id)  // id = linked_qr_id from AsyncStorage
```

If `linked_qr_id` was previously stored as `data.qr_id` (the old bug), logs won't show up because the `qr_id` in `knoc_logs` is the **document ID** from the URL. **This is now fixed** by always storing the document ID.

### Issue 4: [ActionButtons](file:///d:/Projects/Knoc/knoc/app/qr/%5Bqr_id%5D/ActionButtons.tsx#10-242) passes `qrData.qr_id` not doc ID ⚠️
**File:** [page.tsx:76](file:///d:/Projects/Knoc/knoc/app/qr/[qr_id]/page.tsx#L76)

```tsx
<ActionButtons qrId={qrData.qr_id} />
```

The QR page gets `qrData` from `doc.data()` and passes `qrData.qr_id` (the data field) to [ActionButtons](file:///d:/Projects/Knoc/knoc/app/qr/%5Bqr_id%5D/ActionButtons.tsx#10-242). This then calls `/api/notify/${qrId}`. The notify API does `db.collection('qr_codes').doc(qrId).get()`.

**This works ONLY if `qr_id` field = document ID**. Since the generator sets them equal, this works today. But it's fragile — it should use the URL param directly.

### Issue 5: Logout Doesn't Clear FCM Token from Firestore ⚠️
**File:** [settings.tsx:110-141](file:///d:/Projects/Knoc/KNOC_2/app/(Tabs)/settings.tsx#L110-L141)

When a user logs out, the `fcm_token` stays in the Firestore `qr_codes` document. This means:
- Notifications will still be sent to the old device
- If someone else logs in and links the same QR code, they'll compete for notifications

### Issue 6: [(Tabs)/_layout.tsx](file:///d:/Projects/Knoc/knoc/app/api/knoc-log/%5Blog_id%5D/route.ts#36-53) has invalid routes for `welcome` and `login` ⚠️
**File:** [_layout.tsx:43-50](file:///d:/Projects/Knoc/KNOC_2/app/(Tabs)/_layout.tsx#L43-L50)

```tsx
<Tabs.Screen name="welcome" options={{ href: null }} />
<Tabs.Screen name="login" options={{ href: null }} />
```

These screens (`welcome` and `login`) are NOT inside [(Tabs)/](file:///d:/Projects/Knoc/knoc/app/api/knoc-log/%5Blog_id%5D/route.ts#36-53) — they're in the root `app/` directory. These `Tabs.Screen` definitions reference non-existent screens and may cause warnings or errors. They should be removed.

### Issue 7: No `fcm_token` Field in QR Generator ⚠️
**File:** [generate_qr.py:60-66](file:///d:/Projects/Knoc/qr_generator/generate_qr.py#L60-L66)

The QR generator doesn't create an `fcm_token` field when initializing documents. While Firestore allows adding fields dynamically via `.update()`, having a consistent schema is better practice. Consider adding `"fcm_token": None` to the initial document.

### Issue 8: `expo-server-sdk` is unused ⚠️
**File:** [package.json](file:///d:/Projects/Knoc/knoc/package.json#L12)

The Next.js web app has `expo-server-sdk` as a dependency, but you're using `firebase-admin` messaging (FCM directly). The expo-server-sdk is not used anywhere and can be removed.

### Issue 9: Service Account Private Key Exposed in .env ⚠️
**File:** [.env](file:///d:/Projects/Knoc/knoc/.env)

> [!CAUTION]
> The Firebase service account private key is stored in plain text in the [.env](file:///d:/Projects/Knoc/knoc/.env) file AND this file appears to be in the git repo (it's not in [.gitignore](file:///d:/Projects/Knoc/.gitignore) patterns matching [.env](file:///d:/Projects/Knoc/knoc/.env)). This is a **critical security issue**. Consider rotating the key and using proper secrets management.

---

## 📋 Fixes To Apply

| # | Priority | Issue | File | Status |
|---|---|---|---|---|
| 1 | 🔴 Critical | Doc ID vs data field mismatch | [otp.tsx](file:///d:/Projects/Knoc/KNOC_2/app/otp.tsx), [home.tsx](file:///d:/Projects/Knoc/KNOC_2/app/%28Tabs%29/home.tsx) | ✅ Fixed |
| 2 | 🔴 Critical | Silent FCM failures | [otp.tsx](file:///d:/Projects/Knoc/KNOC_2/app/otp.tsx), [home.tsx](file:///d:/Projects/Knoc/KNOC_2/app/%28Tabs%29/home.tsx), [onboard-qr.tsx](file:///d:/Projects/Knoc/KNOC_2/app/onboard-qr.tsx) | ✅ Fixed |
| 3 | 🟡 Medium | ActionButtons uses data field not URL param | `qr/[qr_id]/page.tsx` | ✅ Fixed |
| 4 | 🟡 Medium | Logout doesn't clear FCM token | [settings.tsx](file:///d:/Projects/Knoc/KNOC_2/app/%28Tabs%29/settings.tsx) | ✅ Fixed |
| 5 | 🟠 Low | Invalid Tabs.Screen entries | [(Tabs)/_layout.tsx](file:///d:/Projects/Knoc/knoc/app/api/knoc-log/%5Blog_id%5D/route.ts#36-53) | ✅ Fixed |
| 6 | 🟠 Low | Missing `fcm_token` in QR generator | [generate_qr.py](file:///d:/Projects/Knoc/qr_generator/generate_qr.py) | ✅ Fixed |
| 7 | 🔴 Critical | Service account key exposed | [.env](file:///d:/Projects/Knoc/knoc/.env) / git | ⚠️ Needs manual rotation |
| 8 | ⚪ Cleanup | Unused `expo-server-sdk` dep | [package.json](file:///d:/Projects/Knoc/knoc/package.json) | ✅ Fixed |
