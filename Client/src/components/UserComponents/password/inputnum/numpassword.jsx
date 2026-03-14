import { useForm } from "react-hook-form";
import "./numpassword.css"; // Use the same CSS file
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

export default function NumPassword({ token }) {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      console.log("Token:", token);
      console.log("Form Data:", data);
      window.location.href = "/resetpassword"; // Redirect to reset password page
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="form-container">
      <p className="title">FORGET PASSWORD</p>
      <form onSubmit={handleSubmit(onSubmit)} className="form">
        <div className="input-group">
          <label htmlFor="inputField">NUMBER:</label>
          <input
            type="NUMBER"
            id="inputField"
            className="form-input"
            {...register("number", {
              required: "Le numéro est requis",
              pattern: {
                value: /^[2579]\d{7}$/,
                message: "Le numéro doit être composé de 8 chiffres et commencer par 2, 5, 7 ou 9",
              },
            })}
          />
          <span className="error-message">{errors.number && errors.number.message}</span>
        </div>
        <div className="button-group">
          <button type="submit" className="sign">confirmer</button>
          <button type="button" className="resend"><Link to="/"className="Link-s">Cancel</Link></button>
        </div>
      </form>
      <p className="signup">
        <Link to="/resetpassword">use mail</Link>
      </p>
    </div>
  );
}

NumPassword.propTypes = {
  token: PropTypes.string.isRequired,
};