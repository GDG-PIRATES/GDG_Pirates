import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../predictForm.css";
import { auth } from "../firebase";
import '../Home.css';
import '../App.css';
import '../predictForm.css';
import '../result.css';

const DiabetesPredictionForm = () => {
  const [formData, setFormData] = useState({
    A1Cresult_8: "",
    A1Cresult_Norm: "",
    max_glu_serum_300: "",
    max_glu_serum_Norm: "",
    num_medications: "",
    num_lab_procedures: "",
    number_inpatient: "",
    age: "",
    time_in_hospital: "",
    number_diagnoses: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = Number(value);

    if (["A1Cresult_8", "A1Cresult_Norm", "max_glu_serum_300", "max_glu_serum_Norm"].includes(name)) {
      if (newValue !== 0 && newValue !== 1) {
        alert("Kindly enter only 0 or 1 for this field.");
        newValue = "";
      }
    }

    if (["age"].includes(name)) {
      if (newValue <= 0) {
        alert("Kindly enter a valid age.");
        newValue = "";
      }
    }

    setFormData({ ...formData, [name]: newValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = auth.currentUser; 
      if (!user) {
        alert("User not logged in! Please log in again.");
        return;
      }

      const predictData = { ...formData, email: user.email };
      const response = await axios.post("http://127.0.0.1:5000/predictDiabetes", predictData);

      localStorage.setItem("predictionData", JSON.stringify(response.data));
      navigate("/result");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="diabetes-container">
      <h2>Diabetes Prediction</h2>
      <form onSubmit={handleSubmit}>
        {[
          { key: "A1Cresult_8", label: "HbA1C Level greater than 8%", type: "boolean" },
          { key: "A1Cresult_Norm", label: "A1C Result (Normal=Yes, Abnormal=No)", type: "boolean" },
          { key: "max_glu_serum_300", label: "Glucose Serum greater than 300 mg/dL", type: "boolean" },
          { key: "max_glu_serum_Norm", label: "Max Glucose Serum (Normal=Yes, Abnormal=No)", type: "boolean" },
          { key: "num_medications", label: "Number of Medications Taken for Diabetes or related conditions", type: "number" },
          { key: "num_lab_procedures", label: "Number of Lab Procedures undergone recently", type: "number" },
          { key: "number_inpatient", label: "Number of Times admitted to Hospital for care", type: "number" },
          { key: "age", label: "Age (Years)", type: "number" },
          { key: "time_in_hospital", label: "Time Spent in Hospital (Days) during last admission", type: "number" },
          { key: "number_diagnoses", label: "Number of Health conditions Diagnosed (Hypertension, Heart Disease)", type: "number" },
        ].map(({ key, label, type }) => (
          <div key={key} className="input-grp">
            <label>{label}:</label>
            {type === "boolean" ? (
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name={key}
                    value="1"
                    checked={formData[key] === 1}
                    onChange={handleChange}
                    required
                  />
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    name={key}
                    value="0"
                    checked={formData[key] === 0}
                    onChange={handleChange}
                    required
                  />
                  No
                </label>
              </div>
            ) : (
              <input
                type="number"
                name={key}
                value={formData[key]}
                placeholder={`Enter ${label}`}
                onChange={handleChange}
                required
              />
            )}
          </div>
        ))}
        <button type="submit">Predict</button>
        <button id ="back" type="button" onClick={() => navigate("/home")}>Go Back</button>
      </form>
    </div>
  );
};

export default DiabetesPredictionForm;
