import { useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card } from "react-bootstrap";
import { MoonFill, SunFill } from "react-bootstrap-icons";
import SignUpForm from "../components/SignUpForm";
import { useTheme } from "../context/ThemeContext";
import logo from "../assets/sentiWorld_logo.png";

const SignupPage = ({ onSignupSuccess }) => {
  const { darkMode, setDarkMode } = useTheme();
  const logoRef = useRef(null);

  // Container animation variants
  const containerVariants = {
    initial: {
      opacity: 0,
      backgroundColor: darkMode ? "#1a1a1a" : "#ffffff"
    },
    animate: {
      opacity: 1,
      backgroundColor: darkMode ? "#212529" : "#eeeff4",
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  // Logo animation variants
  const logoVariants = {
    initial: {
      opacity: 0,
      y: -50
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  // Headline animation variants
  const headlineVariants = {
    initial: {
      opacity: 0,
      y: 50
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.3
      }
    }
  };

  // Card animation variants
  const cardVariants = {
    initial: {
      opacity: 0,
      scale: 0.9
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.6
      }
    }
  };

  return (
    <motion.div
      className={`min-h-screen w-full bg-fixed ${darkMode ? "bg-dark" : ""}`}
      style={{
        backgroundColor: darkMode ? "#212529" : "#eeeff4",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "1rem",
      }}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div
        className="position-fixed top-0 start-0 ps-2 d-flex justify-content-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="app-logo rounded text-center bg-opacity-10">
          <div className="d-flex justify-content-center">
            <div className="cross-logo text-sentiWorld">
              <img
                src={logo}
                alt="SentiWorld Logo"
                style={{ width: "100px", height: "100px", objectFit: "contain" }}
              />
            </div>
          </div>
        </div>
      </motion.div>
      {/* Theme Toggle Button */}
      <motion.button
        className={`position-fixed top-0 end-0 m-3 btn ${darkMode ? "btn-outline-light" : "btn-outline-dark"
          }`}
        onClick={() => setDarkMode(!darkMode)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {darkMode ? <SunFill size={20} /> : <MoonFill size={20} />}
      </motion.button>


      <motion.div
        variants={headlineVariants}
        initial="initial"
        animate="animate"
      >
        <h2 className={`text-center mb-4 ${darkMode ? "text-light" : "text-body-secondary"} fs-2`}>
          Create Account
        </h2>
        <p className={`text-center ${darkMode ? "text-light" : "text-muted"} mb-4`}>
          Join us and start analyzing
        </p>
      </motion.div>

      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        className="w-100"
        style={{ maxWidth: "700px" }}
      >
        <Card
          className={`w-100 rounded-5 shadow-sm ${darkMode ? "bg-dark border-secondary" : ""
            }`}
          style={{ minHeight: "550px" }}
        >
          <Card.Body className="p-4 d-flex flex-column justify-content-center">
            <SignUpForm onSignupSuccess={onSignupSuccess} darkMode={darkMode} />
            <div className="text-center my-3">
              <span className={darkMode ? "text-light" : "text-muted"}>
                Already have an account?{" "}
              </span>
              <Link to="/login" className="text-decoration-none text-collagen">
                Log In
              </Link>
            </div>
          </Card.Body>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default SignupPage;
