import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../result.css";

const PredictionResult = () => {
  const [prediction, setPrediction] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem("predictionData");
    if (data) {
      const parsedData = JSON.parse(data);
      setPrediction(parsedData.prediction);
      document.documentElement.style.setProperty("--percent", `${parsedData.prediction}%`);
    } else {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="result-container">
      <h2>Prediction Result</h2>
      {prediction !== null ? (
        <div className="circle">
          <span>{prediction.toFixed(2)}%</span>
        </div>
      ) : (
        <p>Loading...</p>
      )}
      <button onClick={() => navigate("/prediction")}>Go Back</button>
    </div>
  );
};

export default PredictionResult;
