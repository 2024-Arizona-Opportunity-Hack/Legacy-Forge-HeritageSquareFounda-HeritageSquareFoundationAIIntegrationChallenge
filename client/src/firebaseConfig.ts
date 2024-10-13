// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // Import Firebase Auth service

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDmieQrqLjTJzAhkLV9VpdLQNuVrUthvks",
    authDomain: "hackathon-legacyforge.firebaseapp.com",
    projectId: "hackathon-legacyforge",
    storageBucket: "hackathon-legacyforge.appspot.com",
    messagingSenderId: "545824413746",
    appId: "1:545824413746:web:eb1ef61ff3cc470f7d042b",
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider};