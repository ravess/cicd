import React, { useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";
import Axios from "axios";

function HeaderLoggedIn(props)
{
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);
  const navigate = useNavigate();

  async function isAdmin()
  {
    try
    {
      const response = await Axios.post("/checkGroup",
        { role: "\\.Admin\\." },
        { withCredentials: true }
      );
      return true;
    } catch (e)
    {
      return false;
    }
  }

  async function handleProfileManagement()
  {
    navigate("/profile");
  }

  async function handleTMS()
  {
    navigate("/board");
  }
  async function handleUserManagement()
  {
    if (await isAdmin())
    {
      navigate("/users");
    } else
    {
      appDispatch({ type: "flashMessage", value: "You do not have the rights to access this page." });
    }
  }

  async function handleLogout()
  {
    try
    {
      const response = await Axios.get("/logout", { withCredentials: true });
    } catch (e)
    {
      console.log("LOGOUT ERROR");
    }
    appDispatch({ type: "logout" });
    appDispatch({ type: "flashMessage", value: "You have successfully logged out." });
    navigate("/");
  }

  useEffect(() =>
  {
    async function checkAdmin()
    {
      if (await isAdmin()) { appDispatch({ type: "setAdmin" }); }
      else { appDispatch({ type: "removeAdmin" }); }
    }
    checkAdmin();
  }, []);

  return (
    <div className="flex-row my-3 my-md-0">
      {appState.isAdmin ? (
        <button onClick={handleUserManagement} className="ml-3 btn btn-md btn-success">
          Manage Users
        </button>
      ) : null}

      {/* <button onClick={handleTMS} className="ml-3 btn btn-md btn-success">
        Task Management System
      </button> */}

      <button onClick={handleProfileManagement} className="ml-3 btn btn-md btn-success">
        Manage Profile
      </button>

      <button onClick={handleLogout} className="ml-3 btn btn-md btn-success">
        Sign Out
      </button>
    </div>
  );
}

export default HeaderLoggedIn;
