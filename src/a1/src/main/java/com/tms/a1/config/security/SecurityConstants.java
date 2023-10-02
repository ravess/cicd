package com.tms.a1.config.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// import jakarta.annotation.PostConstruct;
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Component
public class SecurityConstants {
    @Value("${jwt.secret}")
    private String secretKey;
    @Value("${cookie.name}")
    private String cookieName;
    @Value("${token.expiration}")
    private int tokenExp;
    @Value("${frontend.url}")
    private String frontendURL;

    // This is to check if the secretkey cookieName is correctly inserted to the database.
    // @PostConstruct
    // public void printValues() {
    //     System.out.println("Secret Key: " + secretKey);
    //     System.out.println("Cookie Name: " + cookieName);
    //     System.out.println("Token Expiration: " + tokenExp + " milliseconds");
    // }



}

