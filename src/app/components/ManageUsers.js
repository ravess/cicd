import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";
import { checkForCookie } from "./Permissions";
import Axios from "axios";
import Page from "./Page";

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
      const response = await Axios.post("/checkGroup", { role: "\\.Admin\\." }, { withCredentials: true });
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
      //appDispatch({ type: "flashMessage", value: "Error getting groups." });
    }
  }

  async function addGroup(newgroup) 
  {
    try 
    {
      const response = await Axios.post("/createGroup", { newgroup: newgroup }, { withCredentials: true });
    } catch (e) 
    {
      appDispatch({ type: "flashMessage", value: "Group creation failed." });
    }
  }

  async function getUsers() 
  {
    try 
    {
      const response = await Axios.post("/users", { role: "\\.Admin\\." }, { withCredentials: true });
      setUserData(response.data.data);
    } catch (e) 
    {
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

  function newGroupSubmit(e) 
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
      addGroup(newInput);
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
                <tr key={user.username}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.isActive ? "Active" : "Inactive"}</td>
                  <td>{user.userGroup}</td>
                  <td>
                    <Link to={`/user/${user.username}`}>Edit</Link>
                  </td>
                </tr>
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
