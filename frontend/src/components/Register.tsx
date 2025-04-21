import { useState } from "react";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import Api from "./Api";

interface IRegister {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "CANDIDATE" | "HR";
}

function Register() {
  const [formData, setFormData] = useState<IRegister>({
    name: "",
    email: "",
    password: "",
    role: "CANDIDATE",
  });

  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nameRegex = /^[A-Za-z\s]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[_@#$]).{7,}$/;

  const validateForm = () => {
    let isValid = true;
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
      isValid = false;
    } else if (!nameRegex.test(formData.name)) {
      newErrors.name = "Name can only contain letters and spaces.";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format.";
      isValid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
      isValid = false;
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password must be at least 7 characters, include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (_@#$).";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setApiError("");
      setSuccessMessage("");

      const response = await Api({
        url: "http://localhost:5000/api/auth/register",
        method: "post",
        body:formData,
      });

      if ("error" in response) {
        setApiError(response.message);
      } else {
        console.log("Registration Success:", response.data);
        setSuccessMessage("Registered successfully! Redirecting to login in 3 seconds...");
        setTimeout(() => navigate("/login"), 3000);
      }
    } catch (error) {
      console.error("API Error:", error);
      setApiError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your name"
        />
        {errors.name && <p style={{ color: "red" }}>{errors.name}</p>}
        <br />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
        />
        {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
        <br />

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
        />
        {errors.password && <p style={{ color: "red" }}>{errors.password}</p>}
        <br />

        <label>Role</label>
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="ADMIN">Admin</option>
          <option value="CANDIDATE">Candidate</option>
          <option value="HR">HR</option>
        </select>
        <br />

        <Button type="submit" onClick={()=>{}} label={loading ? "Registering..." : "Register"} />
      </form>

      <br />
      {apiError && <p style={{ color: "red" }}>{apiError}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      <br />

      <Button type="button" onClick={() => navigate("/")} label="HomePage" />
      <Button type="button" onClick={() => navigate("/login")} label="Login" />
    </>
  );
}

export default Register;
