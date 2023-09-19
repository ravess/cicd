import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";
import LoadingDotsIcon from "./LoadingDotsIcon";
import { checkForCookie } from "./Permissions";
import Axios from "axios";
import Page from "./Page";

function ModifyProfile()
{
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState([]);

  async function getUser()
  {
    try
    {
      const response = await Axios.get("/getUser", { withCredentials: true });
      setIsLoading(false);
      setUserData(response.data);
    } catch (e)
    {
      appDispatch({ type: "flashMessage", value: "You do not have the rights to access this page." });
      navigate("/");
    }
  }

  async function updateProfile(email, password)
  {
    try
    {
      const response = await Axios.put(
        "/updateProfile",
        {
          email: email ? email : "",
          password: password ? password : ""
        },
        { withCredentials: true }
      );
      appDispatch({ type: "flashMessage", value: "User info successfully changed!" });
    } catch (e)
    {
      appDispatch({ type: "flashMessage", value: "Error modifying user info." });
    }
  }

  async function handleSubmit(e)
  {
    e.preventDefault();
    //Get form data
    const formData = new FormData(e.target);
    const data = {};
    for (let [key, value] of formData.entries()) { data[key] = value; }

    if (!data.email && !data.password)
    {
      appDispatch({ type: "flashMessage", value: "Please enter the information you would like to change." });
    }
    else if (data.password && !data.password.match(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,10}$/))
    {
      appDispatch({ type: "flashMessage", value: "Your password does not match the requirements." });
    }
    else if (data.email && !data.email.match(/[\w.-]+@[\w.-]+\.[A-Za-z]{2,4}/))
    {
      appDispatch({ type: "flashMessage", value: "Your email does not match the requirements." });
    }
    else
    {
      updateProfile(data.email, data.password);
      navigate("/");
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
    getUser();
  }, []);

  if (isLoading) { return <LoadingDotsIcon />; }

  return (
    <Page title="Modify User Detail" wide={true}>
      {userData && (
        <form onSubmit={handleSubmit}>
          <h1 className="">Edit Profile ({userData.username})</h1>

          <div className="form-group">
            <label htmlFor="email-modify" className="mb-1">
              <small>Email (e.g. user@domain.com)</small>
            </label>
            <input id="email-modify" name="email" className="form-control" type="text" placeholder={userData.email} />
          </div>

          <div className="form-group">
            <label htmlFor="password-modify" className="mb-1">
              <small>Password (8-10 characters, with at least one letter, number, and special character.)</small>
            </label>
            <input id="password-modify" name="password" className="form-control" type="password" placeholder="Enter new password" />
          </div>

          <button type="submit" className="py-3 mt-4 btn btn-lg btn-success btn-block">
            Submit
          </button>
        </form>
      )}
    </Page>
  );
}

export default ModifyProfile;
