package com.outlms.controller;

import com.outlms.entity.LibraryBookRequest;
import com.outlms.entity.User;
import com.outlms.service.LibraryBookRequestService;
import com.outlms.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/library/book-requests")
@RequiredArgsConstructor
public class LibraryBookRequestController {

    private final LibraryBookRequestService requestService;
    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<?> createRequest(@RequestBody Map<String, Object> payload, Authentication auth) {
        try {
            Long bookId = Long.valueOf(payload.get("bookId").toString());
            String notes = payload.containsKey("notes") ? payload.get("notes").toString() : null;

            User student = userService.findByUsernameOrEmail(auth.getName())
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            LibraryBookRequest request = requestService.createRequest(student.getId(), bookId, notes);
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<?> getMyRequests(Authentication auth) {
        try {
            User student = userService.findByUsernameOrEmail(auth.getName())
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            return ResponseEntity.ok(requestService.getStudentRequests(student.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    public ResponseEntity<?> getAllRequests() {
        try {
            return ResponseEntity.ok(requestService.getAllRequests());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    public ResponseEntity<?> approveRequest(@PathVariable Long id, @RequestBody Map<String, String> payload,
            Authentication auth) {
        try {
            User staff = userService.findByUsernameOrEmail(auth.getName())
                    .orElseThrow(() -> new RuntimeException("Staff not found"));
            String note = payload.get("note");

            LibraryBookRequest request = requestService.approveRequest(id, staff.getId(), note);
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id, @RequestBody Map<String, String> payload,
            Authentication auth) {
        try {
            User staff = userService.findByUsernameOrEmail(auth.getName())
                    .orElseThrow(() -> new RuntimeException("Staff not found"));
            String note = payload.get("note");

            LibraryBookRequest request = requestService.rejectRequest(id, staff.getId(), note);
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
