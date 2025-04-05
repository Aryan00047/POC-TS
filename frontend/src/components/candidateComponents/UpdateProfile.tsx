import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { updateProfileRequest } from "../../slices/profileSlice";
import Button from "../Button";
import moment from "moment";

interface FormFields {
  dob: string;
  marks: string;
  university: string;
  skills: string;
  company: string;
  designation: string;
  workExperience: string;
  working: boolean;
}

const UpdateProfile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState<FormFields>({
    dob: "",
    marks: "",
    university: "",
    skills: "",
    company: "",
    designation: "",
    workExperience: "",
    working: false,
  });

  const [existingProfile, setExistingProfile] = useState<Partial<FormFields>>({});
  const [resume, setResume] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 18);
  const minDateString = minDate.toISOString().split("T")[0];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return setMessage("Please log in first.");

        const res = await fetch("http://localhost:5000/api/candidate/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Error fetching profile");

        const profile = data.profile;
        setExistingProfile(profile);
        setFormData({
          dob: profile.dob || "",
          marks: profile.marks || "",
          university: profile.university || "",
          skills: profile.skills || "",
          company: profile.company || "",
          designation: profile.designation || "",
          workExperience: profile.workExperience || "",
          working: profile.working || false,
        });
      } catch (err: any) {
        setMessage(err.message);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked, files } = e.target;

    if (type === "file" && files && files.length > 0) {
      setResume(files[0]);
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
  
    const changedData: Record<string, any> = {};
    let hasChanges = false;
  
    Object.entries(formData).forEach(([key, value]) => {
      // Convert and compare DOB safely
      if (key === "dob" && value) {
        const formatted = moment(value, "YYYY-MM-DD").format("DD-MM-YYYY");
        const existingFormatted = moment(existingProfile.dob, "YYYY-MM-DD").format("DD-MM-YYYY");
  
        if (formatted !== existingFormatted) {
          changedData[key] = formatted;
          hasChanges = true;
        }
      } else if (value !== existingProfile[key as keyof FormFields]) {
        changedData[key] = value;
        hasChanges = true;
      }
    });
  
    if (resume) {
      hasChanges = true;
    }
  
    if (!hasChanges) {
      setMessage("No changes detected.");
      return;
    }
  
    dispatch(updateProfileRequest({ data: changedData, resume }));

    setMessage("Updating profile...");
  };
  

  return (
    <div>
      <h2>Update Profile</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="date"
          name="dob"
          value={formData.dob}
          max={minDateString}
          onChange={handleChange}
        />
        <br />
        <input
          name="marks"
          type="number"
          value={formData.marks}
          onChange={handleChange}
          placeholder="Marks"
        />
        <br />
        <input
          name="university"
          type="text"
          value={formData.university}
          onChange={handleChange}
          placeholder="University"
        />
        <br />
        <input
          name="skills"
          type="text"
          value={formData.skills}
          onChange={handleChange}
          placeholder="Skills"
        />
        <br />
        <input
          name="company"
          type="text"
          value={formData.company}
          onChange={handleChange}
          placeholder="Company"
        />
        <br />
        <input
          name="designation"
          type="text"
          value={formData.designation}
          onChange={handleChange}
          placeholder="Designation"
        />
        <br />
        <input
          name="workExperience"
          type="text"
          value={formData.workExperience}
          onChange={handleChange}
          placeholder="Work Experience"
        />
        <br />
        <label>
          <input
            name="working"
            type="checkbox"
            checked={formData.working}
            onChange={handleChange}
          />
          Currently Working
        </label>
        <br />
        <label>Resume: </label>
        <input
          name="resume"
          type="file"
          onChange={handleChange}
          accept=".pdf,.docx"
        />
        <br /><br />
        <Button type="submit" onClick={() => {}} label="Update" />
      </form>
    </div>
  );
};

export default UpdateProfile;
