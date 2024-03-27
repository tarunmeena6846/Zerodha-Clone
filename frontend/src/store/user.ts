// atoms.js
import { atom } from "recoil";
export const userState = atom({
  key: "userState",
  default: {
    userEmail: "",
    loggedIn: false,
  },
});
