
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// The project will readily pick up these if you add them to .env.local
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check for required configuration before initialization
const isConfigComplete = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

if (!isConfigComplete) {
  console.warn(
    "⚠️ Firebase configuration is missing apiKey or projectId. " +
    "Please add them to your .env.local file to enable all authentication and cloud services."
  );
}

const app = isConfigComplete ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const storage = app ? getStorage(app) : null;
const db = app ? getFirestore(app) : null;
const googleProvider = new GoogleAuthProvider();

// Add essential scopes for Calendar if desired (user requested video/audio/doc integration earlier)
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');
googleProvider.addScope('https://www.googleapis.com/auth/calendar.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.addScope('openid');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, storage, db, googleProvider };
