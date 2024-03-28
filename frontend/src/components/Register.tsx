import React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Card, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useRecoilState } from "recoil";
import { userState } from "../store/user";
function Register() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [, setUserInfo] = useRecoilState(userState);

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!email || !password) {
      // Display an error message or prevent the registration process
      console.error("Email and password are required");
      alert("Email and Password are Required");
      return;
    }
    console.log(email, password);
    const response = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/auth/signup`, // URL for the signup endpoint
      {
        username: email, // Email address of the user
        password: password, // Password of the user
      }
    );
    if (response.data.success) {
      console.log(response.data.token);
      localStorage.setItem("token", response.data.token);
      setUserInfo({ userEmail: email, loggedIn: true });
      navigate("/dashboard");
    } else {
      alert("User already exist with this username and password");
      setUserInfo({ userEmail: "", loggedIn: false });
    }
  };
  return (
    <div style={{ backgroundColor: "#F0F0F0", minHeight: "100vh" }}>
      <div
        style={{
          paddingTop: 120,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Typography variant={"h6"}>Register to the website</Typography>
      </div>
      <div style={{ display: "flex", justifyContent: "center", padding: 10 }}>
        <Card variant="outlined" style={{ width: 400, padding: 20 }}>
          <TextField
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            label="Email"
            variant="outlined"
            type={"email"}
            fullWidth
            required={true}
          />
          <br />
          <br />
          <TextField
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            label="Password"
            variant="outlined"
            type={"password"}
            fullWidth
            required={true}
          />
          <br />
          <br></br>
          <Button variant="contained" color="primary" onClick={handleRegister}>
            Signup
          </Button>
        </Card>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        Already a user? <a href="/login">Login</a>
      </div>
    </div>
  );
}

export default Register;
