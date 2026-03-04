package com.outlms.repository;

import com.outlms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE u.username = :username OR u.email = :username")
    Optional<User> findByUsernameOrEmail(@Param("username") String username);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.active = true")
    long countByRoleAndActive(@Param("role") User.Role role);

    List<User> findByRoleAndActiveTrue(User.Role role);

    /** Latest VULB staff ID (e.g. VULB0123) to generate next ID in one query instead of looping. */
    @Query(value = "SELECT username FROM users WHERE username LIKE 'VULB%' ORDER BY CAST(SUBSTRING(username, 5) AS UNSIGNED) DESC LIMIT 1", nativeQuery = true)
    Optional<String> findLatestVulbUsername();
}
