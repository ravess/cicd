package com.tms.a1.validation;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

@Documented
//uses passwordvalidator class for validation
@Constraint(validatedBy = PasswordValidator.class)
//can be applied on fields and methods
@Target({ ElementType.FIELD, ElementType.METHOD })
//annotation available at runtime through reflection, can process by validation frameworks
@Retention(RetentionPolicy.RUNTIME)
public @interface ComplexPassword {
  String message() default "Password must contain at least one number, and one special character.";

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};
}
