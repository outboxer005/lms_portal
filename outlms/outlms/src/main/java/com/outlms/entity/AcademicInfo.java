package com.outlms.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "academic_info")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AcademicInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Institution name is required")
    @Column(name = "institution_name", nullable = false)
    private String institutionName;

    @NotBlank(message = "Degree is required")
    @Column(nullable = false)
    private String degree;

    @NotNull(message = "Passing year is required")
    @Column(name = "passing_year", nullable = false)
    private Integer passingYear;

    @Column(name = "grade")
    private String grade;

    @Column(name = "grade_in_percentage")
    private Double gradeInPercentage;

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_registration_id", nullable = false)
    private StudentRegistration studentRegistration;
}
