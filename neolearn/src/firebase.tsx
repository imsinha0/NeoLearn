// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getVertexAI, getGenerativeModel } from "firebase/vertexai";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCRN0VdzE7InKHjwH-BtPjC-dA59j0CVGo",
  authDomain: "neolearn-8a36a.firebaseapp.com",
  projectId: "neolearn-8a36a",
  storageBucket: "neolearn-8a36a.firebasestorage.app",
  messagingSenderId: "1062851166345",
  appId: "1:1062851166345:web:dd845279481370cc5c0658",
  measurementId: "G-LZGW432G8C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const vertexAI = getVertexAI(app);

const model = getGenerativeModel(vertexAI, { model: "gemini-2.0-flash" });

export { auth, app, analytics, db, model}; 