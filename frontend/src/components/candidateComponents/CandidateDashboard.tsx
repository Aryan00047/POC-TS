import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProfileRequest } from "../../slices/profileSlice";
import { useNavigate, Outlet } from "react-router-dom";

const CandidateDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, loading, error } = useSelector((state: any) => state.profile);

  useEffect(() => {
    dispatch(fetchProfileRequest());
  }, [dispatch]);

  useEffect(() => {
    console.log("Profile Data:", data); // Debugging Redux state
    console.log("Loading State:", loading);
    console.log("Error:", error);

    if (!loading && !data) {
      navigate("registerProfile");
    }
    
  }, [loading, data, error, navigate]);

  return (
    <div>
      <h2>Welcome to the Candidate Dashboard</h2>
      <button onClick={() => navigate("viewProfile")}>View Profile</button>
      <button onClick={() => navigate("updateProfile")}>Update Profile</button>
      <button onClick={() => navigate("/logout")}>Logout</button>
      <Outlet />
    </div>
  );
};

export default CandidateDashboard;
