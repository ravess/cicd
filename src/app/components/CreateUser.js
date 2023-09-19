import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DispatchContext from "../DispatchContext";
import LoadingDotsIcon from "./LoadingDotsIcon";
import { checkForCookie } from "./Permissions";
import Page from "./Page";
import Axios from "axios";

function CreateUser()
{
  const appDispatch = useContext(DispatchContext);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [groupData, setGroupData] = useState([]);
  const [chosenGroupData, setChosenGroupData] = useState([]);

  async function isAdmin()
  {
    try 
    {
      const response = await Axios.post("/checkGroup", { group: "Admin" }, { withCredentials: true });
      if (response.data.ingroup.toLowerCase() == "true")
      {
        setIsLoading(false);
      }
      else
      {
        appDispatch({ type: "flashMessage", value: "You do not have permissions to use this feature." });
        appDispatch({ type: "removeAdmin" });
        navigate("/");
      }

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
      appDispatch({ type: "flashMessage", value: "You do not have permissions to use this feature." });
    }
  }

  async function handleSubmit(e)
  {
    e.preventDefault();
    //Gets form data
    const formData = new FormData(e.target);
    const data = {};
    for (let [key, value] of formData.entries()) { data[key] = value; }

    //Parse the data for database insertion.
    const chosenGroupArray = chosenGroupData.map((item) => item.groupName);
    chosenGroupArray.sort((a, b) => a.localeCompare(b));
    const allGroups = "." + chosenGroupArray.join(".") + ".";

    if (!data.username || !data.password)
    {
      appDispatch({ type: "flashMessage", value: "Please enter a username and password." });
    } else if (data.password && !data.password.match(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,10}$/))
    {
      appDispatch({ type: "flashMessage", value: "Your password does not match the requirements." });
    }
    else if (data.email && !data.email.match(/[\w.-]+@[\w.-]+\.[A-Za-z]{2,4}/))
    {
      appDispatch({ type: "flashMessage", value: "Your email does not match the requirements." });
    }
    else
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
              groups: allGroups ? allGroups : "",
              isActive: data.isActive ? 1 : 0
            },
            { withCredentials: true }
          );
          e.target.reset()
          getGroups();
          setChosenGroupData([]);
          appDispatch({ type: "flashMessage", value: "User successfully created!" });
          appDispatch({ type: "dbChange" });
        } catch (e)
        {
          if (e.response.status === 401 || e.response.status === 403)
          {
            appDispatch({ type: "flashMessage", value: "You do not have permissions to use this feature." });
            appDispatch({ type: "removeAdmin" });
            navigate("/");
          }
          appDispatch({ type: "flashMessage", value: "Duplicate username detected. Please enter a unique username." });
        }
      }
      createProfile();
    }
  }

  function handleAddGroup(e)
  {
    //Selects all the selected options in the available_group
    const selectElement = document.querySelector('select[name="available_group"]');
    let selectedValues = null;

    if (selectElement)
    {
      const selectedOptions = Array.from(selectElement.selectedOptions);
      selectedValues = selectedOptions.map((option) => option.value);
    }

    // Remove selected values from groupData and add to chosenGroupData (current groups)
    setGroupData((prevGroupData) =>
      prevGroupData.filter((value) => !selectedValues.includes(value.groupName))
    );
    setChosenGroupData((prevChosenGroupData) =>
    {
      const newChosenGroupData = selectedValues.map((value) => ({ groupName: value }));
      return [
        ...prevChosenGroupData,
        ...newChosenGroupData.filter((newItem) =>
          !prevChosenGroupData.some((prevItem) => prevItem.groupName === newItem.groupName)
        ),
      ];
    });

    selectElement.selectedIndex = -1;
  }

  function handleRemoveGroup(e)
  {
    const selectElement = document.querySelector('select[name="chosen_group"]');
    let selectedValues = null;

    // Check if the <select> element with the specified name exists
    if (selectElement)
    {
      const selectedOptions = Array.from(selectElement.selectedOptions);
      selectedValues = selectedOptions.map((option) => option.value);
    }

    // Remove selected values from groupData and add to chosenGroupData
    setChosenGroupData((prevGroupData) =>
      prevGroupData.filter((value) => !selectedValues.includes(value.groupName))
    );
    setGroupData((prevChosenGroupData) =>
    {
      const newChosenGroupData = selectedValues.map((value) => ({ groupName: value }));
      return [
        ...prevChosenGroupData,
        ...newChosenGroupData.filter((newItem) =>
          !prevChosenGroupData.some((prevItem) => prevItem.groupName === newItem.groupName)
        ),
      ];
    });

    selectElement.selectedIndex = -1;
  }

  useEffect(() =>
  {
    async function cookieCheck()
    {
      const hasCookie = await checkForCookie();
      if (!hasCookie || hasCookie == false)
      {
        appDispatch({ type: "logout" });
        appDispatch({ type: "flashMessage", value: "You do not have the rights to access this page." });
        navigate("/");
      }
    }
    cookieCheck();
    isAdmin();
    getGroups();
  }, []);

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
              <small>Email (e.g. user@domain.com)</small>
            </label>
            <input id="email-modify" name="email" className="form-control" type="text" placeholder="Enter new email" />
          </div>

          <div className="form-group">
            <div className="d-flex align-items-start">
              <div className="mr-3">
                <label htmlFor="group-modify" className="mb-1">
                  <small>Available Groups</small>
                </label>
                <select multiple name="available_group" className="form-control" style={{ width: '25vw' }}>
                  {groupData.map((group, index) => (
                    <option key={index} value={group.groupName}>
                      {group.groupName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="d-flex flex-column justify-content-between mt-4">
                <button type="button" className="mb-4" onClick={handleAddGroup}> &gt;&gt; </button>
                <button type="button" onClick={handleRemoveGroup}> &lt;&lt; </button>
              </div>
              <div className="mx-3">
                <label htmlFor="group-modify" className="mb-1">
                  <small>Current Groups</small>
                </label>
                <select multiple name="chosen_group" className="form-control" style={{ width: '25vw' }}>
                  {chosenGroupData.map((group, index) => (
                    <option key={index} value={group.groupName}>
                      {group.groupName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
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
