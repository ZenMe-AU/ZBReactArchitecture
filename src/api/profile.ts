import { jwtFetch } from "./jwtFetch";

const apiDomain = import.meta.env.VITE_API_DOMAIN || "https://local-chat.azurewebsites.net";

export async function getProfileList(): Promise<any> {
  try {
    const response = await jwtFetch(`${apiDomain}/api/profile`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch profile list");
    }

    const data = await response.json();
    return data.return.profile;
  } catch (err) {
    console.error("Login API error:", err);
    throw err;
  }
}
