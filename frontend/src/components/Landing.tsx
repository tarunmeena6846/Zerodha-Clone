import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
const Landing: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div>
        <Button
          onClick={() => {
            navigate("/login");
          }}
        >
          Login
        </Button>
        or
        <Button
          onClick={() => {
            navigate("/register");
          }}
        >
          SignUp
        </Button>
      </div>
    </div>
  );
};

export default Landing;
