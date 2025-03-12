import React from "react";
//import '../Home.css'
import styles from"../Test.css"; 
import  { useState } from "react";

const Test = () => {
  const [file1, setFile1] = useState(null);
  

  const handleFileChange1 = (event) => {
    setFile1(event.target.files[0]);
  };

 
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!file1 ) {
      alert("Please upload a file!");
      return;
    }
    alert("File submitted successfully! ");
  };

  return (
    <div >
     
      <nav className="navbar">
        
        <ul>
          <li><a href="/home">Home</a></li>
          <li><a href="#">Wellness Guide</a></li>
          <li><a href="#">Profile</a></li>
          <li><a href="#">About Us</a></li>
        </ul>
        </nav>
        <div className="container">
      

      <div className="upload-container">
        <div className="box">
          <h3 className="tex">Upload JPEG or PDF </h3>
          <input className="inp" type="file" accept=".jpeg, .jpg, .pdf" onChange={handleFileChange1} />
          {file1 && <p>File: {file1.name}</p>}
        </div>

        
      </div>

      <button className="button" onClick={handleSubmit}>Analyze</button>
    </div>
    <div className="user">
      <h1>User Details</h1>
      <p>Name:</p>
      <p>Age:19</p>
      <p>Gender:Male</p>
    </div>
   < div className="box-container">
    <div className="box1">
    </div>
    <div className="box2">
        
    </div>
    </div>
    </div>
    
  );
};

export default Test;
