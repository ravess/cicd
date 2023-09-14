import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";
import Axios from "axios";
import Page from "./Page";

function Board()
{
    const { app_acronym_param } = useParams();
    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);

    //Task management
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
    const [isViewTaskOpen, setIsViewTaskOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedTaskAction, setSelectedTaskAction] = useState("");

    //Application Management
    const [isCreateAppOpen, setIsCreateAppOpen] = useState(false);
    const [isEditAppOpen, setIsEditAppOpen] = useState(false);
    const [isViewAppOpen, setIsViewAppOpen] = useState(false);
    //Plan Management
    const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
    const [isEditPlanOpen, setIsEditPlanOpen] = useState(false);
    const [isViewPlanOpen, setIsViewPlanOpen] = useState(false);
    //
    const initialState = {
        openState: [],
        todoState: [],
        doingState: [],
        doneState: [],
        closedState: []
    };
    //State data
    const [taskData, setTaskData] = useState(initialState);
    const [planData, setPlanData] = useState(null);
    const [appData, setAppData] = useState(null);
    const [allApps, setAllApps] = useState([]);
    const [userData, setUserData] = useState([]);
    const [groupData, setGroupData] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();

    const organizeTasksByState = (tasks) =>
    {
        return tasks.reduce((acc, task) =>
        {
            const { task_state } = task;

            switch (task_state)
            {
                case 'OPEN':
                    return { ...acc, openState: [...acc.openState, task] };
                case 'TODO':
                    return { ...acc, todoState: [...acc.todoState, task] };
                case 'DOING':
                    return { ...acc, doingState: [...acc.doingState, task] };
                case 'DONE':
                    return { ...acc, doneState: [...acc.doneState, task] };
                case 'CLOSED':
                    return { ...acc, closedState: [...acc.closedState, task] };
                default:
                    return acc;
            }
        }, {
            openState: [],
            todoState: [],
            doingState: [],
            doneState: [],
            closedState: [],
        });
    };

    const hasPermissionForState = (state) =>
    {
        try
        {
            // getUser();
            // getApp();
            // Map the user's groups to their corresponding app_permit_* values
            const userGroupPermissions = {
                openState: userData.userGroup.includes("." + appData.app_permit_open + "."),
                todoState: userData.userGroup.includes("." + appData.app_permit_todolist + "."),
                doingState: userData.userGroup.includes("." + appData.app_permit_doing + "."),
                doneState: userData.userGroup.includes("." + appData.app_permit_done + "."),
            };
            return userGroupPermissions[state];
        } catch (e)
        {

        }
    };

    function getPlanColor(planName)
    {
        const plan = planData.find((plan) => plan.plan_mvp_name === planName);
        return plan ? plan.plan_colour : '#939393'; // Default color if plan is not found
    }

    // Function to check if the user has permission for a specific state
    async function getUser()
    {
        try
        {
            const response = await Axios.get("/getUser", { headers: { Authorization: `Bearer ${appState.user.token}` } });
            setUserData(response.data);
        } catch (e)
        {
            appDispatch({ type: "flashMessage", value: "You do not have the rights to access this page." });
            navigate("/");
        }
    }

    async function getGroups()
    {
        try
        {
            const response = await Axios.get("/getGroups", { headers: { Authorization: `Bearer ${appState.user.token}` } });
            setGroupData(response.data.data);
        } catch (e)
        {
            appDispatch({ type: "flashMessage", value: "You do not have permissions to use this feature." });
        }
    }

    async function getTasks() 
    {
        try 
        {
            const response = await Axios.post("/getTasks", { app_acronym: app_acronym_param }, { headers: { Authorization: `Bearer ${appState.user.token}` } });
            const organizedTasks = organizeTasksByState(response.data.data);
            setTaskData(organizedTasks);
        } catch (e) 
        {
            ({ type: "flashMessage", value: "Error getting tasks." });
        }
    }

    async function getPlans() 
    {
        try 
        {
            const response = await Axios.post("/getPlans", { plan_app_acronym: app_acronym_param }, { headers: { Authorization: `Bearer ${appState.user.token}` } });
            setPlanData(response.data.data);
        } catch (e) 
        {
            ({ type: "flashMessage", value: "Error getting Plans." });
        }
    }

    async function getPlan(planName) 
    {
        try 
        {
            const response = await Axios.post("/getPlan", { plan_mvp_name: planName }, { headers: { Authorization: `Bearer ${appState.user.token}` } });
            return (response.data.data[0]);
        } catch (e) 
        {
            ({ type: "flashMessage", value: "Error getting Plan." });
        }
    }

    async function getApps() 
    {
        try 
        {
            const response = await Axios.post("/getApps", {}, { headers: { Authorization: `Bearer ${appState.user.token}` } });
            // console.log("getApps Response : " + JSON.stringify(response.data.data));
            setAllApps(response.data.data);
        } catch (e) 
        {
            ({ type: "flashMessage", value: "Error getting Apps." });
        }
    }

    async function getApp() 
    {
        try 
        {
            const response = await Axios.post("/getApp", { app_acronym: app_acronym_param }, { headers: { Authorization: `Bearer ${appState.user.token}` } });
            //console.log("getApp Response : " + JSON.stringify(response.data.data));
            setAppData(response.data.data[0]);
            //console.log(response.data.data[0]);
        } catch (e) 
        {
            ({ type: "flashMessage", value: "Error getting Apps." });
        }
    }

    //What this does is to store the selected task
    //And set isEditTaskOpen to true. Since this element is intialised on Board.js, it would render once this is set to true.
    const handleEditTask = (task, taskAction) =>
    {
        setSelectedTaskAction(taskAction);
        setSelectedTask(task);
        taskAction === "View" ? setIsViewTaskOpen(true) : setIsEditTaskOpen(true);
    };

    const handleStateAuthorisation = async (state) =>
    {
        const sanitisedState = state.replace("State", "").toUpperCase();
        try
        {
            const response = await Axios.post("/hasAccessTo", { app_acronym: appData.app_acronym, app_state: sanitisedState }, { headers: { Authorization: `Bearer ${appState.user.token}` } });
            if (response.data.allowedAccess === false)
            {
                appDispatch({ type: "flashMessage", value: "You do not have permission to access this resource." });
                getUser();
                getApp();
            }
            return response.data.allowedAccess;
        }
        catch (e)
        {
            appDispatch({ type: "flashMessage", value: "You do not have permission to access this resource." });
            return false;
        }
    }

    const handleGroupAuthorisation = async (role) =>
    {
        try
        {
            const response = await Axios.post("/checkGroup", { role: role }, { headers: { Authorization: `Bearer ${appState.user.token}` } });
            if (response.data.ingroup === false)
            {
                appDispatch({ type: "flashMessage", value: "You do not have permission to access this resource." });
                getUser();
                getApp();
            }
            return response.data.ingroup;
        }
        catch (e)
        {
            console.log(e);
            getUser();
            getApp();
            appDispatch({ type: "flashMessage", value: "You do not have permission to access this resource." });
            return false;
        }
    }

    const Modal = ({ isModalOpen, closeModal, title, content, showSaveButton }) =>
    {
        return (
            <div>
                {/* Modal backdrop */}
                {isModalOpen && <div className="modal-backdrop"></div>}

                {/* Modal */}
                <div className={`modal ${isModalOpen ? 'show' : ''}`} tabIndex="-1" role="dialog" style={{ display: isModalOpen ? 'block' : 'none' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3 className="modal-title">{title}</h3>
                                <button type="button" className="close" onClick={closeModal}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                {content}
                            </div>
                            <div className="modal-footer d-flex justify-content-between">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
                                {showSaveButton && <button type="submit" className="btn btn-success" form="modalForm">Save</button>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    //Task Management
    const ViewTaskModal = ({ isModalOpen, closeModal, task }) =>
    {
        return (
            <Modal
                isModalOpen={isModalOpen}
                closeModal={closeModal}
                title={`${selectedTaskAction} Task (${task.task_id})`}
                content={
                    <>
                        <form id="modalForm">

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Task Name: </b>
                                </label>
                                <input id="task_name" name="task_name" className="form-control" type="text" placeholder={task.task_name} disabled />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Task Description: </b>
                                </label>
                                <textarea id="task_description" name="task_description" className="form-control" type="text" placeholder={task.task_description} rows="5" disabled />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Assigned to Plan </b>
                                </label>
                                <input id="task_plan" name="task_plan" className="form-control" type="text" placeholder={task.task_plan} disabled />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Task Creator</b>
                                </label>
                                <input id="task_creator" name="task_creator" className="form-control" type="text" placeholder={task.task_creator} disabled />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Task Owner</b>
                                </label>
                                <input id="task_owner" name="task_owner" className="form-control" type="text" placeholder={task.task_owner} disabled />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Created</b>
                                </label>
                                <input id="task_create_date" name="task_create_date" className="form-control" type="text" placeholder={task.task_createdate} disabled />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>State</b>
                                </label>
                                <input id="task_state" name="task_state" className="form-control" type="text" placeholder={task.task_state} disabled />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Task Notes</b>
                                </label>
                                <textarea id="task_notes_current" name="task_notes_current" className="form-control" type="text" value={task.task_notes ? task.task_notes : ""} rows="10" disabled />
                            </div>

                        </form>
                    </>
                }
                onSave={null}
                onCancel={closeModal}
                showSaveButton={false}
            />
        );
    };

    const EditTaskModal = ({ isModalOpen, closeModal, task }) =>
    {
        async function handleSaveChanges(e)
        {
            e.preventDefault();

            refreshData();

            if (await handleStateAuthorisation(task.task_state) === false)
            {
                window.scrollTo(0, 0);
                closeModal();
            }
            else
            {
                const formData = new FormData(e.target);
                const data = {};
                for (let [key, value] of formData.entries()) { data[key] = value; }
                // Perform the necessary actions to save the edited task

                async function modifyTask()
                {
                    try
                    {
                        console.log("Starting axios.post selectedTaskAction = " + selectedTaskAction);
                        await getTasks();
                        const response = await Axios.post(
                            "/modifyTask",
                            {
                                task_id: task.task_id,
                                task_name: task.task_name,
                                task_notes_current: task.task_notes,
                                task_notes_new: data.task_notes_new ? data.task_notes_new : "",
                                task_plan_current: task.task_plan,
                                task_plan_new: data.task_plan ? data.task_plan : task.task_plan,
                                task_state: task.task_state,
                                task_action: selectedTaskAction,
                                task_owner: userData.username
                            },
                            { headers: { Authorization: `Bearer ${appState.user.token}` } }
                        );
                        if (selectedTaskAction == "Promote")
                        {
                            appDispatch({ type: "flashMessage", value: "Task Promoted." });
                        }
                        else if (selectedTaskAction == "Demote")
                        {
                            appDispatch({ type: "flashMessage", value: "Task Demoted." });
                        }
                        else
                        {
                            appDispatch({ type: "flashMessage", value: "Task successfully modified." });
                        }
                        return true;
                    } catch (e)
                    {
                        appDispatch({ type: "flashMessage", value: "Error modifying task." });
                        return false;
                    }
                }
                modifyTask().then(getTasks);
                window.scrollTo(0, 0);
                closeModal();
            }
        };

        return (
            <Modal
                isModalOpen={isModalOpen}
                closeModal={closeModal}
                title={`${selectedTaskAction} Task (${task.task_id})`}
                content={
                    <>
                        <form id="modalForm" onSubmit={handleSaveChanges}>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Task Name: </b>
                                </label>
                                <input id="task_name" name="task_name" className="form-control" type="text" placeholder={task.task_name} disabled />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Task Description: </b>
                                </label>
                                <textarea id="task_description" name="task_description" className="form-control" type="text" placeholder={task.task_description} rows="5" disabled />
                            </div>

                            {((task.task_state === "OPEN" && selectedTaskAction !== "Promote") || task.task_state === "DONE" && selectedTaskAction === "Demote") && (
                                <div className="form-group">
                                    <label className="mb-1">
                                        <b>Assigned to Plan</b>
                                    </label>
                                    <select className="form-control" id="task_plan" name="task_plan" defaultValue={task.task_plan}>
                                        {/* Render the options based on the planData state */}
                                        <option value="none">None</option>
                                        {planData.map((plan) => (
                                            <option key={plan.plan_mvp_name} value={plan.plan_mvp_name}>
                                                {plan.plan_mvp_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {(task.task_state !== "DONE" || (task.task_state === "DONE" && selectedTaskAction !== "Demote")) && (
                                <div className="form-group">
                                    <label className="mb-1">
                                        <b>Assigned to Plan </b>
                                    </label>
                                    <input id="task_plan" name="task_plan" className="form-control" type="text" placeholder={task.task_plan} disabled />
                                </div>
                            )}

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Task Creator</b>
                                </label>
                                <input id="task_creator" name="task_creator" className="form-control" type="text" placeholder={task.task_creator} disabled />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Task Owner</b>
                                </label>
                                <input id="task_owner" name="task_owner" className="form-control" type="text" placeholder={task.task_owner} disabled />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Created</b>
                                </label>
                                <input id="task_create_date" name="task_create_date" className="form-control" type="text" placeholder={task.task_createdate} disabled />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>State</b>
                                </label>
                                <input id="task_state" name="task_state" className="form-control" type="text" placeholder={task.task_state} disabled />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Task Notes</b>
                                </label>
                                <textarea id="task_notes_current" name="task_notes_current" className="form-control" type="text" value={task.task_notes ? task.task_notes : ""} rows="10" disabled />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Add Note</b>
                                </label>
                                <textarea id="task_notes_new" name="task_notes_new" className="form-control" type="text" placeholder="Additional notes go here" rows="4" />
                            </div>

                        </form>
                    </>
                }
                onSave={handleSaveChanges}
                onCancel={closeModal}
                showSaveButton={true}
            />
        );
    };

    const CreateTaskModal = ({ isModalOpen, closeModal }) =>
    {
        async function handleSaveChanges(e)
        {
            e.preventDefault();

            refreshData();

            if (await handleStateAuthorisation("CREATE") === false)
            {
                window.scrollTo(0, 0);
                closeModal();
            }
            else
            {
                const formData = new FormData(e.target);
                const data = {};
                for (let [key, value] of formData.entries()) { data[key] = value; }
                // Perform the necessary actions to save the edited task

                async function createTask()
                {
                    //Validate rnumber = number. Enter description, task name.
                    try
                    {
                        await getApp();
                        const response = await Axios.post(
                            "/createTask",
                            {
                                task_name: data.task_name ? data.task_name : "",
                                task_description: data.task_description ? data.task_description : "",
                                task_notes: data.task_notes ? data.task_notes : "No creation notes entered.",
                                task_id: appData.app_acronym + "_" + appData.app_rnumber,
                                task_plan: data.task_plan ? data.task_plan : "",
                                task_app_acronym: appData.app_acronym,
                                task_state: "OPEN",
                                task_creator: userData.username,
                                task_owner: userData.username
                            },
                            { headers: { Authorization: `Bearer ${appState.user.token}` } }
                        );
                        await Axios.post("/modifyApp", {
                            app_acronym: appData.app_acronym,
                            app_rnumber: appData.app_rnumber + 1
                        }
                            , { headers: { Authorization: `Bearer ${appState.user.token}` } });
                        appDispatch({ type: "flashMessage", value: "Task successfully created." });
                        return true;
                    } catch (e)
                    {
                        appDispatch({ type: "flashMessage", value: "Error creating task." });
                        console.log(e);
                        return false;
                    }
                }
                createTask().then(getTasks).then(getApp);
                window.scrollTo(0, 0);
                closeModal();
            }
        };

        return (
            <Modal
                isModalOpen={isModalOpen}
                closeModal={closeModal}
                title="Create Task"
                content={
                    <>
                        <form id="modalForm" onSubmit={handleSaveChanges}>
                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Task Name (mandatory) </b>
                                </label>
                                <input id="task_name" name="task_name" className="form-control" type="text" placeholder="Enter task name" autoComplete="off" />
                            </div>

                            <div className="form-group">

                                <label className="mb-1">
                                    <b>Task Description (mandatory) </b>
                                </label>
                                <textarea id="task_description" name="task_description" className="form-control" type="text" placeholder="Enter brief description" />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Task Plan</b>
                                </label>
                                <select className="form-control" id="task_plan" name="task_plan" defaultValue="none">
                                    {/* Render the options based on the planData state */}
                                    <option value="none">None</option>
                                    {planData.map((plan) => (
                                        <option key={plan.plan_mvp_name} value={plan.plan_mvp_name}>
                                            {plan.plan_mvp_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Task Notes</b>
                                </label>
                                <textarea id="task_notes" name="task_notes" className="form-control" type="text" placeholder="Include task notes here" rows="6" />
                            </div>

                        </form>
                    </>
                }
                onSave={handleSaveChanges}
                onCancel={closeModal}
                showSaveButton={true}
            />
        );
    };

    //Application Management
    const ViewAppModal = ({ isModalOpen, closeModal }) =>
    {
        return (
            <Modal
                isModalOpen={isModalOpen}
                closeModal={closeModal}
                title={`Edit Application`}
                content={
                    <>
                        <form id="modalForm">

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Application Acronym</b>
                                </label>
                                <input id="app_acronym" name="app_acronym" className="form-control" type="text" placeholder={appData.app_acronym} autoComplete="off" disabled />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Application Description</b>
                                </label>
                                <textarea id="app_description" name="app_description" className="form-control" type="text" placeholder={appData.app_description} autoComplete="off" rows="4" disabled />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Application Start Date</b>
                                </label>
                                <input id="app_start_date" name="app_start_date" className="form-control" type="text" autoComplete="off" defaultValue={appData.app_start_date ? appData.app_start_date : ""} disabled />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Application End Date</b>
                                </label>
                                <input id="app_end_date" name="app_end_date" className="form-control" type="text" autoComplete="off" defaultValue={appData.app_end_date ? appData.app_end_date : ""} disabled />
                            </div>

                        </form>
                    </>
                }
                onSave={null}
                onCancel={closeModal}
                showSaveButton={false}
            />
        );
    };

    const EditAppModal = ({ isModalOpen, closeModal }) =>
    {
        async function handleSaveChanges(e)
        {
            e.preventDefault();

            refreshData();
            if (await handleGroupAuthorisation("\\.Project Lead\\.") === false)
            {
                console.log("NO AUTHORISATION");
                window.scrollTo(0, 0);
                closeModal();
            }
            else
            {
                const formData = new FormData(e.target);
                const data = {};
                for (let [key, value] of formData.entries()) { data[key] = value; }
                // Perform the necessary actions to save the edited task

                async function ModifyApp()
                {
                    try
                    {
                        const response = await Axios.post(
                            "/modifyApp",
                            {
                                app_acronym: appData.app_acronym,
                                app_start_date: (data.app_start_date ? data.app_start_date : null),
                                app_end_date: (data.app_end_date ? data.app_end_date : null),
                                app_permit_open: data.permit_open,
                                app_permit_todo: data.permit_todo,
                                app_permit_doing: data.permit_doing,
                                app_permit_done: data.permit_done,
                                app_permit_create: data.permit_create,
                                role: "\\.Project Lead\\."
                            },
                            { headers: { Authorization: `Bearer ${appState.user.token}` } }
                        );
                        appDispatch({ type: "flashMessage", value: "Application successfully modified!" });
                        return true;
                    } catch (e)
                    {
                        appDispatch({ type: "flashMessage", value: "Error modifying application." });
                        return false;
                    }
                }
                ModifyApp().then(getApp);
                window.scrollTo(0, 0);
                closeModal();
            }
        };

        return (
            <Modal
                isModalOpen={isModalOpen}
                closeModal={closeModal}
                title={`Edit Application`}
                content={
                    <>
                        <form id="modalForm" onSubmit={handleSaveChanges}>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Application Acronym</b>
                                </label>
                                <input id="app_acronym" name="app_acronym" className="form-control" type="text" placeholder={appData.app_acronym} autoComplete="off" disabled />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Application Description</b>
                                </label>
                                <textarea id="app_description" name="app_description" className="form-control" type="text" placeholder={appData.app_description} autoComplete="off" rows="4" disabled />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Application Release Number</b>
                                </label>
                                <input id="app_rnumber" name="app_rnumber" className="form-control" type="text" placeholder={appData.app_rnumber} autoComplete="off" disabled />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Application Start Date</b>
                                </label>
                                <input id="app_start_date" name="app_start_date" className="form-control" type="date" autoComplete="off" defaultValue={appData.app_start_date ? appData.app_start_date : ""} />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Application End Date</b>
                                </label>
                                <input id="app_end_date" name="app_end_date" className="form-control" type="date" autoComplete="off" defaultValue={appData.app_end_date ? appData.app_end_date : ""} />
                            </div>

                            <div className="form-group">
                                <label htmlFor="group-modify" className="mb-1">
                                    <b>Permission to promote from [Open] State</b>
                                </label>
                                <select name="permit_open" className="form-control" defaultValue={appData.app_permit_open}>
                                    <option value="none">None</option>
                                    {groupData.map((group, index) => (
                                        <option key={index} value={group.groupName}>
                                            {group.groupName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="group-modify" className="mb-1">
                                    <b>Permission to promote/demote from [Todo] State</b>
                                </label>
                                <select name="permit_todo" className="form-control" defaultValue={appData.app_permit_todolist}>
                                    <option value="none">None</option>
                                    {groupData.map((group, index) => (
                                        <option key={index} value={group.groupName}>
                                            {group.groupName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="group-modify" className="mb-1">
                                    <b>Permission to promote/demote from [Doing] State</b>
                                </label>
                                <select name="permit_doing" className="form-control" defaultValue={appData.app_permit_doing}>
                                    <option value="none">None</option>
                                    {groupData.map((group, index) => (
                                        <option key={index} value={group.groupName}>
                                            {group.groupName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="group-modify" className="mb-1">
                                    <b>Permission to promote/demote from [Done] State</b>
                                </label>
                                <select name="permit_done" className="form-control" defaultValue={appData.app_permit_done}>
                                    <option value="none">None</option>
                                    {groupData.map((group, index) => (
                                        <option key={index} value={group.groupName}>
                                            {group.groupName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="group-modify" className="mb-1">
                                    <b>Permission to create tasks</b>
                                </label>
                                <select name="permit_create" className="form-control" defaultValue={appData.app_permit_create}>
                                    <option value="none">None</option>
                                    {groupData.map((group, index) => (
                                        <option key={index} value={group.groupName}>
                                            {group.groupName}
                                        </option>
                                    ))}
                                </select>
                            </div>


                        </form>
                    </>
                }
                onSave={handleSaveChanges}
                onCancel={closeModal}
                showSaveButton={true}
            />
        );
    };

    const CreateAppModal = ({ isModalOpen, closeModal }) =>     
    {
        async function handleSaveChanges(e)
        {
            e.preventDefault();
            refreshData();

            if (await handleGroupAuthorisation("\\.Project Lead\\.") === false)
            {
                window.scrollTo(0, 0);
                closeModal();
            }
            else
            {
                const formData = new FormData(e.target);
                const data = {};
                for (let [key, value] of formData.entries()) { data[key] = value; }
                // Perform the necessary actions to save the edited task

                if (!data.app_acronym || !data.app_description)
                {
                    appDispatch({ type: "flashMessage", value: "App acronym and description are mandatory fields" });
                    return true;
                }

                console.log(JSON.stringify(data));
                async function CreateApp()
                {
                    try
                    {
                        const response = await Axios.post(
                            "/createApp",
                            {
                                app_acronym: data.app_acronym,
                                app_description: data.app_description,
                                app_rnumber: data.app_rnumber,
                                app_start_date: data.app_start_date,
                                app_end_date: data.app_end_date,
                                app_permit_open: data.permit_open,
                                app_permit_todo: data.permit_todo,
                                app_permit_doing: data.permit_doing,
                                app_permit_done: data.permit_done,
                                app_permit_create: data.permit_create,
                                role: "\\.Project Lead\\."
                            },
                            { headers: { Authorization: `Bearer ${appState.user.token}` } }
                        );
                        appDispatch({ type: "flashMessage", value: "Application successfully created!" });
                        return true;
                    } catch (e)
                    {
                        appDispatch({ type: "flashMessage", value: "Error creating application" });
                        return false;
                    }
                }
                CreateApp().then(getApps()).then(navigate(`/board/${data.app_acronym}`));
                window.scrollTo(0, 0);
                closeModal();
            }
        };

        return (
            <Modal
                isModalOpen={isModalOpen}
                closeModal={closeModal}
                title={`Create Application`}
                content={
                    <>
                        <form id="modalForm" onSubmit={handleSaveChanges}>
                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Application Acronym (mandatory)</b>
                                </label>
                                <input id="app_acronym" name="app_acronym" className="form-control" type="text" placeholder="Enter application acronym" autoComplete="off" />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Application Description (mandatory)</b>
                                </label>
                                <textarea id="app_description" name="app_description" className="form-control" type="text" placeholder="Enter task description" autoComplete="off" />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Application Release Number</b>
                                </label>
                                <input id="app_rnumber" name="app_rnumber" className="form-control" type="number" min="1" placeholder="Enter application rnumber" autoComplete="off"
                                    defaultValue="1" />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Application Start Date</b>
                                </label>
                                <input id="app_start_date" name="app_start_date" className="form-control" type="date" autoComplete="off" />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Application End Date</b>
                                </label>
                                <input id="app_end_date" name="app_end_date" className="form-control" type="date" autoComplete="off" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="group-modify" className="mb-1">
                                    <b>Permission to promote from [Open] State</b>
                                </label>
                                <select name="permit_open" className="form-control">
                                    <option value="none">None</option>
                                    {groupData.map((group, index) => (
                                        <option key={index} value={group.groupName}>
                                            {group.groupName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="group-modify" className="mb-1">
                                    <b>Permission to promote/demote from [Todo] State</b>
                                </label>
                                <select name="permit_todo" className="form-control">
                                    <option value="none">None</option>
                                    {groupData.map((group, index) => (
                                        <option key={index} value={group.groupName}>
                                            {group.groupName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="group-modify" className="mb-1">
                                    <b>Permission to promote/demote from [Doing] State</b>
                                </label>
                                <select name="permit_doing" className="form-control">
                                    <option value="none">None</option>
                                    {groupData.map((group, index) => (
                                        <option key={index} value={group.groupName}>
                                            {group.groupName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="group-modify" className="mb-1">
                                    <b>Permission to promote/demote from [Done] State</b>
                                </label>
                                <select name="permit_done" className="form-control">
                                    <option value="none">None</option>
                                    {groupData.map((group, index) => (
                                        <option key={index} value={group.groupName}>
                                            {group.groupName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="group-modify" className="mb-1">
                                    <b>Permission to create tasks</b>
                                </label>
                                <select name="permit_create" className="form-control">
                                    <option value="none">None</option>
                                    {groupData.map((group, index) => (
                                        <option key={index} value={group.groupName}>
                                            {group.groupName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                        </form>
                    </>
                }
                onSave={handleSaveChanges}
                onCancel={closeModal}
                showSaveButton={true}
            />
        );
    };

    //Plan Management
    const CreatePlanModal = ({ isModalOpen, closeModal }) =>
    {
        async function handleSaveChanges(e)
        {
            e.preventDefault();

            refreshData();

            if (await handleGroupAuthorisation("\\.Project Manager\\.") === false)
            {
                window.scrollTo(0, 0);
                closeModal();
            }
            else
            {
                const formData = new FormData(e.target);
                const data = {};
                for (let [key, value] of formData.entries()) { data[key] = value; }

                if (!data.plan_mvp_name)
                {
                    appDispatch({ type: "flashMessage", value: "Plan name is a mandatory field" });
                    return true;
                }

                async function CreatePlan()
                {
                    try
                    {
                        const response = await Axios.post(
                            "/createPlan",
                            {
                                plan_app_acronym: app_acronym_param,
                                plan_mvp_name: data.plan_mvp_name,
                                plan_start_date: data.plan_start_date,
                                plan_end_date: data.plan_end_date,
                                plan_colour: data.plan_colour,
                                role: "\\.Project Manager\\."
                            },
                            { headers: { Authorization: `Bearer ${appState.user.token}` } }
                        );
                        appDispatch({ type: "flashMessage", value: "Plan successfully created!" });
                        return true;
                    } catch (e)
                    {
                        appDispatch({ type: "flashMessage", value: "Error creating plan." });
                        return false;
                    }
                }
                CreatePlan().then(getPlans);
                window.scrollTo(0, 0);
                closeModal();
            }
        };

        return (
            <Modal
                isModalOpen={isModalOpen}
                closeModal={closeModal}
                title={`Create Plan`}
                content={
                    <>
                        <form id="modalForm" onSubmit={handleSaveChanges}>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Plan Name</b>
                                </label>
                                <input id="plan_mvp_name" name="plan_mvp_name" className="form-control" type="text" placeholder="Enter plan name" autoComplete="off" />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Application Start Date</b>
                                </label>
                                <input id="plan_start_date" name="plan_start_date" className="form-control" type="date" autoComplete="off" />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Application End Date</b>
                                </label>
                                <input id="plan_end_date" name="plan_end_date" className="form-control" type="date" autoComplete="off" />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Plan colour</b>
                                </label>
                                <input id="plan_colour" name="plan_colour" className="form-control" type="color" />
                            </div>

                        </form>
                    </>
                }
                onSave={handleSaveChanges}
                onCancel={closeModal}
                showSaveButton={true}
            />
        );
    };

    const EditPlanModal = ({ isModalOpen, closeModal }) =>
    {
        const [selectedPlan, setSelectedPlan] = useState(null);

        async function getSelectedPlan(e)
        {
            setSelectedPlan(await getPlan(e.target.value));
        }

        async function handleSaveChanges(e)
        {
            e.preventDefault();

            refreshData();

            if (await handleGroupAuthorisation("\\.Project Manager\\.") === false)
            {
                window.scrollTo(0, 0);
                closeModal();
            }
            else
            {
                const formData = new FormData(e.target);
                const data = {};
                for (let [key, value] of formData.entries()) { data[key] = value; }

                async function ModifyPlan()
                {
                    try
                    {
                        const response = await Axios.post(
                            "/modifyPlan",
                            {
                                plan_mvp_name: selectedPlan.plan_mvp_name,
                                plan_start_date: data.plan_start_date,
                                plan_end_date: data.plan_end_date,
                                role: "\\.Project Manager\\."
                            },
                            { headers: { Authorization: `Bearer ${appState.user.token}` } }
                        );
                        appDispatch({ type: "flashMessage", value: "Plan successfully modified!" });
                        return true;
                    } catch (e)
                    {
                        appDispatch({ type: "flashMessage", value: "Error modifying plan." });
                        return false;
                    }
                }
                ModifyPlan().then(getPlans);
                window.scrollTo(0, 0);
                closeModal();
            }
        };

        return (
            <Modal
                isModalOpen={isModalOpen}
                closeModal={closeModal}
                title={`Edit Plan`}
                content={
                    <>
                        <form id="modalForm" onSubmit={handleSaveChanges}>

                            <div className="dropdown form-group">
                                <select className="form-control" name="dropdownMenuButton" onChange={getSelectedPlan}>
                                    <option value="">Select Plan</option>
                                    {planData.map((plan) => (
                                        <option key={plan.plan_mvp_name} value={plan.plan_mvp_name}>
                                            {plan.plan_mvp_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Application Start Date</b>
                                </label>
                                <input id="plan_start_date" name="plan_start_date" className="form-control" type="date" defaultValue={selectedPlan ? selectedPlan.plan_start_date : ""} />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Application End Date</b>
                                </label>
                                <input id="plan_end_date" name="plan_end_date" className="form-control" type="date" defaultValue={selectedPlan ? selectedPlan.plan_end_date : ""} />
                            </div>

                        </form>
                    </>
                }
                onSave={handleSaveChanges}
                onCancel={closeModal}
                showSaveButton={true}
            />
        );
    };

    const ViewPlanModal = ({ isModalOpen, closeModal }) =>
    {
        const [selectedPlan, setSelectedPlan] = useState(null);

        async function getSelectedPlan(e)
        {
            setSelectedPlan(await getPlan(e.target.value));
        }

        return (
            <Modal
                isModalOpen={isModalOpen}
                closeModal={closeModal}
                title={`Edit Plan`}
                content={
                    <>
                        <form id="modalForm">

                            <div className="dropdown form-group">
                                <select className="form-control" name="dropdownMenuButton" onChange={getSelectedPlan}>
                                    <option value="">Select Plan</option>
                                    {planData.map((plan) => (
                                        <option key={plan.plan_mvp_name} value={plan.plan_mvp_name}>
                                            {plan.plan_mvp_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Application Start Date</b>
                                </label>
                                <input id="plan_start_date" name="plan_start_date" className="form-control" type="date" defaultValue={selectedPlan ? selectedPlan.plan_start_date : ""} disabled />
                            </div>

                            <div className="form-group">
                                <label className="mb-1">
                                    <b>Application End Date</b>
                                </label>
                                <input id="plan_end_date" name="plan_end_date" className="form-control" type="date" defaultValue={selectedPlan ? selectedPlan.plan_end_date : ""} disabled />
                            </div>

                        </form>
                    </>
                }
                onSave={null}
                onCancel={closeModal}
                showSaveButton={false}
            />
        );
    };

    async function refreshData()
    {
        await getUser();
        await getGroups();
        await getApps();
        await getApp();
        await getPlans();
        await getTasks();
    }

    //Execute on first run
    useEffect(() => 
    {
        refreshData();
    }, []);

    //Execute when location changes
    useEffect(() =>
    {
        refreshData();
    }, [location]);

    return (
        <Page title="Task Management System" wide={true}>
            <div className="d-flex justify-content-between">
                <div className="d-flex justify-content-start">
                    {userData.userGroup && userData.userGroup.includes("Project Lead") && (
                        <div className="flex-row mr-3">
                            <button className="btn btn-md btn-secondary" onClick={async () => { (await handleGroupAuthorisation("\\.Project Lead\\.")) ? setIsCreateAppOpen(true) : null; }}>
                                Create Application</button>
                        </div>
                    )}

                    {app_acronym_param && appData && userData.userGroup.includes("Project Manager") && (
                        <div className="flex-row mr-3">
                            <button className="btn btn-md btn-secondary" onClick={async () => { (await handleGroupAuthorisation("\\.Project Manager\\.")) ? setIsCreatePlanOpen(true) : null; }}>
                                Create Plan</button>
                        </div>
                    )}
                    {app_acronym_param && appData && userData.userGroup.includes(appData.app_permit_create) && (
                        <div className="flex-row">
                            <button className="btn btn-md btn-secondary" onClick={async () => { (await handleGroupAuthorisation(`\\.${appData.app_permit_create}\\.`)) ? setIsCreateTaskOpen(true) : null; }}>
                                Create Task</button>
                        </div>
                    )}
                </div>

                <h3>{app_acronym_param}</h3>

                <div className="d-flex justify-content-end">
                    {app_acronym_param && appData && userData.userGroup.includes("Project Lead") && (
                        <div className="mr-3">
                            <button className="btn btn-md btn-secondary" onClick={async () => { (await handleGroupAuthorisation("\\.Project Lead\\.")) ? setIsEditAppOpen(true) : null; }}>
                                View/Edit Application</button>
                        </div>
                    )}

                    {app_acronym_param && appData && !userData.userGroup.includes("Project Lead") && (
                        <div className="mr-3">
                            <button className="btn btn-md btn-secondary" onClick={() => setIsViewAppOpen(true)}>
                                View Application</button>
                        </div>
                    )}

                    {app_acronym_param && appData && userData.userGroup.includes("Project Manager") && (
                        <div className="mr-3">
                            <button className="btn btn-md btn-secondary" onClick={async () => { (await handleGroupAuthorisation("\\.Project Manager\\.")) ? setIsEditPlanOpen(true) : null; }}>
                                View/Edit Plan</button>
                        </div>
                    )}

                    {app_acronym_param && appData && !userData.userGroup.includes("Project Manager") && (
                        <div className="mr-3">
                            <button className="btn btn-md btn-secondary" onClick={() => setIsViewPlanOpen(true)}>
                                View Plan</button>
                        </div>
                    )}

                    <div className="dropdown">
                        <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown">
                            Select Application
                        </button>
                        <div className="dropdown-menu">
                            {allApps.map((app, index) => (
                                <Link key={index} className="dropdown-item" to={`/board/${app.app_acronym}`}>{app.app_acronym}</Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Kanban Board Container */}
            <div className="kanban-board my-3">
                {/* Nested .map() to generate columns and cards */}
                {Object.entries(taskData).map(([state, tasks]) => (
                    <div key={state} className="kanban-column">
                        <h3 className="text-center my-1">{state.charAt(0).toUpperCase() + state.slice(1).replace("State", "")}</h3>
                        {tasks.map((task) => (
                            <div key={task.task_name} className="kanban-card text-center" style={{ borderColor: getPlanColor(task.task_plan) }}>
                                <b>({task.task_id})<br /></b>
                                {task.task_name}<br />
                                {task.task_description}<br />
                                {state.toUpperCase() !== "OPENSTATE" && state.toUpperCase() !== "TODOSTATE" && hasPermissionForState(state) && ( // Check the state here
                                    <button className="btn btn-sm btn-secondary mx-3 mt-2" onClick={async () =>
                                    {
                                        (await handleStateAuthorisation(state)) ? handleEditTask(task, "Demote") : null;
                                    }}>&lt; &lt;</button>
                                )}

                                {hasPermissionForState(state) && (
                                    <button className="btn btn-sm btn-secondary mt-2" onClick={async () =>
                                    {
                                        (await handleStateAuthorisation(state)) ? handleEditTask(task, "Edit") : null;
                                    }}>Edit</button>
                                )}

                                {!hasPermissionForState(state) && (
                                    <button className="btn btn-sm btn-secondary mt-2" onClick={() => handleEditTask(task, "View")}>View</button>
                                )}

                                {hasPermissionForState(state) && ( // Check the state here
                                    <button className="btn btn-sm btn-secondary mx-3 mt-2" onClick={async () =>
                                    {
                                        (await handleStateAuthorisation(state)) ? handleEditTask(task, "Promote") : null;
                                    }}>&gt;&gt;</button>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div >

            {/* Render the ViewTaskModal when isViewTaskOpen is true */}
            {
                isViewTaskOpen && (
                    <ViewTaskModal
                        isModalOpen={isViewTaskOpen}
                        closeModal={() => setIsViewTaskOpen(false)}
                        task={selectedTask}
                    />
                )
            }

            {/* Render the EditTaskModal when isEditTaskOpen is true */}
            {
                isEditTaskOpen && (
                    <EditTaskModal
                        isModalOpen={isEditTaskOpen}
                        closeModal={() => setIsEditTaskOpen(false)}
                        task={selectedTask}
                    />
                )
            }

            {/* Render the CreateTaskModal when isCreateTaskOpen is true */}
            {
                isCreateTaskOpen && (
                    <CreateTaskModal
                        isModalOpen={isCreateTaskOpen}
                        closeModal={() => setIsCreateTaskOpen(false)}
                    />
                )
            }

            {/* Render the ViewAppModal when isViewAppOpen is true */}
            {
                isViewAppOpen && (
                    <ViewAppModal
                        isModalOpen={isViewAppOpen}
                        closeModal={() => setIsViewAppOpen(false)}
                    />
                )
            }

            {/* Render the EditAppModal when isEditAppOpen is true */}
            {
                isEditAppOpen && (
                    <EditAppModal
                        isModalOpen={isEditAppOpen}
                        closeModal={() => setIsEditAppOpen(false)}
                    />
                )
            }

            {/* Render the CreateAppModal when isCreateAppOpen is true */}
            {
                isCreateAppOpen && (
                    <CreateAppModal
                        isModalOpen={isCreateAppOpen}
                        closeModal={() => setIsCreateAppOpen(false)}
                    />
                )
            }

            {/* Render the CreatePlanModal when isCreatePlanOpen is true */}
            {
                isViewPlanOpen && (
                    <ViewPlanModal
                        isModalOpen={isViewPlanOpen}
                        closeModal={() => setIsViewPlanOpen(false)}
                    />
                )
            }

            {/* Render the EditPlanModal when isEditPlanOpen is true */}
            {
                isEditPlanOpen && (
                    <EditPlanModal
                        isModalOpen={isEditPlanOpen}
                        closeModal={() => setIsEditPlanOpen(false)}
                    />
                )
            }

            {/* Render the CreatePlanModal when isCreatePlanOpen is true */}
            {
                isCreatePlanOpen && (
                    <CreatePlanModal
                        isModalOpen={isCreatePlanOpen}
                        closeModal={() => setIsCreatePlanOpen(false)}
                    />
                )
            }
        </Page >
    );
}

export default Board;