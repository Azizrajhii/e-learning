import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { CiMail } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";
import LogoSopra from "./../images/LS.png";

export default function Signup() {
  const navigate = useNavigate();
  const { register, handleSubmit, getValues, setValue, formState: { errors } } = useForm();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [pwd, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    console.log("Timer:", timer);
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const onSubmit = async (data) => {
    console.log("Step 1: Submitted form with data:", data);

    try {
      const checkRes = await fetch("http://localhost:5000/api/user/checkEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      console.log("checkEmail status:", checkRes.status);

      if (checkRes.status === 404) {
        const sendRes = await fetch("http://localhost:5000/api/user/sendcode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email }),
        });

        const sendResData = await sendRes.json();
        console.log("sendcode response:", sendResData);

        setEmail(data.email);
        setPassword(data.password);
        setValue("name", data.name);
        setStep(2);
        setTimer(60);
        console.log("Step changed to 2");
      } else {
        setMessage("Email already in use.");
        console.log("Email already in use.");
      }
    } catch (err) {
      setMessage("Error sending the code.");
      console.error("Error during checkEmail or sendCode:", err);
    }
  };

  const verifyCodeAndRegister = async () => {
    console.log("Step 2: Verifying code:", code, "for email:", email);

    try {
      const verifyRes = await fetch("http://localhost:5000/api/user/verifiercode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      console.log("verifiercode status:", verifyRes.status);

      if (verifyRes.ok) {
        const registerRes = await fetch("http://localhost:5000/api/user/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: getValues("name"),
            email,
            password: pwd,
          }),
        });

        console.log("register status:", registerRes.status);

        if (registerRes.ok) {
          const data = await registerRes.json();
          setMessage("Registration successful. You can now log in.");
          setStep(3);
          console.log("Step changed to 3, user registered:", data);
          console.log(data._id);
          navigate("/profile", { state: { id: data._id } });
        } else {
          const data = await registerRes.json();
          console.error("Registration error:", data);
          setMessage(data.message || "Error during registration.");
        }
      } else {
        setMessage("Invalid code.");
        console.warn("Code verification failed");
      }
    } catch (err) {
      setMessage("Error verifying the code.");
      console.error("Error during verifyCodeAndRegister:", err);
    }
  };

  const resendCode = async () => {
    console.log("Resending code to:", email);

    try {
      const response = await fetch("http://localhost:5000/api/user/sendcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log("Resend response:", data);

      setTimer(60);
      setMessage("Code resent!");
    } catch (err) {
      setMessage("Error resending the code.");
      console.error("Error in resendCode:", err);
    }
  };

  return (
    <div className="signup-page-wrapper">
      <div className="signup-content-container">
        <div className="signup-decorative-elements">
          <div className="signup-decor-circle-large"></div>
          <div className="signup-decor-circle-medium"></div>
          <div className="signup-decor-circle-small"></div>
          <div className="signup-decor-circle-right"></div>
        </div>

        <div className="signup-welcome-section">
          <img src={LogoSopra} alt="" className="signup-welcome-image" />
          <h1 className="signup-welcome-title">WELCOME</h1>
          <h2 className="signup-welcome-subtitle">TO SKILLSHARE HUB</h2>
          <p className="signup-welcome-text">
            Connect with professionals and share your skills in our collaborative platform
          </p>
        </div>

        <div className="signup-form-container">
          {step === 1 && (
            <>
              <h1 className="signup-form-title">Register</h1>
              <form onSubmit={handleSubmit(onSubmit)} className="signup-form">
                <div className="signup-input-group">
                  <label htmlFor="email" className="signup-input-label">Email</label>
                  <div className="signup-input-with-icon">
                    <input
                      type="email"
                      id="email"
                      placeholder="Enter your email"
                      className="signup-input-field"
                      {...register("email", {
                        required: "The email is required",
                        pattern: {
                          value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                          message: "Invalid email",
                        },
                      })}
                    />
                    <CiMail className="signup-input-icon" />
                  </div>
                  <span className="signup-error-message">{errors.email?.message}</span>
                </div>

                <div className="signup-input-group">
                  <label htmlFor="password" className="signup-input-label">Password</label>
                  <div className="signup-input-with-icon">
                    <input
                      type={isPasswordVisible ? "text" : "password"}
                      id="password"
                      placeholder="Enter your password"
                      className="signup-input-field"
                      {...register("password", {
                        required: "The password is required",
                        minLength: { value: 6, message: "Minimum 6 characters" },
                      })}
                    />
                    <button 
                      type="button" 
                      className="signup-password-toggle"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                      {isPasswordVisible ? "🙈" : "👁"}
                    </button>
                  </div>
                  <span className="signup-error-message">{errors.password?.message}</span>
                </div>

                <div className="signup-input-group">
                  <label htmlFor="confirmPassword" className="signup-input-label">Confirm Password</label>
                  <div className="signup-input-with-icon">
                    <input
                      type={isConfirmPasswordVisible ? "text" : "password"}
                      id="confirmPassword"
                      placeholder="Confirm your password"
                      className="signup-input-field"
                      {...register("confirmPassword", {
                        required: "The confirmation is required",
                        validate: (value) =>
                          value === getValues("password") || "The passwords do not match",
                      })}
                    />
                    <button 
                      type="button" 
                      className="signup-password-toggle"
                      onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                    >
                      {isConfirmPasswordVisible ? "🙈" : "👁"}
                    </button>
                  </div>
                  <span className="signup-error-message">{errors.confirmPassword?.message}</span>
                </div>

                <div className="signup-action-buttons">
                  <button type="submit" className="signup-primary-button">Next</button>
                </div>
              </form>
              <p className="signup-signin-prompt">
                Already have an account?{' '}
                <Link to="/" className="signup-signin-link">
                  Sign In
                </Link>
              </p>
              {message && <p className="signup-error-message">{message}</p>}
            </>
          )}

          {step === 2 && (
            <div className="signup-verification-container">
              <h1 className="signup-form-title">Email Verification</h1>
              <p className="signup-verification-text">Enter the code sent to {email}</p>
              
              <div className="signup-input-group">
                <label htmlFor="code" className="signup-input-label">Verification Code</label>
                <input
                  type="text"
                  id="code"
                  placeholder="Enter code"
                  className="signup-input-field"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              
              <div className="signup-verification-buttons">
                <button onClick={verifyCodeAndRegister} className="signup-primary-button">
                  Verify & Register
                </button>

                <button
                  onClick={resendCode}
                  disabled={timer > 0}
                  className={`signup-secondary-button ${timer > 0 ? "disabled" : ""}`}
                >
                  Resend Code {timer > 0 && `(${timer}s)`}
                </button>
              </div>

              {message && <p className="signup-error-message">{message}</p>}
            </div>
          )}

          {step === 3 && (
            <div className="signup-success-container">
              <h1 className="signup-success-message">{message || "Registration successful!"}</h1>
              <Link to="/" className="signup-primary-button">Go to Login</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
