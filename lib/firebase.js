import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
 apiKey: "AIzaSyC25aqorgRIDMbe0nPI1M32yLP84dXCVk8",
  authDomain: "movie-night-2369b.firebaseapp.com",
  projectId: "movie-night-2369b",
  storageBucket: "movie-night-2369b.firebasestorage.app",
  messagingSenderId: "950604755897",
  appId: "1:950604755897:web:4cc5381d829c0641003c68",
  measurementId: "G-BZLMX6S7BE"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);;