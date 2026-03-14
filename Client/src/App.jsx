import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginForm from "./components/Login/Login";
import SignupForm from "./components/UserComponents/signup/signup";
import ResetPassword from "./components/UserComponents/password/resetpassword";
import ProfileForm from "./components/UserComponents/ProfileForm/profileForm";
import UserApp from "./components/UserComponents/UserApp";
import Capture from "./components/Login/capture";
import FaceIDAnimation from "./components/Login/FaceIDAnimation";

import "./App.css";
import AdminApp from "./components/AdminComponents/AdminApp";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/Admin/*" element={<AdminApp />} />
        <Route path="/face" element={<FaceIDAnimation />} />

        <Route path="/" element={<LoginForm />} />
        <Route path="/Capture" element={<Capture />} />
        <Route
          path="/signup"
          element={
            <SignupForm
              onSuccess={(token) => console.log("Signed up!", token)}
            />
          }
        />
        <Route path="/resetpassword" element={<ResetPassword />} />
        <Route path="/profile" element={<ProfileForm />} />
        <Route path="/SkillShareHub/*" element={<UserApp />} />
        <Route path="*" element={<div>404 - Page not found</div>} />
      </Routes>
    </Router>
  );
};

export default App;
