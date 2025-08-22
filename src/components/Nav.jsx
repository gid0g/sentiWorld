import { useState, useEffect } from "react";
import { PersonCircle, Gear, BoxArrowRight } from "react-bootstrap-icons";
import { useTheme } from "../context/ThemeContext"; // ✅ Import global theme
import { useLocation, useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap";

const Navbar = ({ onLogout }) => {
  const { darkMode } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const pathTitles = {
    "/": "Dashboard",
    "/records": "Records",
    "/visualization": "Visualization",
    "/upload": "Upload & Analyze",
    "/export": "Export",
    "/profile": "Profile",
    "/faq": "FAQ",
    "/feedback-analysis": "Feedback Analysis",
    "/visualize": "Visualize",
  };
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const currentTitle = pathTitles[location.pathname] || "Dashboard";


  const courses = ["Course 1", "Course 2", "Course 3", "Course 4"];

  const handleProfileClick = () => {
    navigate("/profile");
  };

  // const handleSettingsClick = () => {
  //   navigate("/settings");
  // };

  const handleLogoutClick = () => {
    onLogout();
  };

  return (
    <div
      className={`navbar-container border-0 ${darkMode ? "dark-theme" : "light-theme"
        }`}
    >
      <nav
        className={`navbar navbar-expand px-3 py-2  ${darkMode ? "navbar-dark bg-dark" : "navbar-light bg-white"
          }`}
      >
        <div className="container-fluid px-0">
          {/* Title */}
          <div className="navbar-brand mb-0 h1">{currentTitle}</div>

          {/* Right Section */}
          <div className="d-flex align-items-center">
            {/* Course Selector */}


            {/* Dark mode toggle (desktop only) */}

            {/* Profile Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle
                variant={darkMode ? "dark" : "light"}
                id="profile-dropdown"
                className="border-0 bg-transparent"
              >
                <PersonCircle size={24} />
              </Dropdown.Toggle>

              <Dropdown.Menu
                className={darkMode ? "bg-dark text-light" : "bg-white"}
              >
                <Dropdown.Item
                  onClick={handleProfileClick}
                  className={darkMode ? "text-light" : "text-dark"}
                >
                  <PersonCircle className="me-2" />
                  Profile
                </Dropdown.Item>
                {/* <Dropdown.Item
                  onClick={handleSettingsClick}
                  className={darkMode ? "text-light" : "text-dark"}
                >
                  <Gear className="me-2" />
                  Settings
                </Dropdown.Item> */}
                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={handleLogoutClick}
                  className={darkMode ? "text-light" : "text-dark"}
                >
                  <BoxArrowRight className="me-2" />
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </nav>

      {/* Mobile toggle */}
      {isMobile && (
        <div
          className={`mobile-dark-toggle p-2 text-center ${darkMode ? "bg-secondary" : "bg-light"
            }`}
        >
          <div className="form-check form-switch d-inline-block">
            <label
              className="form-check-label me-2"
              htmlFor="mobileDarkModeSwitch"
            >
              {darkMode ? "Dark Mode" : "Light Mode"}
            </label>
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              checked={darkMode}
              onChange={toggleDarkMode}
              id="mobileDarkModeSwitch"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
