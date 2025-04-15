import React from "react";
import { useSelector } from "react-redux";
import Button from "../Button";
import moment from "moment";

const ViewProfile: React.FC = () => {
  const { data, loading, error } = useSelector((state: any) => state.profile);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!data) return <p>No profile found.</p>; // 👈 Prevents undefined errors

  console.log("data in view profile component: ",data)

  const profileData = data.profile;

  const formattedDOB = profileData.dob
  ? moment(profileData.dob).format("DD-MM-YYYY")
  : "N/A";

  return (
    <div>
      <h2>Profile Details</h2>
      <p>Name: {profileData.name || "N/A"}</p>
      <p>Email: {profileData.email || "N/A"}</p>
      <p>DOB: {formattedDOB || "N/A"}</p>
      <p>University: {profileData.university || "N/A"}</p>
      <p>Skills: {Array.isArray(profileData.skills) ? profileData.skills.join(", ") : "N/A"}</p> 
      <p>Marks: { profileData.marks || "N/A"}</p>
      <p>Working: {profileData.working ? 'Yes' : (profileData.working === false ? 'No' : 'N/A')}</p>
      <p>Work Experience: {profileData.workExperience || "N/A"}</p>
      <p>Company: {profileData.company || "N/A"}</p>
      <Button
  type="button"
  onClick={async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found");

      const url = `http://localhost:5000/api/candidate/profile/resume/${profileData.email}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch resume");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = profileData.resumeName || "resume.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Error fetching resume:", err);
      alert("Failed to fetch resume. Check console for details.");
    }
  }}
  label="View Resume"
/>

    </div>
  );
};

export default ViewProfile;
