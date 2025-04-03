import { useNavigate } from "react-router-dom";
import Button from "./Button";

function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <h1>...Welcome to the Job Portal...</h1>
      <Button type="button" label="Register" onClick={() => navigate("/register")} />
      <Button type="button" label="Login" onClick={() => navigate("/login")} />
    </>
  );
}

export default HomePage;
