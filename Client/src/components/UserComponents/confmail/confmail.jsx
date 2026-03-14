import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./confmail.css";

export default function ConfMail() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const email = localStorage.getItem("pendingEmail");
      const userData = JSON.parse(localStorage.getItem("pendingUser")); // { name, password }

      const res = await fetch("http://localhost:8000/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Code invalide");
      }

      // Le code est bon → inscrire l'utilisateur
      const registerRes = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userData, email }),
      });

      if (!registerRes.ok) {
        const data = await registerRes.json();
        throw new Error(data.message || "Erreur lors de l'inscription");
      }

      alert("Compte créé avec succès !");
      localStorage.removeItem("pendingEmail");
      localStorage.removeItem("pendingUser");
      navigate("/"); // vers login
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <p className="title">Email Confirmation</p>
      <form onSubmit={handleVerify} className="form">
        <div className="input-group">
          <label htmlFor="code">Enter the code sent to your email</label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. 123456"
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="sign" disabled={loading}>
          {loading ? "Verifying..." : "Confirm"}
        </button>
      </form>
    </div>
  );
}
