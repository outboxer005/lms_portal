package com.outlms.service;

import com.outlms.entity.Book;
import com.outlms.entity.BookIssuance;
import com.outlms.entity.User;
import com.outlms.repository.BookIssuanceRepository;
import com.outlms.repository.BookRepository;
import com.outlms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final BookRepository bookRepository;
    private final BookIssuanceRepository bookIssuanceRepository;
    private final UserRepository userRepository;

    public String handleChat(String message, User user) {
        if (message == null || message.trim().isEmpty()) {
            return "How can I help you today?";
        }

        String lowerMsg = message.toLowerCase();

        if (user.getRole() == User.Role.STUDENT) {
            return handleStudentIntents(lowerMsg, user);
        } else if (user.getRole() == User.Role.STAFF || user.getRole() == User.Role.ADMIN) {
            return handleStaffIntents(lowerMsg);
        }

        return "I'm sorry, I don't understand that request.";
    }

    public String handleGuestChat(String message) {
        if (message == null || message.trim().isEmpty()) {
            return "Hello! I am the LibPortal Assistant. How can I help you learn about our library management system?";
        }

        String lowerMsg = message.toLowerCase();

        if (lowerMsg.contains("register") || lowerMsg.contains("sign up") || lowerMsg.contains("how to join")
                || lowerMsg.contains("create account")) {
            return "To register, click on the 'Register' button at the top right corner. You can register as a Student or apply for a Staff account. Once submitted, your application will be reviewed by an administrator.";
        }

        if (lowerMsg.contains("login") || lowerMsg.contains("sign in") || lowerMsg.contains("cannot access")) {
            return "You can log in using the 'Member Login' button. If you just registered, you need to wait for an administrator to approve your account. If you forgot your password, use the 'Forgot password?' link on the login page.";
        }

        if (lowerMsg.contains("features") || lowerMsg.contains("what is this") || lowerMsg.contains("what can i do")
                || lowerMsg.contains("about")) {
            return "LibPortal is a modern Library Management System. It allows students to browse the catalog, request books, and track their borrows. Staff can manage inventory, process issue/returns, and govern library operations.";
        }

        if (lowerMsg.contains("books") || lowerMsg.contains("catalog") || lowerMsg.contains("library")) {
            return "We have a vast collection of digital and physical resources. You need to be a registered member to explore our full catalog and check real-time availability.";
        }

        if (lowerMsg.contains("contact") || lowerMsg.contains("support") || lowerMsg.contains("help")) {
            return "For support, you can contact the library administration desk during working hours or send an email to support@libportal.infosys.com.";
        }

        return "I'm a simple assistant designed to help you navigate our portal. You can ask me about how to register, how to login, or what features this system offers.";
    }

    private String handleStudentIntents(String msg, User student) {
        if (msg.contains("borrow") || msg.contains("issue") || msg.contains("my book")) {
            List<BookIssuance> activeIssuances = bookIssuanceRepository.findActiveByStudent(student.getId());
            if (activeIssuances.isEmpty()) {
                return "You currently have no active borrowed books.";
            }
            String books = activeIssuances.stream()
                    .map(bi -> bi.getBook().getTitle() + " (Due: " + bi.getDueDate() + ")")
                    .collect(Collectors.joining(", "));
            return "You have " + activeIssuances.size() + " book(s) borrowed: " + books;
        }

        if (msg.contains("fine") || msg.contains("due") || msg.contains("owe")) {
            List<BookIssuance> activeIssuances = bookIssuanceRepository.findActiveByStudent(student.getId());
            long overdueCount = activeIssuances.stream()
                    .filter(bi -> bi.getDueDate() != null && bi.getDueDate().isBefore(java.time.LocalDate.now()))
                    .count();
            if (overdueCount > 0) {
                return "You currently have " + overdueCount
                        + " overdue book(s). Please return them to the desk to settle any fines.";
            }
            return "Great news! You have no overdue books or pending fines.";
        }

        if (msg.contains("available") || msg.contains("do you have") || msg.contains("search")) {
            String q = extractSubject(msg, new String[] { "available", "do you have", "search", "for", "is" });
            if (q.isEmpty()) {
                return "Could you specify which book you're looking for? E.g., 'Is Harry Potter available?'";
            }
            List<Book> books = bookRepository.searchBooks(q);
            if (books.isEmpty()) {
                return "I couldn't find any books matching '" + q + "'.";
            }
            List<Book> available = books.stream().filter(b -> b.getAvailableCopies() > 0).collect(Collectors.toList());
            if (available.isEmpty()) {
                return "We have books matching '" + q + "', but all copies are currently issued out.";
            }
            String titles = available.stream()
                    .map(b -> b.getTitle() + " (" + b.getAvailableCopies() + " available)")
                    .limit(3)
                    .collect(Collectors.joining(", "));
            return "Yes! Found " + available.size() + " book(s): " + titles + (available.size() > 3 ? "..." : ".");
        }

        if (msg.contains("request book") || msg.contains("need book")) {
            return "To request a new book that we don't have, please click on the 'Applications' tab in your left sidebar, then click 'Request Book'.";
        }

        return "I'm a simple assistant. Try asking me about 'my borrows', 'my fines', or 'is [Book] available'. You can also ask how to 'request book'.";
    }

    private String handleStaffIntents(String msg) {
        if (msg.contains("available") || msg.contains("search book")) {
            String q = extractSubject(msg, new String[] { "available", "do we have", "search", "for", "is", "book" });
            if (q.isEmpty())
                return "Specify the book to search for.";
            List<Book> books = bookRepository.searchBooks(q);
            if (books.isEmpty())
                return "No books match '" + q + "'.";
            long totalAvail = books.stream().mapToInt(Book::getAvailableCopies).sum();
            return "Found " + books.size() + " titles matching '" + q + "'. Total available copies: " + totalAvail
                    + ". Check the Manage Books tab for details.";
        }

        if (msg.contains("student details") || msg.contains("student info")) {
            String q = extractSubject(msg, new String[] { "student details", "student info", "for" });
            if (q.isEmpty()) {
                return "Please specify the student's username or email.";
            }
            return userRepository.findByUsernameOrEmail(q)
                    .map(u -> "Found: " + u.getFirstName() + " " + u.getLastName() + " (" + u.getEmail() + "), Role: "
                            + u.getRole())
                    .orElse("Could not find a student matching '" + q + "'.");
        }

        if (msg.contains("recent borrowers") || msg.contains("recently issued")) {
            List<BookIssuance> issuances = bookIssuanceRepository.findAll().stream()
                    .filter(bi -> bi.getStatus() == BookIssuance.IssuanceStatus.ISSUED)
                    .sorted((a, b) -> b.getIssueDate().compareTo(a.getIssueDate()))
                    .limit(3)
                    .collect(Collectors.toList());
            if (issuances.isEmpty())
                return "No recent book issuances.";
            String res = issuances.stream()
                    .map(bi -> bi.getBook().getTitle() + " to " + bi.getStudent().getUsername())
                    .collect(Collectors.joining(", "));
            return "Last 3 issued books: " + res;
        }

        return "As a staff assistant, I can help with 'book availability', 'student details [username]', or 'recent borrowers'.";
    }

    private String extractSubject(String input, String[] keywordsToRemove) {
        String res = input;
        for (String kw : keywordsToRemove) {
            res = res.replaceAll("(?i)\\b" + kw + "\\b", "").trim();
        }
        return res.replaceAll("[^a-zA-Z0-9 ]", "").trim();
    }
}
