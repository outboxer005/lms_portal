package com.outlms.service;

import com.outlms.dto.AdminDashboardResponse;
import com.outlms.dto.AdminDashboardResponse.StudentRegistrationSummary;
import com.outlms.dto.StudentDashboardResponse;
import com.outlms.dto.StudentDashboardResponse.ProfileCompleteness;
import com.outlms.entity.StudentRegistration;
import com.outlms.entity.StudentRegistration.RegistrationStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final StudentRegistrationService registrationService;

    /**
     * Get student dashboard data
     */
    /**
     * Get student dashboard data
     */
    public StudentDashboardResponse getStudentDashboard(String usernameOrEmail) {
        StudentRegistration registration = registrationService.getRegistrationByUsernameOrEmail(usernameOrEmail);

        String fullName = registration.getPersonalDetails().getFirstName() + " " +
                registration.getPersonalDetails().getLastName();

        StudentDashboardResponse response = new StudentDashboardResponse();
        response.setRegistrationId(registration.getRegistrationId());
        response.setFullName(fullName);
        response.setEmail(registration.getPersonalDetails().getEmail());
        response.setMobile(registration.getPersonalDetails().getPhone());
        response.setStatus(registration.getStatus().toString());
        response.setRegistrationDate(registration.getRegistrationDate());
        response.setApprovedDate(registration.getApprovedDate());
        response.setGeneratedUsername(registration.getGeneratedUsername());

        // Calculate profile completeness
        ProfileCompleteness completeness = calculateProfileCompleteness(registration);
        response.setCompleteness(completeness);

        return response;
    }

    /**
     * Get admin dashboard data with statistics
     */
    public AdminDashboardResponse getAdminDashboard() {
        AdminDashboardResponse response = new AdminDashboardResponse();

        // Get statistics
        response.setTotalRegistrations(registrationService.getTotalRegistrationsCount());
        response.setPendingApprovals(registrationService.countByStatus(RegistrationStatus.PENDING));
        response.setApprovedRegistrations(registrationService.countByStatus(RegistrationStatus.APPROVED));
        response.setRejectedRegistrations(registrationService.countByStatus(RegistrationStatus.REJECTED));

        // Get recent registrations (last 10)
        List<StudentRegistration> recentRegistrations = registrationService.getRecentRegistrations(10);
        List<StudentRegistrationSummary> summaries = recentRegistrations.stream()
                .map(this::mapToSummary)
                .collect(Collectors.toList());

        response.setRecentRegistrations(summaries);

        return response;
    }

    /**
     * Calculate profile completeness
     */
    private ProfileCompleteness calculateProfileCompleteness(StudentRegistration registration) {
        ProfileCompleteness completeness = new ProfileCompleteness();

        // Personal info complete
        boolean personalComplete = registration.getPersonalDetails() != null &&
                registration.getPersonalDetails().getFirstName() != null &&
                registration.getPersonalDetails().getLastName() != null &&
                registration.getPersonalDetails().getEmail() != null &&
                registration.getPersonalDetails().getPhone() != null;
        completeness.setPersonalInfoComplete(personalComplete);

        // Address complete
        boolean addressComplete = registration.getAddress() != null &&
                registration.getAddress().getStreet() != null &&
                registration.getAddress().getCity() != null &&
                registration.getAddress().getState() != null &&
                registration.getAddress().getPincode() != null;
        completeness.setAddressComplete(addressComplete);

        // Academic info complete
        boolean academicComplete = registration.getAcademicInfoList() != null &&
                !registration.getAcademicInfoList().isEmpty();
        completeness.setEducationComplete(academicComplete);

        // Government ID document uploaded (BLOB)
        boolean documentUploaded = registration.getGovernmentIdImage() != null;
        completeness.setDocumentUploaded(documentUploaded);

        // Calculate overall percentage
        int total = 4;
        int completed = 0;
        if (personalComplete)
            completed++;
        if (addressComplete)
            completed++;
        if (academicComplete)
            completed++;
        if (documentUploaded)
            completed++;

        int percentage = (completed * 100) / total;
        completeness.setOverallPercentage(percentage);

        return completeness;
    }

    /**
     * Map StudentRegistration to Summary DTO
     */
    private StudentRegistrationSummary mapToSummary(StudentRegistration registration) {
        String fullName = registration.getPersonalDetails().getFirstName() + " " +
                registration.getPersonalDetails().getLastName();

        StudentRegistrationSummary summary = new StudentRegistrationSummary();
        summary.setId(registration.getId());
        summary.setRegistrationId(registration.getRegistrationId());
        summary.setFullName(fullName);
        summary.setEmail(registration.getPersonalDetails().getEmail());
        summary.setMobile(registration.getPersonalDetails().getPhone());
        summary.setStatus(registration.getStatus().toString());

        // Get first academic info if available
        if (registration.getAcademicInfoList() != null && !registration.getAcademicInfoList().isEmpty()) {
            summary.setCourse(registration.getAcademicInfoList().get(0).getDegree());
            summary.setBranch(registration.getAcademicInfoList().get(0).getInstitutionName());
        }

        summary.setRegistrationDate(registration.getRegistrationDate());
        return summary;
    }
}
