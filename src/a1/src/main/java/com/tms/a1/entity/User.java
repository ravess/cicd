package com.tms.a1.entity;

import com.tms.a1.validation.ComplexPassword;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "accounts")
public class User {

    @Id
    @NotNull(message = "id should not be null")
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment primary key
    private int id;

    @NotBlank(message = "username should not be empty")
    @Column(name = "username", unique = true)
    private String username;

    @NotBlank(message = "password should not be empty")
    @ComplexPassword
    @Column(name = "password")
    private String password;

    @Column(name = "email")
    @Email(message = "Invalid email address")
    private String email;

    @NotNull(message = "is_active should not be null")
    @Column(name = "is_active")
    private int isActive;

    @Column(name = "`groups`")
    private String groups;

}
