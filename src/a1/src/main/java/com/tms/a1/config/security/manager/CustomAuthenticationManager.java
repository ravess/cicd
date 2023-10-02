package com.tms.a1.config.security.manager;


import java.util.Arrays;
import java.util.stream.Collectors;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.tms.a1.entity.User;
import com.tms.a1.exception.ForbiddenException;
import com.tms.a1.service.UserService;



@Component
public class CustomAuthenticationManager implements AuthenticationManager {
    @Autowired
    private UserService userService;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;


    // This entire method is to use bcryptencoder and userservice layer to check against our database record if it matches for authentication
    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        User user = userService.login(authentication.getName());
        System.out.println(user.getGroups());
        System.out.println("It came to authenticationmanager");
        if (!passwordEncoder.matches(authentication.getCredentials().toString(), user.getPassword())) {
            throw new BadCredentialsException("Invalid Username/Password");
        }
      
        if (user.getIsActive() == 0) {
            throw new ForbiddenException("Your account is inactive");
        }
        

        // The below still returns an authentication object after it passes through all the database check for correct password and user. Spring will internally invoke the successfulauthenticationattempt
        return new UsernamePasswordAuthenticationToken(authentication.getName(), user.getPassword());
    }



}
