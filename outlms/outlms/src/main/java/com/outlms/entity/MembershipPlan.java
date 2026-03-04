package com.outlms.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "membership_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MembershipPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlanTier tier;

    @Column(name = "book_allowance", nullable = false)
    private Integer bookAllowance; // max books at a time

    @Column(name = "loan_duration_days", nullable = false)
    private Integer loanDurationDays; // default borrow period

    @Column(name = "max_renewals")
    private Integer maxRenewals = 0;

    @Column(name = "monthly_fee")
    private Double monthlyFee = 0.0;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum PlanTier {
        BASIC,
        STANDARD,
        PREMIUM,
        UNLIMITED
    }
}
