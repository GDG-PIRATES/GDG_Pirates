import React, { useState } from "react";
import styles from "../reportAnalysis.css"; // Ensure correct CSS import
import { FaUpload, FaFileAlt } from "react-icons/fa"; // Import icons

const ReportAnalysis = () => {
  const [file1, setFile1] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange1 = (event) => {
    setFile1(event.target.files[0]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!file1) {
      alert("Please upload a file!");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("File submitted successfully!");
    }, 2000); // Simulate loading
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <h2 className="logo">DetectX</h2>
        <ul>
          <li><a href="/home">Home</a></li>
          <li><a href="#">Wellness Guide</a></li>
          <li><a href="#">Profile</a></li>
          <li><a href="#">About Us</a></li>
        </ul>
      </nav>

      {/* Upload Section */}
      <div className="reportAnalysis-container">
        <div className="upload-container">
          <FaUpload className="upload-icon" />
          <h3 className="tex"> Upload Your Medical Report </h3>
          <input
            className="inp"
            type="file"
            accept=".jpeg, .jpg, .pdf"
            onChange={handleFileChange1}
          />
          {file1 && (
            <p className="file-info">
              <FaFileAlt className="file-icon" /> {file1.name}
            </p>
          )}
        </div>

        {/* Analyze Button */}
        <button className="button" onClick={handleSubmit} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {/* Info Section */}
      <div className="info-section">
        <h3>How does this work?</h3>
        <p>Upload your medical report, and our AI-powered system will analyze the data to provide insights.</p>
      </div>
    </div>
  );
};

export default ReportAnalysis;
