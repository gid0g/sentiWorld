import { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail, Lock, Eye, EyeOff, Tags, School, UserCheck } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "../Schema/workspaceSchema";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { signup } from "../services/api";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/loading.json"
const SignUpForm = ({ onSignupSuccess, darkMode }) => {
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      full_name: "",
      email: "",
      organization: "",
      role: "",
      password: "",
      confirmPassword: "",
    },
  });
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = [
    { value: "Teacher", label: "Teacher" },
    { value: "HOD", label: "Head of Department" },
    { value: "Dean", label: "Dean" },
    { value: "Vice Chancellor", label: "Vice Chancellor" }
  ];

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError("");

      // Prepare signup data (exclude confirmPassword)
      const { confirmPassword, ...signupData } = data;

      // Use the imported signup function
      const response = await signup(signupData);

      if (response) {
        showToast('Account created successfully!', 'success');
        onSignupSuccess();
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to create account. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = `form-control ps-5 rounded-4 py-2 ${darkMode ? "bg-dark text-light border-secondary" : ""
    }`;

  const selectClass = `form-select ps-5 rounded-4 py-2 ${darkMode ? "bg-dark text-light border-secondary" : ""
    }`;

  const inputStyle = darkMode ? {
    color: '#fff',
    backgroundColor: '#da4aff',
    borderColor: '#b33dd1'
  } : {};

  const placeholderStyle = darkMode ? `
    .dark-mode-input::placeholder {
      color: #6c757d !important;
      opacity: 0.65;
    }
    .dark-mode-select option {
      background-color: #212529;
      color: #fff;
    }
  ` : '';

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <style>
        {placeholderStyle}
      </style>

      {/* Full Name Field */}
      <div className="py-3 mb-3 position-relative">
        <div className="position-absolute top-50 start-0 translate-middle-y ms-3 z-1">
          <Tags className={darkMode ? "text-light" : "text-muted"} />
        </div>
        <input
          type="text"
          id="fullnameInput"
          className={`${inputClass} ${errors.full_name ? "is-invalid" : ""} ${darkMode ? "dark-mode-input" : ""}`}
          placeholder="Full name"
          {...register("full_name")}
          style={inputStyle}
        />
        {errors.full_name && (
          <div className={`invalid-feedback position-absolute ${darkMode ? "text-danger" : ""}`}>
            {errors.full_name.message}
          </div>
        )}
      </div>

      {/* Email Field */}
      <div className="py-3 mb-3 position-relative">
        <div className="position-absolute top-50 start-0 translate-middle-y ms-3 z-1">
          <Mail className={darkMode ? "text-light" : "text-muted"} />
        </div>
        <input
          type="email"
          id="emailInput"
          className={`${inputClass} ${errors.email ? "is-invalid" : ""} ${darkMode ? "dark-mode-input" : ""}`}
          placeholder="Email"
          {...register("email")}
          style={inputStyle}
        />
        {errors.email && (
          <div className={`invalid-feedback position-absolute ${darkMode ? "text-danger" : ""}`}>
            {errors.email.message}
          </div>
        )}
      </div>

      {/* Organization Field */}
      <div className="py-3 mb-3 position-relative">
        <div className="position-absolute top-50 start-0 translate-middle-y ms-3 z-1">
          <School className={darkMode ? "text-light" : "text-muted"} />
        </div>
        <input
          type="text"
          id="organizationInput"
          className={`${inputClass} ${errors.organization ? "is-invalid" : ""} ${darkMode ? "dark-mode-input" : ""}`}
          placeholder="Organization"
          {...register("organization")}
          style={inputStyle}
        />
        {errors.organization && (
          <div className={`invalid-feedback position-absolute ${darkMode ? "text-danger" : ""}`}>
            {errors.organization.message}
          </div>
        )}
      </div>

      {/* Role Field */}
      <div className="py-3 mb-3 position-relative">
        <div className="position-absolute top-50 start-0 translate-middle-y ms-3 z-1">
          <UserCheck className={darkMode ? "text-light" : "text-muted"} />
        </div>
        <select
          id="roleSelect"
          className={`${selectClass} ${errors.role ? "is-invalid" : ""} ${darkMode ? "dark-mode-select" : ""}`}
          {...register("role")}
          style={inputStyle}
        >
          <option value="">Select a role</option>
          {roles.map(role => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
        {errors.role && (
          <div className={`invalid-feedback position-absolute ${darkMode ? "text-danger" : ""}`}>
            {errors.role.message}
          </div>
        )}
      </div>

      {/* Password Field */}
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

      {/* Confirm Password Field */}
      <div className="py-3 mb-3 position-relative">
        <div className="position-absolute top-50 start-0 translate-middle-y ms-3 z-1">
          <Lock className={darkMode ? "text-light" : "text-muted"} />
        </div>
        <input
          type={showConfirmPassword ? "text" : "password"}
          className={`${inputClass} ${errors.confirmPassword ? "is-invalid" : ""} ${darkMode ? "dark-mode-input" : ""}`}
          placeholder="Confirm Password"
          {...register("confirmPassword")}
          style={inputStyle}
        />
        {errors.confirmPassword && (
          <div className={`invalid-feedback position-absolute ${darkMode ? "text-danger" : ""}`}>
            {errors.confirmPassword.message}
          </div>
        )}
        <span
          className={`position-absolute end-0 top-50 translate-middle-y me-3 ${darkMode ? "text-light" : "text-muted"
            }`}
          style={{ zIndex: 2, cursor: "pointer" }}
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? <EyeOff /> : <Eye />}
        </span>
      </div>

      {/* Error Display */}
      {error && (
        <div className={`text-danger text-center mb-3`}>
          {error}
        </div>
      )}

      {/* Submit Button */}

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
          "Sign Up"
        )}
      </Button>
    </form>
  );
};

export default SignUpForm;