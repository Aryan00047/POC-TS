import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Outlet } from "react-router-dom";

const HRDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
//   const { data, loading, error } = useSelector((state: any) => state.profile);

  return (
    <div>
      <h2>Welcome to the Candidate Dashboard</h2>
      <button onClick={() => navigate("add-job")}>Add Job</button>
      <button onClick={() => navigate("view-jobs")}>Jobs</button>
      <button onClick={() => navigate("view-candidates")}>Candidates</button>
      <button onClick={() => navigate("view-candidate-profile")}>Candidate Profile</button>
      <button onClick={()=> navigate("/logout")}>Logout</button>
      <Outlet />
    </div>
  );
};

export default HRDashboard;
