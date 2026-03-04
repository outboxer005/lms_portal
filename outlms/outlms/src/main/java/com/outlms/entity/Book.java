package com.outlms.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "books")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    @Column(unique = true)
    private String isbn;

    private String publisher;

    private String genre;

    @Column(name = "publication_year")
    private Integer publicationYear;

    @Column(name = "total_copies", nullable = false)
    private Integer totalCopies = 1;

    @Column(name = "available_copies", nullable = false)
    private Integer availableCopies = 1;

    @Column(length = 1000)
    private String description;

    @Column(name = "cover_image_url", length = 1000)
    private String coverImageUrl;

    @Column(name = "front_page_image_url", length = 1000)
    private String frontPageImageUrl;

    @Column(name = "premium_book", nullable = false)
    private Boolean premiumBook = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookStatus status = BookStatus.AVAILABLE;

    @Column(name = "added_by")
    private Long addedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (availableCopies == null)
            availableCopies = totalCopies;
        updateStatus();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        updateStatus();
    }

    private void updateStatus() {
        if (availableCopies != null && availableCopies <= 0) {
            this.status = BookStatus.UNAVAILABLE;
        } else {
            this.status = BookStatus.AVAILABLE;
        }
    }

    public enum BookStatus {
        AVAILABLE,
        UNAVAILABLE
    }
}
