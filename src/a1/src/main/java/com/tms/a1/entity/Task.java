package com.tms.a1.entity;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
@Entity
@Table(name = "task")
public class Task {
    @Id
    @NotNull(message = "Task id should not be null")
    @NotBlank
    @Column(name = "task_id", unique = true)
    private String taskID;

    @NotNull(message = "Task name should not be null")
    @NotBlank
    @Column(name = "task_name")
    private String taskName;

    @NotNull(message = "Task Description should not be null")
    @Column(name = "task_description")
    private String taskDescription;

    @Column(name = "task_notes")
    private String taskNotes;

    @Column(name = "task_plan")
    private String taskPlan;

    // @NotNull(message = "Task acronym should not be null")
    @Column(name = "task_app_acronym")
    private String taskAppAcronym;

    // @NotNull(message = "Task state should not be null")
    @Column(name = "task_state")
    private String taskState;

    // @NotNull(message = "Task creator should not be null")
    @Column(name = "task_creator")
    private String taskCreator;

    // @NotNull(message = "Task owner should not be null")
    @Column(name = "task_owner")
    private String taskOwner;

    @Column(name = "task_create_date")
    private String taskCreateDate;
}
