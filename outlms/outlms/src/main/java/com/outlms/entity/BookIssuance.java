package com.outlms.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "book_issuances")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookIssuance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    // The student who borrowed the book
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "password",
            "studentRegistration" })
    private User student;

    // Staff or Admin who issued the book
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "issued_by_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "password",
            "studentRegistration" })
    private User issuedBy;

    // Staff or Admin who accepted the return
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "returned_to_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "password",
            "studentRegistration" })
    private User returnedTo;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "return_date")
    private LocalDate returnDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IssuanceStatus status = IssuanceStatus.ISSUED;

    @Column(name = "penalty_amount")
    private Double penaltyAmount = 0.0;

    @Column(name = "is_penalty_paid")
    private Boolean isPenaltyPaid = false;

    @Column(name = "penalty_paid_date")
    private LocalDateTime penaltyPaidDate;

    @Column(name = "notes")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum IssuanceStatus {
        ISSUED,
        RETURNED,
        OVERDUE
    }

    public Double getPenaltyAmount() {
        if (status == IssuanceStatus.ISSUED && dueDate != null && LocalDate.now().isAfter(dueDate)) {
            long daysLate = ChronoUnit.DAYS.between(dueDate, LocalDate.now());
            return daysLate * 5.0;
        }
        return penaltyAmount != null ? penaltyAmount : 0.0;
    }
}
