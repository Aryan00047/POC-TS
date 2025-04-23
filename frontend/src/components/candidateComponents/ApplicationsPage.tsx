import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { getApplicationRequest } from "../../slices/applicationSlice";

const ApplicationsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state: RootState) => state.application);

  useEffect(() => {
    dispatch(getApplicationRequest());
  }, [dispatch]);

  if (loading) return <div>Loading applications...</div>;
  if (error) return <p>{`Error: ${error}`}</p>;
  if (!data.length) return <div>No applications found.</div>;

  return (
    <div>
      <h2>Your Applications</h2>
      {data.map((application) => (
        <div key={application._id} className="application-card">
          <h3>{application.jobId?.designation || "Unknown Designation"}</h3>
          <p>Job Id: {application.numericJobId || "Job Id"}</p>
          <p>Company: {application.jobId?.company || "Unknown Company"}</p>
          <p>Description: {application.jobId?.jobDescription || "No description available"}</p>
          <p>Experience Required: {application.jobId?.experienceRequired || "N/A"}</p>
          <p>Package: {application.jobId?.package || "Not mentioned"}</p>
          <p>Status: {application.status || "Pending"}</p>
        </div>
      ))}
    </div>
  );
};

export default ApplicationsPage;
