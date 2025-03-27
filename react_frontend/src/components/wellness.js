import React, { useState } from "react";
import axios from "axios";
//import "./App.css"; // Import the CSS file
import '../wellness.css'; // Import the CSS file
import '../Home.css'; // Import the CSS file
const Wellness = () => {
  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState([]);
  const APP_ID = process.env.REACT_APP_WELLNESS_APP_ID; 
  const API_KEY = process.env.REACT_APP_WELLNESS_API_KEY; 

  const fetchNutritionData = async () => {
    if (!query) return;
    try {
      const response = await axios.post(
        "https://trackapi.nutritionix.com/v2/natural/nutrients",
        { query },
        {
          headers: {
            "x-app-id": APP_ID,
            "x-app-key": API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
      setFoods(response.data.foods);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Such food items does not exist in our database. Please try again.");
    }
  };

  return (
    <div>
    <nav className="navbar">
        <h2 >DetectX</h2>
        <ul>
          <li><a href="/home">Home</a></li>
          <li><a href="/wellness">Wellness Guide</a></li>
          <li><a href="/profile">Profile</a></li>
          <li><a href="#">About Us</a></li>
        </ul>
       
      </nav>
    <div className="food-container">
      <h1>🥗 Nutrition Facts Finder</h1>
      <div className="search-box">
        <input
          type="text"
          placeholder="Enter food name (e.g., Apple, Pizza)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={fetchNutritionData}>Search</button>
      </div>

      <div className="food-grid">
        {foods.map((food, index) => (
          <div key={index} className="food-card">
            <img src={food.photo.thumb} alt={food.food_name} />
            <h3>{food.food_name}</h3>
            <p>Calories: <span>{food.nf_calories}</span></p>
            <p>Protein: <span>{food.nf_protein}g</span></p>
            <p>Carbs: <span>{food.nf_total_carbohydrate}g</span></p>
            <p>Fats: <span>{food.nf_total_fat}g</span></p>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default Wellness;
