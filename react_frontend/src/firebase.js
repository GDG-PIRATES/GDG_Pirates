import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBsKEgiUIH7368u-VJ_JtzTsHbWfu5fFzU",
  authDomain: "loginapp-9176b.firebaseapp.com",
  projectId: "loginapp-9176b",
  storageBucket: "loginapp-9176b.appspot.app",
  messagingSenderId: "418353873931",
  appId: "1:418353873931:web:9d1b4bfe2472d5febf730e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider =new GoogleAuthProvider();
// Function to set up reCAPTCHA
// 
const setUpRecaptcha = async (phoneNumber) => {
  try {
    console.log("Initializing reCAPTCHA...");

    // Clear any previous reCAPTCHA instance
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }

    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: (response) => {
        console.log("reCAPTCHA verified:", response);
      },
      "expired-callback": () => {
        console.warn("reCAPTCHA expired! Refreshing...");
        window.recaptchaVerifier = null;
      },
    });

    const appVerifier = window.recaptchaVerifier;

    console.log("Sending OTP to:", phoneNumber);
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);

    console.log("OTP sent successfully!", confirmationResult);
    alert("OTP Sent!");
    return confirmationResult;

  } catch (error) {
    console.error("Error sending OTP:", error);
    alert('Failed to send OTP: ${error.message}');
  }
};


export { auth, googleProvider, setUpRecaptcha };