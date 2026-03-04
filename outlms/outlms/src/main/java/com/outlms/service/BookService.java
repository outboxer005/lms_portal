package com.outlms.service;

import com.outlms.dto.BookRequest;
import com.outlms.dto.IssueBookRequest;
import com.outlms.entity.Book;
import com.outlms.entity.Book.BookStatus;
import com.outlms.entity.BookIssuance;
import com.outlms.entity.BookIssuance.IssuanceStatus;
import com.outlms.entity.User;
import com.outlms.entity.StudentMembership;
import com.outlms.entity.MembershipPlan;
import com.outlms.repository.BookIssuanceRepository;
import com.outlms.repository.BookRepository;
import com.outlms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final BookIssuanceRepository issuanceRepository;
    private final UserRepository userRepository;
    private final MembershipService membershipService;
    private final EmailService emailService;

    // ============= BOOK CRUD =============

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Book getBookById(Long id) {
        return bookRepository.findById(Objects.requireNonNull(id, "Book id must not be null"))
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));
    }

    public List<Book> searchBooks(String query, String genre, String status) {
        BookStatus bookStatus = null;
        if (status != null && !status.isBlank()) {
            bookStatus = BookStatus.valueOf(status.toUpperCase());
        }
        String queryParam = (query != null && !query.isBlank()) ? query : null;
        String genreParam = (genre != null && !genre.isBlank()) ? genre : null;
        return bookRepository.filterBooks(queryParam, genreParam, bookStatus);
    }

    public List<String> getAllGenres() {
        return bookRepository.findAllGenres();
    }

    @Transactional
    public Book addBook(BookRequest request, Long addedBy) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new RuntimeException("Book title is required.");
        }
        if (request.getAuthor() == null || request.getAuthor().trim().isEmpty()) {
            throw new RuntimeException("Book author is required.");
        }
        int total = request.getTotalCopies() != null && request.getTotalCopies() > 0 ? request.getTotalCopies() : 1;

        if (request.getIsbn() != null && !request.getIsbn().isBlank()) {
            if (bookRepository.existsByIsbn(request.getIsbn().trim())) {
                throw new RuntimeException("A book with this ISBN already exists. Please use a different ISBN.");
            }
        }

        Book book = new Book();
        mapRequestToBook(request, book);
        book.setAddedBy(addedBy);
        book.setTotalCopies(total);
        book.setAvailableCopies(total);
        return bookRepository.save(book);
    }

    @Transactional
    public Book updateBook(Long id, BookRequest request) {
        Book book = getBookById(id);
        int oldTotal = book.getTotalCopies() != null ? book.getTotalCopies() : 1;
        int newTotal = request.getTotalCopies() != null && request.getTotalCopies() > 0 ? request.getTotalCopies()
                : oldTotal;
        int issued = oldTotal - (book.getAvailableCopies() != null ? book.getAvailableCopies() : 0);

        if (request.getIsbn() != null && !request.getIsbn().isBlank()) {
            String newIsbn = request.getIsbn().trim();
            if (!newIsbn.equals(book.getIsbn()) && bookRepository.existsByIsbn(newIsbn)) {
                throw new RuntimeException("A book with this ISBN already exists. Please use a different ISBN.");
            }
        }

        mapRequestToBook(request, book);
        book.setAvailableCopies(Math.max(0, newTotal - issued));
        return bookRepository.save(book);
    }

    @Transactional
    public void deleteBook(Long id) {
        Book bookToDelete = getBookById(id);
        // Check if any copy is currently issued
        List<BookIssuance> activeIssuances = issuanceRepository.findByBookId(id)
                .stream().filter(i -> i.getStatus() == IssuanceStatus.ISSUED).toList();
        if (!activeIssuances.isEmpty()) {
            throw new RuntimeException(
                    "Cannot delete book: " + activeIssuances.size() + " copy/copies are currently issued.");
        }
        bookRepository.delete(Objects.requireNonNull(bookToDelete));
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }

    private void mapRequestToBook(BookRequest req, Book book) {
        if (req.getTitle() != null)
            book.setTitle(req.getTitle().trim());
        if (req.getAuthor() != null)
            book.setAuthor(req.getAuthor().trim());
        // ISBN: always store null for blank to avoid unique constraint collision
        book.setIsbn(blankToNull(req.getIsbn()));
        if (req.getPublisher() != null)
            book.setPublisher(blankToNull(req.getPublisher()));
        if (req.getGenre() != null)
            book.setGenre(blankToNull(req.getGenre()));
        if (req.getPublicationYear() != null)
            book.setPublicationYear(req.getPublicationYear());
        if (req.getTotalCopies() != null)
            book.setTotalCopies(req.getTotalCopies());
        if (req.getDescription() != null)
            book.setDescription(blankToNull(req.getDescription()));
        if (req.getCoverImageUrl() != null)
            book.setCoverImageUrl(blankToNull(req.getCoverImageUrl()));
        if (req.getFrontPageImageUrl() != null)
            book.setFrontPageImageUrl(blankToNull(req.getFrontPageImageUrl()));
        if (req.getPremiumBook() != null)
            book.setPremiumBook(req.getPremiumBook());
    }

    // ============= ISSUANCE =============

    @Transactional
    public BookIssuance issueBook(IssueBookRequest request, Long issuedById) {
        if (request.getBookId() == null)
            throw new RuntimeException("Book ID must not be null");
        Book book = getBookById(Objects.requireNonNull(request.getBookId()));
        if (book.getAvailableCopies() == null || book.getAvailableCopies() <= 0) {
            throw new RuntimeException("No copies available for: " + book.getTitle());
        }

        if (request.getStudentId() == null)
            throw new RuntimeException("Student ID must not be null");
        User student = userRepository.findById(Objects.requireNonNull(request.getStudentId()))
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (issuedById == null)
            throw new RuntimeException("Issuer ID must not be null");
        User issuedBy = userRepository.findById(Objects.requireNonNull(issuedById))
                .orElseThrow(() -> new RuntimeException("Staff/Admin user not found"));

        // Check current active issuances for this student
        List<BookIssuance> existing = issuanceRepository.findByStudentIdAndStatus(
                student.getId(),
                IssuanceStatus.ISSUED);

        // Enforce membership-based allowance
        int allowance = membershipService.getBookAllowance(student.getId());
        if (existing.size() >= allowance) {
            throw new RuntimeException("This student has reached their borrowing limit (" + allowance
                    + " books). Adjust membership or return a book first.");
        }

        // Prevent issuing same book twice concurrently
        boolean alreadyHas = existing.stream().anyMatch(i -> i.getBook().getId().equals(book.getId()));
        if (alreadyHas) {
            throw new RuntimeException("Student already has this book issued.");
        }

        // Premium books require an appropriate membership
        if (Boolean.TRUE.equals(book.getPremiumBook())) {
            Optional<StudentMembership> activeMembershipOpt = membershipService.getActiveMembership(student.getId());
            if (activeMembershipOpt.isEmpty()) {
                throw new RuntimeException(
                        "Premium books require an active membership plan. Please assign a membership before issuing.");
            }
            StudentMembership membership = activeMembershipOpt.get();
            MembershipPlan.PlanTier tier = membership.getPlan().getTier();
            if (tier == MembershipPlan.PlanTier.BASIC) {
                throw new RuntimeException(
                        "This student's membership plan does not allow premium books. Upgrade their plan to STANDARD or higher.");
            }
        }

        BookIssuance issuance = new BookIssuance();
        issuance.setBook(book);
        issuance.setStudent(student);
        issuance.setIssuedBy(issuedBy);
        issuance.setIssueDate(LocalDate.now());
        issuance.setDueDate(request.getDueDate() != null ? request.getDueDate() : LocalDate.now().plusDays(14));
        issuance.setStatus(IssuanceStatus.ISSUED);
        issuance.setNotes(request.getNotes());

        // Decrement available copies
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        BookIssuance saved = issuanceRepository.save(issuance);
        // Notify student by email (async)
        emailService.sendBookIssuedEmail(saved);
        return saved;
    }

    @Transactional
    public BookIssuance returnBook(Long issuanceId, Long returnedById) {
        if (issuanceId == null)
            throw new RuntimeException("Issuance ID must not be null");
        BookIssuance issuance = issuanceRepository.findById(issuanceId)
                .orElseThrow(() -> new RuntimeException("Issuance record not found"));

        if (issuance.getStatus() == IssuanceStatus.RETURNED) {
            throw new RuntimeException("This book has already been returned.");
        }

        if (returnedById == null)
            throw new RuntimeException("Returner ID must not be null");
        User returnedTo = userRepository.findById(returnedById)
                .orElseThrow(() -> new RuntimeException("Staff/Admin user not found"));

        issuance.setReturnDate(LocalDate.now());
        issuance.setReturnedTo(returnedTo);
        issuance.setStatus(IssuanceStatus.RETURNED);

        // Calculate penalty (5 per day overdue)
        if (LocalDate.now().isAfter(issuance.getDueDate())) {
            long daysLate = ChronoUnit.DAYS.between(issuance.getDueDate(), LocalDate.now());
            issuance.setPenaltyAmount(daysLate * 5.0);
        }

        // Increment available copies
        Book book = issuance.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        BookIssuance saved = issuanceRepository.save(issuance);
        // Notify student by email (async) including penalty info
        emailService.sendBookReturnedEmail(saved);
        return saved;
    }

    public List<BookIssuance> getAllIssuances() {
        return issuanceRepository.findAll();
    }

    public List<BookIssuance> getIssuancesByStatus(String status) {
        IssuanceStatus s = IssuanceStatus.valueOf(status.toUpperCase());
        return issuanceRepository.findByStatus(s);
    }

    public List<BookIssuance> getIssuancesByStudent(Long studentId) {
        return issuanceRepository.findByStudentId(studentId);
    }

    public List<BookIssuance> getActiveIssuancesByStudent(Long studentId) {
        return issuanceRepository.findByStudentIdAndStatus(studentId, IssuanceStatus.ISSUED);
    }

    public List<BookIssuance> getOverdueIssuances() {
        return issuanceRepository.findOverdue(LocalDate.now());
    }

    // ============= STATS =============

    public Map<String, Long> getLibraryStats() {
        long total = bookRepository.count();
        long available = bookRepository.countByStatus(BookStatus.AVAILABLE);
        long issued = issuanceRepository.countByStatus(IssuanceStatus.ISSUED);
        long overdue = issuanceRepository.findOverdue(LocalDate.now()).size();
        return Map.of(
                "totalBooks", total,
                "availableBooks", available,
                "booksIssued", issued,
                "overdueBooks", overdue);
    }
}
