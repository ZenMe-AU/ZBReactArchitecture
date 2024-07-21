import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
import UserList from './components/UserList'
import UserFilter from './components/UserFilter'

function App() {
  const [users, setUsers] = useState([])
  const [params, setParams] = useState({distance:null, limited:null, datetime:null, string:null})

  const fetchUsers = async () => {
    let urlParams = params;
    Object.keys(urlParams).forEach(key => {
      if (urlParams[key] === null || urlParams[key] === '') {
        delete urlParams[key];
      }
    });
    console.log(urlParams)
    try {
      const response = await fetch('http://127.0.0.1:5000?' + new URLSearchParams(urlParams).toString(), {
        method: 'get' ,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin' : '*'
        }
      }) // 發送 GET 請求
      const data = await response.json()
      setUsers(data.return.users)

      // console.log(users)
    } catch (err) {
      console.log(err)
    }
  }

  const handleClick = () => {
    fetchUsers();
    console.log(params)
  }

  const handleChange = (e) => {
    setParams({
      ...params,
      [e.target.name]:e.target.value
      })

    console.log(params)
  }

  return (
    <>
      <UserFilter onClick={handleClick} onChange={handleChange} params={params}></UserFilter>
      <UserList users={users}></UserList>
    </>
  )
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

export default App
