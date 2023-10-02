package com.tms.a1.config.security.filter;

import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tms.a1.config.security.SecurityConstants;
import com.tms.a1.config.security.manager.CustomAuthenticationManager;
import com.tms.a1.entity.User;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;

@AllArgsConstructor
public class AuthenticationFilter extends UsernamePasswordAuthenticationFilter {

    @Autowired
    private SecurityConstants securityConstants;
    
    private CustomAuthenticationManager authenticationManager;

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        try {
            User user = new ObjectMapper().readValue(request.getInputStream(), User.class);
            
            // The below code is to create an authentication object and pass to our authentication manager to authenticate the user from our database record.
            Authentication authentication = new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword());

            // The authenticate method when return with the authentication object which the manager checks from userInput based on the above user
            // Spring internally will invoke either the unsuccessfulauthentication or the successfulauthentication method depending on the 2 diff scenario
            return authenticationManager.authenticate(authentication);
        } catch (IOException e) {
            throw new RuntimeException();
        } 
    }

    // Pending what the authencationManager returns after invoking the authenticate method above. it will trigger either the unsuccessfulauthentication or successfulauthentication
    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response, AuthenticationException failed) throws IOException, ServletException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write(failed.getMessage());
        response.getWriter().flush();
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult) throws IOException, ServletException {
        
        // Get the client's IP address from the request
        String clientIpAddress = getClientIpAddress(request);
        
        // Get the user agent (browser type) from the request
        String userAgent = request.getHeader("User-Agent");

        String token = JWT.create()
            .withSubject(authResult.getName())  //username is saved as 'subject'
            .withExpiresAt(new Date(System.currentTimeMillis() + securityConstants.getTokenExp()))
            .withClaim("ipAddress", clientIpAddress) // Add IP address as a custom claim
            .withClaim("userAgent", userAgent) // Add user agent as a custom claim
            .sign(Algorithm.HMAC512(securityConstants.getSecretKey()));
        // Create a cookie to hold the JWT token
        Cookie cookie = new Cookie(securityConstants.getCookieName(), token);
        
        // Set the cookie's path and other attributes as needed
        cookie.setPath("/"); // Set the cookie path to "/" to make it accessible to all paths
        cookie.setMaxAge(securityConstants.getTokenExp() / 1000); // Set the cookie's max age in seconds
        cookie.setHttpOnly(true); // Make the cookie HTTP-only for added security frontend js cannot access
        System.out.println();
        
        // Add the cookie to the response
        response.addCookie(cookie);
        // Create a JSON response object
        Map<String, String> jsonResponse = new HashMap<>();
        jsonResponse.put("status", String.valueOf(HttpServletResponse.SC_OK));
        jsonResponse.put("msg", "You are logged In!");
        
        // Set the response content type to JSON
        response.setContentType("application/json");
        
        // Set the HTTP status code to 200 (OK)
        response.setStatus(HttpServletResponse.SC_OK);
        
        // Write the JSON response to the response output stream
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.writeValue(response.getWriter(), jsonResponse);
        }

    private String getClientIpAddress(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        return ipAddress;
    }

}
