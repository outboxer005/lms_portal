package com.outlms.repository;

import com.outlms.entity.BookRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRatingRepository extends JpaRepository<BookRating, Long> {

    /** All ratings for a given book. */
    List<BookRating> findByBookId(Long bookId);

    /** All ratings submitted by a given student. */
    List<BookRating> findByStudentId(Long studentId);

    /** Check whether a student has already rated a specific book. */
    Optional<BookRating> findByStudentIdAndBookId(Long studentId, Long bookId);

    boolean existsByStudentIdAndBookId(Long studentId, Long bookId);

    /** Average rating for a book (null when no ratings yet). */
    @Query("SELECT AVG(r.rating) FROM BookRating r WHERE r.book.id = :bookId")
    Double findAverageRatingByBookId(@Param("bookId") Long bookId);

    /** Count ratings for a book. */
    long countByBookId(Long bookId);
}
