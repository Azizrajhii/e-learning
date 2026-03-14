import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import "./Login.css";
import { CiMail } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";
import { PublicClientApplication } from "@azure/msal-browser";
import { config } from "./config";
import MicrosoftIcon from "./assets/MicrosoftIcon.png";
import LogoSopra from "./../UserComponents/images/LS.png";
import FaceIDAnimation from "./FaceIDAnimation"; 

export default function LoginPage() {
  const [showFaceID, setShowFaceID] = useState(true); 
  const [theme, setTheme] = useState(localStorage.getItem("theme-mode") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const [rememberMe, setRememberMe] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [msalInstance, setMsalInstance] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token");
  }, []);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      document.getElementById("email").value = rememberedEmail;
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    const initializeMsal = async () => {
      const instance = new PublicClientApplication({
        auth: {
          clientId: config.appId,
          redirectUri: config.redirectUri,
          authority: config.authority,
        },
        cache: {
          cacheLocation: "sessionStorage",
          storeAuthStateInCookie: false,
        },
      });

      await instance.initialize();
      setMsalInstance(instance);
    };

    initializeMsal();
  }, []);

  const loginWithMicrosoft = async () => {
    if (isLoggingIn || !msalInstance) return;
    setIsLoggingIn(true);
  
    try {
      if (msalInstance.getAllAccounts().length > 0) {
        await msalInstance.logoutPopup();
      }
  
      const response = await msalInstance.loginPopup({
        scopes: config.scopes,
        prompt: "login",
      });
  
      const accessToken = response.accessToken;
  
      // Récupérer les informations du compte Microsoft
      const account = msalInstance.getAllAccounts()[0];
  
      console.log("User Info from Microsoft:");
      console.log("Email:", account.username);
      console.log("Display Name:", account.name);
  
      const userResponse = await fetch(
        "http://localhost:5000/api/user/microsoft-login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email: account.username, 
            firstName: account.idTokenClaims.given_name, 
            lastName: account.idTokenClaims.family_name,
            displayName: account.name
          }),
        }
      );
  
      const result = await userResponse.json();
      if (userResponse.ok) {
        navigate("/SkillShareHub");
        localStorage.setItem("token", result.token);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Login Microsoft échoué:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  const onSubmit = async (data) => {
    try {
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", data.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      const response = await fetch("http://localhost:5000/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        if(result.role === "salarie"){
          navigate("/SkillShareHub");
        } else {
          navigate("/Admin");
        }
        localStorage.setItem("token", result.token);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="login-page-wrapper">
      
      {/* Face ID en haut du formulaire */}
      {showFaceID && (
        <div className="faceid-container">
          <FaceIDAnimation />
        </div>
      )}

      <div className="login-content-container">
        <div className="login-decorative-elements">
          <div className="login-decor-circle-large"></div>
          <div className="login-decor-circle-medium"></div>
          <div className="login-decor-circle-small"></div>
          <div className="login-decor-circle-right"></div>
        </div>

        <div className="login-welcome-section">
          <img src={LogoSopra} alt="" className="login-welcome-image" />
          <h1 className="login-welcome-title">WELCOME</h1>
          <h2 className="login-welcome-subtitle">TO SKILLSHARE HUB</h2>
          <p className="login-welcome-text">
            Connect with professionals and share your skills in our collaborative platform
          </p>
        </div>

        <div className="login-form-container">
          <h1 className="login-form-title">Sign in</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="login-form">
            <div className="login-input-group">
              <label htmlFor="email" className="login-input-label">Email</label>
              <div className="login-input-with-icon">
                <input
                  name="email"
                  placeholder="Enter your email"
                  type="email"
                  id="email"
                  className="login-input-field"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                />
                <CiMail className="login-input-icon" />
              </div>
              {errors.email && (
                <span className="login-error-message">{errors.email.message}</span>
              )}
            </div>

            <div className="login-input-group">
              <label htmlFor="password" className="login-input-label">Password</label>
              <div className="login-input-with-icon">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  placeholder="Enter your password"
                  id="password"
                  className="login-input-field"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                <button 
                  type="button" 
                  className="login-password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  👁
                </button>
              </div>
              {errors.password && (
                <span className="login-error-message">{errors.password.message}</span>
              )}

              <div className="login-options-row">
                <label className="login-remember-me">
                  <input
                    type="checkbox"
                    className="login-remember-checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>

                <Link to="/resetpassword" className="login-forgot-password">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div className="login-action-buttons">
              <button 
                type="submit" 
                className="login-primary-button"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? 'Signing In...' : 'Sign In'}
              </button>

              <div className="login-separator">
                <span className="login-separator-line"></span>
                <span className="login-separator-text">OR</span>
                <span className="login-separator-line"></span>
              </div>

              <button 
                type="button" 
                className="login-microsoft-button"
                onClick={loginWithMicrosoft}
                disabled={isLoggingIn}
              >
                <img src={MicrosoftIcon} alt="Microsoft logo" className="login-microsoft-icon" />
                Sign in with Microsoft
              </button>
            </div>
          </form>

          <p className="login-signup-prompt">
            Don't have an account?{' '}
            <Link to="/signup" className="login-signup-link">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
