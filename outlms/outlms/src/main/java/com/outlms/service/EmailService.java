package com.outlms.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.outlms.entity.StudentRegistration;
import com.outlms.entity.BookIssuance;
import com.outlms.entity.StudentMembership;

@Service
public class EmailService {

    private static final String SYSTEM_NAME = "LibPortal - Library Management System";

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Send registration confirmation email (HTML, professional template with
     * header).
     * Runs asynchronously so the HTTP response is not delayed by SMTP.
     */
    @Async
    public void sendRegistrationConfirmation(StudentRegistration registration) {
        try {
            String to = registration.getPersonalDetails().getEmail();
            String fullName = registration.getPersonalDetails().getFirstName() + " " +
                    registration.getPersonalDetails().getLastName();
            String regId = registration.getRegistrationId();
            String email = registration.getPersonalDetails().getEmail();
            String phone = registration.getPersonalDetails().getPhone();

            String subject = "Registration Received – " + regId + " | " + SYSTEM_NAME;

            String htmlBody = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
                    +
                    "<title>Registration Confirmation</title></head><body style=\"margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f1f5f9;\">"
                    +
                    "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:#f1f5f9;padding:32px 16px;\">"
                    +
                    "<tr><td align=\"center\">" +
                    "<table role=\"presentation\" width=\"600\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);\">"
                    +
                    "<!-- Header -->" +
                    "<tr><td style=\"background:linear-gradient(135deg,#1e3a5f 0%,#0f172a 100%);padding:32px 40px;text-align:center;\">"
                    +
                    "<div style=\"font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;\">📚 LibPortal</div>"
                    +
                    "<div style=\"font-size:14px;color:rgba(255,255,255,0.85);margin-top:6px;\">Library Management System</div>"
                    +
                    "</td></tr>" +
                    "<tr><td style=\"padding:40px 40px 32px;\">" +
                    "<p style=\"margin:0 0 16px;font-size:16px;color:#334155;line-height:1.6;\">Dear <strong>"
                    + escapeHtml(fullName) + "</strong>,</p>" +
                    "<p style=\"margin:0 0 24px;font-size:16px;color:#334155;line-height:1.6;\">Thank you for registering with us. Your application has been received and is under review.</p>"
                    +
                    "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;\">"
                    +
                    "<tr><td style=\"padding:20px 24px;\">" +
                    "<p style=\"margin:0 0 8px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;\">Registration details</p>"
                    +
                    "<p style=\"margin:0 0 4px;font-size:15px;color:#0f172a;\"><strong>Registration ID:</strong> "
                    + escapeHtml(regId) + "</p>" +
                    "<p style=\"margin:0 0 4px;font-size:15px;color:#0f172a;\"><strong>Name:</strong> "
                    + escapeHtml(fullName) + "</p>" +
                    "<p style=\"margin:0 0 4px;font-size:15px;color:#0f172a;\"><strong>Email:</strong> "
                    + escapeHtml(email) + "</p>" +
                    "<p style=\"margin:0 0 0;font-size:15px;color:#0f172a;\"><strong>Phone:</strong> "
                    + escapeHtml(phone) + "</p>" +
                    "</td></tr></table>" +
                    "<div style=\"margin-top:24px;padding:16px 20px;background:#fef3c7;border-radius:10px;border-left:4px solid #f59e0b;\">"
                    +
                    "<p style=\"margin:0;font-size:14px;color:#92400e;\"><strong>Status: PENDING</strong> – You will receive an email with your login credentials once an administrator approves your registration.</p>"
                    +
                    "</div>" +
                    "<p style=\"margin:24px 0 0;font-size:15px;color:#64748b;line-height:1.6;\">If you have any questions, please contact the administrator.</p>"
                    +
                    "</td></tr>" +
                    "<tr><td style=\"padding:24px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;\">"
                    +
                    "<p style=\"margin:0;font-size:13px;color:#64748b;\">Best regards,<br/><strong>" + SYSTEM_NAME
                    + "</strong></p>" +
                    "</td></tr></table></td></tr></table></body></html>";

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            System.err.println("Failed to send confirmation email: " + e.getMessage());
        }
    }

    private static String escapeHtml(String s) {
        if (s == null)
            return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }

    /**
     * Send approval email with credentials.
     * Runs asynchronously so the HTTP response is not delayed by SMTP.
     */
    @Async
    public void sendApprovalEmail(StudentRegistration registration, String username, String password) {
        String fullName = registration.getPersonalDetails().getFirstName() + " " +
                registration.getPersonalDetails().getLastName();
        String email = registration.getPersonalDetails().getEmail();

        // Get academic info if available (staff may have empty list)
        String course = "N/A";
        String branch = "N/A";
        Integer academicYear = 0;
        if (registration.getAcademicInfoList() != null && !registration.getAcademicInfoList().isEmpty()) {
            var first = registration.getAcademicInfoList().get(0);
            course = first.getDegree() != null ? first.getDegree() : "N/A";
            branch = first.getInstitutionName() != null ? first.getInstitutionName() : "N/A";
            academicYear = first.getPassingYear() != null ? first.getPassingYear() : 0;
        }

        String roleLabel = "STAFF".equalsIgnoreCase(registration.getRole()) ? "staff" : "student";

        try {
            String subject = "Registration Approved – Login Credentials | " + SYSTEM_NAME;
            String htmlBody = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"></head>"
                    +
                    "<body style=\"margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f1f5f9;\">"
                    +
                    "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:#f1f5f9;padding:32px 16px;\">"
                    +
                    "<tr><td align=\"center\">" +
                    "<table role=\"presentation\" width=\"600\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);\">"
                    +
                    "<tr><td style=\"background:linear-gradient(135deg,#059669 0%,#047857 100%);padding:32px 40px;text-align:center;\">"
                    +
                    "<div style=\"font-size:28px;font-weight:700;color:#ffffff;\">✓ Registration Approved</div>" +
                    "<div style=\"font-size:14px;color:rgba(255,255,255,0.9);margin-top:6px;\">" + SYSTEM_NAME
                    + "</div>" +
                    "</td></tr>" +
                    "<tr><td style=\"padding:40px 40px 32px;\">" +
                    "<p style=\"margin:0 0 16px;font-size:16px;color:#334155;line-height:1.6;\">Dear <strong>"
                    + escapeHtml(fullName) + "</strong>,</p>" +
                    "<p style=\"margin:0 0 24px;font-size:16px;color:#334155;line-height:1.6;\">Congratulations! Your registration has been <strong>approved</strong>. Use the credentials below to sign in.</p>"
                    +
                    "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:#ecfdf5;border-radius:12px;border:1px solid #a7f3d0;\">"
                    +
                    "<tr><td style=\"padding:20px 24px;\">" +
                    "<p style=\"margin:0 0 8px;font-size:12px;color:#047857;text-transform:uppercase;letter-spacing:0.05em;\">Login credentials</p>"
                    +
                    "<p style=\"margin:0 0 4px;font-size:15px;color:#0f172a;\"><strong>Username:</strong> "
                    + escapeHtml(username) + "</p>" +
                    "<p style=\"margin:0 0 0;font-size:15px;color:#0f172a;\"><strong>Temporary password:</strong> "
                    + escapeHtml(password) + "</p>" +
                    "</td></tr></table>" +
                    "<div style=\"margin-top:24px;padding:16px 20px;background:#fef3c7;border-radius:10px;border-left:4px solid #f59e0b;\">"
                    +
                    "<p style=\"margin:0;font-size:14px;color:#92400e;\"><strong>Important:</strong> Please sign in and change your password immediately for security.</p>"
                    +
                    "</div>" +
                    "<p style=\"margin:24px 0 0;font-size:15px;color:#64748b;\">Registration ID: "
                    + escapeHtml(registration.getRegistrationId()) + " &nbsp;|&nbsp; Name: " + escapeHtml(fullName)
                    + "<br/>Course: " + escapeHtml(course) + " – " + escapeHtml(branch) + " (Year " + academicYear
                    + ")</p>" +
                    "<p style=\"margin:16px 0 0;font-size:15px;color:#334155;\">You can now access the <strong>"
                    + escapeHtml(roleLabel) + " portal</strong>.</p>" +
                    "</td></tr>" +
                    "<tr><td style=\"padding:24px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;\">"
                    +
                    "<p style=\"margin:0;font-size:13px;color:#64748b;\">Best regards,<br/><strong>" + SYSTEM_NAME
                    + "</strong></p>" +
                    "</td></tr></table></td></tr></table></body></html>";

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            System.err.println("Failed to send approval email: " + e.getMessage());
            throw new RuntimeException("Failed to send approval email. Please contact the administrator.");
        }
    }

    /**
     * Send rejection email (HTML).
     * Runs asynchronously so the HTTP response is not delayed by SMTP.
     */
    @Async
    public void sendRejectionEmail(StudentRegistration registration, String reason) {
        String fullName = registration.getPersonalDetails().getFirstName() + " " +
                registration.getPersonalDetails().getLastName();
        String email = registration.getPersonalDetails().getEmail();
        String reasonText = reason != null && !reason.isEmpty() ? reason : "Not specified";

        try {
            String subject = "Registration Update – " + registration.getRegistrationId() + " | " + SYSTEM_NAME;
            String htmlBody = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head>" +
                    "<body style=\"margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f1f5f9;\">"
                    +
                    "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:#f1f5f9;padding:32px 16px;\">"
                    +
                    "<tr><td align=\"center\">" +
                    "<table role=\"presentation\" width=\"600\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);\">"
                    +
                    "<tr><td style=\"background:linear-gradient(135deg,#b91c1c 0%,#991b1b 100%);padding:32px 40px;text-align:center;\">"
                    +
                    "<div style=\"font-size:28px;font-weight:700;color:#ffffff;\">Registration Update</div>" +
                    "<div style=\"font-size:14px;color:rgba(255,255,255,0.9);margin-top:6px;\">" + SYSTEM_NAME
                    + "</div>" +
                    "</td></tr>" +
                    "<tr><td style=\"padding:40px 40px 32px;\">" +
                    "<p style=\"margin:0 0 16px;font-size:16px;color:#334155;line-height:1.6;\">Dear <strong>"
                    + escapeHtml(fullName) + "</strong>,</p>" +
                    "<p style=\"margin:0 0 24px;font-size:16px;color:#334155;line-height:1.6;\">We regret to inform you that your registration has been <strong>rejected</strong>.</p>"
                    +
                    "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:#fef2f2;border-radius:12px;border:1px solid #fecaca;\">"
                    +
                    "<tr><td style=\"padding:20px 24px;\">" +
                    "<p style=\"margin:0 0 4px;font-size:15px;color:#0f172a;\"><strong>Registration ID:</strong> "
                    + escapeHtml(registration.getRegistrationId()) + "</p>" +
                    "<p style=\"margin:0 0 0;font-size:15px;color:#0f172a;\"><strong>Reason:</strong> "
                    + escapeHtml(reasonText) + "</p>" +
                    "</td></tr></table>" +
                    "<p style=\"margin:24px 0 0;font-size:15px;color:#64748b;line-height:1.6;\">If you believe this is an error or have questions, please contact the administrator. You may re-apply with corrected information if needed.</p>"
                    +
                    "</td></tr>" +
                    "<tr><td style=\"padding:24px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;\">"
                    +
                    "<p style=\"margin:0;font-size:13px;color:#64748b;\">Best regards,<br/><strong>" + SYSTEM_NAME
                    + "</strong></p>" +
                    "</td></tr></table></td></tr></table></body></html>";

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            System.err.println("Failed to send rejection email: " + e.getMessage());
        }
    }

    // ---------------------------------------------------------------------
    // LIBRARY: BOOK ISSUANCE + RETURNS + OVERDUE
    // ---------------------------------------------------------------------

    @Async
    public void sendBookIssuedEmail(BookIssuance issuance) {
        try {
            String to = issuance.getStudent().getEmail();
            String fullName = issuance.getStudent().getFirstName() + " " + issuance.getStudent().getLastName();
            String subject = "Book Issued – " + issuance.getBook().getTitle() + " | " + SYSTEM_NAME;

            String htmlBody = "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style=\"font-family:'Segoe UI',sans-serif;background:#f9fafb;padding:24px;\">"
                    + "<div style='max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:24px 28px;border:1px solid #e5e7eb;'>"
                    + "<h2 style='margin-top:0;margin-bottom:12px;color:#111827;'>Book Issued</h2>"
                    + "<p style='margin:0 0 12px;color:#4b5563;'>Dear <strong>" + escapeHtml(fullName)
                    + "</strong>, a book has been issued to your library account.</p>"
                    + "<p style='margin:0 0 8px;color:#111827;'><strong>Title:</strong> "
                    + escapeHtml(issuance.getBook().getTitle()) + "</p>"
                    + "<p style='margin:0 0 8px;color:#111827;'><strong>Issue Date:</strong> " + issuance.getIssueDate()
                    + "</p>"
                    + "<p style='margin:0 0 8px;color:#111827;'><strong>Due Date:</strong> " + issuance.getDueDate()
                    + "</p>"
                    + "<p style='margin:12px 0 0;color:#6b7280;font-size:13px;'>Please return the book on or before the due date to avoid overdue fines.</p>"
                    + "</div></body></html>";

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            System.err.println("Failed to send book issued email: " + e.getMessage());
        }
    }

    @Async
    public void sendBookReturnedEmail(BookIssuance issuance) {
        try {
            String to = issuance.getStudent().getEmail();
            String fullName = issuance.getStudent().getFirstName() + " " + issuance.getStudent().getLastName();
            String subject = "Book Returned – " + issuance.getBook().getTitle() + " | " + SYSTEM_NAME;
            double penalty = issuance.getPenaltyAmount() != null ? issuance.getPenaltyAmount() : 0.0;

            String htmlBody = "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style=\"font-family:'Segoe UI',sans-serif;background:#f9fafb;padding:24px;\">"
                    + "<div style='max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:24px 28px;border:1px solid #e5e7eb;'>"
                    + "<h2 style='margin-top:0;margin-bottom:12px;color:#111827;'>Book Returned</h2>"
                    + "<p style='margin:0 0 12px;color:#4b5563;'>Dear <strong>" + escapeHtml(fullName)
                    + "</strong>, your returned book has been recorded.</p>"
                    + "<p style='margin:0 0 8px;color:#111827;'><strong>Title:</strong> "
                    + escapeHtml(issuance.getBook().getTitle()) + "</p>"
                    + "<p style='margin:0 0 8px;color:#111827;'><strong>Return Date:</strong> "
                    + issuance.getReturnDate() + "</p>"
                    + "<p style='margin:0 0 8px;color:" + (penalty > 0 ? "#b91c1c" : "#16a34a") + ";'><strong>"
                    + (penalty > 0 ? "Penalty: ₹" + penalty : "No penalty applied.") + "</strong></p>"
                    + "<p style='margin:12px 0 0;color:#6b7280;font-size:13px;'>Thank you for using the library.</p>"
                    + "</div></body></html>";

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            System.err.println("Failed to send book returned email: " + e.getMessage());
        }
    }

    @Async
    public void sendOverdueReminderEmail(BookIssuance issuance) {
        try {
            String to = issuance.getStudent().getEmail();
            String fullName = issuance.getStudent().getFirstName() + " " + issuance.getStudent().getLastName();
            String subject = "Overdue Book Reminder – " + issuance.getBook().getTitle() + " | " + SYSTEM_NAME;

            String htmlBody = "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style=\"font-family:'Segoe UI',sans-serif;background:#f9fafb;padding:24px;\">"
                    + "<div style='max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:24px 28px;border:1px solid #fecaca;'>"
                    + "<h2 style='margin-top:0;margin-bottom:12px;color:#b91c1c;'>Overdue Book Notice</h2>"
                    + "<p style='margin:0 0 12px;color:#4b5563;'>Dear <strong>" + escapeHtml(fullName)
                    + "</strong>, the following book is overdue.</p>"
                    + "<p style='margin:0 0 8px;color:#111827;'><strong>Title:</strong> "
                    + escapeHtml(issuance.getBook().getTitle()) + "</p>"
                    + "<p style='margin:0 0 8px;color:#b91c1c;'><strong>Due Date:</strong> " + issuance.getDueDate()
                    + "</p>"
                    + "<p style='margin:12px 0 0;color:#6b7280;font-size:13px;'>Please return the book as soon as possible. Overdue fines are calculated per day after the due date.</p>"
                    + "</div></body></html>";

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            System.err.println("Failed to send overdue reminder email: " + e.getMessage());
        }
    }

    // ---------------------------------------------------------------------
    // MEMBERSHIP NOTIFICATIONS
    // ---------------------------------------------------------------------

    @Async
    public void sendMembershipAssignedEmail(StudentMembership membership) {
        try {
            String to = membership.getStudent().getEmail();
            String fullName = membership.getStudent().getFirstName() + " " + membership.getStudent().getLastName();
            String subject = "Library Membership Assigned – " + membership.getPlan().getName() + " | " + SYSTEM_NAME;

            String htmlBody = "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style=\"font-family:'Segoe UI',sans-serif;background:#f9fafb;padding:24px;\">"
                    + "<div style='max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:24px 28px;border:1px solid #e5e7eb;'>"
                    + "<h2 style='margin-top:0;margin-bottom:12px;color:#111827;'>Membership Assigned</h2>"
                    + "<p style='margin:0 0 12px;color:#4b5563;'>Dear <strong>" + escapeHtml(fullName)
                    + "</strong>, a library membership plan has been assigned to your account.</p>"
                    + "<p style='margin:0 0 8px;color:#111827;'><strong>Plan:</strong> "
                    + escapeHtml(membership.getPlan().getName()) + " (" + membership.getPlan().getTier() + ")</p>"
                    + "<p style='margin:0 0 8px;color:#111827;'><strong>Book Allowance:</strong> "
                    + membership.getPlan().getBookAllowance() + " books</p>"
                    + "<p style='margin:0 0 8px;color:#111827;'><strong>Loan Duration:</strong> "
                    + membership.getPlan().getLoanDurationDays() + " days</p>"
                    + "<p style='margin:12px 0 0;color:#6b7280;font-size:13px;'>You can now borrow books according to this plan.</p>"
                    + "</div></body></html>";

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            System.err.println("Failed to send membership assigned email: " + e.getMessage());
        }
    }

    @Async
    public void sendMembershipRevokedEmail(StudentMembership membership) {
        try {
            String to = membership.getStudent().getEmail();
            String fullName = membership.getStudent().getFirstName() + " " + membership.getStudent().getLastName();
            String subject = "Library Membership Updated | " + SYSTEM_NAME;

            String htmlBody = "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style=\"font-family:'Segoe UI',sans-serif;background:#f9fafb;padding:24px;\">"
                    + "<div style='max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:24px 28px;border:1px solid #fee2e2;'>"
                    + "<h2 style='margin-top:0;margin-bottom:12px;color:#b91c1c;'>Membership Status Changed</h2>"
                    + "<p style='margin:0 0 12px;color:#4b5563;'>Dear <strong>" + escapeHtml(fullName)
                    + "</strong>, your library membership has been updated or suspended.</p>"
                    + "<p style='margin:0 0 8px;color:#111827;'><strong>Previous Plan:</strong> "
                    + escapeHtml(membership.getPlan().getName()) + "</p>"
                    + "<p style='margin:12px 0 0;color:#6b7280;font-size:13px;'>For details, please contact the library staff.</p>"
                    + "</div></body></html>";

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            System.err.println("Failed to send membership revoked email: " + e.getMessage());
        }
    }

    // ---------------------------------------------------------------------
    // AUTHENTICATION
    // ---------------------------------------------------------------------

    @Async
    public void sendPasswordResetOtpEmail(String email, String fullName, String otp) {
        try {
            String subject = "Password Reset OTP | " + SYSTEM_NAME;

            String htmlBody = "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style=\"font-family:'Segoe UI',sans-serif;background:#f9fafb;padding:24px;\">"
                    + "<div style='max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:24px 28px;border:1px solid #e5e7eb;'>"
                    + "<h2 style='margin-top:0;margin-bottom:12px;color:#111827;'>Password Reset</h2>"
                    + "<p style='margin:0 0 12px;color:#4b5563;'>Dear <strong>" + escapeHtml(fullName)
                    + "</strong>, a password reset was requested for your account.</p>"
                    + "<p style='margin:0 0 8px;color:#111827;'>Your One-Time Password (OTP) is:</p>"
                    + "<div style='background:#f3f4f6;padding:12px;text-align:center;border-radius:8px;margin-bottom:16px;'>"
                    + "<span style='font-size:24px;font-weight:bold;letter-spacing:4px;color:#3b82f6;'>"
                    + escapeHtml(otp) + "</span>"
                    + "</div>"
                    + "<p style='margin:12px 0 0;color:#6b7280;font-size:13px;'>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>"
                    + "</div></body></html>";

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            System.err.println("Failed to send password reset OTP email: " + e.getMessage());
        }
    }

    // ---------------------------------------------------------------------
    // Payment Receipt
    // ---------------------------------------------------------------------

    @Async
    public void sendPaymentReceiptEmail(com.outlms.entity.Payment payment) {
        try {
            String email = payment.getUser().getEmail();
            String fullName = payment.getUser().getFirstName() + " " + payment.getUser().getLastName();
            String subject = "Payment Receipt | " + SYSTEM_NAME;

            String paymentTypeLabel = payment.getPaymentType() == com.outlms.entity.PaymentType.FINE_PAYMENT
                    ? "Fine Payment" : "Membership Payment";
            String description = payment.getDescription() != null ? payment.getDescription() : paymentTypeLabel;

            String htmlBody = "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style=\"font-family:'Segoe UI',sans-serif;background:#f9fafb;padding:24px;\">"
                    + "<div style='max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:24px 28px;border:1px solid #e5e7eb;'>"
                    + "<h2 style='margin-top:0;margin-bottom:12px;color:#10b981;'>✓ Payment Successful</h2>"
                    + "<p style='margin:0 0 16px;color:#4b5563;'>Dear <strong>" + escapeHtml(fullName)
                    + "</strong>, your payment has been processed successfully.</p>"
                    + "<div style='background:#f3f4f6;padding:16px;border-radius:8px;margin-bottom:16px;'>"
                    + "<table style='width:100%;border-collapse:collapse;'>"
                    + "<tr><td style='padding:6px 0;color:#6b7280;font-size:14px;'>Receipt ID:</td><td style='padding:6px 0;text-align:right;color:#111827;font-weight:600;'>"
                    + escapeHtml(payment.getReceiptId()) + "</td></tr>"
                    + "<tr><td style='padding:6px 0;color:#6b7280;font-size:14px;'>Payment Type:</td><td style='padding:6px 0;text-align:right;color:#111827;'>"
                    + escapeHtml(paymentTypeLabel) + "</td></tr>"
                    + "<tr><td style='padding:6px 0;color:#6b7280;font-size:14px;'>Description:</td><td style='padding:6px 0;text-align:right;color:#111827;'>"
                    + escapeHtml(description) + "</td></tr>"
                    + "<tr><td style='padding:6px 0;color:#6b7280;font-size:14px;'>Amount Paid:</td><td style='padding:6px 0;text-align:right;color:#10b981;font-size:18px;font-weight:700;'>"
                    + "₹" + payment.getAmount() + "</td></tr>"
                    + "<tr><td style='padding:6px 0;color:#6b7280;font-size:14px;'>Payment Date:</td><td style='padding:6px 0;text-align:right;color:#111827;'>"
                    + payment.getPaymentDate() + "</td></tr>"
                    + "<tr><td style='padding:6px 0;color:#6b7280;font-size:14px;'>Transaction ID:</td><td style='padding:6px 0;text-align:right;color:#6b7280;font-size:12px;'>"
                    + escapeHtml(payment.getRazorpayPaymentId()) + "</td></tr>"
                    + "</table>"
                    + "</div>"
                    + "<p style='margin:12px 0 0;color:#6b7280;font-size:13px;'>Thank you for your payment. This is an automated receipt for your records.</p>"
                    + "</div></body></html>";

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            System.err.println("Failed to send payment receipt email: " + e.getMessage());
        }
    }
}
