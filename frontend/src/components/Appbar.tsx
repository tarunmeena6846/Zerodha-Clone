import { useEffect } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { userState } from "../store/user";
import axios from "axios";

const Appbar: React.FC = () => {
  const [userInfo, setUserInfo] = useRecoilState(userState);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      axios
        .get(`${import.meta.env.VITE_SERVER_URL}/auth/me`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + storedToken,
          },
        })
        .then((response) => {
          console.log("response", response);
          if (response.data.success) {
            setUserInfo({
              userEmail: response.data.userEmail,
              loggedIn: true,
            });
          } else {
            setUserInfo({
              userEmail: "",
              loggedIn: false,
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching user info:", error);
        });
    }
  }, []);

  const handleLogOut = () => {
    localStorage.removeItem("token");
    console.log("handlelout");
    setUserInfo({
      userEmail: "",
      loggedIn: false,
    });
    navigate("/");
  };
  console.log(userInfo.loggedIn);
  return (
    <nav className="bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* App Name */}
        <div className="text-white font-bold text-xl">Zerodha</div>
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
