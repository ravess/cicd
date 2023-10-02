package com.tms.a1.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.tms.a1.dao.UserDAO;
import com.tms.a1.entity.User;
import com.tms.a1.exception.EntityNotFoundException;

@Service
public class UserService {

 @Autowired
    private UserDAO userRepo;
    @Autowired
    private PasswordEncoder passwordEncoder; // Inject the PasswordEncoder

    public User getUser(){
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                String username = authentication.getName();
                User user = userRepo.findByUsername(username);
                return user;
            } else {
                return null;
            }
        } catch (Exception e) {
            System.out.println(e);
            return null;
        }
    }

    public User login(String Username){
        User user = userRepo.findByUsername(Username);

        if (user != null) {
            return user;
        } else {
            throw new EntityNotFoundException(Username, User.class);
        }
    }

    public String updateOwnProfile(String newPassword, String newEmail) {
        try{
        // Get the username of the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();

            // Ensure that the user being updated matches the authenticated user
            User authenticatedUser = userRepo.findByUsername(username);
            if (authenticatedUser != null) {

                // Check if newPassword and newEmail are provided
                if (newPassword != null && !newPassword.isEmpty()) {
                    if (!isPasswordValid(newPassword)) {
                        return "Invalid password";
                    }
                    // Hash the new password
                    String hashedPassword = passwordEncoder.encode(newPassword);

                    // Update the user's password and email with the hashed password
                    authenticatedUser.setPassword(hashedPassword);
                } if (newEmail != null && !newEmail.isEmpty()) {
                if (!isValidEmail(newEmail)) {
                        return "Invalid email";
                    }
                    // Update only the user's password with the hashed password
                    authenticatedUser.setEmail(newEmail);
                }
                } 
                userRepo.saveUser(authenticatedUser); // Save the updated user to the database
                return "Success";
            }  else {
            throw new EntityNotFoundException("You are not an authenticated user", User.class);
        }}catch (Exception e) {
            e.printStackTrace(); // Log the exception stack trace
            return "An error occurred: " + e.getMessage(); // Return the exception message
        }
    }
    // Custom validation logic for password
    private boolean isPasswordValid(String password) {
        // Check if the password contains at least one alphabet character, one number,
        // and one special character.
        boolean hasAlphabet = false;
        boolean hasNumber = false;
        boolean hasSpecialCharacter = false;

        for (char ch : password.toCharArray()) {
            if (Character.isLetter(ch)) {
                hasAlphabet = true;
            } else if (Character.isDigit(ch)) {
                hasNumber = true;
            } else if (!Character.isLetterOrDigit(ch)) {
                hasSpecialCharacter = true;
            }

            // If all required conditions are met, return true.
            if (hasAlphabet && hasNumber && hasSpecialCharacter) {
                return true;
            }
        }

        // If any of the required conditions are not met, return false.
        return false;
    }

    // custom validation for email check (if email input is not null/not empty
    // string)
    private boolean isValidEmail(String email) {
        // Regular expression pattern for a valid email address
        String emailPattern = "^[A-Za-z0-9+_.-]+@(.+)$";

        return email.matches(emailPattern);
    }

}