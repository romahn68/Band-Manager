import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD1ksTPRyfzqrRgOGdq0XIUzcsiQMgO44U",
    authDomain: "band-manager-a355f.firebaseapp.com",
    projectId: "band-manager-a355f",
    storageBucket: "band-manager-a355f.firebasestorage.app",
    messagingSenderId: "81013907736",
    appId: "1:81013907736:web:c1899557f87da368177e6d",
    measurementId: "G-WTBT08L23S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);

// Initialize Firestore with long polling to prevent hangs in some environments
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true
});