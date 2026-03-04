package com.outlms.controller;

import com.outlms.dto.AdminDashboardResponse;
import com.outlms.dto.ApprovalRequest;
import com.outlms.entity.StudentRegistration;
import com.outlms.entity.StudentRegistration.RegistrationStatus;
import com.outlms.entity.User;
import com.outlms.service.ApprovalService;
import com.outlms.service.DashboardService;
import com.outlms.service.FileStorageService;
import com.outlms.service.StudentRegistrationService;
import com.outlms.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class AdminController {

    private final StudentRegistrationService registrationService;
    private final ApprovalService approvalService;
    private final DashboardService dashboardService;
    private final FileStorageService fileStorageService;
    private final UserService userService;

    /**
     * Get admin dashboard with statistics
     */
    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getAdminDashboard() {
        AdminDashboardResponse dashboard = dashboardService.getAdminDashboard();
        return ResponseEntity.ok(dashboard);
    }

    /**
     * Get all registrations
     */
    @GetMapping("/registrations")
    public ResponseEntity<List<StudentRegistration>> getAllRegistrations(
            @RequestParam(required = false) String status) {

        List<StudentRegistration> registrations;

        if (status != null && !status.isEmpty()) {
            RegistrationStatus regStatus = RegistrationStatus.valueOf(status.toUpperCase());
            registrations = registrationService.getRegistrationsByStatus(regStatus);
        } else {
            registrations = registrationService.getAllRegistrations();
        }

        return ResponseEntity.ok(registrations);
    }

    /**
     * Get pending registrations
     */
    @GetMapping("/registrations/pending")
    public ResponseEntity<List<StudentRegistration>> getPendingRegistrations() {
        List<StudentRegistration> registrations = registrationService.getPendingRegistrations();
        return ResponseEntity.ok(registrations);
    }

    /**
     * Get approved registrations
     */
    @GetMapping("/registrations/approved")
    public ResponseEntity<List<StudentRegistration>> getApprovedRegistrations() {
        List<StudentRegistration> registrations = registrationService
                .getRegistrationsByStatus(RegistrationStatus.APPROVED);
        return ResponseEntity.ok(registrations);
    }

    /**
     * Get rejected registrations
     */
    @GetMapping("/registrations/rejected")
    public ResponseEntity<List<StudentRegistration>> getRejectedRegistrations() {
        List<StudentRegistration> registrations = registrationService
                .getRegistrationsByStatus(RegistrationStatus.REJECTED);
        return ResponseEntity.ok(registrations);
    }

    /**
     * Get registration details by ID
     */
    @GetMapping("/registrations/{id}")
    public ResponseEntity<StudentRegistration> getRegistrationDetails(@PathVariable Long id) {
        StudentRegistration registration = registrationService.getRegistrationById(id);
        return ResponseEntity.ok(registration);
    }

    /**
     * Download/view uploaded government ID document (BLOB)
     */
    @GetMapping("/registrations/{id}/document")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long id,
            @RequestParam(defaultValue = "inline") String disposition) throws IOException {

        StudentRegistration registration = registrationService.getRegistrationById(id);

        if (registration.getGovernmentIdImage() == null) {
            throw new RuntimeException("No government ID document uploaded for this registration");
        }

        ByteArrayResource resource = new ByteArrayResource(registration.getGovernmentIdImage());

        String filename = "government_id_" + registration.getRegistrationId();
        String extension = registration.getGovernmentIdFileName() != null ? registration.getGovernmentIdFileName()
                .substring(registration.getGovernmentIdFileName().lastIndexOf(".")) : ".jpg";

        // Support both inline viewing and download
        String contentDisposition = disposition.equalsIgnoreCase("attachment")
                ? "attachment; filename=\"" + filename + extension + "\""
                : "inline; filename=\"" + filename + extension + "\"";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(registration.getGovernmentIdContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
                .body(resource);
    }

    @PostMapping("/registrations/{id}/approve")
    public ResponseEntity<Map<String, String>> approveRegistration(
            @PathVariable Long id,
            Authentication authentication) {

        // Get admin user ID
        String adminIdentity = authentication.getName();
        User admin = userService.findByUsernameOrEmail(adminIdentity)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        StudentRegistration registration = approvalService.approveRegistration(id, admin.getId());

        return ResponseEntity.ok(Map.of(
                "message", "Registration approved successfully",
                "registrationId", registration.getRegistrationId(),
                "status", registration.getStatus().toString(),
                "username", registration.getGeneratedUsername()));
    }

    /**
     * Reject registration
     */
    @PostMapping("/registrations/{id}/reject")
    public ResponseEntity<Map<String, String>> rejectRegistration(
            @PathVariable Long id,
            @RequestBody @Valid ApprovalRequest request,
            Authentication authentication) {

        // Get admin user ID
        String adminIdentity = authentication.getName();
        User admin = userService.findByUsernameOrEmail(adminIdentity)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        if (request.getRejectionReason() == null || request.getRejectionReason().trim().isEmpty()) {
            throw new RuntimeException("Rejection reason is required");
        }

        StudentRegistration registration = approvalService.rejectRegistration(
                id,
                request.getRejectionReason(),
                admin.getId());

        return ResponseEntity.ok(Map.of(
                "message", "Registration rejected",
                "registrationId", registration.getRegistrationId(),
                "status", registration.getStatus().toString(),
                "reason", registration.getRejectionReason()));
    }

    /**
     * Search registrations
     */
    @GetMapping("/registrations/search")
    public ResponseEntity<List<StudentRegistration>> searchRegistrations(
            @RequestParam String query) {
        List<StudentRegistration> registrations = registrationService.searchRegistrations(query);
        return ResponseEntity.ok(registrations);
    }

    /**
     * Get system statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStatistics() {
        Map<String, Long> stats = Map.of(
                "totalRegistrations", registrationService.getTotalRegistrationsCount(),
                "pendingApprovals", registrationService.countByStatus(RegistrationStatus.PENDING),
                "approvedRegistrations", registrationService.countByStatus(RegistrationStatus.APPROVED),
                "rejectedRegistrations", registrationService.countByStatus(RegistrationStatus.REJECTED));

        return ResponseEntity.ok(stats);
    }

    /**
     * Get student registrations only
     */
    @GetMapping("/student-registrations")
    public ResponseEntity<List<StudentRegistration>> getStudentRegistrations(
            @RequestParam(required = false) String status) {

        List<StudentRegistration> registrations;

        if (status != null && !status.isEmpty()) {
            RegistrationStatus regStatus = RegistrationStatus.valueOf(status.toUpperCase());
            registrations = registrationService.getRegistrationsByRoleAndStatus("STUDENT", regStatus);
        } else {
            registrations = registrationService.getRegistrationsByRole("STUDENT");
        }

        return ResponseEntity.ok(registrations);
    }

    /**
     * Get staff registrations only
     */
    @GetMapping("/staff-registrations")
    public ResponseEntity<List<StudentRegistration>> getStaffRegistrations(
            @RequestParam(required = false) String status) {

        List<StudentRegistration> registrations;

        if (status != null && !status.isEmpty()) {
            RegistrationStatus regStatus = RegistrationStatus.valueOf(status.toUpperCase());
            registrations = registrationService.getRegistrationsByRoleAndStatus("STAFF", regStatus);
        } else {
            registrations = registrationService.getRegistrationsByRole("STAFF");
        }

        return ResponseEntity.ok(registrations);
    }

    /**
     * Get active users by role (approved members)
     */
    @GetMapping("/users")
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
