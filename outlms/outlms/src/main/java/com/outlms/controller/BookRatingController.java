package com.outlms.controller;

import com.outlms.dto.BookRatingRequest;
import com.outlms.entity.BookRating;
import com.outlms.entity.User;
import com.outlms.service.BookRatingService;
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
public class BookRatingController {

    private final BookRatingService ratingService;
    private final UserService userService;

    // ── Student: submit or update a rating ──────────────────────────────────

    @PostMapping("/ratings")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<BookRating> submitRating(
            @RequestBody BookRatingRequest request,
            Authentication auth) {
        User student = getUser(auth);
        return ResponseEntity.ok(ratingService.rateBook(request, student));
    }

    // ── Student: get their own rating for a book ─────────────────────────────

    @GetMapping("/ratings/my/{bookId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<BookRating> getMyRating(
            @PathVariable Long bookId,
            Authentication auth) {
        User student = getUser(auth);
        BookRating r = ratingService.getStudentRatingForBook(student.getId(), bookId);
        return r != null ? ResponseEntity.ok(r) : ResponseEntity.noContent().build();
    }

    // ── Student: has this student already rated a book? ──────────────────────

    @GetMapping("/ratings/my/{bookId}/exists")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Boolean>> hasRated(
            @PathVariable Long bookId,
            Authentication auth) {
        User student = getUser(auth);
        return ResponseEntity.ok(Map.of("rated", ratingService.hasRated(student.getId(), bookId)));
    }

    // ── Public (authenticated): all ratings for a book ───────────────────────

    @GetMapping("/ratings/book/{bookId}")
    public ResponseEntity<List<BookRating>> getBookRatings(@PathVariable Long bookId) {
        return ResponseEntity.ok(ratingService.getRatingsForBook(bookId));
    }

    // ── Public (authenticated): average + count for a book ──────────────────

    @GetMapping("/ratings/book/{bookId}/summary")
    public ResponseEntity<Map<String, Object>> getBookRatingSummary(@PathVariable Long bookId) {
        return ResponseEntity.ok(ratingService.getBookRatingSummary(bookId));
    }

    // ── Helper ──────────────────────────────────────────────────────────────

    private User getUser(Authentication auth) {
        return userService.findByUsernameOrEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
