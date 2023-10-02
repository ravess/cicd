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
  const appDispatch = useContext(DispatchContext);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState([]);
  const [groupData, setGroupData] = useState([]);
  const [existingGroupData, setExistingGroupData] = useState([]);
  const [availableGroupData, setAvailableGroupData] = useState([]);

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

  async function getUser()
  {
    try
    {
      const response = await Axios.get(`/users/${id}`, { withCredentials: true });
      setUserData(response.data);

      const existingGroups = response.data.groups
        .split('.')
        .filter(Boolean)
        .map((value) => ({ groupName: value }));

      setExistingGroupData(existingGroups);
    } catch (e)
    {
      console.log(e);
      console.log("Get user is failing");
      appDispatch({ type: "flashMessage", value: "Get User failed." });
    }
  }

  async function getGroups()
  {
    try
    {
      const response = await Axios.get("/users/getGroups", { withCredentials: true });
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
    const chosenGroupArray = existingGroupData.map((item) => item.groupName);
    chosenGroupArray.sort((a, b) => a.localeCompare(b));
    const allGroups = "." + chosenGroupArray.join(".") + ".";

    if (data.password && !data.password.match(`^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,10}$`))
    {
      appDispatch({ type: "flashMessage", value: "Your password does not match the requirements." });
    } else
    {
      async function updateProfile()
      {
        try
        {
          const response = await Axios.put(
            `/users/${id}`,
            {
              password: data.password ? data.password : "",
              email: data.email ? data.email : "",
              groups: allGroups ? allGroups : "",
              isActive: data.isActive ? 1 : 0
            },
            { withCredentials: true }
          );
          appDispatch({ type: "flashMessage", value: "User Info successfully changed!" });
          appDispatch({ type: "dbChange" });
          navigate("/users");
        } catch (e)
        {
          if (e.response.status === 401 || e.response.status === 403)
          {
            appDispatch({ type: "flashMessage", value: "You do not have permissions to use this feature." });
            appDispatch({ type: "removeAdmin" });
            navigate("/");
          }
          appDispatch({ type: "flashMessage", value: "User creation error." });
        }
      }
      updateProfile();
    }
  }

  function handleAddGroup(e)
  {
    const selectElement = document.querySelector('select[name="available_group"]');
    let selectedValues = null;

    // Check if the <select> element with the specified name exists
    if (selectElement)
    {
      const selectedOptions = Array.from(selectElement.selectedOptions);
      selectedValues = selectedOptions.map((option) => option.value);
    }

    // Remove selected values from currentGroupData and add to availableGroupData
    setAvailableGroupData((prevGroupData) =>
      prevGroupData.filter((value) => !selectedValues.includes(value.groupName))
    );
    setExistingGroupData((prevChosenGroupData) =>
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
    const selectElement = document.querySelector('select[name="current_group"]');
    let selectedValues = null;

    // Check if the <select> element with the specified name exists
    if (selectElement)
    {
      const selectedOptions = Array.from(selectElement.selectedOptions);
      selectedValues = selectedOptions.map((option) => option.value);
    }

    // Remove selected values from groupData and add to availableGroupData
    setExistingGroupData((prevGroupData) =>
      prevGroupData.filter((value) => !selectedValues.includes(value.groupName))
    );
    setAvailableGroupData((prevChosenGroupData) =>
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
    getUser();
    getGroups();
  }, []);


  useEffect(() =>
  { 
    const filteredGroups = groupData.filter((group1) =>
      !existingGroupData.some((group2) => group1.groupName === group2.groupName)
    );
    setAvailableGroupData(filteredGroups);
  }, [groupData, existingGroupData]);

  if (isLoading)
  {
    return <LoadingDotsIcon />;
  }

  return (
    <Page title="Modify User Detail" wide={true}>
      {userData.groups && groupData && (
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
              <small>Email (e.g. user@domain.com)</small>
            </label>
            <input id="email-modify" name="email" className="form-control" type="text" placeholder={userData.email} />
          </div>

          <div className="form-group">
            <div className="d-flex align-items-start">
              <div className="mr-3">
                <label htmlFor="group-modify" className="mb-1">
                  <small>Available Groups</small>
                </label>
                <select multiple name="available_group" className="form-control" style={{ width: '25vw' }}>
                  {availableGroupData.map((group, index) => (
                    <option key={index} value={group.groupName}>
                      {group.groupName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="d-flex flex-column justify-content-between mt-4">
                <button type="button" className="mb-4" onClick={handleAddGroup}>  &gt;&gt; </button>
                <button type="button" onClick={handleRemoveGroup}> &lt;&lt; </button>
              </div>
              <div className="mx-3">
                <label htmlFor="group-modify" className="mb-1">
                  <small>Current Groups</small>
                </label>
                <select multiple name="current_group" className="form-control" style={{ width: '25vw' }}>
                  {existingGroupData.map((group, index) => (
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
