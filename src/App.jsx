import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "./components/layout/Layout";
import Dashboard from "./Pages/Dashboard";
import Records from "./Pages/Records";
import Upload from "./Pages/Upload";
import RawData from "./Pages/RawData";
import Login from "./Pages/Login";
import SignupPage from "./Pages/SignupPage";
import { ToastProvider, useToast } from "./context/ToastContext";
import Visualize from "./Pages/Visualize";
import Profile from "./Pages/Profile";
import FAQ from "./Pages/FAQ";
import { checkAuth, logout } from "./services/api";


// Separate the main app content into a component
function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { showToast } = useToast();

  // Check authentication status on mount and after any changes
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Listen for unauthorized events
  useEffect(() => {
    const handleUnauthorized = () => {
      setIsAuthenticated(false);
      showToast("Session expired. Please log in again.", "error");
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, [showToast]);

  // Update page title
  useEffect(() => {
    document.title = "SentiWorld";
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await checkAuth();
      setIsAuthenticated(response.authenticated);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  // Function to handle successful login
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // Function to handle successful signup
  const handleSignup = () => {
    setIsAuthenticated(true);
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await logout();
      showToast("Logged out successfully", "success");
    } catch (error) {
      console.error("Logout error:", error);
      showToast("Error during logout. Please try again.", "error");
    } finally {
      setIsAuthenticated(false);
      // Clear all session storage
      sessionStorage.clear();
    }
  };

  return (
    <Router>
      <Routes>
        {/* Public route - Login */}
        <Route
          path="/login"
          element={
            isAuthenticated ?
              <Navigate to="/" replace /> :
              <Login onLoginSuccess={handleLogin} />
          }
        />

        {/* Public route - Signup */}
        <Route
          path="/signup"
          element={
            isAuthenticated ?
              <Navigate to="/" replace /> :
              <SignupPage onSignupSuccess={handleSignup} />
          }
        />



        {/* Protected routes - wrapped in Layout */}
        <Route
          path="/"
          element={
            isAuthenticated ?
              <Layout onLogout={handleLogout} /> :
              <Navigate to="/login" replace />
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="records" element={<Records />} />
          <Route path="upload" element={<Upload />} />
          <Route path="profile" element={<Profile />} />
          <Route path="feedback-analysis" element={<RawData />} />
          <Route path="visualize" element={<Visualize />} />
          <Route path="faq" element={<FAQ />} />
        </Route>

        {/* Catch-all route */}
        <Route
          path="*"
          element={
            isAuthenticated ?
              <Navigate to="/" replace /> :
              <Navigate to="/login" replace />
          }
        />
      </Routes>
    </Router>
  );
}

// Main App component that provides the context
function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;