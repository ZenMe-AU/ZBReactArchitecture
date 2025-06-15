import { Helmet } from "react-helmet";

export async function clientLoader() {
  let isAuthenticated = localStorage.getItem("token") ? true : false;
  return { isAuthenticated };
}

export default function HomePage({ loaderData }: { loaderData: { isAuthenticated: boolean } }) {
  const { isAuthenticated } = loaderData;
  return (
    <main>
      <Helmet>
        <title>HomePage</title>
      </Helmet>
      <div style={{ textAlign: "center", marginTop: "5rem", width: "100vw" }}>
        <h1>Welcome to the Portal</h1>
        <p>This is the main entry of the application.</p>
        {isAuthenticated && <p>You are logged in.</p>}
      </div>
    </main>
  );
}
