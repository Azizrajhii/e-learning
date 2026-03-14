import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CiMail, CiLock } from "react-icons/ci";
import "./ResetPassword.css"; // We'll create this CSS file

export default function ResetPasswordFlow() {
  const { register, handleSubmit, formState: { errors }, getValues } = useForm();
  const [step, setStep] = useState(1);
  const [resetCode, setResetCode] = useState(null);
  const [email, setEmail] = useState("");
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem("theme-mode") || "light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleEmailSubmit = async (data) => {
    try {
      const contact = data.contact.trim();
      const isEmail = /^[a-zA-Z0-9._%+-]+@(gmail\.com|staffsopra\.com)$/i.test(contact);
      const isnum = /^[259]\d{7,14}$/.test(contact);
  
      if (!isEmail && !isnum) {
        alert("Please enter a valid email or phone number");
        return;
      }
  
      const endpoint = isEmail ? "checkEmail" : "checkNum";
      const response = await fetch(`http://localhost:5000/api/user/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(isEmail ? { email: contact } : { num: contact }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        setEmail(isEmail ? contact : "");
        setTimer(15);
  
        const codeResponse = await fetch("http://localhost:5000/api/user/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(isEmail ? { email: contact } : { num: contact }),
        });
  
        const codeResult = await codeResponse.json();
        
        if (codeResponse.ok) {
          setResetCode(codeResult.resetCode);
          setStep(2);
        } else {
          alert(codeResult.message);
        }
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleCodeSubmit = (data) => {
    if (data.code == resetCode) {
      setStep(3);
    } else {
      alert("Invalid reset code! Please try again.");
    }
  };

  const handlePasswordSubmit = async (data) => {
    try {
      const response = await fetch("http://localhost:5000/api/user/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, newPassword: data.password }),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Password reset successfully!");
        navigate("/");
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="reset-password-page-wrapper">
      <div className="reset-password-content-container">
        <div className="reset-password-decorative-elements">
          <div className="reset-password-decor-circle-large"></div>
          <div className="reset-password-decor-circle-medium"></div>
          <div className="reset-password-decor-circle-small"></div>
          <div className="reset-password-decor-circle-right"></div>
        </div>
        
        <div className="reset-password-form-container">
          <h1 className="reset-password-title">
            {step === 1 ? "Reset Password" : step === 2 ? "Verification Code" : "New Password"}
          </h1>
          
          <form
            onSubmit={handleSubmit(
              step === 1
                ? handleEmailSubmit
                : step === 2
                ? handleCodeSubmit
                : handlePasswordSubmit
            )}
            className="reset-password-form"
          >
            {/* Step 1: Email Form */}
            {step === 1 && (
              <div className="reset-password-input-group">
                <label htmlFor="contact" className="reset-password-input-label">
                  Email or Phone Number
                </label>
                <div className="reset-password-input-with-icon">
                  <input
                    type="text"
                    id="contact"
                    placeholder="Enter your email or phone"
                    className="reset-password-input-field"
                    {...register("contact", {
                      required: "Email or phone is required",
                      pattern: {
                        value: /^(?:[a-zA-Z0-9._%+-]+@(gmail\.com|staffsopra\.com)|[259]\d{7,14})$/,
                        message: "Enter a valid email (@soprahr.com or @staffsopra.com) or phone number starting with 2, 5 or 9",
                      },
                    })}
                  />
                  <CiMail className="reset-password-input-icon" />
                </div>
                {errors.contact && (
                  <span className="reset-password-error-message">{errors.contact.message}</span>
                )}
              </div>
            )}

            {/* Step 2: Enter Reset Code Form */}
            {step === 2 && (
              <div className="reset-password-input-group">
                <label htmlFor="code" className="reset-password-input-label">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="code"
                  placeholder="Enter the verification code"
                  className="reset-password-input-field"
                  {...register("code", { required: "Verification code is required" })}
                />
                {errors.code && (
                  <span className="reset-password-error-message">{errors.code.message}</span>
                )}
              </div>
            )}

            {/* Step 3: Reset Password Form */}
            {step === 3 && (
              <>
                <div className="reset-password-input-group">
                  <label htmlFor="password" className="reset-password-input-label">
                    New Password
                  </label>
                  <div className="reset-password-input-with-icon">
                    <input
                      type="password"
                      id="password"
                      placeholder="Enter your new password"
                      className="reset-password-input-field"
                      {...register("password", {
                        required: "Password is required",
                        minLength: { value: 6, message: "Password must be at least 6 characters" },
                      })}
                    />
                    <CiLock className="reset-password-input-icon" />
                  </div>
                  {errors.password && (
                    <span className="reset-password-error-message">{errors.password.message}</span>
                  )}
                </div>
                <div className="reset-password-input-group">
                  <label htmlFor="confirmPassword" className="reset-password-input-label">
                    Confirm New Password
                  </label>
                  <div className="reset-password-input-with-icon">
                    <input
                      type="password"
                      id="confirmPassword"
                      placeholder="Confirm your new password"
                      className="reset-password-input-field"
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) =>
                          value === getValues("password") || "Passwords do not match",
                      })}
                    />
                    <CiLock className="reset-password-input-icon" />
                  </div>
                  {errors.confirmPassword && (
                    <span className="reset-password-error-message">{errors.confirmPassword.message}</span>
                  )}
                </div>
              </>
            )}

            <div className="reset-password-action-buttons">
              <button 
                type="submit" 
                className="reset-password-primary-button"
              >
                {step === 1 ? "Send Code" : step === 2 ? "Verify Code" : "Reset Password"}
              </button>

              {step === 2 && (
                <button 
                  type="button" 
                  className="reset-password-secondary-button"
                  disabled={timer > 0} 
                  onClick={() => { if (timer === 0) setTimer(15); }}
                >
                  {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                </button>
              )}

              <button 
                type="button" 
                className="reset-password-secondary-button"
                onClick={() => navigate("/")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}