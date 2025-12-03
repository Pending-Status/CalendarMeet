// Import Firebase core + Firestore
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCj3BB4Zz_EoWdxhXWhKyVxinhrNXHRWpY",
  authDomain: "calendarmeet-9a327.firebaseapp.com",
  projectId: "calendarmeet-9a327",
  storageBucket: "calendarmeet-9a327.firebasestorage.app",
  messagingSenderId: "25466301303",
  appId: "1:25466301303:web:a2112093de29843312cf72",
  measurementId: "G-KYRHZP84E7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (THIS IS REQUIRED)
export const db = getFirestore(app);

// Optional: analytics
export const analytics = getAnalytics(app);
