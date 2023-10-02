package com.tms.a1.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tms.a1.entity.Group;

public interface GroupRepo extends JpaRepository<Group, String>{
    boolean existsByGroupName(String groupName);
}
