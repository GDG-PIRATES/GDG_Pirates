import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import "../profile.css";

const Profile = () => {
  const auth = getAuth();
  const db = getFirestore();
  const [userData, setUserData] = useState({
    email: "",
    displayName: "",
    phoneNumber: "",
    age: "",
    gender: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const userRef = doc(db, "profiles", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserData(userSnap.data());
      } else {
        await setDoc(userRef, {
          email: user.email || "",
          displayName: user.displayName || "",
          phoneNumber: "",
          age: "",
          gender: "",
        });
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleUpdate = async () => {
    if (!auth.currentUser) return;

    if (
      !userData.phoneNumber.trim() ||
      !userData.gender.trim() ||
      !userData.age.trim()
    ) {
      alert("⚠️ Please fill in both Phone Number and Gender before updating!");
      return;
    }

    try {
      const userRef = doc(db, "profiles", auth.currentUser.uid);
      await updateDoc(userRef, {
        phoneNumber: userData.phoneNumber,
        age: userData.age,
        gender: userData.gender,
      });

      alert("✅ Profile Updated Successfully!");
    } catch (error) {
      alert("❌ Error updating profile: " + error.message);
    }
  };

  return (
    <div className="profile-page">
      <nav className="navbar">
        <h2>DetectX</h2>
        <ul>
          <li>
            <a href="/home">Home</a>
          </li>
          <li>
            <a href="/wellness">Wellness Guide</a>
          </li>
          <li>
            <a href="/profile">Profile</a>
          </li>
          <li>
            <a href="#">About Us</a>
          </li>
        </ul>
      </nav>
      <div className="profileback1">
        <h2>Profile Page</h2>
        <p>
          <strong>Name:</strong>
          <br></br>
          {userData.displayName}
        </p>
        <p>
          <strong>Email:</strong> <br></br>
          {userData.email}
        </p>

        <label htmlFor="phone">Phone Number:</label>
        <input
          id="phone"
          type="tel"
          placeholder="Enter your phone number"
          value={userData.phoneNumber}
          onChange={(e) =>
            setUserData({ ...userData, phoneNumber: e.target.value })
          }
          onInput={(e) =>
            (e.target.value = e.target.value.replace(/[^0-9+]/g, ""))
          }
          pattern="^\+?[0-9\s-]{7,15}$"
          maxLength="15"
          autoComplete="tel"
          required
        />

        <label htmlFor="age">Age: </label>
        <input
          id="id"
          type="number"
          placeholder="Enter your age"
          min="0"
          max="100"
          value={userData.age}
          onChange={(e) => setUserData({ ...userData, age: e.target.value })}
          required
        />

        <label htmlFor="gender">Gender: </label>
        <select
          id="gender"
          value={userData.gender}
          onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
          required
        >
          <option value="" disabled>
            Select
          </option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <button onClick={handleUpdate}>Update Profile</button>
      </div>
    </div>
  );
};

export default Profile;
