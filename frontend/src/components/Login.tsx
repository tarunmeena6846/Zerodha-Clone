import React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Card, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { userState } from "../store/user";
import { useRecoilState } from "recoil";

/// File is incomplete. You need to add input boxes to take input for users to login.
function Login() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [, setUserInfo] = useRecoilState(userState);

  const navigate = useNavigate();
  console.log(password);
  const handleLogin = async () => {
    if (!email || !password) {
      // Display an error message or prevent the registration process
      console.error("Email and password are required");
      alert("Email and Password are Required");
      return;
    }

    const response = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/auth/login`,
      {},
      {
        headers: {
          Username: email,
          Password: password,
        },
      }
    );
    if (response.data.success) {
      console.log(response.data.token);
      localStorage.setItem("token", response.data.token);
      setUserInfo({ userEmail: email, loggedIn: true });
      navigate("/dashboard");
    } else {
      alert("Invalid username or password");
      setUserInfo({ userEmail: email, loggedIn: true });
    }
  };
  return (
    <div style={{ backgroundColor: "#F0F0F0", minHeight: "100vh" }}>
      <>
        <div
          style={{
            paddingTop: 120,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Typography variant={"h6"}>Welcome Back!! </Typography>
        </div>
        <div style={{ display: "flex", justifyContent: "center", padding: 10 }}>
          <Card variant="outlined" style={{ width: 400, padding: 20 }}>
            <TextField
              onChange={(e) => setEmail(e.target.value)}
              label="Email"
              variant="outlined"
              type="email"
              fullWidth
            />
            <br />
            <br />
            <TextField
              onChange={(e) => setPassword(e.target.value)}
              label="Password"
              variant="outlined"
              type="password"
              fullWidth
            />
            <br />
            <br />
            <Button variant="contained" color="primary" onClick={handleLogin}>
              Login
            </Button>
          </Card>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          New user? <a href="/register"> Register</a>
        </div>
      </>
    </div>
  );
}

export default Login;
