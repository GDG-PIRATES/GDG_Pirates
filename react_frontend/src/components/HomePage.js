import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import "../Home.css";

const HomePage = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "enabled"
  );

 
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "enabled");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "disabled");
    }
  }, [darkMode]);

  return (
    <div className="homepage-container">
     
      <nav className="navbar">
        <h2>Health App</h2>
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">Contact</a></li>
          <li><a href="#">Profile</a></li>
          <li><a href="#">About Us</a></li>
        </ul>
       
        <button className="dark-mode-toggle" onClick={toggleDarkMode}>
          {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
        </button>
      </nav>

      
      <div className="welcome-section">
        <h1>Welcome, {user?.displayName || user?.email}!</h1>
      </div>

      <div className="main-content">
        
        <div className="tests-container">
          {[
            { name: "Cancer Detection", route: "/test" },
            { name: "Diabetes", route: "/prediction" },
            { name: "Blood Pressure", route: "/test" },
            { name: "Blood Test", route: "/test" }
          ].map((test, index) => (
            <div key={index} className="test-box" onClick={() => navigate(test.route)}>
              <h2>{test.name}</h2>
              <button className="detect-btn">Start Test</button>
            </div>
          ))}
        </div>
        <div className="previous-tests">
       
        <div className="headd">Previous Test Results</div>
          <div className="test-dropdown">
            <div className="prev">sbvhbvj</div>
            <div className="prev">sbvhbvj</div> 
            <div className="prev">sbvhbvj</div>
            <div className="prev">sbvhbvj</div>
            <div className="prev">sbvhbvj</div> 
            <div className="prev">sbvhbvj</div>
            <div className="prev">sbvhbvj</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;