import { useForm } from "react-hook-form";
import "./forgetpassnum.css"; // Use the same CSS file
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

export default function ForgetPassNum({ token }) {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      console.log("Token:", token);
      console.log("Code de confirmation:", data.code);
      alert("Numéro confirmé avec succès !");
      window.location.href = "/"; // Redirect to login page
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur, veuillez réessayer.");
    }
  };

  const handleResend = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/sms/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }) // Send token if needed
      });

      const data = await response.json(); // Parse response JSON

      if (!response.ok) {
        console.error("❌ HTTP Error:", response.status);
        return;
      }

      if (data && data.success) { // Vérification correcte de success
        alert("✅ Code renvoyé avec succès !");
      } else {
        console.error("❌ Backend Error:", data);
      }
    } catch (error) {
      console.error("🚨 Network/Parsing Error:", error);
      alert("Erreur réseau, veuillez réessayer.");
    }
  };

  return (
    <div className="form-container">
      <p className="title">number confirmation </p>
      <form onSubmit={handleSubmit(onSubmit)} className="form">
        <div className="input-group">
          <label htmlFor="code">Code de confirmation</label>
          <input
            type="text"
            id="code"
            className="form-input"
            {...register("code", { required: "Le code est obligatoire" })}
          />
          <span className="error-message">{errors.code && errors.code.message}</span>
        </div>
        <div className="button-group">
          <button type="submit" className="sign">Confirmer</button>
          <button type="button" className="resend" onClick={handleResend}>Renvoyer le code</button>
        </div>
      </form>
      <p className="signup">
        <Link to="/resetpassword">Use email</Link>
      </p>
    </div>
  );
}

ForgetPassNum.propTypes = {
  token: PropTypes.string.isRequired,
};
