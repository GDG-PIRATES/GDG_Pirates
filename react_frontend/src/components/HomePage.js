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
  const [previousResults, setPreviousResults] = useState([]);

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

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  // Function to clear previous test results
  const clearResults = () => {
    localStorage.removeItem("previousResults"); // Remove stored results
    setPreviousResults([]); // Clear state
    alert("Previous results deleted!");
  };
  /*Health articles*/
  const [articles, setArticles] = useState([]); // Store health articles

  useEffect(() => {
    const fetchHealthNews = async () => {
      try {
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=health&sortBy=publishedAt&apiKey=4c433e67ee2e4e4d8babf8c5253fe3df`
        );
        const data = await response.json();
        setArticles(data.articles.slice(0, 10)); // Get only 10 articles
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchHealthNews();
  }, []); 

  return (
    <div className="homepage-container">
      {/* Navbar */}
      <nav className="navbar">
        <h2 className={darkMode ? "dark-mode-text" : ""}>DetectX</h2>
        <ul>
          <li><a href="/home">Home</a></li>
          <li><a href="/wellness">Wellness Guide</a></li>
          <li><a href="/profile">Profile</a></li>
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
            {previousResults.length > 0 ? (
              previousResults.map((result, index) => (
                <div key={index} className="prev">
                  {result.testName}: {result.result.toFixed(2)}%
                </div>
              ))
            ) : (
              <div className="prev">No previous results</div>
            )}
          </div>

          {previousResults.length > 0 && (
            <button 
              onClick={clearResults} 
              style={{
                backgroundColor: "red", 
                color: "white", 
                border: "none", 
                padding: "10px 15px", 
                cursor: "pointer", 
                marginTop: "10px",
                fontWeight:"700",
                fontFamily:"Poppins"

              }}
            >
              Clear Previous Results
            </button>
          )}
        </div>
      </div>
       {/* Health Articles Section */}
       <div className="articles-container">
        <h2 className="articles-heading">Latest Health News</h2>
        <div className="articles-scroll">
          {articles.map((article, index) => (
            <div key={index} className="article-box">
              <img src={article.urlToImage} alt="Article" className="article-image"/>
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                Read More
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
