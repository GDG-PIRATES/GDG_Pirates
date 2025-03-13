import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { auth, googleProvider } from "../firebase";
import axios from "axios";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import "../Login.css";
// import "../App.css";
import { Loader2 } from "lucide-react"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Google Sign-in
  const handleGoogleSignIn = async () => {
    setLoading(true); // Show loader
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userData = {
        email: result.user.email,
        uid: result.user.uid, // Firebase UID
      };

      await axios.post("http://127.0.0.1:5000/check", userData);
      navigate("/home"); // Redirect after success
    } catch (error) {
      console.error("Google Login Error:", error);
      alert(error.message);
    } finally {
      setLoading(false); // Hide loader
    }
  };

  // Email Sign-in / Sign-up
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loader
    try {
      let userCredential;
      if (isNewUser) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        alert(`Account created! Welcome, ${userCredential.user.email}!`);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        alert(`Welcome back, ${userCredential.user.email}!`);
      }

      const userData = {
        email: userCredential.user.email,
        uid: userCredential.user.uid, // Firebase UID
      };

      await axios.post("http://127.0.0.1:5000/check", userData);
      navigate("/home");
    } catch (error) {
      console.error("Auth Error:", error.message);
      alert(error.message);
    } finally {
      setLoading(false); 
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

  // 🚀 Loader Screen
  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="loader-icon" />
        <p className="loading-text">Logging you in...</p>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="welcome-text">{isNewUser ? "Register" : "Welcome Back!"}</h1>

        <form onSubmit={handleEmailSignIn}>
          <div className="input-group">
            <label className="lpage">Email</label>
            <input
              className="lpage"
              type="email"
              placeholder="username@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="lpage">Password</label>
            <input
              type="password"
              className="lpage"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isNewUser && (
            <a href="#" onClick={handleForgotPassword} className="forgot-password">
              Forgot Password?
            </a>
          )}

          <button type="submit" className="btn primary-btn">
            {isNewUser ? "Register" : "Sign in"}
          </button>
        </form>

        <div className="separator">or continue with</div>

        <button onClick={handleGoogleSignIn} className="btn google-btn">
          <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" alt="Google" />
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