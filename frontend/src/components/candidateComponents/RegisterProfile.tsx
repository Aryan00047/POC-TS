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
