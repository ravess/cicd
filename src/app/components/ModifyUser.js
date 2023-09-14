import React, { useState, useEffect, useContext } from "react";
import Page from "./Page";
import { useNavigate, useParams } from "react-router-dom";
import Axios from "axios";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";
import LoadingDotsIcon from "./LoadingDotsIcon";
import { checkForCookie } from "./Permissions";

function ModifyUser()
{
  const { id } = useParams();
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState([]);
  const [groupData, setGroupData] = useState([]);

  async function isAdmin()
  {
    try
    {
      const response = await Axios.post("/checkGroup",
        { role: "\\.Admin\\." },
        { withCredentials: true }
      );
      setIsLoading(false);
    } catch (e)
    {
      appDispatch({ type: "flashMessage", value: "You do not have permissions to use this feature." });
      navigate("/");
    }
  }

  async function getUser()
  {
    try
    {
      const response = await Axios.post("/getUser", { id: id }, { withCredentials: true });
      setUserData(response.data);
    } catch (e)
    {
      console.log("Get user is failing");
      appDispatch({ type: "flashMessage", value: "You do not have permissions to use this feature." });
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
      appDispatch({ type: "flashMessage", value: "You do not have permissions to use this feature." });
    }
  }

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

    if (data.password && !data.password.match(`^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,10}$`))
    {
      appDispatch({ type: "flashMessage", value: "Your password does not match the requirements." });
    } else
    {
      async function updateProfile()
      {
        try
        {
          const response = await Axios.post(
            "/updateUser",
            {
              password: data.password ? data.password : "",
              email: data.email ? data.email : "",
              userGroup: allGroups ? allGroups : "",
              isActive: data.isActive ? 1 : 0,
              role: "\\.Admin\\.",
              targetId: id
            },
            { withCredentials: true }
          );
          appDispatch({ type: "flashMessage", value: "User Info successfully changed!" });
          return true;
        } catch (e)
        {
          appDispatch({ type: "flashMessage", value: "User creation error." });
          return false;
        }
      }

      if (await updateProfile())
      {
        navigate("/users");
        appDispatch({ type: "dbChange" });
      } else
      {
        appDispatch({ type: "flashMessage", value: "Duplicate username detected. Please enter a unique username." });
      }
    }
  }

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
    getUser();
    getGroups();
  }, []);

  if (isLoading)
  {
    return <LoadingDotsIcon />;
  }

  return (
    <Page title="Modify User Detail" wide={true}>
      {userData.userGroup && groupData && (
        <form onSubmit={handleSubmit}>
          <h1 className="">Edit User Details</h1>

          <div className="form-group">
            <label htmlFor="username-modify" className="mb-1">
              <small>Username</small>
            </label>
            <input id="username-modify" name="username" className="form-control" type="text" placeholder={userData.username} autoComplete="off" disabled />
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
            <input id="email-modify" name="email" className="form-control" type="text" placeholder={userData.email} />
          </div>

          <div className="form-group">
            <label htmlFor="group-modify" className="mb-1">
              <small>Group (Current: {userData.userGroup} )</small>
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
              <input
                className="form-check-input"
                type="checkbox"
                value="true"
                id="flexCheckDefault"
                defaultChecked={userData.isActive === 1}
                name="isActive"
              />
              <label className="form-check-label ml-2" htmlFor="flexCheckDefault">
                Account Active?
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

export default ModifyUser;
