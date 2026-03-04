package com.outlms.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IssueBookRequest {
    private Long bookId;
    private Long studentId; // student user ID
    private LocalDate dueDate;
    private String notes;
}
