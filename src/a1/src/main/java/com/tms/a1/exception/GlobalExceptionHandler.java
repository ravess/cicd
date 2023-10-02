package com.tms.a1.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, String>> handleValidationException(MethodArgumentNotValidException ex) {
    Map<String, String> errors = new HashMap<>();
    ex.getBindingResult().getAllErrors().forEach(error -> {
      String fieldName = "msg";
      String errorMessage = "";
      if (error instanceof FieldError) {
        FieldError fieldError = (FieldError) error;
        // fieldName = fieldError.getField();
        errorMessage = fieldError.getDefaultMessage();
      } else if (error instanceof ObjectError) {
        ObjectError objectError = (ObjectError) error;
        // fieldName = objectError.getObjectName();
        errorMessage = objectError.getDefaultMessage();
      }
      errors.put(fieldName, errorMessage);
    });

    // Customize the error message for the 'password' field
    if (errors.containsKey("password")) {
      errors.put("msg",
          "Input password invalid, the password should contain at least 1 alphabet, 1 number and 1 special character");
    }

    return ResponseEntity.status(HttpStatus.ACCEPTED).body(errors);
  }

  @ExceptionHandler(EntityNotFoundException.class)
  public ResponseEntity<Object> handleUserNotFoundException(EntityNotFoundException ex) {
      ErrorResponse errorResponse = new ErrorResponse(ex.getMessage());
      return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
  }
}
