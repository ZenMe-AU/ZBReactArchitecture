import { useState, useEffect } from "react";
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
import UserList from "./components/UserList";
import UserFilter from "./components/UserFilter";
import { Blocks } from "react-loader-spinner";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState(null);
  const [isDisabled, setDisabled] = useState(false);
  const [params, setParams] = useState<{
    lat: number | null;
    lon: number | null;
    distance: number | null;
    limited: number | null;
    searchTime: string | null;
    interval: number | null;
    attributes: string | null;
    fuzzySearch: boolean;
  }>({
    lat: 32.2002163,
    lon: 92.895663,
    distance: 10,
    limited: 100,
    searchTime: "2024-11-13T14:00",
    interval: 60,
    attributes: "",
    fuzzySearch: true,
  });
  const apiDomain = import.meta.env.VITE_API_DOMAIN || "https://local-chat.azurewebsites.net/";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    let urlParams = params;
    Object.keys(urlParams).forEach((key) => {
      if (urlParams[key as keyof typeof urlParams] === null || urlParams[key as keyof typeof urlParams] === "") {
        delete urlParams[key as keyof typeof urlParams];
      }
    });
    // console.log(urlParams)
    try {
      const response = await fetch(apiDomain + "/api/GetUsersDataByCoord?" + new URLSearchParams(urlParams).toString(), {
        method: "get",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }); // 發送 GET 請求
      const data = await response.json();
      setUsers(data.return.users);

      console.log(users);
    } catch (err) {
      console.log(err);
      setUsers(null);
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 150);
  };

  const GenerateData = async () => {
    try {
      setDisabled(true);
      const response = await fetch(apiDomain + "/api/LocationWriteAndGenFake", {
        method: "post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          lon: 151.21417,
          lat: -33.85861,
          topic: "owntracks/owntracks/genbtn",
          _type: "location",
          tid: "l1",
        }),
      });
      console.log(response);
    } catch (err) {
      console.log(err);
    }
    setTimeout(() => {
      setDisabled(false);
    }, 1000);
  };

  const handleClick = () => {
    fetchUsers();
    console.log(params);
  };

  const handleGenerator = () => {
    // GenerateData();
    console.log("GEN BTN");
  };

  const handleCheckBox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams({
      ...params,
      [e.target.name]: !e.target.checked,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams({
      ...params,
      [e.target.name]: e.target.value,
    });

    console.log(params);
  };

  return (
    <>
      <UserFilter
        onClick={handleClick}
        onChange={handleChange}
        params={params}
        onClickGenBtn={handleGenerator}
        onCheck={handleCheckBox}
        isDisabled={isDisabled}
      ></UserFilter>
      {!isLoading && <UserList users={users}></UserList>}
      <div className="row mx-auto">
        {users !== null && !isLoading && users.length == 0 && <span className="text-center">No Data</span>}
        <Blocks
          height="80"
          width="80"
          color="#4fa94d"
          ariaLabel="blocks-loading"
          wrapperStyle={{}}
          wrapperClass="blocks-wrapper"
          visible={isLoading}
        />
      </div>
    </>
  );
}

// const [users, setUsers] = useState([{
//   "avatar": "pic/avatar_20.jpg",
//   "name": "user_20",
//   "tid": "20"
// },
// {
//   "avatar": "pic/avatar_43.jpg",
//   "name": "user_43",
//   "tid": "43"
// }])

export default App;
