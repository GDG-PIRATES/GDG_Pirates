import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Info } from "lucide-react";
import { auth } from "../firebase";
import "../predictForm.css";
import "../Home.css";
import "../App.css";
import "../result.css";

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
  const [tooltip, setTooltip] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = Number(value);

    if (["A1Cresult_8", "A1Cresult_Norm", "max_glu_serum_300", "max_glu_serum_Norm"].includes(name)) {
      if (newValue !== 0 && newValue !== 1) {
        alert("Kindly enter only 0 or 1 for this field.");
        newValue = "";
      }
    }

    if (name === "age" && newValue <= 0) {
      alert("Kindly enter a valid age.");
      newValue = "";
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

  const tooltips = {
    A1Cresult_8: "It checks if your average blood sugar is too high (above 8%). (0 = No, 1 = Yes)",
    A1Cresult_Norm: "Checks your Blood HbA Level (0 = No, 1 = Yes)",
    max_glu_serum_300: "It checks if your blood sugar ever went over 300 mg/dL (0 = No, 1 = Yes)",
    max_glu_serum_Norm: "Shows if your blood sugar level is within the normal range. (0 = No, 1 = Yes)",
    num_medications: "It counts how many diabetes medicines you are taking.",
    num_lab_procedures: "How many lab tests you've undergone.",
    number_inpatient: "How many times you've been admitted to a hospital.",
    age: "Your age in years.",
    time_in_hospital: "Days stayed in hospital(last visit).",
    number_diagnoses: "Total number of health conditions you have been diagnosed with (e.g., high blood pressure, heart disease).",
  };
  

  return (
    <div className="diabetes-container">
      <h2>Diabetes Prediction</h2>
      <form onSubmit={handleSubmit}>
        {Object.entries(tooltips).map(([key, label]) => (
          <div key={key} className="input-grp">
            <label className="flex items-center gap-2">
              {label}
              <div
                className="relative flex items-center"
                onMouseEnter={() => setTooltip(key)}
                onMouseLeave={() => setTooltip(null)}
              >
                <Info className="w-5 h-5 text-blue-500 cursor-pointer" />
                {tooltip === key && (
                  <div className="absolute left-6 top-0 bg-white shadow-md border rounded p-2 text-sm w-56">
                    {tooltips[key]}
                  </div>
                )}
              </div>
            </label>
            {["A1Cresult_8", "A1Cresult_Norm", "max_glu_serum_300", "max_glu_serum_Norm"].includes(key) ? (
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
        <button id="back" type="button" onClick={() => navigate("/home")}>Go Back</button>
      </form>
    </div>
  );
};

export default DiabetesPredictionForm;
