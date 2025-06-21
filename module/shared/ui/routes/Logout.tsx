import { redirect } from "react-router";

export const clientLoader = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("profileId");
  return redirect("/login");
};

export default function Logout() {
  return null;
}
