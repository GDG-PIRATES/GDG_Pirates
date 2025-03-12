import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
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
  const [previousResults, setPreviousResults] = useState([]);
  const [tests, setTests] = useState([]); // Firestore tests

  useEffect(() => {
    // Retrieve previous test results from localStorage
    const storedResults = JSON.parse(localStorage.getItem("previousResults")) || [];
    setPreviousResults(storedResults);

    // Apply dark mode
    if (darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "enabled");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "disabled");
    }
  }, [darkMode]);

  useEffect(() => {
    if (!user) return;

    async function fetchPreviousTests() {
      try {
        const q = query(collection(db, "PreviousTests"), where("Email_ID", "==", user.email));
        const querySnapshot = await getDocs(q);
        const testsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTests(testsList);
      } catch (error) {
        console.error("Error fetching tests:", error);
      }
    }

    fetchPreviousTests();
  }, [user]); // Runs when user state changes

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const clearResults = () => {
    localStorage.removeItem("previousResults"); // Remove stored results
    setPreviousResults([]); // Clear state
    alert("Previous results deleted!");
  };

  return (
    <div className="homepage-container">
      <nav className="navbar">
        <h2 className={darkMode ? "dark-mode-text" : ""}>DetectX</h2>
        <ul>
          <li><a href="/home">Home</a></li>
          <li><a href="#">Wellness Guide</a></li>
          <li><a href="#">Profile</a></li>
          <li><a href="#">About Us</a></li>
        </ul>
        <div className="toggle-container" onClick={toggleDarkMode}>
          <span className="icon">☀</span>
          <div className="toggle-circle"></div>
          <span className="icon">🌙</span>
        </div>
      </nav>

      {/* Welcome Section */}
      <div className="welcome-section">
        <h1>Welcome, {user?.displayName || user?.email}!</h1>
      </div>

      {/* Test Sections */}
      <div className="main-content">
        <div className="tests-container">
          {[
            { name: "Cancer Detection", route: "/test" },
            { name: "Diabetes", route: "/prediction" },
            { name: "Blood Pressure", route: "/test" },
            { name: "Blood Test", route: "/test" }
          ].map((test, index) => (
            <div key={index} className="test-box" onClick={() => navigate(test.route)}>
              <h2 className={darkMode ? "dark-mode-text" : ""}>{test.name}</h2>
              <button className="detect-btn">Start Test</button>
            </div>
          ))}
        </div>

        {/* Previous Test Results */}
        <div className="previous-tests">
          <div className="headd">Previous Test Results</div>
          <div className="test-dropdown">
            {tests.length > 0 ? (
              tests.map((test) => (
                <div key={test.id} className="test-card">
                  <strong>{test.Test_Name}</strong> - {test.Prediction_Percentage.toFixed(2)}%
                  <br />
                  <small>{test.Date_Time}</small>
                </div>
              ))
            ) : (
              <div>No previous tests found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
