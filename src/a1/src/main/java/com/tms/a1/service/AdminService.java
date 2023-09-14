package com.tms.a1.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.tms.a1.entity.Group;
import com.tms.a1.entity.User;
import com.tms.a1.repository.GroupRepo;
import com.tms.a1.repository.UserRepo;

@Service
public class AdminService {
    
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private GroupRepo groupRepo;
    private BCryptPasswordEncoder passwordEncoder;
    public Map<String, Object> response = new HashMap<>();

    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    public List<Group> getAllGroups() {
        return (List<Group>)groupRepo.findAll();
    }

    public String newGroup(Group group){
        if (groupRepo.existsByGroupName(group.getGroupName())) {
            return "Duplicate";
        }
        groupRepo.save(group);
        return "Success";
    }
}
