package com.tms.a1.config.security.filter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.function.Consumer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.tms.a1.entity.Application;
import com.tms.a1.entity.Task;
import com.tms.a1.exception.ForbiddenException;
import com.tms.a1.service.AuthService;
import com.tms.a1.service.TmsService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;


@AllArgsConstructor
public class AppPermitFilter extends OncePerRequestFilter {

    @Autowired
    private AuthService authService;

    @Autowired
    private TmsService tmsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // Retrieve the current URL
        String requestURI = request.getRequestURI();
        // Get the Authentication object from the SecurityContextHolder
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // Get the authorities (roles) associated with the authenticated user
        List<GrantedAuthority> authorities = (List<GrantedAuthority>) authentication.getAuthorities();

        //url startsWith apps, is a PUT/POST method & is task related
        if (requestURI.startsWith("/apps/") && (request.getMethod().equalsIgnoreCase("PUT") || request.getMethod().equalsIgnoreCase("POST")) && requestURI.contains("tasks")) {
            // Extract the {appacronym} part from the URL
            String[] parts = requestURI.split("/");
            System.out.println(Arrays.toString(parts));
            String appacronym = parts[2];
            Application app = tmsService.getApp(appacronym);

            if(authorities.isEmpty()){
                throw new ForbiddenException("You are not permitted!");
            }

            // new task
            if (parts[(parts.length-1)].equals("new")) {
                String permitCreate = app.getAppPermitCreate();
                if (permitCreate == null){
                    throw new ForbiddenException("No permits allowed.");
                }

                GrantedAuthority therole = new SimpleGrantedAuthority(permitCreate);
                
                if(!authorities.contains(therole)){
                    throw new ForbiddenException("You are not permitted!");
                }
            } else if (parts[(parts.length-1)].equals("edit")) {
                //update task
                String permitOpen = app.getAppPermitOpen();
                String permitTodo = app.getAppPermitToDoList();
                String permitDoing = app.getAppPermitDoing();
                String permitDone = app.getAppPermitDone();
                String[] permits = {permitOpen, permitTodo, permitDoing, permitDone};
                String[] states = {"OPEN", "TODO", "DOING", "DONE"};

                String taskid = parts[4];
                Task task = tmsService.getTask(taskid, appacronym);
                String taskCurrentState = task.getTaskState(); 
                System.out.println("TASK CURRENT STATE: "+taskCurrentState);

                System.out.println("user's roles: "+ authorities);

                Consumer<String> checkPermit = (permit) -> {
                    if (permit == null) {
                        throw new ForbiddenException("No permits allowed.");
                    };
                };

                if (Arrays.asList(states).contains(taskCurrentState)) {
                    int stateIndex = Arrays.asList(states).indexOf(taskCurrentState);
                    checkPermit.accept(permits[stateIndex]);

                    GrantedAuthority taskRole = new SimpleGrantedAuthority(permits[stateIndex]);
                    
                    if (!authorities.contains(taskRole)) {
                        throw new ForbiddenException("You are not permitted!");
                    }
                } else {
                    throw new ForbiddenException("Invalid task state");
                }

                // if(taskCurrentState.equals("OPEN")){
                //     if(permitOpen == null){
                //         throw new ForbiddenException("No permits allowed.");
                //     }
                //     GrantedAuthority therole = new SimpleGrantedAuthority(permitOpen);
                //     if(!authorities.contains(therole)){
                //         throw new ForbiddenException("You are not permitted!");
                //     }
                // } else if (taskCurrentState.equals("TODO")){
                //     if(permitTodo == null){
                //         throw new ForbiddenException("No permits allowed.");
                //     }
                //     GrantedAuthority therole = new SimpleGrantedAuthority(permitTodo);
                //     if(!authorities.contains(therole)){
                //         throw new ForbiddenException("You are not permitted!");
                //     }
                // } else if (taskCurrentState.equals("DOING")){
                //     if(permitDoing == null){
                //         throw new ForbiddenException("No permits allowed.");
                //     }
                //     GrantedAuthority therole = new SimpleGrantedAuthority(permitDoing);
                //     if(!authorities.contains(therole)){
                //         throw new ForbiddenException("You are not permitted!");
                //     }
                // } else if (taskCurrentState.equals("DONE")){
                //     if(permitDone == null){
                //         throw new ForbiddenException("No permits allowed.");
                //     }
                //     GrantedAuthority therole = new SimpleGrantedAuthority(permitDone);
                //     if(!authorities.contains(therole)){
                //         throw new ForbiddenException("You are not permitted!");
                //     }
                // }
            }
        }
        filterChain.doFilter(request, response);
    }
}
