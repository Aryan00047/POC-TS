import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Import JWT decoder
import Logout from "./Logout";

interface DecodedToken {
    role: string;
    exp: number; // Token expiration timestamp
}

function Dashboard() {
    const navigate = useNavigate();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login"); // Redirect to login if token is missing
            return;
        }

        try {
            const decoded: DecodedToken = jwtDecode(token);
            setRole(decoded.role);

            // Check if token is expired
            if (decoded.exp * 1000 < Date.now()) {
                localStorage.removeItem("token");
                navigate("/login");
            }
        } catch (error) {
            console.error("Invalid token:", error);
            localStorage.removeItem("token");
            navigate("/login");
        }
    }, [navigate]);

    const handleLogout = () => {
        navigate("/logout"); // Navigate to logout route
    };

    if (!role) return <h2>Loading...</h2>;

    return (
        <>
            <h1>Welcome to {role} Dashboard</h1>
            {role === "ADMIN" && <p>You have admin privileges.</p>}
            {role === "HR" && <p>You can manage employee records.</p>}
            {role === "CANDIDATE" && <p>You can apply for jobs.</p>}

            {/* Logout button */}
            <button onClick={handleLogout}>Logout</button>
        </>
    );
}

export default Dashboard;
