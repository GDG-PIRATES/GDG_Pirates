import React, { useState } from "react";
import axios from "axios";
import styles from "../reportAnalysis.css";
import { FaUpload, FaFileAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const ReportAnalysis = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setDownloadUrl(null);
    setError(null);

    // Free old object URL
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Please upload a file!");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("https://gdg-pirates-xz8u.onrender.com/ReportUpload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob",
      });

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(pdfBlob);
      setDownloadUrl(url);
    } catch (error) {
      console.error("Error uploading file:", error);
      if (error.response) {
        setError(error.response.data.error || "File upload failed. Please try again.");
      } else {
        setError("Network error. Ensure Flask backend is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <nav className="navbar">
        <h2 className="logo">DetectX</h2>
        <ul>
          <li><a href="/home">Home</a></li>
          <li><a href="#">Wellness Guide</a></li>
          <li><a href="#">Profile</a></li>
          <li><a href="#">About Us</a></li>
          <li>
            <a href="/">Logout</a>
          </li>
        </ul>
      </nav>

      <div className="reportAnalysis-container">
        <div className="upload-container">
          <FaUpload className="upload-icon" />
          <h3 className="tex">Upload Your Medical Report</h3>
          <input className="inp" type="file" accept=".jpeg, .jpg, .png, .pdf" onChange={handleFileChange} />
          {file && <p className="file-info"><FaFileAlt className="file-icon" /> {file.name}</p>}
        </div>

        <button className="button" onClick={handleSubmit} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {error && <p className="error-message">{error}</p>}

        {downloadUrl && (
          <div className="download-section">
            <h4>Download Simplified Report:</h4>
            <a href={downloadUrl} download="Processed_Report.pdf" className="download-btn">Download PDF</a>
          </div>
        )}
      </div>

      <div className="info-section">
        <h3>How does this work?</h3>
        <p>Upload your medical report, and our AI-powered system will analyze the data to provide insights.</p>
      </div>
    </div>
  );
};

export default ReportAnalysis;
