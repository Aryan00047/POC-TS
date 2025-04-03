import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        // Clear all storage
        localStorage.clear();
        sessionStorage.clear();

        // Prevent user from going back
        window.history.pushState(null, "", window.location.href);
        window.onpopstate = () => {
            window.history.pushState(null, "", window.location.href);
        };

        // Redirect to homepage after 3 seconds
        const timer = setTimeout(() => {
            navigate("/");
        }, 3000);

        return () => clearTimeout(timer); // Cleanup timer
    }, [navigate]);

    return (
        <div>
            <h2>Logging out...</h2>
            <p>You will be redirected to the homepage shortly.</p>
        </div>
    );
}

export default Logout;
