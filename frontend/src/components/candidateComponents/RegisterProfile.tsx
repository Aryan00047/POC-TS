import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { registerProfileRequest } from "../../slices/profileSlice";
import Button from "../Button";

const RegisterProfile: React.FC = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    dob: "",
    marks: "",
    university: "",
    skills: "",
    company: "",
    designation: "",
    workExperience: "",
    working: false,
  });
  const [resume, setResume] = useState<File | null>(null); // Store file separately

  // Minimum age 18 years for DOB
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 18);
  const minDateString = minDate.toISOString().split("T")[0];

  // ✅ Handles all input changes (including checkbox and file)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked, files } = e.target;
  
    if (type === "file" && files && files.length > 0) {
      setResume(files[0]); // ✅ Correctly stores the file
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const profileData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      profileData.append(key, String(value));
    });
    if (resume) profileData.append("resume", resume);

    dispatch(registerProfileRequest(formData, resume)); // Dispatch formData including resume

    setFormData({
        dob: "",
        marks: "",
        university: "",
        skills: "",
        company: "",
        designation: "",
        workExperience: "",
        working: false,
      });
      setResume(null);
    
      // ✅ Reset file input manually
      const fileInput = document.querySelector<HTMLInputElement>('input[name="resume"]');
      if (fileInput) fileInput.value = "";
  };

  return (
    <div>
      <h2>Register Profile</h2>
      <form onSubmit={handleSubmit}>
        <label>DOB: </label>
        <input
          name="dob"
          type="date"
          value={formData.dob}
          onChange={handleChange}
          max={minDateString}
        />
        <br/>
        <label>Marks: </label>
        <input
          name="marks"
          type="number"
          value={formData.marks}
          onChange={handleChange}
          placeholder="Marks"
        />
        <br/>
        <label>University</label>
        <input
          name="university"
          type="text"
          value={formData.university}
          onChange={handleChange}
          placeholder="University"
        />
        <br/>
        <label>Skills: </label>
        <input
          name="skills"
          type="text"
          value={formData.skills}
          onChange={handleChange}
          placeholder="Skills"
        />
        <br/>
        <label>Company: </label>
        <input
          name="company"
          type="text"
          value={formData.company}
          onChange={handleChange}
          placeholder="Company"
        />
        <br/>
        <label>Designation: </label>
        <input
          name="designation"
          type="text"
          value={formData.designation}
          onChange={handleChange}
          placeholder="Designation"
        />
        <br/>
        <label>Work Experience: </label>
        <input
          name="workExperience"
          type="text"
          value={formData.workExperience}
          onChange={handleChange}
          placeholder="Work Experience"
        />
        <br/>
        <label>
          <input
            name="working"
            type="checkbox"
            checked={formData.working}
            onChange={handleChange}
          />
          Currently Working
        </label>
        <br/>
        <label>Resume: </label>
        <input
          name="resume"
          type="file"
          onChange={handleChange}
          accept=".pdf,.docx"
        /><br/><br/>
        <Button type="submit" onClick = {()=>{}} label="Submit" />
      </form>
    </div>
  );
};

export default RegisterProfile;
