import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { auth } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Login from "./components/Login";
import Home from "./components/HomePage";
import Test from "./components/Test";
import loading from "./components/GoogleLoginRedirect";
import GoogleLoginRedirect from "./components/GoogleLoginRedirect";


const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <h2>Loading...</h2>; 
  }

  return user ? children : <Navigate to="/" replace />; 
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/loading" element={<GoogleLoginRedirect />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/test" element={<ProtectedRoute><Test /></ProtectedRoute>}/>
      </Routes>
    </Router>
  );
};

export default App;