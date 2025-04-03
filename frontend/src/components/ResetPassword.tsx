import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"; // Use env variable

function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const { token } = useParams(); // Extract token from URL
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setError("Invalid or expired token.");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");

        // Basic Validation
        if (!password || !confirmPassword) {
            setError("Both password fields are required.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true); // Start loading state

        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/reset-password/${token}`, { password });

            setMessage("Your password has been reset successfully. Redirecting to login...");
            setTimeout(() => navigate("/login"), 3000); // Redirect after 3s
        } catch (error: any) {
            setError(error.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false); // Stop loading state
        }
    };

    return (
        <div>
            <h2>Reset Password</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {message && <p style={{ color: "green" }}>{message}</p>}

            <form onSubmit={handleSubmit}>
                <label>New Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    disabled={loading}
                />

                <label>Confirm Password</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    disabled={loading}
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Resetting..." : "Reset Password"}
                </button>
            </form>
        </div>
    );
}

export default ResetPassword;


// import { useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import axios from "axios"; // Use axios instead of custom Api for better error handling

// function ResetPassword() {
//     const [password, setPassword] = useState("");
//     const [confirmPassword, setConfirmPassword] = useState("");
//     const [error, setError] = useState("");
//     const [message, setMessage] = useState("");
//     const { token } = useParams(); // The token from the URL
//     const navigate = useNavigate();

//     useEffect(() => {
//         if (!token) {
//             setError("Invalid or expired token.");
//         }
//     }, [token]);

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         if (!password || !confirmPassword) {
//             setError("Both password fields are required.");
//             return;
//         }

//         if (password !== confirmPassword) {
//             setError("Passwords do not match.");
//             return;
//         }

//         try {
//             setError("");
//             setMessage("");

//             const response = await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, {
//                 password,
//             });

//             setMessage("Your password has been reset successfully.");
//             setTimeout(() => {
//                 navigate("/login"); // Redirect after successful reset
//             }, 3000);

//         } catch (error: any) {
//             setError(error.response?.data?.message || "Something went wrong. Please try again.");
//         }
//     };

//     return (
//         <div>
//             <h2>Reset Password</h2>
//             <form onSubmit={handleSubmit}>
//                 <label>New Password</label>
//                 <input
//                     type="password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="Enter new password"
//                     required
//                 />
//                 <label>Confirm Password</label>
//                 <input
//                     type="password"
//                     value={confirmPassword}
//                     onChange={(e) => setConfirmPassword(e.target.value)}
//                     placeholder="Confirm new password"
//                     required
//                 />
//                 <button type="submit">Reset Password</button>
//             </form>
//             {error && <p style={{ color: "red" }}>{error}</p>}
//             {message && <p style={{ color: "green" }}>{message}</p>}
//         </div>
//     );
// }

// export default ResetPassword;

