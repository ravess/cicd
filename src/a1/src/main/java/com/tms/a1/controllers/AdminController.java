package com.tms.a1.controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.tms.a1.entity.Group;
import com.tms.a1.entity.User;
import com.tms.a1.service.AdminService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@RestController
public class AdminController {

    @Autowired
    private AdminService adminService;

    // get all users
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        String resMsg;
        Map<String, Object> response = new HashMap<>();

        List permitted = adminService.checkGroup();
        if(permitted != null && !permitted.isEmpty()){
            List<User> allusers = adminService.getAllUsers();
            if (allusers != null && !allusers.isEmpty()) {
                response.put("data", allusers);
                return new ResponseEntity<>(response, HttpStatus.OK);
            }else{
                resMsg = "No Users Found.";
                response.put("msg", resMsg);
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
        } else {
            resMsg = "You are unauthorized for this action";
            response.put("msg", resMsg);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    // get all groups
    @GetMapping("/getGroups")
    public ResponseEntity<?> getAllGroups() {
        String resMsg;
        Map<String, Object> response = new HashMap<>();

        // List permitted = adminService.checkGroup();
        // if(permitted != null && !permitted.isEmpty()){
            List<Group> allgroups = adminService.getAllGroups();
            if (allgroups != null && !allgroups.isEmpty()) {
                response.put("data", allgroups);
                return new ResponseEntity<>(response, HttpStatus.OK);
            }else{
                resMsg = "No Groups Found.";
                response.put("msg", resMsg);
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
        // } else {
        //     resMsg = "You are unauthorized for this action";
        //     response.put("msg", resMsg);
        //     return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        // }
    }

    // get user by username
    @GetMapping("/users/{username}")
    public ResponseEntity<Object> getUser(@PathVariable String username) {
        String resMsg;
        Map<String, Object> response = new HashMap<>();

        List permitted = adminService.checkGroup();
        if(permitted != null && !permitted.isEmpty()){
            User user = adminService.getUser(username);
            if (user != null) {
                return new ResponseEntity<>(user, HttpStatus.OK);
            } else {
                resMsg = "User does not exist";
                response.put("msg", resMsg);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        }else{
            resMsg = "You are unauthorized for this action";
            response.put("msg", resMsg);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    // create new group
    @PostMapping("/createGroup")
    public ResponseEntity<?> createGroup(@RequestBody Group requestBodyGroup) {
        String resMsg;
        Map<String, Object> response = new HashMap<>();

        List permitted = adminService.checkGroup();
        if(permitted != null && !permitted.isEmpty()){
            String res = adminService.createGroup(requestBodyGroup);
            if (res.equals("Success")) {
                resMsg = "New Group " + requestBodyGroup.getGroupName() + " Created.";
                response.put("msg", resMsg);
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else if (res.equals("Duplicate")) {
                resMsg = "Duplicate Group Name.";
                response.put("msg", resMsg);
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            } else {
                resMsg = "An error occurred.";
                response.put("msg", resMsg);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        }else{
            resMsg = "You are unauthorized for this action";
            response.put("msg", resMsg);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
    }

    // create new user
    @PostMapping("/user/new")
    public ResponseEntity<?> addNewUser(@Valid @RequestBody User requestBody, BindingResult bindingResult) {
        Map<String, Object> response = new HashMap<>();
        String resMsg;

        if (bindingResult.hasErrors()) {
            // Handle validation errors here
            Map<String, String> errorMap = new HashMap<>();
            bindingResult.getFieldErrors().forEach(fieldError -> {
                errorMap.put("msg", fieldError.getDefaultMessage());
            });
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMap);
        }

        // List permitted = adminService.checkGroup();
        // if(permitted != null && !permitted.isEmpty()){
            String res = adminService.newUser(requestBody);

            if (res.equals("Success")) {
                resMsg = "User Successfully Created.";
                response.put("msg", resMsg);
                return new ResponseEntity<>(response, HttpStatus.CREATED);
            } else if (res.equals("Duplicate")) {
                resMsg = "Username Already Exists.";
                response.put("msg", resMsg);
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            } else {
                resMsg = "An error occured when creating user";
                response.put("msg", resMsg);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        // }else{
        //     resMsg = "You are unauthorized for this action.";
        //     response.put("msg", resMsg);
        //     return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        // }
    }

    //admin update user
    @PutMapping("/users/{username}")
    public ResponseEntity<?> updateUserByUsername(@PathVariable String username,
    @RequestBody User requestBody,
    BindingResult bindingResult) {
    Map<String, Object> response = new HashMap<>();
    String resMsg;

        if (bindingResult.hasErrors()) {
            // Handle validation errors here
            Map<String, String> errorMap = new HashMap<>();
            bindingResult.getFieldErrors().forEach(fieldError -> {
                errorMap.put("msg", fieldError.getDefaultMessage());
            });
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMap);
        }
        
        List permitted = adminService.checkGroup();
        if(permitted != null && !permitted.isEmpty()){
            String res = adminService.updateUser(username, requestBody);
            if (res.equals("Success")) {
                resMsg = "User Successfully Updated.";
                response.put("msg", resMsg);
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else if (res.equals("Invalid email")) {
                System.out.println(res);
                resMsg = "Invalid email";
                response.put("msg", resMsg);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }else if (res.equals("Invalid password")) {
                resMsg = "Invalid password";
                response.put("msg", resMsg);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            } else {
                resMsg = "An error occurred when updating user.";
                response.put("msg", resMsg);
                System.out.println(resMsg);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        }else{
            resMsg = "You are unauthorized for this action.";
            response.put("msg", resMsg);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

}
