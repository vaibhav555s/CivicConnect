// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, RecaptchaVerifier } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBvZ44AtNFyZcjmk5EQhdvYasuqSyh8yKM",
  authDomain: "civicconnect-ea7d3.firebaseapp.com",
  projectId: "civicconnect-ea7d3",
  storageBucket: "civicconnect-ea7d3.firebasestorage.app",
  messagingSenderId: "917259776191",
  appId: "1:917259776191:web:d423be8d9a1cb124cad60a",
  measurementId: "G-BGYZ0SS20Q",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Configure auth settings
auth.useDeviceLanguage();

export { auth, db, analytics, RecaptchaVerifier };
export const storage = getStorage(app);
export default app;