import * as z from "zod";
const roleOptions = ["Vice Chancellor", "Dean", "HOD", "Teacher"]; 

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

const signupSchema = z.object({
  full_name: z
    .string()
    .min(4, { message: "Minimum of 4 characters" })
    .max(20, { message: "Maximum of 20 characters" }),
  email: z.string().email("Invalid email address"),
  organization: z
    .string()
    .min(4, { message: "Minimum of 4 characters" })
    .max(30, { message: "Maximum of 30 characters" }),
  role: z.enum(roleOptions, {
      message: "Role must be one of: " + roleOptions.join(", "),
    }),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export { loginSchema, signupSchema };

