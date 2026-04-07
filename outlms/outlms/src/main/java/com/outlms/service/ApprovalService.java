package com.outlms.service;

import com.outlms.entity.StudentRegistration;
import com.outlms.entity.StudentRegistration.RegistrationStatus;
import com.outlms.entity.User;
import com.outlms.repository.NotificationRepository;
import com.outlms.repository.StudentRegistrationRepository;
import com.outlms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ApprovalService {

    private final StudentRegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final NotificationRepository notificationRepository;

    private static final String CHAR_LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String CHAR_UPPER = CHAR_LOWER.toUpperCase();
    private static final String NUMBER = "0123456789";
    private static final String DATA_FOR_RANDOM_STRING = CHAR_LOWER + CHAR_UPPER + NUMBER;
    private static final SecureRandom random = new SecureRandom();

    /**
     * Approve a student registration
     */
    public StudentRegistration approveRegistration(Long registrationId, Long adminId) {
        // Get registration
        StudentRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found"));

        // Validate status
        if (registration.getStatus() != RegistrationStatus.PENDING) {
            throw new RuntimeException("Only pending registrations can be approved");
        }

        // Get admin user
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        // Generate credentials
        String username = generateUsername(registration);
        String temporaryPassword = generateTemporaryPassword();

        // Create user account
        User studentUser = createUserAccount(registration, username, temporaryPassword);

        // Update registration
        registration.setStatus(RegistrationStatus.APPROVED);
        registration.setApprovedBy(admin);
        registration.setApprovedDate(LocalDateTime.now());
        registration.setGeneratedUsername(username);
        registration.setGeneratedPassword(temporaryPassword); // Store plain for email
        registration.setUser(studentUser);

        registration = registrationRepository.save(registration);

        // Send approval email with credentials
        emailService.sendApprovalEmail(registration, username, temporaryPassword);

        // Send web notification
        com.outlms.entity.Notification notification = new com.outlms.entity.Notification();
        notification.setUser(studentUser);
        notification.setTitle("Registration Approved");
        notification.setMessage("Welcome! Your registration has been approved.");
        notificationRepository.save(notification);

        return registration;
    }

    /**
     * Reject a student registration
     */
    public StudentRegistration rejectRegistration(Long registrationId, String reason, Long adminId) {
        // Get registration
        StudentRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found"));

        // Validate status
        if (registration.getStatus() != RegistrationStatus.PENDING) {
            throw new RuntimeException("Only pending registrations can be rejected");
        }

        // Validate reason
        if (reason == null || reason.trim().isEmpty()) {
            throw new RuntimeException("Rejection reason is required");
        }

        // Get admin user
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        // Update registration
        registration.setStatus(RegistrationStatus.REJECTED);
        registration.setApprovedBy(admin); // Record who rejected
        registration.setApprovedDate(LocalDateTime.now());
        registration.setRejectionReason(reason);

        registration = registrationRepository.save(registration);

        // Send rejection email
        emailService.sendRejectionEmail(registration, reason);

        return registration;
    }

    /**
     * Generate username from registration
     * For STUDENT: Use provided Student ID from registration
     * For STAFF: Auto-generate VULIB{NNNN} (e.g., VULIB1234)
     */
    private String generateUsername(StudentRegistration registration) {
        String role = registration.getRole() != null ? registration.getRole().toUpperCase() : "STUDENT";

        if ("STAFF".equals(role)) {
            // Generate VULIB ID for staff
            return generateStaffId();
        } else {
            // Use provided Student ID for students
            String studentId = registration.getPersonalDetails().getStudentId();

            if (studentId != null && !studentId.trim().isEmpty()) {
                // Check if student ID already exists
                if (userRepository.existsByUsername(studentId)) {
                    throw new RuntimeException(
                            "Student ID '" + studentId + "' is already in use. Please contact admin.");
                }
                return studentId.trim();
            } else {
                throw new RuntimeException("Student ID is required for student registration");
            }
        }
    }

    /**
     * Generate unique Staff ID (VULB ID) in one DB query.
     * Format: VULB{NNNN} where NNNN is zero-padded 4-digit sequential number.
     */
    private String generateStaffId() {
        int nextNum = 1;
        Optional<String> latest = userRepository.findLatestVulbUsername();
        if (latest.isPresent()) {
            String u = latest.get();
            if (u != null && u.length() >= 5 && u.startsWith("VULB")) {
                try {
                    nextNum = Integer.parseInt(u.substring(4).trim()) + 1;
                } catch (NumberFormatException ignored) {
                }
            }
        }
        if (nextNum > 9999) {
            throw new RuntimeException("Maximum VULB ID limit reached. Please contact system administrator.");
        }
        return String.format("VULB%04d", nextNum);
    }

    /**
     * Generate temporary password
     * 8 characters with mix of upper, lower, and numbers
     */
    private String generateTemporaryPassword() {
        StringBuilder sb = new StringBuilder(8);
        for (int i = 0; i < 8; i++) {
            int randomIndex = random.nextInt(DATA_FOR_RANDOM_STRING.length());
            sb.append(DATA_FOR_RANDOM_STRING.charAt(randomIndex));
        }
        return sb.toString();
    }

    /**
     * Create user account for approved student
     */
    private User createUserAccount(StudentRegistration registration, String username, String password) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(registration.getPersonalDetails().getEmail());
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(registration.getPersonalDetails().getFirstName());
        user.setLastName(registration.getPersonalDetails().getLastName());
        user.setPhoneNumber(registration.getPersonalDetails().getPhone());
        if (registration.getRole() != null) {
            try {
                user.setRole(User.Role.valueOf(registration.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                user.setRole(User.Role.STUDENT); // Default fallback
            }
        } else {
            user.setRole(User.Role.STUDENT);
        }
        user.setActive(true);
        user.setMustChangePassword(true); // Force password change on first login
        user.setStudentRegistration(registration);

        return userRepository.save(user);
    }
}
