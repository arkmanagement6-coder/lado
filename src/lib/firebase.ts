import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBA020qGqpEsnZecSb1npfzgo6h-E3wNTo",
  authDomain: "lado-24e43.firebaseapp.com",
  projectId: "lado-24e43",
  storageBucket: "lado-24e43.firebasestorage.app",
  messagingSenderId: "565879914730",
  appId: "1:565879914730:web:8909b366a7a59a5a00d793",
};

// Check if Firebase configs are provided (forced true for hardcoded config)
export const hasFirebaseConfig = true;

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firestore reference
export const fdb = getFirestore(app);
