import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBsKEgiUIH7368u-VJ_JtzTsHbWfu5fFzU",
  authDomain: "loginapp-9176b.firebaseapp.com",
  projectId: "loginapp-9176b",
  storageBucket: "loginapp-9176b.appspot.app",
  messagingSenderId: "418353873931",
  appId: "1:418353873931:web:9d1b4bfe2472d5febf730e",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app); // ✅ Initialize Firestore

export { auth, googleProvider, db };
