import { initializeApp, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD-5AM4sAVs8hP_gjfdt9ubkSy8fx6--t4",
  authDomain: "aviation-exam-app.firebaseapp.com",
  projectId: "aviation-exam-app",
  storageBucket: "aviation-exam-app.firebasestorage.app",
  messagingSenderId: "400350681929",
  appId: "1:400350681929:web:99e499488a459f15325898"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  app = getApp();
} catch {
  app = initializeApp(firebaseConfig);
}

auth = getAuth(app);
db = getFirestore(app);

export { auth, db };
export default app;