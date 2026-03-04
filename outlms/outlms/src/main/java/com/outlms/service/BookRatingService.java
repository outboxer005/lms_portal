package com.outlms.service;

import com.outlms.dto.BookRatingRequest;
import com.outlms.entity.Book;
import com.outlms.entity.BookIssuance;
import com.outlms.entity.BookIssuance.IssuanceStatus;
import com.outlms.entity.BookRating;
import com.outlms.entity.User;
import com.outlms.repository.BookIssuanceRepository;
import com.outlms.repository.BookRatingRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class BookRatingService {

    private final BookRatingRepository ratingRepository;
    private final BookIssuanceRepository issuanceRepository;

    /**
     * Submit (or update) a student's rating for a book.
     * The student must have a RETURNED issuance for that book.
     */
    @Transactional
    public BookRating rateBook(BookRatingRequest request, User student) {
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        // Verify the student returned this book via the given issuance
        BookIssuance issuance = issuanceRepository
                .findById(Objects.requireNonNull(request.getIssuanceId(), "Issuance ID required"))
                .orElseThrow(() -> new RuntimeException("Issuance not found"));

        if (!issuance.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("This issuance does not belong to you");
        }
        if (issuance.getStatus() != IssuanceStatus.RETURNED) {
            throw new RuntimeException("You can only rate books you have returned");
        }

        Book book = issuance.getBook();

        // Upsert: update existing rating or create new one
        BookRating rating = ratingRepository
                .findByStudentIdAndBookId(student.getId(), book.getId())
                .orElse(new BookRating());

        rating.setBook(book);
        rating.setStudent(student);
        rating.setRating(request.getRating());
        rating.setReview(request.getReview());

        return ratingRepository.save(rating);
    }

    /** Get all ratings for a book, newest first. */
    public List<BookRating> getRatingsForBook(Long bookId) {
        return ratingRepository.findByBookId(bookId);
    }

    /** Get average rating and count for a book (returns 0.0 / 0 when none). */
    public Map<String, Object> getBookRatingSummary(Long bookId) {
        Double avg = ratingRepository.findAverageRatingByBookId(bookId);
        long count = ratingRepository.countByBookId(bookId);
        return Map.of(
                "average", avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0,
                "count", count);
    }

    /** Get a student's rating for a specific book (null if not rated). */
    public BookRating getStudentRatingForBook(Long studentId, Long bookId) {
        return ratingRepository.findByStudentIdAndBookId(studentId, bookId).orElse(null);
    }

    /** Whether a student has already rated a book. */
    public boolean hasRated(Long studentId, Long bookId) {
        return ratingRepository.existsByStudentIdAndBookId(studentId, bookId);
    }

    /** All ratings by a student (their review history). */
    public List<BookRating> getStudentRatings(Long studentId) {
        return ratingRepository.findByStudentId(studentId);
    }
}
