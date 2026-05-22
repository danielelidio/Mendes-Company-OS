import { Platform } from 'react-native';
import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase Web config. Values come from EXPO_PUBLIC_* env vars (see .env / .env.example).
// A Firebase web config is not secret — it is shipped to the client by design.
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/** True once the env vars are filled in. */
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

/** Initialize once — guards against re-init on Fast Refresh / repeated imports. */
export const firebaseApp: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

/** Firestore — stores the extracted Nota Fiscal records (the queryable table). */
export const db = getFirestore(firebaseApp);

/** Cloud Storage — stores the uploaded XML files. */
export const storage = getStorage(firebaseApp);

/**
 * Auth works on both web and native:
 * - Web: default browser persistence (IndexedDB/localStorage) via getAuth.
 * - Native: AsyncStorage persistence via initializeAuth, so sessions survive app restarts.
 *
 * getReactNativePersistence is only exported by Firebase's React Native build, so it is read
 * dynamically here — the web type definitions omit it, and it is never called on web.
 */
function createAuth(): firebaseAuth.Auth {
  if (Platform.OS === 'web') return firebaseAuth.getAuth(firebaseApp);

  const getReactNativePersistence = (
    firebaseAuth as unknown as {
      getReactNativePersistence?: (storage: unknown) => firebaseAuth.Persistence;
    }
  ).getReactNativePersistence;

  if (!getReactNativePersistence) return firebaseAuth.getAuth(firebaseApp);

  try {
    return firebaseAuth.initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Already initialized (e.g. Fast Refresh re-ran this module).
    return firebaseAuth.getAuth(firebaseApp);
  }
}

export const auth: firebaseAuth.Auth = createAuth();

// Local testing / E2E: connect to the Firebase Emulator Suite when the flag is set.
// (EXPO_PUBLIC_USE_FIREBASE_EMULATOR=true; emulator host defaults to localhost.)
export const usingEmulator = process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'true';
if (usingEmulator) {
  const host = process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST || 'localhost';
  try {
    firebaseAuth.connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(db, host, 8080);
    connectStorageEmulator(storage, host, 9199);
  } catch {
    // Already connected (Fast Refresh re-ran this module) — ignore.
  }
}
