// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCj3BB4Z_EoWdhxWhkVyVxihnrNXHRWpY",
  authDomain: "calendarmeet-9a327.firebaseapp.com",
  projectId: "calendarmeet-9a327",
  storageBucket: "calendarmeet-9a327.appspot.com",
  messagingSenderId: "25466301303",
  appId: "1:25466301303:web:a112093d2e9843312cf72",
  measurementId: "G-KYRHZP84E7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firestore and export it
export const db = getFirestore(app);
