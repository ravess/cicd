package com.tms.a1.entity;

import jakarta.annotation.Nonnull;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "`groups`")
public class Group {

    @Id
    @Nonnull
    @Column(name = "group_name", unique = true)
    private String groupName;

    // public Group(String groupName) {
    // this.groupName = groupName;
    // }

}