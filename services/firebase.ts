import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

const CONFIG_KEY = 'relentless_firebase_custom_config';

// Default provided configuration
const defaultConfig = {
  apiKey: "AIzaSyC0bHZ4ZZrvh_qy0HMSPQvCVJmVMjf5v-8",
  authDomain: "relentless-2c53e.firebaseapp.com",
  projectId: "relentless-2c53e",
  storageBucket: "relentless-2c53e.firebasestorage.app",
  messagingSenderId: "1064434695924",
  appId: "1:1064434695924:web:34c2b86bf659e449f1e8a1",
  measurementId: "G-S6HFC3CGPZ"
};

// Load config from storage or use default
const getFirebaseConfig = () => {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn("Failed to parse stored firebase config", e);
  }
  return defaultConfig;
};

const firebaseConfig = getFirebaseConfig();

// Initialize Firebase (singleton pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Enforce Google Account selection
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const saveFirebaseConfig = (config: any) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  // Force reload to re-initialize firebase with new config
  window.location.reload();
};

export const resetFirebaseConfig = () => {
  localStorage.removeItem(CONFIG_KEY);
  window.location.reload();
};

export const hasCustomConfig = () => {
  return !!localStorage.getItem(CONFIG_KEY);
};

export { signInWithPopup, signOut, onAuthStateChanged };
export type { User };
