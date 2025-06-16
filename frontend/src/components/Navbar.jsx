import "../styles/Navbar.css";
import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <ul className="nav-bar">
      <li>
        <NavLink to="/" end>
          Notes
        </NavLink>
        <NavLink to="/tasks/" end>
          Tasks
        </NavLink>
      </li>
    </ul>
  );
}
export default Navbar;
