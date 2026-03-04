package com.outlms.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "student_registrations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class StudentRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "registration_id", unique = true, nullable = false)
    private String registrationId;

    @Column(name = "registration_date", nullable = false)
    private LocalDateTime registrationDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RegistrationStatus status;

    @Column(name = "role", nullable = false)
    private String role;

    // Embedded Personal Details
    @Embedded
    private PersonalDetails personalDetails;

    // Embedded Address
    @Embedded
    private Address address;

    // Academic Information List
    @JsonManagedReference
    @OneToMany(mappedBy = "studentRegistration", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AcademicInfo> academicInfoList = new ArrayList<>();

    // Work Experience List
    @JsonManagedReference
    @OneToMany(mappedBy = "studentRegistration", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkExperience> workExperienceList = new ArrayList<>();

    // Government ID - Stored as LONGBLOB in database (supports up to 4GB)
    @Lob
    @Column(name = "government_id_image", columnDefinition = "LONGBLOB")
    private byte[] governmentIdImage;

    @Column(name = "government_id_content_type")
    private String governmentIdContentType;

    @Column(name = "government_id_file_name")
    private String governmentIdFileName;

    @Column(name = "government_id_size")
    private Long governmentIdSize;

    // Approval Tracking
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "approved_date")
    private LocalDateTime approvedDate;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "generated_username")
    private String generatedUsername;

    @Column(name = "generated_password")
    private String generatedPassword;

    // Relationship to User (created after approval)
    @OneToOne(mappedBy = "studentRegistration", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private User user;

    // Audit
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (registrationDate == null) {
            registrationDate = LocalDateTime.now();
        }
        if (status == null) {
            status = RegistrationStatus.PENDING;
        }
        if (role == null) {
            role = "STUDENT";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper methods for bidirectional relationships
    public void addAcademicInfo(AcademicInfo academicInfo) {
        academicInfoList.add(academicInfo);
        academicInfo.setStudentRegistration(this);
    }

    public void removeAcademicInfo(AcademicInfo academicInfo) {
        academicInfoList.remove(academicInfo);
        academicInfo.setStudentRegistration(null);
    }

    public void addWorkExperience(WorkExperience workExperience) {
        workExperienceList.add(workExperience);
        workExperience.setStudentRegistration(this);
    }

    public void removeWorkExperience(WorkExperience workExperience) {
        workExperienceList.remove(workExperience);
        workExperience.setStudentRegistration(null);
    }

    // Enums
    public enum RegistrationStatus {
        PENDING,
        APPROVED,
        REJECTED
    }

    // Embedded Classes
    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PersonalDetails {

        @NotBlank(message = "First name is required")
        @Size(max = 100, message = "First name must not exceed 100 characters")
        @Column(name = "first_name", nullable = false)
        private String firstName;

        @NotBlank(message = "Last name is required")
        @Size(max = 100, message = "Last name must not exceed 100 characters")
        @Column(name = "last_name", nullable = false)
        private String lastName;

        @NotBlank(message = "Email is required")
        @Email(message = "Email should be valid")
        @Pattern(regexp = ".*@gmail\\.com$", message = "Only Gmail addresses are allowed")
        @Column(unique = true, nullable = false)
        private String email;

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
        @Column(name = "phone", nullable = false)
        private String phone;

        @Column(name = "contact_no")
        @Pattern(regexp = "^[0-9]{10}$", message = "Contact number must be 10 digits")
        private String contactNo;

        @Column(name = "student_id")
        private String studentId;

        @Column(name = "gender")
        private String gender;

        @Column(name = "marital_status")
        private String maritalStatus;
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Address {

        @NotBlank(message = "Street is required")
        @Column(name = "street")
        private String street;

        @NotBlank(message = "City is required")
        @Column(name = "city")
        private String city;

        @NotBlank(message = "State is required")
        @Column(name = "state")
        private String state;

        @NotBlank(message = "Pincode is required")
        @Pattern(regexp = "^[0-9]{6}$", message = "Pincode must be 6 digits")
        @Column(name = "pincode")
        private String pincode;
    }
}
