import { redirect } from "react-router";
import { getProfileList } from "../../api/profile";
import { login as authLogin } from "../../api/auth";

export async function loader() {
  if (localStorage.getItem("token")) {
    throw redirect("/");
  }
  try {
    const userList = await getProfileList();
    return { userList };
  } catch (err) {
    console.error("Error in loader:", err);
    return { userList: [], error: "Failed to fetch user list." };
  }
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const userId = formData.get("userId");
  console.log("send app insight");
  // setOperationId();
  // logEvent("btnLoginClick", { parentId: "SubmitButton" });
  if (!userId) {
    return { success: false, error: "No user selected." };
  }

  try {
    const res = await authLogin(userId.toString());
    localStorage.setItem("token", res.token);
    localStorage.setItem("profileId", userId.toString());
    return redirect("/");
    // return { success: true };
  } catch (err) {
    console.error("Login error in action:", err);
    return { success: false, error: "Login failed." };
  }
}
