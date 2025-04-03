import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

const HomePage = lazy(()=> import("./components/HomePage"))
const Register = lazy(() => import("./components/Register"));
const Login = lazy(()=> import("./components/Login"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const Logout = lazy(()=> import("./components/Logout"));
const ResetPassword = lazy(() => import("./components/ResetPassword"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));

function App() {
  return (
    <Router>
      <Suspense fallback={<h2>Loading...</h2>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login/>}/>
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/logout" element={<Logout/>}/>
          <Route path="/reset-password/:token" element={<ResetPassword/>}/>
          <Route path="/forgot-password" element={<ForgotPassword/>}/>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
