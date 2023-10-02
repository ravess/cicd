package com.tms.a1.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
// import lombok.AllArgsConstructor;
import lombok.Getter;
// import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "application")

public class Application {
    @Id
    @NotNull(message = "app acronym should not be null")
    @NotBlank
    @Column(name = "app_acronym", unique = true)
    private String appAcronym;

    @NotBlank(message = "Application Description should not be empty")
    @Column(name = "app_description", unique = true)
    private String appDescription;

    @NotNull(message = "RNumber should not be null")
    @Positive(message ="RNumber should have only postive integer" )
    @Column(name = "app_rnumber", unique = true)
    private int appRNumber;

    @Column(name = "app_start_date")
    private String appStartDate;

    @Column(name = "app_end_date")
    private String appEndDate;

    @Column(name = "app_permit_open")
    private String appPermitOpen;

    @Column(name = "app_permit_todolist")
    private String appPermitToDoList;

    @Column(name = "app_permit_doing")
    private String appPermitDoing;

    @Column(name = "app_permit_done")
    private String appPermitDone;

    @Column(name = "app_permit_create")
    private String appPermitCreate;
}