import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { getJobRequest } from "../../slices/jobsSlice";
import { applyForJob } from "../../slices/applicationSlice";

const JobsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { loading, error, data } = useSelector((state: RootState) => state.job);

  // Dispatch the action to fetch jobs when the component is mounted
  useEffect(() => {
    dispatch(getJobRequest());
  }, [dispatch]);

  // Loading and error states
  if (loading) return <div>Loading jobs...</div>;
  if (error) return <p>{`Error: ${error}`}</p>;
  if (!data || data.length === 0) {
    return <p>No jobs available at the moment.</p>;
  }
  return (
    <div>
      <h2>Available Jobs</h2>
{/*       
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {applicationError && <p style={{ color: "red" }}>{applicationError}</p>} */}
        <div>
          {data?.map((job) => (
            <div key={job.jobId} className="job-card">
              <h4>Job Id: {job.jobId}</h4>
              <h3>{job.designation}</h3>
              <p>{job.company}</p>
              <p>{job.jobDescription}</p>
              <p>Experience Required: {job.experienceRequired}</p>
              <p>Salary: {job.salary}</p>
              <button
                onClick={() => {
                  console.log("Applying for job ID:", job.jobId);
                  dispatch(applyForJob({ numericJobId: job.jobId }));
                }}
              >
                Apply
              </button>
            </div>
          ))}
        </div>
    </div>
  );
};

export default JobsPage;
