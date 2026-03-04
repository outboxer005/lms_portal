package com.outlms.dto;

import jakarta.validation.constraints.*;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentRegistrationRequest {

    @Valid
    @NotNull(message = "Personal details are required")
    private PersonalDetailsDTO personalDetails;

    private String role;

    @Valid
    @NotNull(message = "Address is required")
    private AddressDTO address;

    @Valid
    private List<AcademicInfoDTO> academicInfoList;

    @Valid
    private List<WorkExperienceDTO> workExperienceList;

    // Note: Government ID image will be handled via MultipartFile separately

    // Inner DTOs
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PersonalDetailsDTO {

        @NotBlank(message = "First name is required")
        @Size(max = 100, message = "First name must not exceed 100 characters")
        private String firstName;

        @NotBlank(message = "Last name is required")
        @Size(max = 100, message = "Last name must not exceed 100 characters")
        private String lastName;

        @NotBlank(message = "Email is required")
        @Email(message = "Email should be valid")
        private String email;

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
        private String phone;

        @Pattern(regexp = "^[0-9]{10}$", message = "Contact number must be 10 digits")
        private String contactNo;

        private String studentId;

        private String gender;

        private String maritalStatus;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddressDTO {

        @NotBlank(message = "Street is required")
        private String street;

        @NotBlank(message = "City is required")
        private String city;

        @NotBlank(message = "State is required")
        private String state;

        @NotBlank(message = "Pincode is required")
        @Pattern(regexp = "^[0-9]{6}$", message = "Pincode must be 6 digits")
        private String pincode;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AcademicInfoDTO {

        @NotBlank(message = "Institution name is required")
        private String institutionName;

        @NotBlank(message = "Degree is required")
        private String degree;

        @NotNull(message = "Passing year is required")
        private Integer passingYear;

        private String grade;

        private Double gradeInPercentage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkExperienceDTO {

        @NotNull(message = "Start date is required")
        private LocalDate startDate;

        private LocalDate endDate;

        @NotNull(message = "Currently working status is required")
        private Boolean currentlyWorking;

        @NotBlank(message = "Company name is required")
        private String companyName;

        @NotBlank(message = "Designation is required")
        private String designation;

        private Double ctc;

        private String reasonForLeaving;
    }
}
