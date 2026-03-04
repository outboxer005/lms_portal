package com.outlms.repository;

import com.outlms.entity.Book;
import com.outlms.entity.Book.BookStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    List<Book> findByStatus(BookStatus status);

    List<Book> findByGenreIgnoreCase(String genre);

    List<Book> findByAuthorContainingIgnoreCase(String author);

    @Query("SELECT DISTINCT b.genre FROM Book b WHERE b.genre IS NOT NULL ORDER BY b.genre")
    List<String> findAllGenres();

    @Query("SELECT b FROM Book b WHERE " +
            "LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(b.isbn) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(b.genre) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(b.publisher) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Book> searchBooks(@Param("query") String query);

    @Query("SELECT b FROM Book b WHERE " +
            "(:query IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(b.isbn) LIKE LOWER(CONCAT('%', :query, '%'))) AND "
            +
            "(:genre IS NULL OR LOWER(b.genre) = LOWER(:genre)) AND " +
            "(:status IS NULL OR b.status = :status)")
    List<Book> filterBooks(@Param("query") String query,
            @Param("genre") String genre,
            @Param("status") BookStatus status);

    long countByStatus(BookStatus status);

    boolean existsByIsbn(String isbn);
}
