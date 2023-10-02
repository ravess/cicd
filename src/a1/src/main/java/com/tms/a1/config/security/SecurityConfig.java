package com.tms.a1.config.security;


import static org.springframework.security.config.Customizer.withDefaults; // Import the withDefaults() method

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.core.GrantedAuthorityDefaults;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.logout.CookieClearingLogoutHandler;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.tms.a1.config.security.filter.AppPermitFilter;
import com.tms.a1.config.security.filter.AuthenticationFilter;
import com.tms.a1.config.security.filter.ExceptionHandlerFilter;
import com.tms.a1.config.security.filter.JWTAuthorizationFilter;
import com.tms.a1.config.security.manager.CustomAuthenticationManager;
import com.tms.a1.service.AuthService;
import com.tms.a1.service.TmsService;
import com.tms.a1.service.UserService;

import lombok.AllArgsConstructor;

@Configuration
@AllArgsConstructor
@EnableWebSecurity
public class SecurityConfig {

  @Autowired
  private SecurityConstants securityConstants;
  @Autowired
  private UserService userService;
  @Autowired
  private TmsService tmsService;
  @Autowired
  private AuthService authService;

  private CustomAuthenticationManager customAuthenticationManager;

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    
    AuthenticationFilter authenticationFilter = new AuthenticationFilter(securityConstants, customAuthenticationManager);
    authenticationFilter.setFilterProcessesUrl("/login");
    CookieClearingLogoutHandler cookies = new CookieClearingLogoutHandler(securityConstants.getCookieName());

    http
    .cors(withDefaults())
    .csrf(csrf -> csrf.disable())
    .authorizeHttpRequests(authorize -> authorize
        .requestMatchers(HttpMethod.POST, "/apps/new").hasAuthority("ProjectLead")
        .requestMatchers(HttpMethod.PUT, "/apps/*/edit").hasAuthority("ProjectLead")
        .requestMatchers(HttpMethod.POST,"/apps/*/plans/new").hasAuthority("ProjectManager")
        .requestMatchers(HttpMethod.PUT,"/apps/*/plans/*/edit").hasAuthority("ProjectManager")
        .requestMatchers(HttpMethod.POST,"/user/new").hasAuthority("Admin")
        .requestMatchers("/users/*").hasAuthority("Admin")
        .requestMatchers("/users").hasAuthority("Admin")
        .requestMatchers("/createGroup").hasAuthority("Admin")
        .requestMatchers("/getGroups").hasAuthority("Admin")
        // .requestMatchers("/getUser").authenticated()
        // .requestMatchers("/apps/**").authenticated()
        // .requestMatchers("/getGroups").authenticated()
        .anyRequest().authenticated()
        )
    .addFilterBefore(new ExceptionHandlerFilter(), AuthenticationFilter.class)
    .addFilter(authenticationFilter)
    .addFilterAfter(new JWTAuthorizationFilter(securityConstants,userService), AuthenticationFilter.class)
    .addFilterAfter(new AppPermitFilter(authService, tmsService), JWTAuthorizationFilter.class)
    .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
    .logout(logout -> logout
            .logoutUrl("/logout") // Configure the logout URL
            .clearAuthentication(true) // Clear the user's authentication
            .invalidateHttpSession(true) // Invalidate the HTTP session
            .deleteCookies(securityConstants.getCookieName()) // List the names of cookies to be deleted upon logout
            .addLogoutHandler(cookies) // Additional logout handler if needed
            .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler()) // Configure the logout success handler
        );
    
    return http.build();
  }

  @Bean
	CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(Arrays.asList(securityConstants.getFrontendURL())); // Specify the exact origin
		configuration.setAllowedMethods(Arrays.asList("GET","POST", "PUT"));
        configuration.setAllowCredentials(true);
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

  @Bean
  static GrantedAuthorityDefaults grantedAuthorityDefaults() {
    return new GrantedAuthorityDefaults("");
  }

}
