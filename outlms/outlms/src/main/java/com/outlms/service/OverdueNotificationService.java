package com.outlms.service;

import com.outlms.entity.BookIssuance;
import com.outlms.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * Scheduled job that sends daily overdue reminders for issued books
 * whose due date has passed.
 */
@Service
@RequiredArgsConstructor
public class OverdueNotificationService {

    private final BookService bookService;
    private final EmailService emailService;
    private final NotificationRepository notificationRepository;

    /**
     * Run once every day at 09:00 server time.
     * Cron: sec min hour day month weekday
     */
    @Scheduled(cron = "0 0 9 * * *")
    public void sendDailyOverdueReminders() {
        List<BookIssuance> overdues = bookService.getOverdueIssuances();
        for (BookIssuance issuance : overdues) {
            // Only remind for items that are still issued and not yet returned
            if (issuance.getReturnDate() == null && issuance.getDueDate().isBefore(LocalDate.now())) {
                emailService.sendOverdueReminderEmail(issuance);

                com.outlms.entity.Notification notification = new com.outlms.entity.Notification();
                notification.setUser(issuance.getStudent());
                notification.setTitle("Overdue Book Notice");
                notification.setMessage("Your book '" + issuance.getBook().getTitle() + "' is overdue. Please return it as soon as possible to avoid further penalties.");
                notificationRepository.save(notification);
            }
        }
    }
}

