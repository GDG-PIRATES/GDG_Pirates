import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { auth, googleProvider } from "../firebase";
import axios from "axios";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import "../Login.css"; // Import CSS file

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isNewUser, setIsNewUser] = useState(false); // Toggle between login and sign-up
  const navigate = useNavigate(); // Initialize navigation

  // Google Sign-in
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      alert(`Welcome, ${result.user.displayName}!`);
  
      const userData = {
        email: result.user.email,
        uid: result.user.uid, // Firebase UID
      };
  
      // Send user details to Flask
      const response = await axios.post("http://127.0.0.1:5000/check", userData);
      
      console.log(response.data); // Ensure Flask returns a JSON response
  
      navigate("/home"); // Redirect to home page after login
    } catch (error) {
      console.error("Google Login Error:", error);
      alert(error.message);
    }
  };
  

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    try {
      let userCredential;
      if (isNewUser) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        alert("Account created! Welcome, ${userCredential.user.email}!");
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        alert("Welcome back, ${userCredential.user.email}!");
      }

      const userData = {
        email: userCredential.user.email,
        uid: userCredential.user.uid, // Firebase UID
      };

      await axios
        .post("http://127.0.0.1:5000/check", userData)
        .then((response) => console.log(response.data));

      navigate("/home");
    } catch (error) {
      console.error("Auth Error:", error.message);
      alert(error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Check your inbox.");
    } catch (error) {
      console.error("Forgot Password Error:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="welcome-text">
          {isNewUser ? "Register" : "Welcome Back!"}
        </h1>

        <form onSubmit={handleEmailSignIn}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="username@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isNewUser && (
            <a
              href="#"
              onClick={handleForgotPassword}
              className="forgot-password"
            >
              Forgot Password?
            </a>
          )}

          <button type="submit" className="btn primary-btn">
            {isNewUser ? "Register" : "Sign in"}
          </button>
        </form>

        <div className="separator">or continue with</div>

        <button onClick={handleGoogleSignIn} className="btn google-btn">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png"
            alt="Google"
          />
          Sign in with Google
        </button>

        <p className="register-text">
          {isNewUser ? "Already have an account?" : "Don't have an account?"}{" "}
          <a href="#" onClick={() => setIsNewUser(!isNewUser)}>
            {isNewUser ? "Sign in" : "Register for free"}
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
