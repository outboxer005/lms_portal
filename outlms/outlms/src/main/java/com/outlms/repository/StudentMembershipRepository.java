package com.outlms.repository;

import com.outlms.entity.StudentMembership;
import com.outlms.entity.StudentMembership.MembershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentMembershipRepository extends JpaRepository<StudentMembership, Long> {

    List<StudentMembership> findByStudentId(Long studentId);

    Optional<StudentMembership> findByStudentIdAndStatus(Long studentId, MembershipStatus status);

    List<StudentMembership> findByPlanId(Long planId);

    List<StudentMembership> findByStatus(MembershipStatus status);

    @Query("SELECT sm FROM StudentMembership sm WHERE sm.student.id = :studentId ORDER BY sm.createdAt DESC")
    List<StudentMembership> findLatestByStudentId(Long studentId);

    boolean existsByStudentIdAndStatus(Long studentId, MembershipStatus status);
}
