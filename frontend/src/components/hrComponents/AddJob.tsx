import React, { useState, FormEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {addJobRequest} from "../../slices/hrSlice";
import { RootState } from "../../store";

const AddJob: React.FC = () => {
  const dispatch = useDispatch();
  const { loading, error, data } = useSelector((state: RootState) => state.hr);
  const [confirmation, setConfirmation] = useState<string | null>(null); 

  const [jobData, setJobData] = useState({
    company: "",
    designation: "",
    jobDescription: "",
    experienceRequired: 0,
    salary: "",
  });

  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setJobData((prev) => ({
      ...prev,
      [name]:
        name === "experienceRequired" ? Number(value) : value,
    }));
  };
  

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("🚀 Dispatching addJobRequest with:", jobData);
    dispatch(addJobRequest(jobData));
  };

  useEffect(() => {
    if (data) {
      setConfirmation("Job posted successfully!");
      setTimeout(() => setConfirmation(null), 3000); // Clear the message after 3 seconds
    }
  }, [data]);

  return (
    <div>
      <h2>Post a New Job</h2>
      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      {confirmation && <p style={{ color: "green" }}>{confirmation}</p>}
      
      <form onSubmit={handleSubmit}>
        <label>Company:</label>
        <input type="text" name="company" value={jobData.company} onChange={handleChange} placeholder="Company Name" required />
        <br/>
        <label>Designation:</label>
        <input type="text" name="designation" value={jobData.designation} onChange={handleChange} placeholder="Designation" required />
        <br/>
        <label>Job Description:</label>
        <br/>
        <textarea name="jobDescription" value={jobData.jobDescription} onChange={handleChange} placeholder="Job Description" required />
        <br/>
        <label>Experience Required:</label>
        <input type="number" name="experienceRequired" value={jobData.experienceRequired} onChange={handleChange} placeholder="Experience Required" required />
        <br/>
        <label>Package:</label>
        <input type="text" name="salary" value={jobData.salary} onChange={handleChange} placeholder="Package Details" required />
        <br/>
        <br/>
        <button type="submit" disabled={loading}>
          {loading ? "Posting..." : "Post Job"}
        </button>
      </form>
      {error && <p>{error}</p>}
      {/* { {success && <p>{success}</p>} } */}
    </div>
  );
};

export default AddJob;
