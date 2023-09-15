package com.tms.a1.controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.tms.a1.service.AuthService;


import lombok.AllArgsConstructor;

@AllArgsConstructor
@RestController
public class AuthController {

  private AuthService authService;




  @PostMapping("/checkGroup")
  public ResponseEntity<Map<String,Object>> CheckGroup (@RequestBody Map<String, String> requestBody ) {
    return new ResponseEntity<>(authService.checkgroup(requestBody), HttpStatus.OK);
  }

  //temp function for frontend to be able to work
  @GetMapping("/validateCookie")
  public ResponseEntity<?> checkCookie(){
    Boolean resMsg = true;
    Map<String, Object> response = new HashMap<>();
    response.put("hasCookie", resMsg);
    // The user is not in the group, return unauthorized
    return ResponseEntity.status(HttpStatus.OK).body(response);
  }
}