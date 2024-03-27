import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { userState } from "../store/user";
const Appbar: React.FC = () => {
  const [userInfo, setUserINfo] = useRecoilState(userState);
  const navigate = useNavigate();
  const handleLogOut = () => {
    localStorage.removeItem("token");
    setUserINfo({
      userEmail: "",
      loggedIn: false,
    });
    navigate("/");
  };
  return (
    <nav className="bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* App Name */}
        <div className="text-white font-bold text-xl">Zerodha</div>

        {/* Login/Logout Button */}
        <div>
          {userInfo.loggedIn ? (
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              onClick={handleLogOut}
            >
              Logout
            </button>
          ) : (
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Appbar;
