import { useNavigate } from "react-router-dom";
import "../styles/CustomButton.css";

function RegisterButton() {
  const navigate = useNavigate();
  return (
    <button type="register" onClick={() => navigate("/register")}>
      Register
    </button>
  );
}
export default RegisterButton;
