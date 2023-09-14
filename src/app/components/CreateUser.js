import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";
import LoadingDotsIcon from "./LoadingDotsIcon";
import { checkForCookie } from "./Permissions";
import Page from "./Page";
import Axios from "axios";

function CreateUser()
{
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [groupData, setGroupData] = useState([]);

  async function isAdmin()
  {
    try
    {
      const response = await Axios.post(
        "/checkGroup",
        { role: "\\.Admin\\." },
        { headers: { Authorization: `Bearer ${appState.user.token}` } }
      );
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
      const response = await Axios.post("/getGroups", {}, { headers: { Authorization: `Bearer ${appState.user.token}` } });
      setGroupData(response.data.data);
    } catch (e)
    {
      appDispatch({ type: "flashMessage", value: "You do not have permissions to use this feature." });
    }
  }

  useEffect(() =>
  {
    if (checkForCookie() == true)
    {
      appDispatch({ type: "logout" });
      appDispatch({ type: "flashMessage", value: "You do not have the rights to access this page." });
      navigate("/");
    }
    isAdmin();
    getGroups();
  }, []);

  async function handleSubmit(e)
  {
    e.preventDefault();
    //Get form data
    const formData = new FormData(e.target);
    const data = {};
    for (let [key, value] of formData.entries()) { data[key] = value; }

    //Parse the data for database insertion.
    const allGroupsArray = formData.getAll("group");
    const allGroups = "." + allGroupsArray.join(".") + ".";

    if (!data.username || !data.password)
    {
      appDispatch({ type: "flashMessage", value: "Please enter a username and password." });
    } else if (data.password && !data.password.match(`^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,10}$`))
    {
      appDispatch({ type: "flashMessage", value: "Your password does not match the requirements." });
    } else
    {
      async function createProfile()
      {
        try
        {
          const response = await Axios.post(
            "/user/new",
            {
              username: data.username ? data.username : "",
              password: data.password ? data.password : "",
              email: data.email ? data.email : "",
              userGroup: allGroups ? allGroups : "",
              isActive: data.isActive ? 1 : 0,
              role: "admin"
            },
            { headers: { Authorization: `Bearer ${appState.user.token}` } }
          );
          appDispatch({ type: "flashMessage", value: "User Info successfully changed!" });
          return true;
        } catch (e)
        {
          appDispatch({ type: "flashMessage", value: "Error updating user info." });
          return false;
        }
      }
      if (await createProfile())
      {
        navigate("/users");
        appDispatch({ type: "dbChange" });
      } else
      {
        appDispatch({ type: "flashMessage", value: "Duplicate username detected. Please enter a unique username." });
      }
    }
  }

  if (isLoading)
  {
    return <LoadingDotsIcon />;
  }

  return (
    <Page title="Create User" wide={true}>
      {groupData && (
        <form onSubmit={handleSubmit}>
          <h1 className="">Create User</h1>
          <div className="form-group">

            <label htmlFor="username-modify" className="mb-1">
              <small>Username</small>
            </label>
            <input id="username-modify" name="username" className="form-control" type="text" placeholder="Enter new username" autoComplete="off" />
          </div>
          <div className="form-group">

            <label htmlFor="password-modify" className="mb-1">
              <small>Password (8-10 characters, with at least one letter, number, and special character.)</small>
            </label>
            <input id="password-modify" name="password" className="form-control" type="password" placeholder="Enter new password" />
          </div>

          <div className="form-group">
            <label htmlFor="email-modify" className="mb-1">
              <small>Email</small>
            </label>
            <input id="email-modify" name="email" className="form-control" type="text" placeholder="Enter new email" />
          </div>

          <div className="form-group">
            <label htmlFor="group-modify" className="mb-1">
              <small>Group</small>
            </label>
            <select multiple name="group" className="form-control">
              {groupData.map((group, index) => (
                <option key={index} value={group.groupName}>
                  {group.groupName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group mt-3">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" value="true" id="flexCheckDefault" defaultChecked="true" name="isActive" />
              <label className="form-check-label ml-2" htmlFor="flexCheckDefault">
                Activate Account
              </label>
            </div>
          </div>

          <button type="submit" className="py-3 mt-4 btn btn-lg btn-success btn-block">
            Submit
          </button>
        </form>
      )}
    </Page>
  );
}

export default CreateUser;
