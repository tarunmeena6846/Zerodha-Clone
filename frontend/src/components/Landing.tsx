import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
const Landing: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex items-center flex-col">
        <img src="./landing.png"></img>
        <Button
          onClick={() => {
            navigate("/register");
          }}
          variant="contained"
        >
          SignUp
        </Button>
      </div>
    </div>
  );
};

export default Landing;
