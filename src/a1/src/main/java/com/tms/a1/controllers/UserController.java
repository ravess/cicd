package com.tms.a1.controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.tms.a1.entity.User;
import com.tms.a1.exception.ForbiddenException;
import com.tms.a1.service.UserService;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@RestController
public class UserController {

    @Autowired
    private UserService userService;
    
    @GetMapping("/getUser")
    public ResponseEntity<?> getUser() {
        User user = userService.getUser();
        user.setPassword(null);
        int isActive = user.getIsActive();
        if(isActive == 0){
            throw new ForbiddenException("Your account is inactive");
        }
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

     @PutMapping("/updateProfile")
    public ResponseEntity<?> updateOwnProfile(@RequestBody Map<String, String> updateData) {
        Map<String, Object> response = new HashMap<>();
        String resMsg;

            String newPassword = updateData.get("password");
            String newEmail = updateData.get("email");

            String res = userService.updateOwnProfile(newPassword, newEmail);

            if (res.equals("Success")) {
                resMsg = "User Successfully Updated.";
                response.put("msg", resMsg);
                return new ResponseEntity<>(response, HttpStatus.OK);
            
            } else if (res.equals("You are not an authenticated user")) {
                resMsg = "You are not an authenticated user.";
                response.put("msg", resMsg);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            } else {
                if (res.equals("Invalid email")) {
                    System.out.println(res);
                    resMsg = "Invalid email";
                    response.put("msg", resMsg);
                    System.out.println(resMsg);
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
                }
                if (res.equals("Invalid password")) {
                    resMsg = "Invalid password";
                    response.put("msg", resMsg);
                    System.out.println(resMsg);
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
                } else {
                    System.out.println(res);
                   
                    resMsg = "An error occurred when updating user.";
                }
                response.put("msg", resMsg);
                System.out.println(resMsg);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
    }
}