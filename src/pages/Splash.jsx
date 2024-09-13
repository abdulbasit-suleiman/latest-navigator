import { Link } from "react-router-dom";
import logo from "../assets/logo.svg"

function Splash() {
  return (
    <div className="splashContainer">
      <img src={logo} alt="" width={100} height={100} className="splashLogo" />
      <h4 className="splashText">SUN OFFA NAVIGATION APP</h4>
      <button className="splashGO">
        <Link className="splashLink" to="/navigation">
          Go
        </Link>
      </button>
    </div>
  );
}
export default Splash;
