import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { getJobRequest } from "../../slices/hrSlice";

const ViewJobs: React.FC = () => {
  const dispatch = useDispatch();
  const { loading, error, data } = useSelector((state: RootState) => state.hr);

  // Dispatch the action to fetch jobs when the component is mounted
  useEffect(() => {
    dispatch(getJobRequest());
  }, [dispatch]);

  // Loading and error states
  if (loading) return <div>Loading jobs...</div>;
  if (error) return <p>{`Error: ${error}`}</p>;

  // Check if data is an array and handle it accordingly
  if (!data || data.length === 0) {
    return <p>No jobs available at the moment.</p>;
  }

  return (
    <div>
      <h2>Available Jobs</h2>
      <div>
        {data.map((job) => (
          <div key={job.jobId} className="job-card">
            <h3>{job.designation}</h3>
            <p>{job.company}</p>
            <p>{job.jobDescription}</p>
            <p>Experience Required: {job.experienceRequired} years</p>
            <p>Package: {job.salary}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewJobs;
