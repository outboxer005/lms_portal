-- ============================================================
-- OUTLMS Seed Data – Membership Plans + 20 Popular Books
-- Run this against the outlms_db schema after the tables are created.
-- ============================================================

-- ── Membership Plans ──────────────────────────────────────────────────────
INSERT IGNORE INTO membership_plans
    (name, tier, book_allowance, loan_duration_days, max_renewals, monthly_fee, description, is_active, created_at, updated_at)
VALUES
    ('Basic',     'BASIC',     2,  14, 0, 0.00,  'Borrow up to 2 books for 14 days. No renewals.',              TRUE, NOW(), NOW()),
    ('Standard',  'STANDARD',  4,  21, 1, 0.00,  'Borrow up to 4 books for 21 days with 1 renewal allowed.',   TRUE, NOW(), NOW()),
    ('Premium',   'PREMIUM',   6,  30, 2, 0.00,  'Borrow up to 6 books for 30 days with 2 renewals.',          TRUE, NOW(), NOW()),
    ('Unlimited', 'UNLIMITED', 10, 60, 5, 0.00,  'Borrow up to 10 books for 60 days with 5 renewals. For research scholars.', TRUE, NOW(), NOW());

-- ── 20 Popular Books ──────────────────────────────────────────────────────
INSERT IGNORE INTO books
    (title, author, isbn, publisher, genre, publication_year,
     total_copies, available_copies, description,
     cover_image_url, front_page_image_url,
     status, added_by, created_at, updated_at)
VALUES
-- 1
('To Kill a Mockingbird',
 'Harper Lee', '978-0061935466', 'HarperCollins', 'Classic Fiction', 1960,
 5, 5,
 'A gripping, heart-wrenching, and wholly remarkable tale of coming-of-age in a South poisoned by virulent prejudice.',
 'https://covers.openlibrary.org/b/isbn/9780061935466-L.jpg',
 'https://covers.openlibrary.org/b/isbn/9780061935466-M.jpg',
 'AVAILABLE', 1, NOW(), NOW()),

-- 2
('1984',
 'George Orwell', '978-0451524935', 'Signet Classic', 'Dystopian Fiction', 1949,
 5, 5,
 'A dystopian social science fiction novel that follows Winston Smith living in a totalitarian society under constant surveillance.',
 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg',
 'https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg',
 'AVAILABLE', 1, NOW(), NOW()),

-- 3
('The Great Gatsby',
 'F. Scott Fitzgerald', '978-0743273565', 'Scribner', 'Classic Fiction', 1925,
 4, 4,
 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg',
 'https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg',
 'AVAILABLE', 1, NOW(), NOW()),

-- 4
('Harry Potter and the Sorcerer''s Stone',
 'J.K. Rowling', '978-0439708180', 'Scholastic', 'Fantasy', 1997,
 6, 6,
 'The magical journey begins — Harry Potter finds out he''s a wizard and begins his education at Hogwarts School.',
 'https://covers.openlibrary.org/b/isbn/9780439708180-L.jpg',
 'https://covers.openlibrary.org/b/isbn/9780439708180-M.jpg',
 'AVAILABLE', 1, NOW(), NOW()),

-- 5
('The Hobbit',
 'J.R.R. Tolkien', '978-0547928227', 'Houghton Mifflin Harcourt', 'Fantasy', 1937,
 4, 4,
 'A fantasy novel following Bilbo Baggins, a hobbit who embarks on a quest with a group of dwarves and the wizard Gandalf.',
 'https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg',
 'https://covers.openlibrary.org/b/isbn/9780547928227-M.jpg',
 'AVAILABLE', 1, NOW(), NOW()),

-- 6
('The Catcher in the Rye',
 'J.D. Salinger', '978-0316769174', 'Little, Brown', 'Classic Fiction', 1951,
 3, 3,
 'Holden Caulfield''s story of alienation and coming-of-age in New York City.',
 'https://covers.openlibrary.org/b/isbn/9780316769174-L.jpg',
 'https://covers.openlibrary.org/b/isbn/9780316769174-M.jpg',
 'AVAILABLE', 1, NOW(), NOW()),

-- 7
('Pride and Prejudice',
 'Jane Austen', '978-0141439518', 'Penguin Classics', 'Romance', 1813,
 4, 4,
 'The story follows the main character Elizabeth Bennet as she deals with issues of manners, upbringing, morality, and marriage.',
 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg',
 'https://covers.openlibrary.org/b/isbn/9780141439518-M.jpg',
 'AVAILABLE', 1, NOW(), NOW()),

-- 8
('The Alchemist',
 'Paulo Coelho', '978-0062315007', 'HarperOne', 'Philosophical Fiction', 1988,
 5, 5,
 'A magical story about following your dreams as told through the journey of a young Andalusian shepherd.',
 'https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg',
 'https://covers.openlibrary.org/b/isbn/9780062315007-M.jpg',
 'AVAILABLE', 1, NOW(), NOW()),

-- 9
('Brave New World',
 'Aldous Huxley', '978-0060850524', 'Harper Perennial', 'Dystopian Fiction', 1932,
 3, 3,
 'A futuristic dystopia where humans are engineered and conditioned to accept their place in a rigidly structured society.',
 'https://covers.openlibrary.org/b/isbn/9780060850524-L.jpg',
 'https://covers.openlibrary.org/b/isbn/9780060850524-M.jpg',
 'AVAILABLE', 1, NOW(), NOW()),

-- 10
('The Da Vinci Code',
 'Dan Brown', '978-0307474278', 'Anchor', 'Mystery Thriller', 2003,
 5, 5,
 'A thriller following symbologist Robert Langdon as he investigates a murder in the Louvre and uncovers a church conspiracy.',
 'https://covers.openlibrary.org/b/isbn/9780307474278-L.jpg',
 'https://covers.openlibrary.org/b/isbn/9780307474278-M.jpg',
 'AVAILABLE', 1, NOW(), NOW()),

-- 11
('Sapiens: A Brief History of Humankind',
 'Yuval Noah Harari', '978-0062316097', 'Harper', 'Non-Fiction', 2011,
 4, 4,
 'A thrilling account of humankind''s creation and evolution exploring how biology and history have defined us.',
 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg',
 'https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg',
 'AVAILABLE', 1, NOW(), NOW()),

-- 12
('Atomic Habits',
 'James Clear', '978-0735211292', 'Avery', 'Self Help', 2018,
 5, 5,
 'Proven methods for building good habits, breaking bad ones and getting 1% better every day.',
 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
 'https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg',
 'AVAILABLE', 1, NOW(), NOW()),

-- 13
('Think and Grow Rich',
 'Napoleon Hill', '978-1585424337', 'Tarcher', 'Self Help', 1937,
 3, 3,
 'Classic personal development and motivational book on achieving success by thinking positively.',
 'https://covers.openlibrary.org/b/isbn/9781585424337-L.jpg',
 'https://covers.openlibrary.org/b/isbn/9781585424337-M.jpg',
 'AVAILABLE', 1, NOW(), NOW()),

-- 14
('Clean Code',
 'Robert C. Martin', '978-0132350884', 'Prentice Hall', 'Technology', 2008,
 3, 3,
 'A Handbook of Agile Software Craftsmanship — must-read for every developer who wants to write clean, maintainable code.',
 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg',
 'https://covers.openlibrary.org/b/isbn/9780132350884-M.jpg',
 'AVAILABLE', 1, NOW(), NOW()),

-- 15
('Introduction to Algorithms',
 'Thomas H. Cormen', '978-0262046305', 'MIT Press', 'Technology', 2022,
 3, 3,
 'Comprehensive textbook covering algorithms and data structures — the standard reference for computer science.',
 'https://covers.openlibrary.org/b/isbn/9780262046305-L.jpg',
 'https://covers.openlibrary.org/b/isbn/9780262046305-M.jpg',
 'AVAILABLE', 1, NOW(), NOW()),

-- 16
('The Psychology of Money',
 'Morgan Housel', '978-0857197689', 'Harriman House', 'Finance', 2020,
 4, 4,
 'Timeless lessons on wealth, greed, and happiness using engaging stories to explain money and investing behavior.',
 'https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg',
 'https://covers.openlibrary.org/b/isbn/9780857197689-M.jpg',
 'AVAILABLE', 1, NOW(), NOW()),

-- 17
('Rich Dad Poor Dad',
 'Robert T. Kiyosaki', '978-1612680194', 'Plata Publishing', 'Finance', 1997,
 4, 4,
 'What the rich teach their kids about money that the poor and middle class do not.',
 'https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg',
 'https://covers.openlibrary.org/b/isbn/9781612680194-M.jpg',
 'AVAILABLE', 1, NOW(), NOW()),

-- 18
('Wings of Fire',
 'A.P.J. Abdul Kalam', '978-8173711466', 'Universities Press', 'Biography', 1999,
 5, 5,
 'The autobiography of India''s missile man and former President, Dr. A.P.J. Abdul Kalam.',
 'https://covers.openlibrary.org/b/isbn/9788173711466-L.jpg',
 'https://covers.openlibrary.org/b/isbn/9788173711466-M.jpg',
 'AVAILABLE', 1, NOW(), NOW()),

-- 19
('The Lean Startup',
 'Eric Ries', '978-0307887894', 'Crown Business', 'Business', 2011,
 3, 3,
 'How Today''s Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses.',
 'https://covers.openlibrary.org/b/isbn/9780307887894-L.jpg',
 'https://covers.openlibrary.org/b/isbn/9780307887894-M.jpg',
 'AVAILABLE', 1, NOW(), NOW()),

-- 20
('Zero to One',
 'Peter Thiel', '978-0804139021', 'Crown Business', 'Business', 2014,
 3, 3,
 'Notes on Startups, or How to Build the Future — encourages thinking from scratch to create new things.',
 'https://covers.openlibrary.org/b/isbn/9780804139021-L.jpg',
 'https://covers.openlibrary.org/b/isbn/9780804139021-M.jpg',
 'AVAILABLE', 1, NOW(), NOW());
