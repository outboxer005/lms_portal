package com.outlms.service;

import com.outlms.dto.PaymentOrderRequest;
import com.outlms.dto.PaymentOrderResponse;
import com.outlms.dto.PaymentVerificationRequest;
import com.outlms.entity.*;
import com.outlms.repository.*;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final BookIssuanceRepository bookIssuanceRepository;
    private final StudentMembershipRepository studentMembershipRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final MembershipService membershipService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Value("${razorpay.currency}")
    private String currency;

    @Value("${payment.receipt.prefix}")
    private String receiptPrefix;

    @Transactional
    public PaymentOrderResponse createOrder(PaymentOrderRequest request, User user) throws RazorpayException {
        // Initialize Razorpay client
        RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

        // Generate unique receipt ID
        String receiptId = receiptPrefix + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // Convert amount to paise (Razorpay uses smallest currency unit)
        int amountInPaise = (int) (request.getAmount() * 100);

        // Create Razorpay order
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", currency);
        orderRequest.put("receipt", receiptId);
        orderRequest.put("payment_capture", 1);

        Order razorpayOrder = razorpayClient.orders.create(orderRequest);

        // Create Payment entity
        Payment payment = new Payment();
        payment.setUser(user);
        payment.setPaymentType(request.getPaymentType());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setAmount(request.getAmount());
        payment.setRazorpayOrderId(razorpayOrder.get("id"));
        payment.setReceiptId(receiptId);
        payment.setDescription(request.getDescription());
        payment.setCurrency(currency);

        // Link to BookIssuance or StudentMembership based on payment type
        if (request.getPaymentType() == PaymentType.FINE_PAYMENT && request.getReferenceId() != null) {
            BookIssuance issuance = bookIssuanceRepository.findById(request.getReferenceId())
                    .orElseThrow(() -> new RuntimeException("Book issuance not found"));
            payment.setBookIssuance(issuance);
        } else if (request.getPaymentType() == PaymentType.MEMBERSHIP_PAYMENT && request.getReferenceId() != null) {
            StudentMembership membership = studentMembershipRepository.findById(request.getReferenceId())
                    .orElseThrow(() -> new RuntimeException("Membership not found"));
            payment.setStudentMembership(membership);
        }

        // Save payment
        payment = paymentRepository.save(payment);

        // Return response for frontend
        return new PaymentOrderResponse(
                razorpayOrder.get("id"),
                request.getAmount(),
                currency,
                razorpayKeyId,
                receiptId,
                request.getDescription()
        );
    }

    @Transactional
    public Payment verifyPayment(PaymentVerificationRequest request) throws Exception {
        // Find payment by order ID
        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        // Verify signature
        boolean isValid = verifyRazorpaySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (isValid) {
            // Update payment with success details
            payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
            payment.setRazorpaySignature(request.getRazorpaySignature());
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setPaymentDate(LocalDateTime.now());

            payment = paymentRepository.save(payment);

            // Handle post-payment actions
            handlePaymentSuccess(payment);

            return payment;
        } else {
            // Mark payment as failed
            payment.setStatus(PaymentStatus.FAILED);
            payment.setNotes("Signature verification failed");
            paymentRepository.save(payment);

            throw new RuntimeException("Payment signature verification failed");
        }
    }

    private boolean verifyRazorpaySignature(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(razorpayKeySecret.getBytes(), "HmacSHA256");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(payload.getBytes());

            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }

            return hexString.toString().equals(signature);
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional
    public void handlePaymentSuccess(Payment payment) {
        User user = payment.getUser();

        // Handle based on payment type
        if (payment.getPaymentType() == PaymentType.FINE_PAYMENT && payment.getBookIssuance() != null) {
            // Mark fine as paid
            BookIssuance issuance = payment.getBookIssuance();
            issuance.setIsPenaltyPaid(true);
            issuance.setPenaltyPaidDate(LocalDateTime.now());
            bookIssuanceRepository.save(issuance);

            // Create notification
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setTitle("Fine Payment Successful");
            notification.setMessage("Your fine of Rs. " + payment.getAmount() + " has been paid successfully for the book: " + issuance.getBook().getTitle());
            notification.setRead(false);
            notificationRepository.save(notification);

        } else if (payment.getPaymentType() == PaymentType.MEMBERSHIP_PAYMENT && payment.getStudentMembership() != null) {
            // Activate membership
            StudentMembership membership = payment.getStudentMembership();
            membership.setIsPaymentCompleted(true);
            membership.setPaymentDate(LocalDateTime.now());
            membership.setStatus(StudentMembership.MembershipStatus.ACTIVE);
            studentMembershipRepository.save(membership);

            // Create notification
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setTitle("Membership Payment Successful");
            notification.setMessage("Your membership plan '" + membership.getPlan().getName() + "' has been activated successfully!");
            notification.setRead(false);
            notificationRepository.save(notification);
        }

        // Send payment receipt email
        emailService.sendPaymentReceiptEmail(payment);
    }

    public List<Payment> getPaymentHistory(User user) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public List<BookIssuance> getUnpaidFines(User user) {
        return bookIssuanceRepository.findUnpaidFinesByStudent(user.getId(), 0.0);
    }

    public List<StudentMembership> getUnpaidMemberships(User user) {
        return studentMembershipRepository.findByStudentIdAndIsPaymentCompletedFalse(user.getId());
    }
}
