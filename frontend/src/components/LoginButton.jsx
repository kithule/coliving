import { useNavigate } from "react-router-dom";
import "../styles/CustomButton.css";

function LoginButton() {
  const navigate = useNavigate();
  return (
    <button type="register" onClick={() => navigate("/login")}>
      Login
    </button>
  );
}
export default LoginButton;
