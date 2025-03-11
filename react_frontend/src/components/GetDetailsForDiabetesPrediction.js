import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../predictForm.css";
import { auth } from "../firebase";

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

    if (
      [
        "A1Cresult_8",
        "A1Cresult_Norm",
        "max_glu_serum_300",
        "max_glu_serum_Norm",
      ].includes(name)
    ) {
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
      const user = auth.currentUser; // Get logged-in user
      if (!user) {
        alert("User not logged in! Please log in again.");
        return;
      }

      const predictData = { ...formData, email: user.email,  };
      const response = await axios.post(
        "http://127.0.0.1:5000/predictDiabetes",
        predictData
      );

      localStorage.setItem("predictionData", JSON.stringify(response.data));
      navigate("/result");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="container">
      <h2>Diabetes Prediction</h2>
      <form onSubmit={handleSubmit}>
        {[
          {
            key: "A1Cresult_8",
            label: "Enter 1 if HbA1C Level greater than 8% else 0",
          },
          { key: "A1Cresult_Norm", label: "A1C Result (Normal=1, Abnormal=0)" },
          {
            key: "max_glu_serum_300",
            label: "Enter 1 if Glucose Serum is greater than 300 mg/dL else 0",
          },
          {
            key: "max_glu_serum_Norm",
            label: "Max Glucose Serum (Normal=1, Abnormal=0)",
          },
          {
            key: "num_medications",
            label:
              "Number of Medications Taken for Diabetes or related conditions",
          },
          {
            key: "num_lab_procedures",
            label: "Number of Lab Procedures undergone recently",
          },
          {
            key: "number_inpatient",
            label: "Number of Times admitted to Hospital for care",
          },
          { key: "age", label: "Age (Years)" },
          {
            key: "time_in_hospital",
            label: "Time Spent in Hospital (Days) during last admission",
          },
          {
            key: "number_diagnoses",
            label:
              "Number of Health conditions Diagnosed (Hypertension, Heart Disease)",
          },
        ].map(({ key, label }) => (
          <div key={key}>
            <label>{label}:</label>
            <input
              type="number"
              name={key}
              value={formData[key]}
              placeholder={`Enter ${label}`}
              onChange={handleChange}
              required
            />
          </div>
        ))}
        <button type="submit">Predict</button>
        <button onClick={() => navigate("/home")}>Go Back</button>
      </form>
    </div>
  );
};

export default DiabetesPredictionForm;
