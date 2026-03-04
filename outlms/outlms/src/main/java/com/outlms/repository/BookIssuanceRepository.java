package com.outlms.repository;

import com.outlms.entity.BookIssuance;
import com.outlms.entity.BookIssuance.IssuanceStatus;
import com.outlms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookIssuanceRepository extends JpaRepository<BookIssuance, Long> {

    List<BookIssuance> findByStudent(User student);

    List<BookIssuance> findByStudentId(Long studentId);

    List<BookIssuance> findByStatus(IssuanceStatus status);

    List<BookIssuance> findByBookId(Long bookId);

    List<BookIssuance> findByStudentIdAndStatus(Long studentId, IssuanceStatus status);

    // Find overdue records: status is ISSUED and due date passed
    @Query("SELECT bi FROM BookIssuance bi WHERE bi.status = 'ISSUED' AND bi.dueDate < :today")
    List<BookIssuance> findOverdue(@Param("today") LocalDate today);

    @Query("SELECT bi FROM BookIssuance bi WHERE bi.student.id = :studentId AND bi.status = 'ISSUED'")
    List<BookIssuance> findActiveByStudent(@Param("studentId") Long studentId);

    long countByStatus(IssuanceStatus status);

    @Query("SELECT COUNT(bi) FROM BookIssuance bi WHERE bi.student.id = :studentId AND bi.status = 'ISSUED'")
    long countActiveByStudent(@Param("studentId") Long studentId);
}
