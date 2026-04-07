package com.outlms.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.outlms.dto.StudentRegistrationRequest;
import com.outlms.entity.AcademicInfo;
import com.outlms.entity.StudentRegistration;
import com.outlms.entity.StudentRegistration.RegistrationStatus;
import com.outlms.entity.User;
import com.outlms.entity.WorkExperience;
import com.outlms.repository.NotificationRepository;
import com.outlms.repository.StudentRegistrationRepository;
import com.outlms.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class StudentRegistrationService {

    private final StudentRegistrationRepository registrationRepository;
    private final FileStorageService fileStorageService;
    private final EmailService emailService;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /**
     * Register a new student with document upload
     */
    public StudentRegistration registerStudent(StudentRegistrationRequest request, MultipartFile governmentIdImage)
            throws IOException {

        // Validate unique email (check both pending and approved registrations)
        String email = request.getPersonalDetails().getEmail();
        
        // Validate email is not empty
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email is required and cannot be empty.");
        }
        
        // Check if email already exists (with explicit null check in query)
        if (registrationRepository.emailExists(email.trim())) {
            throw new RuntimeException("This email is already registered. Please use a different email or contact admin if you believe this is an error.");
        }

        // Validate government ID image
        if (governmentIdImage != null && !governmentIdImage.isEmpty()) {
            fileStorageService.validateFile(governmentIdImage);
        }

        // Create registration entity
        StudentRegistration registration = new StudentRegistration();
        registration.setRegistrationId(generateRegistrationId());
        registration.setRegistrationDate(LocalDateTime.now());
        registration.setStatus(RegistrationStatus.PENDING);
        registration.setRole(request.getRole());

        // Set Personal Details (Embedded)
        StudentRegistration.PersonalDetails personalDetails = new StudentRegistration.PersonalDetails();
        personalDetails.setFirstName(request.getPersonalDetails().getFirstName());
        personalDetails.setLastName(request.getPersonalDetails().getLastName());
        personalDetails.setEmail(request.getPersonalDetails().getEmail());
        personalDetails.setPhone(request.getPersonalDetails().getPhone());
        personalDetails.setContactNo(request.getPersonalDetails().getContactNo());
        personalDetails.setStudentId(request.getPersonalDetails().getStudentId());
        personalDetails.setGender(request.getPersonalDetails().getGender());
        personalDetails.setMaritalStatus(request.getPersonalDetails().getMaritalStatus());
        registration.setPersonalDetails(personalDetails);

        // Set Address (Embedded)
        StudentRegistration.Address address = new StudentRegistration.Address();
        address.setStreet(request.getAddress().getStreet());
        address.setCity(request.getAddress().getCity());
        address.setState(request.getAddress().getState());
        address.setPincode(request.getAddress().getPincode());
        registration.setAddress(address);

        // Save registration first to get ID for bidirectional relationships
        registration = registrationRepository.save(registration);

        // Add Academic Info List
        if (request.getAcademicInfoList() != null) {
            for (StudentRegistrationRequest.AcademicInfoDTO dto : request.getAcademicInfoList()) {
                AcademicInfo academicInfo = new AcademicInfo();
                academicInfo.setInstitutionName(dto.getInstitutionName());
                academicInfo.setDegree(dto.getDegree());
                academicInfo.setPassingYear(dto.getPassingYear());
                academicInfo.setGrade(dto.getGrade());
                academicInfo.setGradeInPercentage(dto.getGradeInPercentage());
                registration.addAcademicInfo(academicInfo);
            }
        }

        // Add Work Experience List
        if (request.getWorkExperienceList() != null) {
            for (StudentRegistrationRequest.WorkExperienceDTO dto : request.getWorkExperienceList()) {
                WorkExperience workExp = new WorkExperience();
                workExp.setStartDate(dto.getStartDate());
                workExp.setEndDate(dto.getEndDate());
                workExp.setCurrentlyWorking(dto.getCurrentlyWorking());
                workExp.setCompanyName(dto.getCompanyName());
                workExp.setDesignation(dto.getDesignation());
                workExp.setCtc(dto.getCtc());
                workExp.setReasonForLeaving(dto.getReasonForLeaving());
                registration.addWorkExperience(workExp);
            }
        }

        // Store Government ID Image as BLOB
        if (governmentIdImage != null && !governmentIdImage.isEmpty()) {
            registration.setGovernmentIdImage(governmentIdImage.getBytes());
            registration.setGovernmentIdContentType(governmentIdImage.getContentType());
            registration.setGovernmentIdFileName(governmentIdImage.getOriginalFilename());
            registration.setGovernmentIdSize(governmentIdImage.getSize());
        }

        // Save again with all relationships and BLOB
        registration = registrationRepository.save(registration);

        // Send confirmation email
        emailService.sendRegistrationConfirmation(registration);

        // Send in-app notification to all admins
        List<User> admins = userRepository.findByRoleAndActiveTrue(User.Role.ADMIN);
        for (User admin : admins) {
            com.outlms.entity.Notification notification = new com.outlms.entity.Notification();
            notification.setUser(admin);
            notification.setTitle("New Registration Request");
            notification.setMessage("A new " + (request.getRole() != null ? request.getRole().toLowerCase() : "user") + 
                                  " (" + request.getPersonalDetails().getFirstName() + " " + request.getPersonalDetails().getLastName() + 
                                  ") has registered and is pending approval.");
            notificationRepository.save(notification);
        }

        return registration;
    }
    private String generateRegistrationId() {
        String year = String.valueOf(Year.now().getValue());
        long count = registrationRepository.countAllRegistrations() + 1;
        String sequence = String.format("%03d", count);
        return "STU" + year + sequence;
    }

    /**
     * Get registration by ID
     */
    @Transactional(readOnly = true)
    public StudentRegistration getRegistrationById(Long id) {
        return registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration not found with ID: " + id));
    }

    /**
     * Get registration by registration ID
     */
    @Transactional(readOnly = true)
    public StudentRegistration getRegistrationByRegistrationId(String registrationId) {
        return registrationRepository.findByRegistrationId(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found with ID: " + registrationId));
    }

    /**
     * Get registration by email
     */
    @Transactional(readOnly = true)
    public StudentRegistration getRegistrationByEmail(String email) {
        return registrationRepository.findByPersonalDetailsEmail(email)
                .orElseThrow(() -> new RuntimeException("Registration not found for email: " + email));
    }

    /**
     * Get all registrations
     */
    @Transactional(readOnly = true)
    public List<StudentRegistration> getAllRegistrations() {
        return registrationRepository.findAll();
    }

    /**
     * Get registrations by status
     */
    @Transactional(readOnly = true)
    public List<StudentRegistration> getRegistrationsByStatus(RegistrationStatus status) {
        return registrationRepository.findByStatusOrderByRegistrationDateDesc(status);
    }

    /**
     * Get pending registrations
     */
    @Transactional(readOnly = true)
    public List<StudentRegistration> getPendingRegistrations() {
        return registrationRepository.findByStatusOrderByRegistrationDateDesc(RegistrationStatus.PENDING);
    }

    /**
     * Get recent registrations
     */
    @Transactional(readOnly = true)
    public List<StudentRegistration> getRecentRegistrations(int limit) {
        return registrationRepository.findRecentRegistrations(PageRequest.of(0, limit));
    }

    /**
     * Search registrations
     */
    @Transactional(readOnly = true)
    public List<StudentRegistration> searchRegistrations(String query) {
        return registrationRepository.searchRegistrations(query);
    }

    /**
     * Get statistics by status
     */
    @Transactional(readOnly = true)
    public long countByStatus(RegistrationStatus status) {
        return registrationRepository.countByStatus(status);
    }

    /**
     * Get total registrations count
     */
    @Transactional(readOnly = true)
    public long getTotalRegistrationsCount() {
        return registrationRepository.countAllRegistrations();
    }

    /**
     * Update registration status
     */
    public StudentRegistration updateRegistrationStatus(Long id, RegistrationStatus status) {
        StudentRegistration registration = getRegistrationById(id);
        registration.setStatus(status);
        return registrationRepository.save(registration);
    }

    /**
     * Get registration by username or email
     */
    @Transactional(readOnly = true)
    public StudentRegistration getRegistrationByUsernameOrEmail(String usernameOrEmail) {
        // First try to find by generated username (for approved students)
        java.util.Optional<StudentRegistration> byUsername = registrationRepository
                .findByGeneratedUsername(usernameOrEmail);
        if (byUsername.isPresent()) {
            return byUsername.get();
        }

        // If not found, try by email
        java.util.Optional<StudentRegistration> byEmail = registrationRepository
                .findByPersonalDetailsEmail(usernameOrEmail);
        if (byEmail.isPresent()) {
            return byEmail.get();
        }

        throw new RuntimeException("Registration not found for username/email: " + usernameOrEmail);
    }
    
    /**
     * Get registrations by role
     */
    @Transactional(readOnly = true)
    public List<StudentRegistration> getRegistrationsByRole(String role) {
        return registrationRepository.findByRoleOrderByRegistrationDateDesc(role);
    }
    
    /**
     * Get registrations by role and status
     */
    @Transactional(readOnly = true)
    public List<StudentRegistration> getRegistrationsByRoleAndStatus(String role, RegistrationStatus status) {
        return registrationRepository.findByRoleAndStatusOrderByRegistrationDateDesc(role, status);
    }
}
