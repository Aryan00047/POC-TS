import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

const HomePage = lazy(()=> import("./components/HomePage"))
const Register = lazy(() => import("./components/Register"));
const Login = lazy(()=> import("./components/Login"));
const CandidateDashboard = lazy(() => import("./components/candidateComponents/CandidateDashboard"));
const Logout = lazy(()=> import("./components/Logout"));
const ResetPassword = lazy(() => import("./components/ResetPassword"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));
const RegisterProfile = lazy(()=> import("./components/candidateComponents/RegisterProfile"));
const UpdateProfile = lazy(() => import("./components/candidateComponents/UpdateProfile"));
const ViewProfile = lazy(() => import("./components/candidateComponents/ViewProfile"));
const HRDashboard = lazy(() => import("./components/hrComponents/HRDashboard"));
const AddJob = lazy(() => import("./components/hrComponents/AddJob"));
const ViewJobs = lazy(() => import("./components/hrComponents/ViewJobs"));
const ViewJobsCandidate = lazy(() => import("./components/candidateComponents/ViewJobs"));
function App() {
  return (
    <Router>
      <Suspense fallback={<h2>Loading...</h2>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login/>}/>
          <Route path="/candidateDashboard" element= {<CandidateDashboard/>}>
            <Route path="viewProfile" element={<ViewProfile/>}/>
            <Route path="updateProfile" element={<UpdateProfile/>}/>
            <Route path="registerProfile" element={<RegisterProfile/>}/>
            <Route path="viewJobs" element={<ViewJobsCandidate/>}/>
          </Route>
          <Route path="/hrDashboard" element= {<HRDashboard/>}>
            <Route path="add-job" element={<AddJob/>}/>
            <Route path="view-jobs" element={<ViewJobs/>}/>
            <Route path="view-candidate-profile" element={<RegisterProfile/>}/>
          </Route>
          <Route path="/logout" element={<Logout/>}/>
          <Route path="/reset-password/:token" element={<ResetPassword/>}/>
          <Route path="/forgot-password" element={<ForgotPassword/>}/>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
