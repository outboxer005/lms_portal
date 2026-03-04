package com.outlms.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    
    private long totalRegistrations;
    private long pendingApprovals;
    private long approvedRegistrations;
    private long rejectedRegistrations;
    private List<StudentRegistrationSummary> recentRegistrations;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentRegistrationSummary {
        private Long id;
        private String registrationId;
        private String fullName;
        private String email;
        private String mobile;
        private String status;
        private String course;
        private String branch;
        private LocalDateTime registrationDate;
    }
}
