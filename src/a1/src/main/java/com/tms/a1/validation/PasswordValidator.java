package com.tms.a1.validation;

import java.util.regex.Pattern;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordValidator implements ConstraintValidator<ComplexPassword, String> {
  private static final Pattern PASSWORD_PATTERN = Pattern
       .compile("^(?=.*[0-9])(?=.*[^A-Za-z0-9]).*$");

  @Override
  public void initialize(ComplexPassword constraintAnnotation) {
  }

  @Override
  public boolean isValid(String value, ConstraintValidatorContext context) {
    if (value == null) {
      return true; // Null values are handled separately if needed
    }
    return PASSWORD_PATTERN.matcher(value).matches();
  }
}
