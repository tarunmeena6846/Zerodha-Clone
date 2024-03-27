import { RecoilRoot } from "recoil";
import Portfolio from "./components/Portfolio";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Landing from "./components/Landing";
import Appbar from "./components/Appbar";

function App() {
  return (
    <Router>
      <RecoilRoot>
        <Appbar />

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Portfolio />} />
        </Routes>
      </RecoilRoot>
    </Router>
  );
}

export default App;
