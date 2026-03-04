package com.outlms.controller;

import com.outlms.dto.RegistrationResponse;
import com.outlms.dto.StudentDashboardResponse;
import com.outlms.dto.StudentRegistrationRequest;
import com.outlms.entity.StudentRegistration;
import com.outlms.service.DashboardService;
import com.outlms.service.FileStorageService;
import com.outlms.service.StudentRegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class StudentRegistrationController {

    private final StudentRegistrationService registrationService;
    private final FileStorageService fileStorageService;
    private final DashboardService dashboardService;

    /**
     * Student self-registration with document upload
     */
    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RegistrationResponse> registerStudent(
            @RequestPart("registration") @Valid StudentRegistrationRequest request,
            @RequestPart("document") MultipartFile document) {

        try {
            StudentRegistration registration = registrationService.registerStudent(request, document);

            RegistrationResponse response = new RegistrationResponse(
                    registration.getRegistrationId(),
                    "Registration successful! You will receive an email once your registration is approved.",
                    registration.getStatus().toString());

            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload document: " + e.getMessage());
        }
        // Let DataIntegrityViolationException (e.g. duplicate email) propagate to GlobalExceptionHandler
    }

    /**
     * Get registration status by registration ID
     */
    @GetMapping("/registration/{registrationId}")
    public ResponseEntity<StudentRegistration> getRegistrationStatus(
            @PathVariable String registrationId) {

        StudentRegistration registration = registrationService.getRegistrationByRegistrationId(registrationId);
        return ResponseEntity.ok(registration);
    }

    /**
     * Get student dashboard (requires authentication)
     */
    @GetMapping("/dashboard")
    public ResponseEntity<StudentDashboardResponse> getStudentDashboard(Authentication authentication) {
        String usernameOrEmail = authentication.getName();
        StudentDashboardResponse dashboard = dashboardService.getStudentDashboard(usernameOrEmail);
        return ResponseEntity.ok(dashboard);
    }

    /**
     * Get student profile
     */
    @GetMapping("/profile")
    public ResponseEntity<StudentRegistration> getStudentProfile(Authentication authentication) {
        String usernameOrEmail = authentication.getName();
        StudentRegistration registration = registrationService.getRegistrationByUsernameOrEmail(usernameOrEmail);
        return ResponseEntity.ok(registration);
    }
}
