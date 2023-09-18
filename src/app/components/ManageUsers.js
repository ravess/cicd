import Axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";
import LoadingDotsIcon from "./LoadingDotsIcon";
import Page from "./Page";
import { checkForCookie } from "./Permissions";

function ManageUsers()
{
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);
  const [userData, setUserData] = useState([]);
  const [groupData, setGroupData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  async function isAdmin()
  {
    try 
    {
      const response = await Axios.post("/checkGroup", { group: "Admin" }, { withCredentials: true });
      setIsLoading(false);
    } catch (e) 
    {
      appDispatch({ type: "flashMessage", value: "You do not have permissions to use this feature." });
      navigate("/");
    }
  }

  async function getGroups() 
  {
    try 
    {
      const response = await Axios.get("/getGroups", { withCredentials: true });
      setGroupData(response.data.data);
    } catch (e) 
    {
      appDispatch({ type: "flashMessage", value: "Error getting groups." });
    }
  }

  async function addGroup(newgroup) 
  {
    try 
    {
      const response = await Axios.post("/createGroup", { groupName: newgroup }, { withCredentials: true });
      appDispatch({ type: "flashMessage", value: "Group created." });
    } catch (e) 
    {
      appDispatch({ type: "flashMessage", value: "Group creation failed." });
    }
  }

  async function getUsers() 
  {
    try 
    {
      const response = await Axios.get("/users", { withCredentials: true });
      setUserData(response.data.data);
    } catch (e) 
    {
      console.log(e);
      appDispatch({ type: "flashMessage", value: "Error getting users." });
    }
  }

  //Run on first render
  useEffect(() => 
  {
    async function cookieCheck()
    {
      const hasCookie = await checkForCookie();
      if (hasCookie == false)
      {
        appDispatch({ type: "logout" });
        appDispatch({ type: "flashMessage", value: "You do not have the rights to access this page." });
        navigate("/");
      }
    }
    cookieCheck();
    isAdmin();
    getUsers();
    getGroups();
  }, []);

  //Run when db change is detected.
  useEffect(() => 
  {
    getUsers();
    getGroups();
  }, [appState.dbChange]);

  async function newGroupSubmit(e) 
  {
    e.preventDefault();
    const newInput = e.target.elements.newGroup.value;
    const groupArray = groupData.map(group => group.groupName);

    if (groupArray.includes(newInput)) 
    {
      appDispatch({ type: "flashMessage", value: `The group '${newInput}' already exists.` });
    }
    else if (newInput.trim() == "")
    {
      appDispatch({ type: "flashMessage", value: `Please enter a value.` });
    }
    else
    {
      await addGroup(newInput);
      getGroups();
      e.target.reset();
    }
  }

  function newUserSubmit(e) 
  {
    e.preventDefault();
    navigate("/user/new");
  }

  if (isLoading) 
  {
    return <LoadingDotsIcon />;
  }

  return (
    <Page title="Manage Users" wide={true}>
      <div className="flex-row my-3 my-md-0">
        <button className="mr-3 btn btn-md btn-secondary" onClick={newUserSubmit}>Create User</button>
      </div>

      <div className="row gw-3">
        <div className="col-9">
          <table className="mt-3 table table-striped">
            <thead className="thead-dark">
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Status</th>
                <th>User Group</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {userData.map(user => (
                user.username && (
                  <tr key={user.username}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.isActive === 1 ? "Active" : "Inactive"}</td>
                    <td>{user.groups}</td>
                    <td>
                      <Link to={`/user/${user.username}`}>Edit</Link>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>

        <div className="col-3">
          <table className="mt-3 table table-striped">
            <thead className="thead-dark">
              <tr>
                <th>Groups</th>
              </tr>
            </thead>
            <tbody>
              {groupData.map(group => (
                <tr key={group.groupName}>
                  <td>{group.groupName}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <form onSubmit={newGroupSubmit}>
            <div className="form-group">
              <input name="newGroup" className="form-control mb-3" type="text" placeholder="New Group" />
              <button className="mr-3 btn btn-md btn-secondary form-control">Create Group</button>
            </div>
          </form>

        </div>
      </div>
    </Page>
  );
}
export default ManageUsers;
