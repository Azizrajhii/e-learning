import "./AdminApp.scss";
import SideBar from "./SideBar/SideBar";
import NavBar from "./NavBar/NavBar";
import Dashboard from "./Dashboard/Dashboard";
import Database from "./DatabaseDiagram/DatabaseDiagram";
import Users from "./TableUsers/TableUsers";
import Profiles from "./TableProfiles/TableProfiles";
import Prof from "./TableProf/TableProf";
import Formations from "./TableFormations/TableFormations";
import TableEvents from "./TableEvents/TableEvents"

import { Route, Routes, useLocation } from "react-router-dom";

function AdminApp() {
  return (
    <div className="Admin-app">
      <div className="Admin-app-SideBar">
        <SideBar />
      </div>
      <div className="Admin-app-main-content">
        <NavBar />
        <div className="Admin-app-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/Database" element={<Database />} />
            <Route path="/Database/users" element={<Users />} />
            <Route path="/Database/profiles" element={<Profiles />} />
            <Route path="/Database/Prof" element={<Prof />} />
            <Route path="/Database/formations" element={<Formations />} />
            <Route path="/Database/events" element={<TableEvents />} />

          </Routes>
        </div>
      </div>
    </div>
  );
}

export default AdminApp;
