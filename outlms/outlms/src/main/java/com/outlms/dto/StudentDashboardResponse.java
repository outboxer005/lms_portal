package com.outlms.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentDashboardResponse {
    
    private String registrationId;
    private String fullName;
    private String email;
    private String mobile;
    private String status;
    private LocalDateTime registrationDate;
    private LocalDateTime approvedDate;
    private String generatedUsername;
    private String course;
    private String branch;
    private Integer academicYear;
    private ProfileCompleteness completeness;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileCompleteness {
        private boolean personalInfoComplete;
        private boolean addressComplete;
        private boolean educationComplete;
        private boolean documentUploaded;
        private int overallPercentage;
    }
}
