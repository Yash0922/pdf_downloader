import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  // Replace with your Firebase config
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