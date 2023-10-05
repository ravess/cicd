import React, { useState, useEffect, useContext } from "react";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";
import LoadingDotsIcon from "./LoadingDotsIcon";
import Axios from "axios";
import Page from "./Page";


function Home()
{
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const [userData, setUserData] = useState([]);

  //Run once on first mount
  useEffect(() => 
  {
    async function getUser() 
    {
      try
      {
        const response = await Axios.get("/getUser", { withCredentials: true });
        setUserData(response.data);
        appDispatch({ type: "updateName", value: response.data.username });
      } catch (e) 
      {
        appDispatch({ type: "flashMessage", value: "You are not authorised to view this page." });
        appDispatch({ type: "logout" });
      }
    }
    getUser();
    appDispatch({ type: "showLoading", value: false });
  }, []);

  if (appState.isLoading)
  {
    return <LoadingDotsIcon />;
  }

  return (
    <Page title="Home Page">
      {userData.username && (
        <center>
          <h1>Welcome, {userData.username}.</h1>
        </center>
      )}
    </Page>
  );
}

export default Home;
