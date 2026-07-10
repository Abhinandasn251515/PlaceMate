import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCoY_kLCR9eyEugIHtfI2j9UCYyz9Ub_rg",
  authDomain: "placemate-d4bd0.firebaseapp.com",
  projectId: "placemate-d4bd0",
  storageBucket: "placemate-d4bd0.firebasestorage.app",
  messagingSenderId: "1021492167736",
  appId: "1:1021492167736:web:0725e6200b98397ed0d2cd",
  measurementId: "G-G4M5TZ13FY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
