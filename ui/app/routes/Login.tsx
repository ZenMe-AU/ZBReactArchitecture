/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { Form, useActionData, useNavigation } from "react-router";
import { useState } from "react";
import { Helmet } from "react-helmet";
import { Box, Button, Typography, Alert, CircularProgress, Autocomplete, TextField } from "@mui/material";

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
export const handle = {
  title: "Login Page",
  requiresAuth: true,
};

export default function Login({ loaderData }: { loaderData: { userList: Array<{ id: string; name: string }>; error?: string } }) {
  const { userList } = loaderData;
  const actionData = useActionData() as { error?: string; success?: boolean };
  console.log("Login loaderData:", loaderData);
  console.log("Login actionData:", actionData);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  // const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  return (
    <>
      <main style={{ textAlign: "center", width: "100vw" }}>
        <Helmet>
          <title>Login</title>
        </Helmet>
        <Form method="post" replace>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            <Box bgcolor="white" p={4} borderRadius={2} boxShadow={3} maxWidth={400} width="100%">
              <Typography variant="h4" gutterBottom>
                Login
              </Typography>
              {actionData?.error && <Alert severity="error">{actionData.error}</Alert>}
              <Autocomplete
                disablePortal
                onChange={(_, newValue) => setSelectedUserId(newValue?.id ?? null)}
                getOptionLabel={(user) => `${user.id} - ${user.name}`}
                options={userList}
                sx={{ width: 300, mb: 2 }}
                renderInput={(params) => <TextField {...params} label="Select a user" />}
              />
              <input type="hidden" name="userId" value={selectedUserId ?? ""} />
              <Button fullWidth variant="contained" disabled={isSubmitting} type="submit">
                {isSubmitting ? <CircularProgress size={24} /> : "Login"}
              </Button>
            </Box>
          </Box>
        </Form>
      </main>
    </>
  );
}
