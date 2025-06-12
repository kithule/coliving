import { useNavigate } from "react-router-dom";
import "../styles/LogoutButton.css";

function LogoutButton() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };
  return (
    <button type="logout" onClick={handleLogout}>
      Logout
    </button>
  );
}
export default LogoutButton;
