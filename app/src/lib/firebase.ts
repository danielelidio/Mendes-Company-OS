import { Platform } from 'react-native';
import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
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
