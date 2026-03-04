# Student Registration Portal - Frontend

A modern, responsive React + Vite frontend for the Student Registration and Approval System.

## 🚀 Features

### Student Features
- **Multi-step Registration Form**
  - Personal Information
  - Address Details
  - Academic Information (Multiple degrees support)
  - Work Experience (Optional, multiple experiences)
  - Government ID Document Upload (PDF/JPG/PNG, max 10MB)
  
- **Student Dashboard**
  - Registration status tracking
  - View complete profile
  - Access generated credentials (upon approval)

### Admin Features
- **Comprehensive Dashboard**
  - Statistics overview (Total, Pending, Approved, Rejected)
  - Filter registrations by status
  - Search by ID, name, or email
  - View all registrations in a table
  
- **Registration Management**
  - View detailed registration information
  - Download government ID documents
  - Approve registrations (auto-generates credentials and sends email)
  - Reject registrations with reason
  - View approval/rejection history

### General Features
- **Authentication System**
  - JWT-based authentication
  - Role-based access control (Admin/Student)
  - Persistent login state
  - Protected routes

- **Modern UI/UX**
  - Beautiful gradient designs
  - Smooth animations
  - Responsive layout
  - Professional color scheme
  - Loading states and error handling

## 🛠️ Tech Stack

- **React** 19.2.0
- **Vite** 7.3.1
- **React Router DOM** 7.13.0
- **Axios** 1.13.5
- **Lucide React** (Icons)
- **Pure CSS** (Custom design system)

## 📦 Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will run at `http://localhost:5173`

## 🔧 Configuration

### API Configuration
The API base URL is configured in `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

### Backend CORS
Ensure your backend allows requests from `http://localhost:5173` (or your frontend URL)

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.jsx              # Navigation bar with user info
│   └── ProtectedRoute.jsx      # Route protection HOC
├── context/
│   └── AuthContext.jsx         # Authentication context & provider
├── pages/
│   ├── Home.jsx                # Landing page
│   ├── Login.jsx               # Login page
│   ├── Register.jsx            # Student registration form
│   ├── StudentDashboard.jsx    # Student dashboard
│   ├── AdminDashboard.jsx      # Admin dashboard with table
│   └── RegistrationDetails.jsx # Admin registration details & approval
├── services/
│   └── api.js                  # API service with axios interceptors
├── App.jsx                     # Main app with routing
├── index.css                   # Global styles & design system
└── main.jsx                    # App entry point
```

## 🎨 Design System

The application uses a comprehensive CSS design system with:

- **Color Palette**
  - Primary: Modern blue gradient
  - Secondary: Purple accent
  - Success, Warning, Error states
  - Neutral grays

- **Components**
  - Buttons (Primary, Secondary, Success, Error)
  - Form inputs with focus states
  - Cards with hover effects
  - Badges for status
  - Loading spinners
  - File upload areas

- **Utilities**
  - Grid system (2 & 3 columns)
  - Spacing utilities
  - Typography scale
  - Smooth animations

## 🔐 Authentication Flow

1. User logs in with username/password
2. Backend validates and returns JWT token
3. Token is stored in localStorage
4. Token is automatically added to all API requests via axios interceptor
5. Protected routes check authentication state
6. User can logout to clear token

## 📝 API Endpoints Used

### Auth
- `POST /api/auth/login` - User login
- `GET /api/auth/validate` - Token validation

### Student
- `POST /api/student/register` - Student registration (multipart/form-data)
- `GET /api/student/profile` - Get student profile
- `GET /api/student/dashboard` - Get student dashboard

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/registrations` - Get all registrations (with optional status filter)
- `GET /api/admin/registrations/pending` - Get pending registrations
- `GET /api/admin/registrations/{id}` - Get registration details
- `GET /api/admin/registrations/{id}/document` - Download government ID
- `POST /api/admin/registrations/{id}/approve` - Approve registration
- `POST /api/admin/registrations/{id}/reject` - Reject registration with reason

## 🚀 Build for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The build output will be in the `dist/` directory.

## 🎯 Key Features Implementation

### Multi-step Form
The registration form is split into 5 logical steps with progress indicator:
1. Personal Info → 2. Address → 3. Education → 4. Experience → 5. Document Upload

### Document Upload
- File validation (type and size)
- Preview of selected file
- Sent as multipart/form-data with JSON data as blob

### Admin Approval Workflow
1. Admin views registration details
2. Reviews all information and document
3. Either approves (generates credentials) or rejects (with reason)
4. System sends email to student automatically

### Responsive Design
The entire application is mobile-responsive with:
- Flexible grid system
- Breakpoints for tablets and phones
- Touch-friendly buttons and inputs

## 🤝 Backend Integration

This frontend is designed to work with the Spring Boot backend at:
- `http://localhost:8080`

Ensure the backend is running before starting the frontend.

## 📄 License

Copyright © 2026 Student Registration Portal. All rights reserved.

## 👥 Support

For support or questions, please contact the development team.
