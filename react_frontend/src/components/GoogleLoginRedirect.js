import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import "../GoogleLoginRedirect.css"; 

export default function GoogleLoginRedirect() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      navigate("/home"); // Redirect after delay
    }, 3000);

    return () => clearTimeout(timer); // Cleanup function
  }, [navigate]);

  return (
    <div className="loading-container">
      {loading ? (
        <>
          <Loader2 className="loader-icon" />
          <p>Logging you in...</p>
        </>
      ) : (
        <p>Redirecting...</p>
      )}
    </div>
  );
}
