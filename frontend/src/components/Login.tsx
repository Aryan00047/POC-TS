import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Api from "./Api";
import Button from "./Button";

interface ILogin {
  email: string;
  password: string;
}

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ILogin>({
    email: "",
    password: "",
  });
  
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string>("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[_@#$]).{7,}$/;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    let isValid = true;
    let newErrors: { email?: string; password?: string } = {};

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
    if (!isValid) return;

    try {
      setLoading(true);
      setApiError("");

      const response = await Api({
        url: "http://localhost:5000/api/auth/login",
        method: "post",
        formData, 
      });

      if ("error" in response) {
        setApiError(response.message);
      } else {
        console.log("Login Success:", response.data);
        localStorage.setItem("token", response.data.token); // Store token if needed
        navigate("/dashboard"); // Redirect after successful login
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
      <form onSubmit={handleLogin}>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your Email"
        />
        {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
        <br />

        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
        />
        {errors.password && <p style={{ color: "red" }}>{errors.password}</p>}
        <br />

        {apiError && <p style={{ color: "red" }}>{apiError}</p>}

        <Button type="submit" onClick={() => {}} label={loading ? "Logging in..." : "Login"} />
      </form>
      <br />
      <Button type="button" onClick={() => navigate("/")} label="HomePage" />
      <Button type="button" onClick={() => navigate("/register")} label="Register" />
      <Button type="button" onClick={() => navigate("/forgot-password")} label="Forgot Password" />
    </>
  );
}

export default Login;
