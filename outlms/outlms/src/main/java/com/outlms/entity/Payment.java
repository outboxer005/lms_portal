package com.outlms.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "studentRegistration"})
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentType paymentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(nullable = false)
    private Double amount;

    @Column(name = "razorpay_order_id", unique = true)
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id", unique = true)
    private String razorpayPaymentId;

    @Column(name = "razorpay_signature")
    private String razorpaySignature;

    @Column(name = "receipt_id", unique = true)
    private String receiptId;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, length = 3)
    private String currency = "INR";

    @Column(length = 1000)
    private String notes;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    // References to related entities (nullable - only one will be set based on payment type)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "book_issuance_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private BookIssuance bookIssuance;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_membership_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private StudentMembership studentMembership;

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
}
