import React, { useContext, useEffect } from "react";
import Page from "./Page";
import Axios from "axios";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";
import LoadingDotsIcon from "./LoadingDotsIcon";
import { checkForCookie } from "./Permissions";

function Login()
{
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);

  //Login button event handler
  async function handleSubmit(e)
  {
    e.preventDefault();

    //Get Form Data
    const formData = new FormData(e.target);
    const data = {};
    for (let [key, value] of formData.entries()) { data[key] = value; }

    //Warn if either fields empty, else send query to backend.
    if (!data.username || !data.password)
    { appDispatch({ type: "flashMessage", value: "Please enter a username and password." }); }
    else
    {
      async function fetchResults()
      {
        try
        {
          const response = await Axios.post("/login", { username: data.username, password: data.password }, { withCredentials: true });
          // console.log(response);
          appDispatch({ type: "login" });
          appDispatch({ type: "flashMessage", value: "You have successfully logged in." });
          appDispatch({ type: "showLoading", value: true });
        } catch (e)
        {
          if (e.response.status === 403)
          {
            appDispatch({ type: "flashMessage", value: "Your account has been disabled. Please contact your System Administrator for information." });
          }
          else
          {
            appDispatch({ type: "flashMessage", value: "Invalid username / password." });
          }
        }
      }
      fetchResults();
    }
  }

  if (appState.isLoading)
  {
    return <LoadingDotsIcon />;
  }

  return (
    <Page title="Login" wide={true}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username-login" className="text-muted mb-1">
            <small>Username</small>
          </label>
          <input
            id="username-login"
            name="username"
            className="form-control"
            type="text"
            placeholder="Enter Username"
            autoComplete="off"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password-login" className="text-muted mb-1">
            <small>Password</small>
          </label>
          <input
            id="password-login"
            name="password"
            className="form-control"
            type="password"
            placeholder="Enter password"
          />
        </div>
        <button type="submit" className="py-3 mt-4 btn btn-lg btn-success btn-block">
          Login
        </button>
      </form>
    </Page>
  );
}

export default Login;
