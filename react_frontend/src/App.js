import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Login from "./components/Login";
import Home from "./components/HomePage";
import Test from "./components/Test";
import GoogleLoginRedirect from "./components/GoogleLoginRedirect";
import DiabetesPredictionForm from "./components/GetDetailsForDiabetesPrediction";
import PredictionResult from "./components/PredictionResult";
import { AuthProvider } from "./context/AuthContext"; // Ensure this file exists

const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <h2>Loading...</h2>; 
  }

  return user ? children : <Navigate to="/" replace />;
};

const App = () => {
  return (
    <AuthProvider> {/* Wrap everything inside AuthProvider */}
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/loading" element={<GoogleLoginRedirect />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/test" element={<ProtectedRoute><Test /></ProtectedRoute>} />
          <Route path="/prediction" element={<ProtectedRoute><DiabetesPredictionForm /></ProtectedRoute>} />
          <Route path="/result" element={<ProtectedRoute><PredictionResult/></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
