import { useState } from "react";
import "./SideBar.scss";
import { TiThMenuOutline } from "react-icons/ti";
import { IoCloseSharp } from "react-icons/io5";
import LogoSopra from "./../images/LS.png";
import { FaDatabase, FaBookBookmark } from "react-icons/fa6";
import { MdSpaceDashboard, MdEventNote, MdSignpost } from "react-icons/md";
import { FaChevronDown } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FiUsers, FiSettings } from "react-icons/fi";
import { ImProfile } from "react-icons/im";

export default function SideBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDatabaseOpen, setIsDatabaseOpen] = useState(false);

  return (
    <div className="Admin-SideBar-Container">
      <div className={`Admin-SideBar ${isOpen ? "isOpen" : ""}`}>
        <div className="Admin-SideBar__header">
          {isOpen ? (
            <div className="Admin-SideBar__Logo">
              <img src={LogoSopra} alt="" />
              <span>Skillshare Admin</span>
            </div>
          ) : (
            <div className="MenuAdminOpen">
              <button onClick={() => setIsOpen(true)}>
                <TiThMenuOutline />
              </button>
            </div>
          )}
        </div>
        <div className="Admin-SideBar__Line"></div>
        {isOpen && (
          <>
            <div className="Admin-SideBar-Search">
              <span className="search-icon">🔍</span>
              <input type="search" placeholder="Search..." />
            </div>
            <div className="Admin-SideBar__Line"></div>
          </>
        )}
        <div className={`Admin-SideBar__Navs ${isOpen ? "isOpen" : ""}`}>
          <ul>
            <li>
              <Link to="/Admin/">
                <div className="SidebarItem">
                  <MdSpaceDashboard />
                  {isOpen && <span>Dashboard</span>}
                </div>
              </Link>
            </li>

            <li>
              <Link to="/Admin/Database">
                <div className="SidebarItem">
                  <FaDatabase />
                  {isOpen && <span>Database</span>}
                </div>
              </Link>
            </li>
            <li>
              <Link to="/Admin/Database/Prof">
                <div className="SidebarItem">
                  <MdEventNote size={24} /> {isOpen && <span>Prof</span>}
                </div>
              </Link>
            </li>
            <li>
              <Link to="/Admin/Database/users">
                <div className="SidebarItem">
                  <FiUsers size={24} /> {isOpen && <span>Users</span>}
                </div>
              </Link>
            </li>
            <li>
              <Link to="/Admin/Database/profiles">
                <div className="SidebarItem">
                  <ImProfile size={24} /> {isOpen && <span>Profiles</span>}
                </div>
              </Link>
            </li>
            <li>
              <Link to="/Admin/Database/formations">
                <div className="SidebarItem">
                  <FaBookBookmark size={24} />{" "}
                  {isOpen && <span>Formations</span>}
                </div>
              </Link>
            </li>
            
            <li>
              <Link to="/Admin/Database/events">
                <div className="SidebarItem">
                  <MdEventNote size={24} /> {isOpen && <span>Events</span>}
                </div>
              </Link>
            </li>

          
          </ul>
        </div>
      </div>
      {isOpen && (
        <div className="CloseBtnWrapper">
          <button
            onClick={() => {
              setIsOpen(false);
              setIsDatabaseOpen(false);
            }}
          >
            <IoCloseSharp />
          </button>
        </div>
      )}
    </div>
  );
}
