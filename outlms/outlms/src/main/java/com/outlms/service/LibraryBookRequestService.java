package com.outlms.service;

import com.outlms.entity.Book;
import com.outlms.entity.LibraryBookRequest;
import com.outlms.entity.LibraryBookRequest.RequestStatus;
import com.outlms.entity.StudentMembership;
import com.outlms.entity.User;
import com.outlms.repository.BookRepository;
import com.outlms.repository.LibraryBookRequestRepository;
import com.outlms.repository.NotificationRepository;
import com.outlms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LibraryBookRequestService {

    private final LibraryBookRequestRepository requestRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final MembershipService membershipService;
    private final NotificationRepository notificationRepository;

    public List<LibraryBookRequest> getAllRequests() {
        return requestRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<LibraryBookRequest> getStudentRequests(Long studentId) {
        return requestRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public List<LibraryBookRequest> getRequestsByStatus(RequestStatus status) {
        return requestRepository.findByStatus(status);
    }

    @Transactional
    public LibraryBookRequest createRequest(Long studentId, Long bookId, String notes) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        if (book.getAvailableCopies() <= 0) {
            throw new RuntimeException("Book is currently out of stock");
        }

        // Check if student already has a pending request for this book
        if (requestRepository.existsByStudentIdAndBookIdAndStatus(studentId, bookId, RequestStatus.PENDING)) {
            throw new RuntimeException("You already have a pending request for this book");
        }

        // Check Premium Book constraints
        if (Boolean.TRUE.equals(book.getPremiumBook())) {
            StudentMembership membership = membershipService.getActiveMembership(studentId)
                    .orElseThrow(() -> new RuntimeException(
                            "This is a Premium Book. You need an active membership plan to request it."));

            String tier = membership.getPlan().getTier().name();
            if ("BASIC".equals(tier)) {
                throw new RuntimeException("Your Basic plan does not allow borrowing Premium Books. Please upgrade.");
            }
        }

        LibraryBookRequest request = new LibraryBookRequest();
        request.setStudent(student);
        request.setBook(book);
        request.setStudentNotes(notes);
        request.setStatus(RequestStatus.PENDING);

        LibraryBookRequest savedRequest = requestRepository.save(request);

        // Send in-app notification to all staff
        List<User> staffMembers = userRepository.findByRoleAndActiveTrue(User.Role.STAFF);
        for (User staff : staffMembers) {
            com.outlms.entity.Notification notification = new com.outlms.entity.Notification();
            notification.setUser(staff);
            notification.setTitle("New Book Request");
            notification.setMessage("Student " + student.getFirstName() + " " + student.getLastName() + 
                                  " has requested the book '" + book.getTitle() + "'.");
            notificationRepository.save(notification);
        }

        return savedRequest;
    }

    @Transactional
    public LibraryBookRequest approveRequest(Long requestId, Long staffId, String staffNote) {
        LibraryBookRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be approved");
        }

        request.setStatus(RequestStatus.APPROVED);
        request.setStaffNote(staffNote);
        request.setHandledBy(staff);
        request.setHandledAt(LocalDateTime.now());
        LibraryBookRequest savedRequest = requestRepository.save(request);

        com.outlms.entity.Notification notification = new com.outlms.entity.Notification();
        notification.setUser(request.getStudent());
        notification.setTitle("Book Request Approved");
        notification.setMessage("Your request for '" + request.getBook().getTitle() + "' has been approved.");
        notificationRepository.save(notification);

        return savedRequest;
    }

    @Transactional
    public LibraryBookRequest rejectRequest(Long requestId, Long staffId, String staffNote) {
        LibraryBookRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be rejected");
        }

        request.setStatus(RequestStatus.REJECTED);
        request.setStaffNote(staffNote);
        request.setHandledBy(staff);
        request.setHandledAt(LocalDateTime.now());
        LibraryBookRequest savedRequest = requestRepository.save(request);

        com.outlms.entity.Notification notification = new com.outlms.entity.Notification();
        notification.setUser(request.getStudent());
        notification.setTitle("Book Request Rejected");
        notification.setMessage(
                "Your request for '" + request.getBook().getTitle() + "' has been rejected. Reason: " + staffNote);
        notificationRepository.save(notification);

        return savedRequest;
    }
}
