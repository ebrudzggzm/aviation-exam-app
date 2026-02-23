// Firebase Configuration
// https://console.firebase.google.com/
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD-5AM4sAVs8hP_gjfdt9ubkSy8fx6--t4",
  authDomain: "aviation-exam-app.firebaseapp.com",
  projectId: "aviation-exam-app",
  storageBucket: "aviation-exam-app.firebasestorage.app",
  messagingSenderId: "400350681929",
  appId: "1:400350681929:web:99e499488a459f15325898"
};

// ✅ Firebase'i başlat
const app = initializeApp(firebaseConfig);

// ✅ Servisleri export et
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;