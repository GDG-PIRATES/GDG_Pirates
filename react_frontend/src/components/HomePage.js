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
            { name: "Cancer Detection", route: "/cancer-detection" },
            { name: "Diabetes", route: "/diabetes-check" },
            { name: "Blood Pressure", route: "/blood-pressure-check" },
            { name: "Blood Test", route: "/blood-test" }
          ].map((test, index) => (
            <div key={index} className="test-box" onClick={() => navigate(test.route)}>
              <h2>{test.name}</h2>
              <button className="detect-btn">Start Test</button>
            </div>
          ))}
        </div>

       
        <div className="previous-tests">
          <h3>Previous Test Results</h3>
          <div className="test-dropdown">
            
            <option value="test1">Diabetes - 2024/03/06 - 10:30 AM</option>
            <option value="test2">Blood Pressure - 2024/03/05 - 03:45 PM</option>
            <option value="test3">Cancer Detection - 2024/03/02 - 12:15 PM</option>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;