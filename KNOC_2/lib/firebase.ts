// Firebase modular API setup
// @react-native-firebase/app auto-initializes using google-services.json / GoogleService-Info.plist.
// We use getFirestore() and getAuth() to obtain singleton instances.

import { getFirestore } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';

const db = getFirestore();
const auth = getAuth();

export { db, auth };
