import { jwtFetch } from "./jwtFetch";
import { getConfig } from "../config/loadConfig";
// const apiDomain = import.meta.env.VITE_PROFILE_DOMAIN;
const apiDomain = getConfig("PROFILE_DOMAIN");

export async function getProfileList(): Promise<any> {
  try {
    const response = await jwtFetch(`${apiDomain}/profile`, {
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
