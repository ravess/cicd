package com.tms.a1.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.tms.a1.entity.User;

public interface UserRepo extends JpaRepository<User, String> {

    @Query("SELECT u.username FROM User u WHERE u.username = :username AND u.groups LIKE '.%' || :userGroup || '.%'")
    String checkgroup(@Param("username") String username, @Param("userGroup") String userGroup);

    Optional<User> findByUsername(String username);

    // custom query method to check if username already exists
    boolean existsByUsername(String username);
}
