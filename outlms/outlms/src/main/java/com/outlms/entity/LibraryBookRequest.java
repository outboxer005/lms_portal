package com.outlms.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "library_book_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LibraryBookRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({
            "hibernateLazyInitializer", "handler", "password", "studentRegistration"
    })
    private User student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "book_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Book book;

    @Column(name = "request_date", nullable = false)
    private LocalDateTime requestDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.PENDING;

    @Column(name = "student_notes", length = 500)
    private String studentNotes;

    @Column(name = "staff_note", length = 500)
    private String staffNote;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "handled_by")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({
            "hibernateLazyInitializer", "handler", "password", "studentRegistration"
    })
    private User handledBy;

    @Column(name = "handled_at")
    private LocalDateTime handledAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        requestDate = LocalDateTime.now();
    }

    public enum RequestStatus {
        PENDING, APPROVED, REJECTED
    }
}
