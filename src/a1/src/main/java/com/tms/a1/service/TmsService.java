package com.tms.a1.service;

import java.lang.reflect.Field;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.tms.a1.dao.TmsDAO;
import com.tms.a1.dao.UserDAO;
import com.tms.a1.entity.Application;
import com.tms.a1.entity.Plan;
import com.tms.a1.entity.Task;
import com.tms.a1.entity.User;
import com.tms.a1.exception.EntityNotFoundException;

@Service
public class TmsService {
    @Autowired
    private TmsDAO tmsRepo;

    @Autowired
    private UserDAO userRepo;

    @Autowired
    private JavaMailSender javaMailSender;

    // Get All Apps
    public List<Application> getAllApps() {
        return tmsRepo.findAllApps();
    }

    // Get Single App
    public Application getApp(String appacronym) {
        try {
            Application app = tmsRepo.findByApp(appacronym);
            if (app != null) {
                return app;
            } else {
                throw new EntityNotFoundException(appacronym, Application.class);
            }
        } catch (Exception e) {
            System.out.println(e);
            return null;
        }
    }

    // Create New App
    public String newApp(Application app) {
        if (tmsRepo.existByAppAcronym(app.getAppAcronym())) {
            return "Duplicate";
        }

        tmsRepo.saveApp(app);
        return "Success";
    }

    // Update App
    public String updateApp(String appacronym, Application app) {
        Application existingApp = tmsRepo.findByApp(appacronym);
        if (existingApp != null) {
            existingApp.setAppStartDate(app.getAppStartDate());
            existingApp.setAppEndDate(app.getAppEndDate());
            existingApp.setAppPermitOpen(app.getAppPermitOpen());
            existingApp.setAppPermitToDoList(app.getAppPermitToDoList());
            existingApp.setAppPermitDoing(app.getAppPermitDoing());
            existingApp.setAppPermitDone(app.getAppPermitDone());
            existingApp.setAppPermitCreate(app.getAppPermitCreate());

            tmsRepo.saveApp(existingApp);
            return "Success";
        } else {
            return "App not found";
        }
    }

    // Get All Plans
    public List<Plan> getAllPlans(String appacronym) {
        return tmsRepo.findAllPlans(appacronym);
    }

    // Get single Plan
    public Plan getPlan(String planid, String appacronym) {
        try {
            System.out.println("********************");
            System.out.println("In plan service layer");
            System.out.println(planid);
            System.out.println("*********************");
            Plan plan = tmsRepo.findByPlan(planid, appacronym);
            if (plan != null) {
                return plan;
            } else {
                throw new EntityNotFoundException(planid, Plan.class);
            }
        } catch (Exception e) {
            System.out.println(e);
            return null;
        }
    }

    // Create New Plan
    public String newPlan(Plan plan, String appacronym) {
        // check if app exists
        if (!tmsRepo.existByAppAcronym(appacronym)) {
            return "NonexistentApp";
        }

        // check for duplicate plan name
        if (tmsRepo.existByPlanMVPName(plan.getPlanMVPName())) {
            return "Duplicate";
        }
        plan.setPlanAppAcronym(appacronym);
        tmsRepo.savePlan(plan);
        return "Success";
    }

    // Update plan
    public String updatePlan(String appacronym, String planid, Plan plan) {
        Plan existingPlan = tmsRepo.findByPlan(planid, appacronym);
        System.out.println(existingPlan);
        if (existingPlan != null) {
            // Update plans's information
            // Iterate over the fields of the Plan class
            for (Field field : Plan.class.getDeclaredFields()) {
                field.setAccessible(true);
                try {
                    // Get the field name and value from the request body
                    String fieldName = field.getName();
                    Object fieldValue = field.get(plan);

                    // Check if the field value is not null and update the existingPlan
                    if (fieldValue != null) {
                        Field existingField = Plan.class.getDeclaredField(fieldName);
                        existingField.setAccessible(true);
                        existingField.set(existingPlan, fieldValue);
                    }

                } catch (Exception e) {
                    // Handle any exceptions or errors
                    e.printStackTrace();
                    return "Error updating plan";
                }
            }
            // Save the updated plan back to the repository
            tmsRepo.savePlan(existingPlan);
            return "Success";
        } else {
            return "Plan not found";
        }
    }

    // Get All Tasks
    public List<Task> getAllTasks(String appacronym) {
        return tmsRepo.findAllTasks(appacronym);
    }

    // Get Single Task
    public Task getTask(String taskid, String appacronym) {
        try {
            Task task = tmsRepo.findByTask(taskid, appacronym);
            if (task != null) {
                return task;
            } else {
                throw new EntityNotFoundException(taskid, Task.class);
            }
        } catch (Exception e) {
            System.out.println(e);
            return null;
        }
    }

    // Create New Task
    public String newTask(Task task, String appacronym) {

        try {
            if (task == null) {
                return "Task object is null"; // Handle the case where task is null
            }
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            // if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            String task_action_message = "Created";
            String task_state = "OPEN";
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss z");
            ZonedDateTime currentZonedDateTime = ZonedDateTime.now();
            String formattedDateTime = currentZonedDateTime.format(formatter);
            String updateMessage = task_action_message + " by: " + username + "\n" + task_action_message + " on: " + formattedDateTime + "\n" + "State: " + task_state + "\n";
            String taskNotes = task.getTaskNotes();
            if (taskNotes != null && !taskNotes.isEmpty()) {
                updateMessage = updateMessage +  "________________________________________________________\n" + taskNotes;
            }
            task.setTaskCreateDate(formattedDateTime);
            task.setTaskCreator(username);
            task.setTaskOwner(username);
            task.setTaskState(task_state);
            task.setTaskAppAcronym(appacronym);
            task.setTaskNotes(updateMessage);
            Application application = tmsRepo.findByApp(appacronym);
            List<Plan> plans = getAllPlans(appacronym);
            int appRNumber = application.getAppRNumber();
            task.setTaskID(appacronym + "_" + appRNumber);

            if (task.getTaskName() == null || task.getTaskName().isEmpty()) {
                return "Please input task name";
            }
            if (task.getTaskDescription() == null || task.getTaskDescription().isEmpty()) {
                return "Please input task description";
            }
            String plan = task.getTaskPlan();
            if (plan != null && !plan.isEmpty()) {
                boolean isValidPlan = false;

                for (Plan availablePlan : plans) {
                    if (availablePlan.getPlanMVPName().equals(plan)) {
                        isValidPlan = true;
                        break; // Exit the loop since a match is found
                    }
                }

                if (!isValidPlan) {
                    return "Invalid task plan"; // Return an error message if no match is found
                }
            }

            // Rest of your code for saving the task and returning success

            tmsRepo.saveTask(task);
            application.setAppRNumber(appRNumber + 1);
            tmsRepo.saveApp(application);

            System.out.println(application);
            System.out.println(task);
            return "Success";
            // } else {
            // throw new EntityNotFoundException("You are not an authenticated user",
            // User.class);
            // }
        } catch ( Exception e) {
            e.printStackTrace(); // Log the exception stack trace
            return "An error occurred: " + e.getMessage(); // Return the exception message
        }
    }

    // Update Task
    public Map<String, String> updateTask(String appacronym, String taskid, Map<String, String> requestBody) {
        try {
            Task existingTask = tmsRepo.findByTask(taskid, appacronym);
            if (existingTask != null) {
                String task_action_message = "";
                System.out.println(requestBody.get("task_action"));
                if (requestBody.get("task_action").equals("Edit")) {
                    task_action_message = "Modified";
                }
                if (requestBody.get("task_action").equals("Promote")) {
                    task_action_message = "Promoted";
                    System.out.println(task_action_message);
                }

                if (requestBody.get("task_action").equals("Demote")) {
                    task_action_message = "Demoted";
                }

                String task_state_new = requestBody.get("task_state");
                System.out.println(task_state_new);
                System.out.println(task_action_message);
                if (task_action_message.equals("Promoted")) {
                    switch (requestBody.get("task_state")) {
                        case "OPEN":
                            task_state_new = "TODO";
                            break;
                        case "TODO":
                            task_state_new = "DOING";
                            break;
                        case "DOING":
                            task_state_new = "DONE";
                            break;
                        case "DONE":
                            task_state_new = "CLOSED";
                            break;
                    }
                } else if (task_action_message.equals("Demoted")) {
                    switch (requestBody.get("task_state")) {

                        case "DOING":
                            task_state_new = "TODO";
                            break;
                        case "DONE":
                            task_state_new = "DOING";
                            break;
                    }
                }
                System.out.println(task_state_new);
                String varState = (task_action_message.equals("Modified")) ? "[" + requestBody.get("task_state") + "]"
                        : "[" + requestBody.get("task_state") + "] >>> [" + task_state_new + "]";
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss z");
                ZonedDateTime currentZonedDateTime = ZonedDateTime.now();
                String formattedDateTime = currentZonedDateTime.format(formatter);
                String updateMessage = "________________________________________________________\n"
                        + task_action_message + " by:" + requestBody.get("task_owner") + "\n" + task_action_message
                        + " on:" + formattedDateTime + "\n" + "State:" + varState + "\n";
                if (requestBody.get("task_plan_current") != requestBody.get("task_plan_new")) {
                    updateMessage += "Plan changed from [" + requestBody.get("task_plan_current") + "] to [ "
                            + requestBody.get("task_plan_new") + "]\n";
                    

                } 
                String updatedNotes = "";
                if (!requestBody.get("task_notes_new").isEmpty()) {
                    updatedNotes = updateMessage + "Notes: " + requestBody.get("task_notes_new") + "\n";
                            
                    updatedNotes += "_______________________________________________________________________\n";
                    updatedNotes += requestBody.get("task_notes_current");
                    existingTask.setTaskOwner(requestBody.get("task_owner"));
                } else if (task_action_message.equals("Modified")
                        && !requestBody.get("task_plan_current").equals(requestBody.get("task_plan_new"))) {
                    updatedNotes = updateMessage + "\n";
                    updatedNotes += "_______________________________________________________________________\n";
                    updatedNotes += requestBody.get("task_notes_current");

                    existingTask.setTaskOwner(requestBody.get("task_owner"));
                } else {
                    updatedNotes = requestBody.get("task_notes_current");
                }
                existingTask.setTaskNotes(updatedNotes);
                System.out.println(updatedNotes);
                existingTask.setTaskPlan(requestBody.get("task_plan_new"));

                existingTask.setTaskState(task_state_new);

                tmsRepo.saveTask(existingTask);
                Map<String, String> response = new HashMap<>();
                response.put("msg", "Success");
                if ((requestBody.get("task_action").equals("Promote")) && (task_state_new.equals("DONE"))) {
                    response.put("email", "true");
                } else {
                    response.put("email", "false");
                }

                return response;
            } else {
                return null;
            }
        } catch (

        Exception e) {
            e.printStackTrace(); // Log the exception stack trace
            return null; // Return the exception message
        }
    }

    // Has Access to
    public Boolean hasAccess(Map<String, String> requestBody) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                String username = authentication.getName();
                String app = requestBody.get("appAcronym");
                String state = requestBody.get("appState");
                switch (state) {
                    case "OPEN":
                        state = "Open";
                        break;
                    case "TODO":
                        state = "Todolist";
                        break;
                    case "DOING":
                        state = "Doing";
                        break;
                    case "DONE":
                        state = "Done";
                    case "CLOSED":
                        state = "Closed";
                        break;
                }
                List<String> grouplist = tmsRepo.getPermit(app, state);
                String group = grouplist.get(0);
                List result = userRepo.checkgroup(username, group);
                if (result != null && !result.isEmpty()) {

                    return true;
                } else {

                    return false;
                }
            }
            return null;
        } catch (Exception e) {
            System.out.println(e);
            return null;
        }
    }

    @Async
    public void sendEmail(String app, String task_id) {
        List<String> grouplist = tmsRepo.getPermit(app, "Done");
        String group = grouplist.get(0);
        List<User> emails = userRepo.findEmail(group);
        for (User user : emails) {
            if (!user.getEmail().isEmpty()) {
                String to = user.getEmail();
                String subject = "Task Promoted";
                String text = task_id + " Has been promoted to Done";
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(to);
                message.setSubject(subject);
                message.setText(text);
                javaMailSender.send(message);
            }
        }

    }

}
