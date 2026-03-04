package com.outlms.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * A student's star-rating (1-5) and optional review for a book,
 * submitted after they return it.
 */
@Entity
@Table(name = "book_ratings", uniqueConstraints = @UniqueConstraint(name = "uq_rating_student_book", columnNames = {
        "student_id", "book_id" }))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The book being rated. */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "book_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({
            "hibernateLazyInitializer", "handler", "issuances"
    })
    private Book book;

    /** The student who rated the book. */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({
            "hibernateLazyInitializer", "handler", "password", "studentRegistration"
    })
    private User student;

    /** Rating value: 1 (worst) – 5 (best). */
    @Column(nullable = false)
    private Integer rating;

    /** Optional written review. */
    @Column(length = 500)
    private String review;

    @Column(name = "rated_at")
    private LocalDateTime ratedAt;

    @PrePersist
    protected void onCreate() {
        ratedAt = LocalDateTime.now();
    }
}
