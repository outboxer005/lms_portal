package com.outlms.controller;

import com.outlms.dto.BookRequest;
import com.outlms.dto.IssueBookRequest;
import com.outlms.entity.Book;
import com.outlms.entity.BookIssuance;
import com.outlms.entity.User;
import com.outlms.service.BookService;
import com.outlms.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/library")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class BookController {

    private final BookService bookService;
    private final UserService userService;

    // ============= PUBLIC / AUTHENTICATED BOOK BROWSING =============

    @GetMapping("/books")
    public ResponseEntity<List<Book>> getBooks(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(bookService.searchBooks(query, genre, status));
    }

    @GetMapping("/books/{id}")
    public ResponseEntity<Book> getBook(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.getBookById(id));
    }

    @GetMapping("/genres")
    public ResponseEntity<List<String>> getGenres() {
        return ResponseEntity.ok(bookService.getAllGenres());
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(bookService.getLibraryStats());
    }

    // ============= ADMIN + STAFF: MANAGE BOOKS =============

    @PostMapping("/books")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Book> addBook(@RequestBody BookRequest request, Authentication auth) {
        User currentUser = getUserFromAuth(auth);
        Book book = bookService.addBook(request, currentUser.getId());
        return ResponseEntity.ok(book);
    }

    @PutMapping("/books/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody BookRequest request) {
        return ResponseEntity.ok(bookService.updateBook(id, request));
    }

    @DeleteMapping("/books/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Map<String, String>> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok(Map.of("message", "Book deleted successfully"));
    }

    // ============= ADMIN + STAFF: ISSUANCE MANAGEMENT =============

    @PostMapping("/issue")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<BookIssuance> issueBook(@RequestBody IssueBookRequest request, Authentication auth) {
        User currentUser = getUserFromAuth(auth);
        BookIssuance issuance = bookService.issueBook(request, currentUser.getId());
        return ResponseEntity.ok(issuance);
    }

    @PostMapping("/return/{issuanceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<BookIssuance> returnBook(@PathVariable Long issuanceId, Authentication auth) {
        User currentUser = getUserFromAuth(auth);
        BookIssuance issuance = bookService.returnBook(issuanceId, currentUser.getId());
        return ResponseEntity.ok(issuance);
    }

    @GetMapping("/issuances")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<BookIssuance>> getAllIssuances(
            @RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(bookService.getIssuancesByStatus(status));
        }
        return ResponseEntity.ok(bookService.getAllIssuances());
    }

    @GetMapping("/issuances/overdue")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<BookIssuance>> getOverdue() {
        return ResponseEntity.ok(bookService.getOverdueIssuances());
    }

    @GetMapping("/issuances/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<BookIssuance>> getStudentIssuances(@PathVariable Long studentId) {
        return ResponseEntity.ok(bookService.getIssuancesByStudent(studentId));
    }

    // ============= STUDENT: MY BOOKS =============

    @GetMapping("/my-books")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<BookIssuance>> getMyBooks(Authentication auth) {
        User student = getUserFromAuth(auth);
        return ResponseEntity.ok(bookService.getIssuancesByStudent(student.getId()));
    }

    @GetMapping("/my-books/active")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<BookIssuance>> getMyActiveBooks(Authentication auth) {
        User student = getUserFromAuth(auth);
        return ResponseEntity.ok(bookService.getActiveIssuancesByStudent(student.getId()));
    }

    // ============= HELPER =============

    private User getUserFromAuth(Authentication auth) {
        String identity = auth.getName();
        return userService.findByUsernameOrEmail(identity)
                .orElseThrow(() -> new RuntimeException("User not found: " + identity));
    }
}
