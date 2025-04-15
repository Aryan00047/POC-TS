// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import { AppDispatch } from "../../store";
// import { registerProfileRequest } from "../../slices/profileSlice";
// import Button from "../Button";
// import moment from "moment";

// interface FormFields {
//   dob: string;
//   marks: string;
//   university: string;
//   skills: string;
//   company: string;
//   designation: string;
//   workExperience: string;
//   working: boolean;
// }

// const RegisterProfile: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();

//   const [formData, setFormData] = useState<FormFields>({
//     dob: "",
//     marks: "",
//     university: "",
//     skills: "",
//     company: "",
//     designation: "",
//     workExperience: "",
//     working: false,
//   });

//   const [resume, setResume] = useState<File | null>(null);
//   const [message, setMessage] = useState("");

  // // Minimum age 18
  // const minDate = new Date();
  // minDate.setFullYear(minDate.getFullYear() - 18);
  // const minDateString = minDate.toISOString().split("T")[0];

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, type, value, checked, files } = e.target;

//     if (type === "file" && files && files.length > 0) {
//       setResume(files[0]);
//     } else if (type === "checkbox") {
//       setFormData((prev) => ({ ...prev, [name]: checked }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setMessage("");

    // const formattedDob = moment(formData.dob, "YYYY-MM-DD").format("DD-MM-YYYY");
    // const skillsArray = formData.skills.split(",").map((s) => s.trim()).filter(Boolean);

    // const dataToSend = {
    //   ...formData,
    //   dob: formattedDob,
    //   skills: skillsArray,
    // };

//     dispatch(registerProfileRequest({ formData: dataToSend, resume }));

//     // Reset form
//     setFormData({
//       dob: "",
//       marks: "",
//       university: "",
//       skills: "",
//       company: "",
//       designation: "",
//       workExperience: "",
//       working: false,
//     });
//     setResume(null);

//     const fileInput = document.querySelector<HTMLInputElement>('input[name="resume"]');
//     if (fileInput) fileInput.value = "";
//   };

//   return (
//     <div>
//       <h2>Register Profile</h2>
//       {message && <p>{message}</p>}
//       <form onSubmit={handleSubmit}>
        // <input
        //   type="date"
        //   name="dob"
        //   value={formData.dob}
        //   max={minDateString}
        //   onChange={handleChange}
        // />
//         <br />
//         <input
//           name="marks"
//           type="number"
//           value={formData.marks}
//           onChange={handleChange}
//           placeholder="Marks"
//         />
//         <br />
//         <input
//           name="university"
//           type="text"
//           value={formData.university}
//           onChange={handleChange}
//           placeholder="University"
//         />
//         <br />
//         <input
//           name="skills"
//           type="text"
//           value={formData.skills}
//           onChange={handleChange}
//           placeholder="Skills"
//         />
//         <br />
//         <input
//           name="company"
//           type="text"
//           value={formData.company}
//           onChange={handleChange}
//           placeholder="Company"
//         />
//         <br />
//         <input
//           name="designation"
//           type="text"
//           value={formData.designation}
//           onChange={handleChange}
//           placeholder="Designation"
//         />
//         <br />
//         <input
//           name="workExperience"
//           type="text"
//           value={formData.workExperience}
//           onChange={handleChange}
//           placeholder="Work Experience"
//         />
//         <br />
//         <label>
//           <input
//             name="working"
//             type="checkbox"
//             checked={formData.working}
//             onChange={handleChange}
//           />
//           Currently Working
//         </label>
//         <br />
//         <label>Resume: </label>
//         <input
//           name="resume"
//           type="file"
//           onChange={handleChange}
//           accept=".pdf,.docx"
//         />
//         <br /><br />
//         <Button type="submit" onClick={() => {}} label="Submit" />
//       </form>
//     </div>
//   );
// };

// export default RegisterProfile;
import React, { useState, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerProfileRequest } from '../../slices/profileSlice';
import { RootState } from '../../store';
import moment from 'moment';

const RegisterProfileForm: React.FC = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.profile);

  const [formData, setFormData] = useState({
    dob: '',
    marks: '',
    university: '',
    skills: [] as string[],
    working: false,
    workExperience: '',
    company: '',
    designation: '',
  });

  const [resume, setResume] = useState<File | null>(null);

  // Minimum age 18
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 18);
  const minDateString = minDate.toISOString().split("T")[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === 'skills') {
      const skillsArray = value.split(',').map((skill) => skill.trim()).filter(Boolean);
      setFormData((prev) => ({ ...prev, skills: skillsArray }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResume(e.target.files[0]);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Convert the dob to DD-MM-YYYY format before submitting to the backend
    const formattedDob = moment(formData.dob).format("DD-MM-YYYY");

    // Prepare the form data with the updated dob format
    const dataToSubmit = {
      ...formData,
      dob: formattedDob,  // Send the formatted date to the backend
    };

    // Dispatch the action to register the profile
    dispatch(registerProfileRequest(dataToSubmit, resume));
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Register Profile</h2>

      <label>DOB</label>
      <input
        type="date"
        name="dob"
        value={formData.dob}
        max={minDateString}
        onChange={handleChange}
      />
      <br />
      <label>Marks</label>
      <input
        name="marks"
        value={formData.marks}
        onChange={handleChange}
        required
        className="input"
      />
      <br />
      <label>University</label>
      <input
        name="university"
        value={formData.university}
        onChange={handleChange}
        required
        className="input"
      />
      <br />
      <label>Skills (comma-separated)</label>
      <input
        name="skills"
        value={formData.skills.join(', ')} // Display skills as a comma-separated string
        onChange={handleChange}
        required
        className="input"
      />
      <br />
      <label>Working?</label>
      <input
        type="checkbox"
        name="working"
        checked={formData.working}
        onChange={handleChange}
        className="ml-2"
      />
      <br />
      <label>Work Experience (in years)</label>
      <input
        name="workExperience"
        value={formData.workExperience}
        onChange={handleChange}
        required
        className="input"
      />
      <br />
      <label>Company</label>
      <input
        name="company"
        value={formData.company}
        onChange={handleChange}
        className="input"
      />
      <br />
      <label>Designation</label>
      <input
        name="designation"
        value={formData.designation}
        onChange={handleChange}
        className="input"
      />
      <br />
      <label>Upload Resume</label>
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleResumeUpload}
        className="mb-4"
      />
      <br />
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Registering...' : 'Register Profile'}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
};

export default RegisterProfileForm;
