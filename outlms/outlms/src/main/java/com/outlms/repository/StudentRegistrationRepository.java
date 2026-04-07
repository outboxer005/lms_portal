package com.outlms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.outlms.entity.StudentRegistration;
import com.outlms.entity.StudentRegistration.RegistrationStatus;

@Repository
public interface StudentRegistrationRepository extends JpaRepository<StudentRegistration, Long> {

    Optional<StudentRegistration> findByRegistrationId(String registrationId);

    // Updated to use embedded field path
    Optional<StudentRegistration> findByPersonalDetailsEmail(String email);

    Optional<StudentRegistration> findByPersonalDetailsPhone(String phone);

    boolean existsByPersonalDetailsEmail(String email);

    boolean existsByPersonalDetailsPhone(String phone);
    
    /**
     * Check if email exists with explicit non-null check
     */
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM StudentRegistration s WHERE s.personalDetails.email IS NOT NULL AND LOWER(s.personalDetails.email) = LOWER(:email)")
    boolean emailExists(@Param("email") String email);

    List<StudentRegistration> findByStatus(RegistrationStatus status);

    @Query("SELECT s FROM StudentRegistration s WHERE s.status = :status ORDER BY s.registrationDate DESC")
    List<StudentRegistration> findByStatusOrderByRegistrationDateDesc(@Param("status") RegistrationStatus status);

    @Query("SELECT COUNT(s) FROM StudentRegistration s WHERE s.status = :status")
    long countByStatus(@Param("status") RegistrationStatus status);

    @Query("SELECT s FROM StudentRegistration s ORDER BY s.registrationDate DESC")
    List<StudentRegistration> findRecentRegistrations(Pageable pageable);

    // Updated search query for embedded fields
    @Query("SELECT s FROM StudentRegistration s WHERE " +
            "(LOWER(CONCAT(s.personalDetails.firstName, ' ', s.personalDetails.lastName)) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            +
            "LOWER(s.personalDetails.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(s.personalDetails.phone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(s.registrationId) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<StudentRegistration> searchRegistrations(@Param("search") String search);

    @Query("SELECT s FROM StudentRegistration s WHERE s.personalDetails.email = :email OR s.personalDetails.phone = :phone")
    Optional<StudentRegistration> findByEmailOrPhone(@Param("email") String email, @Param("phone") String phone);

    // Find by generated username (for approved students who login with username)
    Optional<StudentRegistration> findByGeneratedUsername(String generatedUsername);

    @Query("SELECT COUNT(s) FROM StudentRegistration s")
    long countAllRegistrations();
    
    // Find by role
    @Query("SELECT s FROM StudentRegistration s WHERE s.role = :role ORDER BY s.registrationDate DESC")
    List<StudentRegistration> findByRoleOrderByRegistrationDateDesc(@Param("role") String role);
    
    // Find by role and status
    @Query("SELECT s FROM StudentRegistration s WHERE s.role = :role AND s.status = :status ORDER BY s.registrationDate DESC")
    List<StudentRegistration> findByRoleAndStatusOrderByRegistrationDateDesc(@Param("role") String role, @Param("status") RegistrationStatus status);
}
