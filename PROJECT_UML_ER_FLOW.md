# LMS Portal UML, SQL Schema, and Control Flow Diagrams

This document provides:
1. UML architecture/class-level relationships
2. SQL table structure and foreign-key relations (ER)
3. Control flow charts for key backend workflows

## 1) UML Architecture Diagram

```mermaid
classDiagram
		direction LR

		class StudentRegistrationController
		class AdminController
		class AuthController
		class BookController
		class PaymentController

		class StudentRegistrationService
		class ApprovalService
		class UserService
		class BookService
		class PaymentService
		class LibraryBookRequestService
		class MembershipService

		class StudentRegistrationRepository
		class UserRepository
		class BookRepository
		class BookIssuanceRepository
		class PaymentRepository
		class StudentMembershipRepository
		class LibraryBookRequestRepository
		class NotificationRepository

		class StudentRegistration
		class AcademicInfo
		class WorkExperience
		class User
		class Book
		class BookIssuance
		class Payment
		class MembershipPlan
		class StudentMembership
		class LibraryBookRequest
		class Notification
		class BookRating

		StudentRegistrationController --> StudentRegistrationService
		AdminController --> StudentRegistrationService
		AdminController --> ApprovalService
		AuthController --> UserService
		BookController --> BookService
		PaymentController --> PaymentService

		StudentRegistrationService --> StudentRegistrationRepository
		StudentRegistrationService --> UserRepository
		StudentRegistrationService --> NotificationRepository
		ApprovalService --> StudentRegistrationRepository
		ApprovalService --> UserRepository
		ApprovalService --> NotificationRepository
		UserService --> UserRepository
		BookService --> BookRepository
		BookService --> BookIssuanceRepository
		BookService --> UserRepository
		BookService --> MembershipService
		BookService --> NotificationRepository
		PaymentService --> PaymentRepository
		PaymentService --> BookIssuanceRepository
		PaymentService --> StudentMembershipRepository
		PaymentService --> NotificationRepository
		LibraryBookRequestService --> LibraryBookRequestRepository
		LibraryBookRequestService --> BookRepository
		LibraryBookRequestService --> UserRepository

		StudentRegistrationRepository --> StudentRegistration
		UserRepository --> User
		BookRepository --> Book
		BookIssuanceRepository --> BookIssuance
		PaymentRepository --> Payment
		StudentMembershipRepository --> StudentMembership
		LibraryBookRequestRepository --> LibraryBookRequest
		NotificationRepository --> Notification

		StudentRegistration "1" --> "0..*" AcademicInfo
		StudentRegistration "1" --> "0..*" WorkExperience
		StudentRegistration "0..1" --> "1" User : approved account

		User "1" --> "0..*" Notification
		User "1" --> "0..*" Payment
		User "1" --> "0..*" StudentMembership

		Book "1" --> "0..*" BookIssuance
		User "1" --> "0..*" BookIssuance : student
		User "1" --> "0..*" BookIssuance : issuedBy
		User "1" --> "0..*" BookIssuance : returnedTo

		Book "1" --> "0..*" BookRating
		User "1" --> "0..*" BookRating

		User "1" --> "0..*" LibraryBookRequest
		Book "1" --> "0..*" LibraryBookRequest
		User "1" --> "0..*" LibraryBookRequest : handledBy

		MembershipPlan "1" --> "0..*" StudentMembership
		StudentMembership "1" --> "0..*" Payment
		BookIssuance "1" --> "0..*" Payment
```

## 2) SQL Table Structure + Relations (ER Diagram)

```mermaid
erDiagram
		USERS {
			BIGINT id PK
			VARCHAR username UK
			VARCHAR email UK
			VARCHAR password
			VARCHAR first_name
			VARCHAR last_name
			VARCHAR phone_number
			VARCHAR role
			BOOLEAN is_active
			BOOLEAN must_change_password
			VARCHAR reset_otp
			DATETIME reset_otp_expiry
			BIGINT student_registration_id FK
			DATETIME created_at
			DATETIME updated_at
		}

		STUDENT_REGISTRATIONS {
			BIGINT id PK
			VARCHAR registration_id UK
			DATETIME registration_date
			VARCHAR status
			VARCHAR role
			VARCHAR first_name
			VARCHAR last_name
			VARCHAR email UK
			VARCHAR phone
			VARCHAR contact_no
			VARCHAR student_id
			VARCHAR gender
			VARCHAR marital_status
			VARCHAR street
			VARCHAR city
			VARCHAR state
			VARCHAR pincode
			LONGBLOB government_id_image
			VARCHAR government_id_content_type
			VARCHAR government_id_file_name
			BIGINT government_id_size
			BIGINT approved_by FK
			DATETIME approved_date
			VARCHAR rejection_reason
			VARCHAR generated_username
			VARCHAR generated_password
			DATETIME created_at
			DATETIME updated_at
		}

		ACADEMIC_INFO {
			BIGINT id PK
			BIGINT student_registration_id FK
			VARCHAR institution_name
			VARCHAR degree
			INT passing_year
			VARCHAR grade
			DOUBLE grade_in_percentage
		}

		WORK_EXPERIENCE {
			BIGINT id PK
			BIGINT student_registration_id FK
			DATE start_date
			DATE end_date
			BOOLEAN currently_working
			VARCHAR company_name
			VARCHAR designation
			DOUBLE ctc
			VARCHAR reason_for_leaving
		}

		BOOKS {
			BIGINT id PK
			VARCHAR title
			VARCHAR author
			VARCHAR isbn UK
			VARCHAR publisher
			VARCHAR genre
			INT publication_year
			INT total_copies
			INT available_copies
			BOOLEAN premium_book
			VARCHAR status
			BIGINT added_by
			DATETIME created_at
			DATETIME updated_at
		}

		BOOK_ISSUANCES {
			BIGINT id PK
			BIGINT book_id FK
			BIGINT student_id FK
			BIGINT issued_by_id FK
			BIGINT returned_to_id FK
			DATE issue_date
			DATE due_date
			DATE return_date
			VARCHAR status
			DOUBLE penalty_amount
			BOOLEAN is_penalty_paid
			DATETIME penalty_paid_date
			VARCHAR notes
			DATETIME created_at
			DATETIME updated_at
		}

		BOOK_RATINGS {
			BIGINT id PK
			BIGINT book_id FK
			BIGINT student_id FK
			INT rating
			VARCHAR review
			DATETIME rated_at
		}

		LIBRARY_BOOK_REQUESTS {
			BIGINT id PK
			BIGINT student_id FK
			BIGINT book_id FK
			DATETIME request_date
			VARCHAR status
			VARCHAR student_notes
			VARCHAR staff_note
			BIGINT handled_by FK
			DATETIME handled_at
			DATETIME created_at
		}

		MEMBERSHIP_PLANS {
			BIGINT id PK
			VARCHAR name UK
			VARCHAR tier
			INT book_allowance
			INT loan_duration_days
			INT max_renewals
			DOUBLE monthly_fee
			VARCHAR description
			BOOLEAN is_active
			DATETIME created_at
			DATETIME updated_at
		}

		STUDENT_MEMBERSHIPS {
			BIGINT id PK
			BIGINT student_id FK
			BIGINT plan_id FK
			BIGINT assigned_by FK
			DATE start_date
			DATE end_date
			VARCHAR status
			BOOLEAN is_payment_completed
			DATETIME payment_date
			BOOLEAN auto_renewal_enabled
			VARCHAR notes
			DATETIME created_at
			DATETIME updated_at
		}

		PAYMENTS {
			BIGINT id PK
			BIGINT user_id FK
			BIGINT book_issuance_id FK
			BIGINT student_membership_id FK
			VARCHAR payment_type
			VARCHAR status
			DOUBLE amount
			VARCHAR razorpay_order_id UK
			VARCHAR razorpay_payment_id UK
			VARCHAR razorpay_signature
			VARCHAR receipt_id UK
			VARCHAR description
			VARCHAR currency
			VARCHAR notes
			DATETIME payment_date
			DATETIME created_at
			DATETIME updated_at
		}

		NOTIFICATIONS {
			BIGINT id PK
			BIGINT user_id FK
			VARCHAR title
			VARCHAR message
			BOOLEAN is_read
			DATETIME created_at
		}

		USERS ||--o{ NOTIFICATIONS : receives
		USERS ||--o{ PAYMENTS : makes
		USERS ||--o{ STUDENT_MEMBERSHIPS : has
		USERS ||--o{ BOOK_ISSUANCES : borrows
		USERS ||--o{ BOOK_ISSUANCES : issues
		USERS ||--o{ BOOK_ISSUANCES : accepts_return
		USERS ||--o{ BOOK_RATINGS : rates
		USERS ||--o{ LIBRARY_BOOK_REQUESTS : requests
		USERS ||--o{ LIBRARY_BOOK_REQUESTS : handles
		USERS ||--o{ STUDENT_REGISTRATIONS : approves
		STUDENT_REGISTRATIONS ||--o| USERS : becomes_user
		STUDENT_REGISTRATIONS ||--o{ ACADEMIC_INFO : has
		STUDENT_REGISTRATIONS ||--o{ WORK_EXPERIENCE : has

		BOOKS ||--o{ BOOK_ISSUANCES : issued_in
		BOOKS ||--o{ BOOK_RATINGS : rated_in
		BOOKS ||--o{ LIBRARY_BOOK_REQUESTS : requested_in

		MEMBERSHIP_PLANS ||--o{ STUDENT_MEMBERSHIPS : defines
		STUDENT_MEMBERSHIPS ||--o{ PAYMENTS : membership_payment
		BOOK_ISSUANCES ||--o{ PAYMENTS : fine_payment
```

## 3) Control Flow Charts

### 3.1 Student Registration + Admin Approval

```mermaid
flowchart TD
		A[Student submits /api/student/register multipart form] --> B[StudentRegistrationController.registerStudent]
		B --> C[StudentRegistrationService.registerStudent]
		C --> D{Email null/empty?}
		D -- Yes --> E[Throw runtime error]
		D -- No --> F{Email exists in student_registrations?}
		F -- Yes --> G[Duplicate email error]
		F -- No --> H[Validate document + build StudentRegistration]
		H --> I[Save registration PENDING]
		I --> J[Attach academic/work experience + BLOB]
		J --> K[Save registration again]
		K --> L[Send confirmation email]
		L --> M[Create Notification for all admins]
		M --> N[Return CREATED response with registrationId]

		N --> O[Admin reviews pending registration]
		O --> P[POST /api/admin/registrations/{id}/approve]
		P --> Q[ApprovalService.approveRegistration]
		Q --> R{Status is PENDING?}
		R -- No --> S[Reject with error]
		R -- Yes --> T[Generate username/password]
		T --> U[Create User account]
		U --> V[Mark registration APPROVED and link user]
		V --> W[Send approval email with credentials]
		W --> X[Create user notification Registration Approved]
		X --> Y[Return approval payload]
```

### 3.2 Authentication + Forgot Password

```mermaid
flowchart TD
		A1[POST /api/auth/login] --> B1[AuthenticationManager.authenticate]
		B1 --> C1{Valid credentials?}
		C1 -- No --> D1[401 unauthorized]
		C1 -- Yes --> E1[Load User + role]
		E1 --> F1[Generate JWT token]
		F1 --> G1[Return AuthResponse]

		H1[POST /api/auth/forgot-password] --> I1[Find user by username or email]
		I1 --> J1{User exists?}
		J1 -- No --> K1[Error user not found]
		J1 -- Yes --> L1[Generate 6-digit OTP]
		L1 --> M1[Save resetOtp + expiry]
		M1 --> N1[Send OTP email]

		O1[POST /api/auth/verify-otp] --> P1{OTP matches and not expired?}
		P1 -- No --> Q1[Invalid/expired OTP]
		P1 -- Yes --> R1[OTP verified]

		S1[POST /api/auth/reset-password] --> T1{OTP valid and password valid?}
		T1 -- No --> U1[Reject reset]
		T1 -- Yes --> V1[Encode new password]
		V1 --> W1[Clear OTP fields + save]
		W1 --> X1[Password reset success]
```

### 3.3 Book Issuance + Return + Fine Payment

```mermaid
flowchart TD
		A2[Staff calls issueBook] --> B2[BookService.issueBook]
		B2 --> C2{Book available copies > 0?}
		C2 -- No --> D2[Stop: out of stock]
		C2 -- Yes --> E2{Student has unpaid fines?}
		E2 -- Yes --> F2[Stop: fine payment required]
		E2 -- No --> G2{Within membership allowance?}
		G2 -- No --> H2[Stop: limit reached]
		G2 -- Yes --> I2{Premium book and plan eligible?}
		I2 -- No --> J2[Stop: upgrade membership]
		I2 -- Yes --> K2[Create BookIssuance ISSUED]
		K2 --> L2[Decrement available copies]
		L2 --> M2[Save issuance + send email + notification]

		N2[Staff calls returnBook] --> O2[BookService.returnBook]
		O2 --> P2[Set return date and status RETURNED]
		P2 --> Q2{Overdue?}
		Q2 -- Yes --> R2[Calculate penalty and mark unpaid]
		Q2 -- No --> S2[Mark penalty paid]
		R2 --> T2
		S2 --> T2[Increment book available copies]
		T2 --> U2[Save + notify student]

		V2[User pays fine] --> W2[PaymentService.createOrder]
		W2 --> X2[Persist PENDING payment]
		X2 --> Y2[PaymentService.verifyPayment]
		Y2 --> Z2{Signature valid?}
		Z2 -- No --> A3[Mark FAILED]
		Z2 -- Yes --> B3[Mark SUCCESS + payment date]
		B3 --> C3[handlePaymentSuccess]
		C3 --> D3[Set BookIssuance.isPenaltyPaid = true]
		D3 --> E3[Create notification + send receipt email]
```

## Notes

- Diagram source is based on current Spring entities/services/controllers in the backend module.
- Embedded fields from `StudentRegistration.PersonalDetails` and `StudentRegistration.Address` are represented as flattened columns inside `student_registrations`.
- Enums such as `PaymentStatus`, `PaymentType`, and status enums are modeled as string columns in ER diagrams.
