interface UserListProps {
    users: { name: string, avatar: string }[]| null;
}

export const UserList = ({ users }:UserListProps) => {
  return (
    // <ul className="list-group list-group-horizontal-sm">
    //     {users.map((user) => (
    //         <li className="list-group-item">
    //             <h3>{user.name}</h3>
    //             <img src={ user.avatar } className="img-thumbnail" alt='Avatar' style={{ width: "150px"}}></img>
    //         </li>
    //     ))}
    // </ul>

    <div className="row mx-auto">
      {users!==null && users.map((user) => (
        <div className="col-xl-4 col-lg-6 mb-4">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <img
                  src={ user.avatar }
                  className="rounded-circle"
                  alt='Avatar'
                  style={{ width: "150px"}}
                />
                <div className="ms-3">
                  <h3 className="fw-bold mb-1">{user.name}</h3>
                  <p className="text-muted mb-0"></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default UserList