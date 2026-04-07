package com.outlms.controller;

import com.outlms.dto.PaymentOrderRequest;
import com.outlms.dto.PaymentOrderResponse;
import com.outlms.dto.PaymentVerificationRequest;
import com.outlms.entity.BookIssuance;
import com.outlms.entity.Payment;
import com.outlms.entity.StudentMembership;
import com.outlms.entity.User;
import com.outlms.repository.UserRepository;
import com.outlms.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;

    @PostMapping("/create-order")
    @PreAuthorize("hasAnyRole('STUDENT', 'STAFF', 'ADMIN')")
    public ResponseEntity<?> createOrder(@RequestBody PaymentOrderRequest request, Authentication authentication) {
        try {
            User user = getUserFromAuth(authentication);
            PaymentOrderResponse response = paymentService.createOrder(request, user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating payment order: " + e.getMessage());
        }
    }

    @PostMapping("/verify")
    @PreAuthorize("hasAnyRole('STUDENT', 'STAFF', 'ADMIN')")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerificationRequest request) {
        try {
            Payment payment = paymentService.verifyPayment(request);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Payment verification failed: " + e.getMessage());
        }
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('STUDENT', 'STAFF', 'ADMIN')")
    public ResponseEntity<List<Payment>> getPaymentHistory(Authentication authentication) {
        User user = getUserFromAuth(authentication);
        List<Payment> payments = paymentService.getPaymentHistory(user);
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/unpaid-fines")
    @PreAuthorize("hasAnyRole('STUDENT', 'STAFF', 'ADMIN')")
    public ResponseEntity<List<BookIssuance>> getUnpaidFines(Authentication authentication) {
        User user = getUserFromAuth(authentication);
        List<BookIssuance> unpaidFines = paymentService.getUnpaidFines(user);
        return ResponseEntity.ok(unpaidFines);
    }

    @GetMapping("/unpaid-memberships")
    @PreAuthorize("hasAnyRole('STUDENT', 'STAFF', 'ADMIN')")
    public ResponseEntity<List<StudentMembership>> getUnpaidMemberships(Authentication authentication) {
        User user = getUserFromAuth(authentication);
        List<StudentMembership> unpaidMemberships = paymentService.getUnpaidMemberships(user);
        return ResponseEntity.ok(unpaidMemberships);
    }

    private User getUserFromAuth(Authentication authentication) {
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
