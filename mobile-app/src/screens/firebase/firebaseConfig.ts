// Firebase config — Expo / React Native (Firebase v10+)

import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD-5AM4sAVs8hP_gjfdt9ubkSy8fx6--t4",
  authDomain: "aviation-exam-app.firebaseapp.com",
  projectId: "aviation-exam-app",
  storageBucket: "aviation-exam-app.firebasestorage.app",
  messagingSenderId: "400350681929",
  appId: "1:400350681929:web:99e499488a459f15325898",
};

// ✅ App init
const app = initializeApp(firebaseConfig);

// ✅ Auth (React Native uyumlu — persistence manuel)
export const auth = initializeAuth(app, {
  persistence: {
    type: 'LOCAL',
    storage: AsyncStorage,
  } as any,
});

// ✅ Diğer servisler
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;
