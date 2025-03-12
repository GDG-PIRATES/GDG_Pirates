import React, { useState, useEffect } from "react";
import { db } from "../firebase"; 
import { doc, setDoc} from "firebase/firestore"; 
import "../profile.css";
const Profile = () => {
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setPhone(parsedUser.phone || "");
      setGender(parsedUser.gender || "");
    }
  }, []);

  const handleUpdate = async () => {
    if (!user || !user.uid) {
      alert("User not found. Please log in again.");
      return;
    }
  
    const updatedData = { ...user, phone, gender };
  
    try {
      // Use setDoc with merge to create the document if it doesn't exist
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { phone, gender }, { merge: true });
  
      // Update local state & storage
      setUser(updatedData);
      localStorage.setItem("user", JSON.stringify(updatedData));
  
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Profile Update Error:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  return user ? (
    <div>
    <nav className="navbar">
        <h2 >Wellness Guide</h2>
        <ul>
          <li><a href="/home">Home</a></li>
          <li><a href="/wellness">Wellness Guide</a></li>
          <li><a href="/profile">Profile</a></li>
          <li><a href="#">About Us</a></li>
        </ul>
       
      </nav>
    <div  className="profile-container">
      <h1>Profile</h1>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      
      <label><strong>Phone:</strong></label>
      <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />

      <label><strong>Gender:</strong></label>
      <input type="text" value={gender} onChange={(e) => setGender(e.target.value)} />

      <button onClick={handleUpdate}>Update Profile</button>
    </div>
    </div>
  ) : (
    <p>Loading...</p>
  );
};

export default Profile;
