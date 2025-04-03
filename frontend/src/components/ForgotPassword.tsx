import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Api from "./Api"; // Adjust path if needed
import Button from "./Button";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setError("Please enter a valid email.");
            return;
        }

        try {
            setError("");
            setMessage("");

            const response = await Api({
                url: "http://localhost:5000/api/auth/forgotpassword", // This endpoint sends the reset token
                method: "post",
                formData: { email },
            });

            if (response.error) {
                setError(response.message);
            } else {
                setMessage("A password reset link has been sent to your email.");
            }
        } catch (error) {
            setError("Something went wrong. Please try again.");
        }
    };

    return (
        <div>
            <h2>Forgot Password</h2>
            <form onSubmit={handleSubmit}>
                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                />
                <Button onClick={() => {}} type="submit" label="Submit"/>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {message && <p style={{ color: "green" }}>{message}</p>}
        </div>
    );
}

export default ForgotPassword;
