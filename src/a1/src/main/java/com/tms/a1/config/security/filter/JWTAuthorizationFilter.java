package com.tms.a1.config.security.filter;

import java.io.IOException;
import java.util.Arrays;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.tms.a1.config.security.SecurityConstants;
import com.tms.a1.entity.User;
import com.tms.a1.exception.ForbiddenException;
import com.tms.a1.service.UserService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;


// If only the request is coming in with JWT, it will not invoke the authenticationfilter method in it/bypassing it and coming here to check for authorization
@AllArgsConstructor
public class JWTAuthorizationFilter extends OncePerRequestFilter {

    @Autowired
    private SecurityConstants securityConstants;

    @Autowired
    private UserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // Retrieve the JWT token from the cookie
        Cookie[] cookies = request.getCookies();
        String token = null;

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(securityConstants.getCookieName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        if (token == null ) {
            throw new ForbiddenException("You are not logged in!");
            // filterChain.doFilter(request, response);
            // return;
        }

        DecodedJWT  decodedJWT = JWT.require(Algorithm.HMAC512(securityConstants.getSecretKey()))
            .build()
            .verify(token);
        
        String username = decodedJWT.getSubject();
        User userObj = userService.login(username);

        String[] rolesArray = userObj.getGroups().split("\\.");
        java.util.List<GrantedAuthority> authorities = Arrays.stream(rolesArray)
                .filter(role -> !role.isEmpty())
                .map(role -> new SimpleGrantedAuthority(role))
                .collect(Collectors.toList());

        if(userObj.getIsActive()==0){
            throw new ForbiddenException("Your account is inactive");
        }

        String ipAddress = decodedJWT.getClaim("ipAddress").asString();
        String browser = decodedJWT.getClaim("userAgent").asString(); 
        System.out.println(browser + "Testing browser");
        
        String clientIpAddress = getClientIpAddress(request);
        String userAgent = request.getHeader("User-Agent");

        if(!ipAddress.equals(clientIpAddress) || !userAgent.equals(browser)){
            throw new ForbiddenException("Please Log in again");
        }

        //"Authentication token"
        //UsernamePWAuthToken = "app-wide authentication token"
        //1st param: authenticated user's username, 2nd param: user's credentials, set as null as pw not needed after authentication, 3rd param list of roles associated with user. use Arrays.asList() for none. 
        Authentication authentication;
        if(rolesArray.length!=0){
            System.out.println("has roles");
            authentication = new UsernamePasswordAuthenticationToken(username, null, authorities);
            System.out.println(authentication.getAuthorities());
        }else{
            // System.out.println("no roles");
            authentication = new UsernamePasswordAuthenticationToken(username, null, null);
        }

        //the following stores details of currently authenticated user, providing a way to access the authenticated info throughout the app
        SecurityContextHolder.getContext().setAuthentication(authentication);
        filterChain.doFilter(request, response);
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