const apiDomain = import.meta.env.VITE_API_DOMAIN;

// Fetch profile list
export async function getProfileList(): Promise<any> {
  const response = await fetch(`${apiDomain}/api/profile`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch profile list");
  }

  const data = await response.json();
  return data.return.profile;
}
