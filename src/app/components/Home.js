import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";
import Axios from "axios";
import Page from "./Page";


function Home()
{
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const [userData, setUserData] = useState([]);
  const navigate = useNavigate();

  //Run once on first mount
  useEffect(() => 
  {
    async function getUser() 
    {
      try
      {
        const response = await Axios.get("/getUser", { withCredentials: true });
        setUserData(response.data);
      } catch (e) 
      {
        appDispatch({ type: "flashMessage", value: "You are not authorised to view this page." });
        appDispatch({ type: "logout" });
      }
    }
    getUser();
  }, []);

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
