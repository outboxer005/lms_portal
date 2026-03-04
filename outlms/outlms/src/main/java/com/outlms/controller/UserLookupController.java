package com.outlms.controller;

import com.outlms.entity.User;
import com.outlms.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Shared lookup endpoints for staff/admin.
 * We intentionally keep this outside /api/admin/** so STAFF can access it.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class UserLookupController {

    private final UserService userService;

    /**
     * Get active users by role (approved members).
     * Example: GET /api/users?role=STUDENT
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<UserSummary>> getUsersByRole(@RequestParam String role) {
        User.Role userRole = User.Role.valueOf(role.toUpperCase());
        List<User> users = userService.findActiveByRole(userRole);
        List<UserSummary> summaries = users.stream()
                .map(UserSummary::fromUser)
                .collect(Collectors.toList());
        return ResponseEntity.ok(summaries);
    }

    public static class UserSummary {
        public Long id;
        public String username;
        public String email;
        public String firstName;
        public String lastName;
        public String phoneNumber;
        public User.Role role;
        public Boolean active;

        public static UserSummary fromUser(User user) {
            UserSummary summary = new UserSummary();
            summary.id = user.getId();
            summary.username = user.getUsername();
            summary.email = user.getEmail();
            summary.firstName = user.getFirstName();
            summary.lastName = user.getLastName();
            summary.phoneNumber = user.getPhoneNumber();
            summary.role = user.getRole();
            summary.active = user.getActive();
            return summary;
        }
    }
}

