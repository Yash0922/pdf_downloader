import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  // Replace with your Firebase config
  // apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  // messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  // appId: import.meta.env.VITE_FIREBASE_APP_ID
  
  apiKey: "AIzaSyADM9wJs1JC21ne9NVlziTjUinKcRGUvtM",
  authDomain: "pdf-downloader-674b6.firebaseapp.com",
  projectId: "pdf-downloader-674b6",
  storageBucket: "pdf-downloader-674b6.firebasestorage.app",
  messagingSenderId: "201402845829",
  appId: "1:201402845829:web:7a6177862bdde14603b7ec",
  measurementId: "G-1J2565VRBJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);