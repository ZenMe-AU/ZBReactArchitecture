import { Helmet } from "react-helmet";
import { Link } from "react-router";

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
        {isAuthenticated && (
          <>
            <p>You are logged in.</p>
            <Link to="/question">
              <button>Go to Question</button>
            </Link>
            <Link to="/questionV2">
              <button>Go to QuestionV2</button>
            </Link>

            <Link to="/questionV3">
              <button>Go to QuestionV3</button>
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
