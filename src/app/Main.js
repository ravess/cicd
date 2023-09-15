import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { useImmerReducer } from "use-immer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { checkForCookie } from "./components/Permissions";
import Axios from "axios";
Axios.defaults.baseURL = "http://localhost:8080";

import StateContext from "./StateContext";
import DispatchContext from "./DispatchContext";

// My Components
import Header from "./components/Header";
import Login from "./components/Login";
import Home from "./components/Home";
import Footer from "./components/Footer";
import FlashMessages from "./components/FlashMessages";
import NotFound from "./components/NotFound";
import ModifyUser from "./components/ModifyUser";
import ManageUsers from "./components/ManageUsers";
import ModifyProfile from "./components/ModifyProfile";
import CreateUser from "./components/CreateUser";
import Board from "./components/Board";
import LoadingDotsIcon from "./components/LoadingDotsIcon";

function Main()
{
  const initialState = {
    loggedIn: false,
    flashMessages: [],
    dbChange: 0,
    isAdmin: false,
    isLoading: true
  };


  function ourReducer(draft, action)
  {
    switch (action.type)
    {
      case "login":
        draft.loggedIn = true;
        return;
      case "logout":
        draft.loggedIn = false;
        return;
      case "flashMessage":
        draft.flashMessages.push(action.value);
        return;
      case "dbChange":
        draft.dbChange++;
        return;
      case "setAdmin":
        draft.isAdmin = true;
        return;
      case "removeAdmin":
        draft.isAdmin = false;
        return;
      case "showLoading":
        draft.isLoading = action.value;
        return;

    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  useEffect(() =>
  {
    if (state.loggedIn == false)
    {
      Axios.post("/logout", { withCredentials: true });
    }
  }, [state.loggedIn]);

  useEffect(() =>
  {
    async function cookieCheck()
    {
      try
      {
        const hasCookie = await checkForCookie();
        console.log("Has Cookie = " + hasCookie);
        dispatch({ type: hasCookie ? "login" : "logout" });
      } catch (error)
      {
        console.log(error);
        dispatch({ type: "flashMessage", value: "Error connecting to backend." });
      }
      finally
      {
        dispatch({ type: "showLoading", value: false });
      }
    }
    cookieCheck();

  }, []);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Routes>
            <Route path="/users" element={<ManageUsers />} />
            <Route path="/user/:id" element={<ModifyUser />} />
            <Route path="/user/new" element={<CreateUser />} />
            <Route path="/profile" element={<ModifyProfile />} />
            <Route path="/board/:app_acronym_param?" element={<Board />} />
            <Route path="/" element={state.loggedIn ? <Home /> : <Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

const root = ReactDOM.createRoot(document.querySelector("#app"));
root.render(<Main />);

if (module.hot)
{
  module.hot.accept();
}
