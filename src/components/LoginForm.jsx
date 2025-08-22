import { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../Schema/workspaceSchema";
import { Button } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { login } from "../services/api"
import Lottie from "lottie-react"; 
import loadingAnimation from "../assets/loading.json"
const LoginForm = ({ onLoginSuccess, darkMode }) => {
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");


  const onSubmit = async (formData) => {
    setError("");
    setIsLoading(true);

    try {
      const response = await login(formData);
      if (response) {
        showToast("Login successful. Welcome back!", "success");
        onLoginSuccess();
        navigate("/");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || "Failed to login. Please check your email and password.";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };


  const inputClass = `form-control ps-5 rounded-4 py-2 ${darkMode ? "bg-dark text-light border-secondary" : ""
    }`;

  const inputStyle = darkMode ? {
    color: '#fff',
    backgroundColor: '#212529',
    borderColor: '#495057'
  } : {};

  const placeholderStyle = darkMode ? `
    .dark-mode-input::placeholder {
      color: #6c757d !important;
      opacity: 0.65;
    }
  ` : '';

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <style>
        {placeholderStyle}
      </style>
      <div className="py-3 mb-3 position-relative">
        <div className="position-absolute top-50 start-0 translate-middle-y ms-3 z-1">
          <Mail className={darkMode ? "text-light" : "text-muted"} />
        </div>
        <input
          type="email"
          id="emailInput"
          className={`${inputClass} ${errors.email ? "is-invalid" : ""} ${darkMode ? "dark-mode-input" : ""}`}
          placeholder="info@sentiWord.com"
          {...register("email")}
          style={inputStyle}
        />
        {errors.email && (
          <div className={`invalid-feedback position-absolute ${darkMode ? "text-danger" : ""}`}>
            {errors.email.message}
          </div>
        )}
      </div>
      <div className="py-3 mb-3 position-relative">
        <div className="position-absolute top-50 start-0 translate-middle-y ms-3 z-1">
          <Lock className={darkMode ? "text-light" : "text-muted"} />
        </div>
        <input
          type={showPassword ? "text" : "password"}
          className={`${inputClass} ${errors.password ? "is-invalid" : ""} ${darkMode ? "dark-mode-input" : ""}`}
          placeholder="Password"
          {...register("password")}
          style={inputStyle}
        />
        {errors.password && (
          <div className={`invalid-feedback position-absolute ${darkMode ? "text-danger" : ""}`}>
            {errors.password.message}
          </div>
        )}
        <span
          className={`position-absolute end-0 top-50 translate-middle-y me-3 ${darkMode ? "text-light" : "text-muted"
            }`}
          style={{ zIndex: 2, cursor: "pointer" }}
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </span>
      </div>

      {error && (
        <div className={`text-danger text-center mb-3`}>
          {error}
        </div>
      )}

      <Button
        type="submit"
        className={`btn ${darkMode ? "btn-outline-light" : "bg-collagen"} w-100 my-3 d-flex align-items-center justify-content-center`}
        disabled={isLoading}
        style={{ height: "48px" }} 
      >
        {isLoading ? (
          <Lottie
            animationData={loadingAnimation}
            style={{
              width: "52px",
              height: "52px",
              filter: darkMode ? "brightness(1.5)" : "none",
            }}
            loop
            autoplay
          />
        ) : (
          "Sign in"
        )}
      </Button>

    </form>
  );
};

export default LoginForm;
