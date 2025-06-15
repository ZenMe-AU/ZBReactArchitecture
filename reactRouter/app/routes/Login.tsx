import { Form, useActionData, useNavigation } from "react-router";
import { Helmet } from "react-helmet";
import { redirect } from "react-router";
// import type { Route } from "../+types/root";
import { getProfileList } from "../../api/profile";
import { login as authLogin } from "../../api/auth";
import { loader, action } from "./login.loader";
export const clientLoader = loader;
export const clientAction = action;

// export async function clientLoader() {
//   const userList = await getProfileList();
//   return { userList };
// }

// export const clientAction = async ({ request }: { request: Request }) => {
//   const formData = await request.formData();
//   const selectedUserId = formData.get("userId");

//   if (!selectedUserId) {
//     return { error: "Please select a user." };
//   }

//   try {
//     const response = await authLogin(selectedUserId as string);
//     localStorage.setItem("token", response.token);
//     return redirect("/");
//   } catch (error) {
//     console.error("Login error:", error);
//     return { error: "Login failed." };
//   }
// };

export default function Login({ loaderData }: { loaderData: { userList: Array<{ id: string; name: string }>; error?: string } }) {
  const { userList } = loaderData;
  const actionData = useActionData() as { error?: string; success?: boolean; redirectTo?: string };
  console.log("Login loaderData:", loaderData);
  console.log("Login actionData:", actionData);
  // const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  return (
    <>
      <main style={{ textAlign: "center", marginTop: "5rem", width: "100vw" }}>
        <Helmet>
          <title>Login</title>
        </Helmet>
        <h1>Login</h1>
        {actionData?.error && <p style={{ color: "red" }}>{actionData.error}</p>}
        <Form method="post" replace>
          <select name="userId" defaultValue="" style={{ padding: "0.5rem", marginBottom: "1rem" }}>
            <option value="" disabled>
              -- Select User --
            </option>
            {userList.map((user) => (
              <option key={user.id} value={user.id}>
                {user.id} - {user.name}
              </option>
            ))}
          </select>
          <br />
          <button type="submit">login</button>
        </Form>
      </main>
    </>
  );
}

// existing code
