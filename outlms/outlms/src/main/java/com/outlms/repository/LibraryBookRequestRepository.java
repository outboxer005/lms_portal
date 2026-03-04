package com.outlms.repository;

import com.outlms.entity.LibraryBookRequest;
import com.outlms.entity.LibraryBookRequest.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LibraryBookRequestRepository extends JpaRepository<LibraryBookRequest, Long> {
    List<LibraryBookRequest> findByStudentId(Long studentId);

    List<LibraryBookRequest> findByStatus(RequestStatus status);

    List<LibraryBookRequest> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<LibraryBookRequest> findAllByOrderByCreatedAtDesc();

    boolean existsByStudentIdAndBookIdAndStatus(Long studentId, Long bookId, RequestStatus status);
}
