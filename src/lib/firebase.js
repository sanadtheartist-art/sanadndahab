import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDzDErt48oNkpskL0oLEshAlIeIeYawAnk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "my-art-portfolio-43d92.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "my-art-portfolio-43d92",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "my-art-portfolio-43d92.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "74829465359",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:74829465359:web:de100f4028c9fcbd97e07a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
