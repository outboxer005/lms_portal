package com.outlms.config;

import com.outlms.entity.Book;
import com.outlms.entity.User;
import com.outlms.repository.BookRepository;
import com.outlms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedAdminUser();
        seedSampleBooks();
    }

    private void seedAdminUser() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@outlms.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setPhoneNumber("0000000000");
            admin.setRole(User.Role.ADMIN);
            admin.setActive(true);

            userRepository.save(admin);
            log.info("✅ Default admin user created successfully!");
            log.info("   Username: admin");
            log.info("   Password: admin123");
            log.info("   Email: admin@outlms.com");
        } else {
            log.info("ℹ️  Admin user already exists, skipping initialization.");
        }
    }

    /**
     * Seed ~20 example books with cover images if the catalog is empty.
     */
    private void seedSampleBooks() {
        if (bookRepository.count() > 0) {
            log.info("ℹ️  Books already exist, skipping sample book seeding.");
            return;
        }

        log.info("📚 Seeding sample books into catalog...");

        // Helper to build and save a book quickly
        addBook("To Kill a Mockingbird", "Harper Lee", "978-0061935466",
                "HarperCollins", "Classic Fiction", 1960,
                5,
                "A gripping, heart-wrenching coming-of-age tale set in the racially charged American South.",
                "https://covers.openlibrary.org/b/isbn/9780061935466-L.jpg",
                "https://covers.openlibrary.org/b/isbn/9780061935466-M.jpg");

        addBook("1984", "George Orwell", "978-0451524935",
                "Signet Classic", "Dystopian Fiction", 1949,
                5,
                "A chilling vision of a totalitarian future where Big Brother watches everyone.",
                "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg",
                "https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg");

        addBook("The Great Gatsby", "F. Scott Fitzgerald", "978-0743273565",
                "Scribner", "Classic Fiction", 1925,
                4,
                "The story of the mysteriously wealthy Jay Gatsby and his love for Daisy Buchanan.",
                "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg",
                "https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg");

        addBook("Harry Potter and the Sorcerer's Stone", "J.K. Rowling", "978-0439708180",
                "Scholastic", "Fantasy", 1997,
                6,
                "The beginning of Harry Potter's magical journey at Hogwarts School of Witchcraft and Wizardry.",
                "https://covers.openlibrary.org/b/isbn/9780439708180-L.jpg",
                "https://covers.openlibrary.org/b/isbn/9780439708180-M.jpg");

        addBook("The Hobbit", "J.R.R. Tolkien", "978-0547928227",
                "Houghton Mifflin Harcourt", "Fantasy", 1937,
                4,
                "Bilbo Baggins is swept into a quest to reclaim a treasure guarded by a dragon.",
                "https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg",
                "https://covers.openlibrary.org/b/isbn/9780547928227-M.jpg");

        addBook("The Catcher in the Rye", "J.D. Salinger", "978-0316769174",
                "Little, Brown", "Classic Fiction", 1951,
                3,
                "Holden Caulfield's iconic story of alienation and teenage angst in New York City.",
                "https://covers.openlibrary.org/b/isbn/9780316769174-L.jpg",
                "https://covers.openlibrary.org/b/isbn/9780316769174-M.jpg");

        addBook("Pride and Prejudice", "Jane Austen", "978-0141439518",
                "Penguin Classics", "Romance", 1813,
                4,
                "A witty exploration of manners, marriage, and morality in Regency England.",
                "https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg",
                "https://covers.openlibrary.org/b/isbn/9780141439518-M.jpg");

        addBook("The Alchemist", "Paulo Coelho", "978-0062315007",
                "HarperOne", "Philosophical Fiction", 1988,
                5,
                "A young shepherd follows his personal legend across the desert in search of treasure.",
                "https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg",
                "https://covers.openlibrary.org/b/isbn/9780062315007-M.jpg");

        addBook("Brave New World", "Aldous Huxley", "978-0060850524",
                "Harper Perennial", "Dystopian Fiction", 1932,
                3,
                "A futuristic world of engineered citizens and a rigid caste system.",
                "https://covers.openlibrary.org/b/isbn/9780060850524-L.jpg",
                "https://covers.openlibrary.org/b/isbn/9780060850524-M.jpg");

        addBook("The Da Vinci Code", "Dan Brown", "978-0307474278",
                "Anchor", "Mystery Thriller", 2003,
                5,
                "A symbologist unravels a conspiracy involving secret societies and religious history.",
                "https://covers.openlibrary.org/b/isbn/9780307474278-L.jpg",
                "https://covers.openlibrary.org/b/isbn/9780307474278-M.jpg");

        addBook("Sapiens: A Brief History of Humankind", "Yuval Noah Harari", "978-0062316097",
                "Harper", "Non-Fiction", 2011,
                4,
                "An exploration of how Homo sapiens became the planet’s dominant species.",
                "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg",
                "https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg");

        addBook("Atomic Habits", "James Clear", "978-0735211292",
                "Avery", "Self Help", 2018,
                5,
                "Small, consistent changes that compound into remarkable results.",
                "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
                "https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg");

        addBook("Think and Grow Rich", "Napoleon Hill", "978-1585424337",
                "Tarcher", "Self Help", 1937,
                3,
                "A classic on mindset, desire, and persistence for achieving success.",
                "https://covers.openlibrary.org/b/isbn/9781585424337-L.jpg",
                "https://covers.openlibrary.org/b/isbn/9781585424337-M.jpg");

        addBook("Clean Code", "Robert C. Martin", "978-0132350884",
                "Prentice Hall", "Technology", 2008,
                3,
                "A handbook of agile software craftsmanship for writing maintainable code.",
                "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg",
                "https://covers.openlibrary.org/b/isbn/9780132350884-M.jpg");

        addBook("Introduction to Algorithms", "Thomas H. Cormen", "978-0262046305",
                "MIT Press", "Technology", 2022,
                3,
                "Comprehensive reference on algorithms and data structures.",
                "https://covers.openlibrary.org/b/isbn/9780262046305-L.jpg",
                "https://covers.openlibrary.org/b/isbn/9780262046305-M.jpg");

        addBook("The Psychology of Money", "Morgan Housel", "978-0857197689",
                "Harriman House", "Finance", 2020,
                4,
                "Stories about how people actually behave with money and why it matters.",
                "https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg",
                "https://covers.openlibrary.org/b/isbn/9780857197689-M.jpg");

        addBook("Rich Dad Poor Dad", "Robert T. Kiyosaki", "978-1612680194",
                "Plata Publishing", "Finance", 1997,
                4,
                "Lessons on financial literacy and thinking differently about money.",
                "https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg",
                "https://covers.openlibrary.org/b/isbn/9781612680194-M.jpg");

        addBook("Wings of Fire", "A.P.J. Abdul Kalam", "978-8173711466",
                "Universities Press", "Biography", 1999,
                5,
                "Autobiography of Dr. A.P.J. Abdul Kalam, former President of India.",
                "https://covers.openlibrary.org/b/isbn/9788173711466-L.jpg",
                "https://covers.openlibrary.org/b/isbn/9788173711466-M.jpg");

        addBook("The Lean Startup", "Eric Ries", "978-0307887894",
                "Crown Business", "Business", 2011,
                3,
                "How modern startups use continuous innovation to build successful companies.",
                "https://covers.openlibrary.org/b/isbn/9780307887894-L.jpg",
                "https://covers.openlibrary.org/b/isbn/9780307887894-M.jpg");

        addBook("Zero to One", "Peter Thiel", "978-0804139021",
                "Crown Business", "Business", 2014,
                3,
                "Notes on startups and building the future by creating new things.",
                "https://covers.openlibrary.org/b/isbn/9780804139021-L.jpg",
                "https://covers.openlibrary.org/b/isbn/9780804139021-M.jpg");

        log.info("✅ Sample books seeded successfully ({} records).", bookRepository.count());
    }

    private void addBook(String title, String author, String isbn,
                         String publisher, String genre, int year,
                         int totalCopies, String description,
                         String coverUrl, String frontUrl) {
        Book book = new Book();
        book.setTitle(title);
        book.setAuthor(author);
        book.setIsbn(isbn);
        book.setPublisher(publisher);
        book.setGenre(genre);
        book.setPublicationYear(year);
        book.setTotalCopies(totalCopies);
        book.setAvailableCopies(totalCopies);
        book.setDescription(description);
        book.setCoverImageUrl(coverUrl);
        book.setFrontPageImageUrl(frontUrl);
        // addedBy: default admin id is 1 in a fresh DB, but it is not required here
        bookRepository.save(book);
    }
}
