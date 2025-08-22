import { useRef, useState, useEffect } from "react";
import {
  BarChartLine,
  Upload,
  FileEarmarkText,
  Gear,
  MoonFill,
  SunFill,
  BoxArrowRight,
  // Cloud,
  Database,
  X,
  QuestionCircle
} from "react-bootstrap-icons";
import { useTheme } from "../context/ThemeContext";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/sentiWorld_logo.png";
const Sidebar = ({ collapsed, setCollapsed, onLogout }) => {
  const { darkMode, setDarkMode } = useTheme();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const sidebarRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { name: "Dashboard", icon: <BarChartLine size={20} />, path: "/" },
    { name: "Records", icon: <FileEarmarkText size={20} />, path: "/records" },
    // { name: "Word Cloud", icon: <Cloud size={20} />, path: "/word-cloud" },
    { name: "Feedback Analysis", icon: <Database size={20} />, path: "/feedback-analysis" },
    { name: "Upload & Analyze", icon: <Upload size={20} />, path: "/upload" },
    // { name: "Settings", icon: <Gear size={20} />, path: "/settings", badge: 1 },
    { name: "FAQ", icon: <QuestionCircle size={20} />, path: "/faq" },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {!collapsed && windowWidth < 768 && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1029
          }}
          onClick={() => setCollapsed(true)}
        />
      )}

      <div
        ref={sidebarRef}
        className={`sidebar d-flex flex-column ${collapsed ? "collapsed" : ""} ${
          darkMode ? "bg-dark text-light" : "bg-light text-dark"
        }`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: collapsed ? "0" : "250px",
          zIndex: 1030,
          transition: "width 0.3s ease",
          overflowX: "hidden",
          overflowY: "auto",
          boxShadow: collapsed ? "none" : "0 0 10px rgba(0,0,0,0.1)"
        }}
      >
        {/* Close button for mobile */}
        {windowWidth < 768 && !collapsed && (
          <button
            className={`btn btn-link position-absolute end-0 top-0 mt-2 me-2 ${
              darkMode ? "text-light" : "text-dark"
            }`}
            onClick={() => setCollapsed(true)}
            style={{ zIndex: 1031 }}
          >
            <X size={24} />
          </button>
        )}

        <div className="p-3 d-flex justify-content-center">
          <div className="app-logo rounded p-2 text-center bg-opacity-10">
            <div className="d-flex justify-content-center">
              <div className="cross-logo text-sentiWorld">
                <img
                  src={logo}  
                  alt="SentiWorld Logo"
                  style={{ width: "40px", height: "40px", objectFit: "contain" }}
                />
              </div>
            </div>
          </div>
        </div>


        <div className="menu-items mt-3">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const itemTextClass = isActive
              ? "text-white bg-sentiWorld"
              : darkMode
              ? "text-light"
              : "text-dark";

            return (
              <Link
                key={index}
                to={item.path}
                className={`menu-item text-decoration-none p-3 d-flex align-items-center ${itemTextClass}`}
                onClick={() => windowWidth < 768 && setCollapsed(true)}
              >
                <div className="icon me-3">{item.icon}</div>
                <div className="menu-title flex-grow-1">{item.name}</div>
                {item.badge && (
                  <span
                    className={`badge rounded-pill ${
                      darkMode ? "bg-light text-dark" : "bg-secondary text-light"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto">
          <div className="d-flex align-items-center justify-content-between p-3 border-top">
            <div className="d-flex align-items-center">
              {darkMode ? <MoonFill size={20} /> : <SunFill size={20} />}
              <span className="ms-3">
                {darkMode ? "Dark Mode" : "Light Mode"}
              </span>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
            </div>
          </div>
          <div 
            className="logout-btn p-3 border-top d-flex align-items-center"
            onClick={onLogout}
            style={{ cursor: 'pointer' }}
          >
            <BoxArrowRight size={20} className="me-3" />
            <span>Logout</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
