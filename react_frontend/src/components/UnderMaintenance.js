import React from "react";

const UnderMaintenance = () => {
  return (
    
    <div style={{ textAlign: "center", marginTop: "50px", color: "red" }}>
        <nav className="navbar">
        <h2 style={{ color: "white" }}>DetectX</h2>
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
          <li>
            <a href="/">Logout</a>
          </li>
        </ul>
      </nav>
      <h2 style={{ color: "red" }}>🚧 Page Under Maintenance 🚧</h2>
      <p style={{ color: "gray", fontSize: "18px" }}>
        We're working hard to bring this feature to you soon. Stay tuned!
      </p>
    </div>
  );
};

export default UnderMaintenance;
