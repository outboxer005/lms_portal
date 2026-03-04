package com.outlms.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalRequest {
    
    @NotNull(message = "Registration ID is required")
    private Long registrationId;
    
    @NotNull(message = "Action is required")
    private ApprovalAction action;
    
    private String rejectionReason; // Required if action is REJECT
    
    public enum ApprovalAction {
        APPROVE,
        REJECT
    }
}
