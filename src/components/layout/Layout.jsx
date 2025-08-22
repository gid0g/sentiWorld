import { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import Navbar from "../Nav";
import { useTheme } from "../../context/ThemeContext";
import { Outlet } from "react-router-dom";
import { List } from "react-bootstrap-icons";

const Layout = ({ onLogout }) => {
  const { darkMode } = useTheme();
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      if (width >= 768) {
        setCollapsed(false);
      } else {
        setCollapsed(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="d-flex" style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      {/* Mobile Menu Button */}
      <button
        className={`d-md-none btn btn-link position-fixed ${darkMode ? 'text-light' : 'text-dark'}`}
        onClick={toggleSidebar}
        style={{
          zIndex: 1031,
          left: "10px",
          top: "10px",
          border: "none",
        }}
      >
        <List size={24} />
      </button>

      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} onLogout={onLogout} />

      {/* Main Content Area */}
      <div
        className="d-flex flex-column flex-grow-1"
        style={{
          width: "100%",
          marginLeft: windowWidth >= 768 ? (collapsed ? "0" : "250px") : "0",
          transition: "margin-left 0.3s ease",
          paddingLeft: windowWidth < 768 ? "0" : "0"
        }}
      >
        {/* Navbar at the top */}
        <Navbar
          showMenuButton={windowWidth < 768}
          onMenuClick={toggleSidebar}
          onLogout={onLogout}
        />

        {/* Main Content (below navbar) with auto overflow */}
        <div
          className={`flex-grow-1 ${darkMode ? "bg-dark text-light" : "bg-light text-dark"}`}
          style={{
            padding: "1rem",
            overflow: "auto",
            width: "100%",
            paddingTop: windowWidth < 768 ? "60px" : "1rem" // Add padding for mobile menu button
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;