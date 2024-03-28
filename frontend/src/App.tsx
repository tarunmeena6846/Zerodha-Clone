import { RecoilRoot } from "recoil";
import Portfolio from "./components/Portfolio";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Landing from "./components/Landing";
import Appbar from "./components/Appbar";
import Dashboard from "./components/Dashboard";
import Holdings from "./components/Holdings";
import Returns from "./components/Returns";

function App() {
  return (
    <Router>
      <RecoilRoot>
        <Appbar />

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/holdings" element={<Holdings />} />
          {/* <Route path="/returns" element={<Returns />} /> */}
        </Routes>
      </RecoilRoot>
    </Router>
  );
}

export default App;
