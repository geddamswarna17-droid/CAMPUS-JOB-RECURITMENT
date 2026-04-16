# CampusConnect - Job Recruitment Portal

CampusConnect is a full-stack web application designed to bridge the gap between job seekers and recruiters. It allows users to search and apply for jobs across various sectors, while providing an administrative dashboard for recruiters to manage postings and track applications.

## 🚀 Features

### For Users
- **Registration & Login**: Secure user accounts with personal profile management.
- **Job Search**: Search for jobs by title, company, or location.
- **Advanced Filtering**: Filter jobs by sector (Private vs. Government) and category (Engineering, Design, etc.).
- **Job Applications**: Apply for jobs with a detailed form and resume upload support (PDF, DOC, DOCX).
- **Application Tracking**: View the live status of all submitted applications.
- **Bookmarks**: Save interesting jobs to your personal wishlist for later application.

### For Admins
- **Admin Dashboard**: Comprehensive overview of portal statistics.
- **Job Management**: Create, update, and delete job postings.
- **Application Processing**: Review submitted applications and update their status (Accepted, Rejected, or Under Review).
- **Automated Notifications**: Users receive automated email notifications whenever their application status is updated.
- **Database Management**: Tools to seed initial job data or reset the database.

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (Custom Styling), JavaScript (Vanilla JS)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas (Mongoose ODM)
- **File Storage**: Multer for handling resume uploads
- **Email Service**: Nodemailer for status update notifications

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or a local MongoDB instance)
- Gmail account (for automated email notifications)

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/swarna-job-recruitment.git
   cd "Job Recuritment"
   ```

2. **Backend Setup**
   - Navigate to the backend directory:
     ```bash
     cd backend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Configure environment variables:
     Create a `.env` file in the `backend` folder and add the following:
     ```env
     MONGODB_URI=your_mongodb_connection_string
     PORT=3001
     EMAIL_USER=your-email@gmail.com
     EMAIL_PASS=your-app-password
     ```
     *(Note: If using Gmail, you need to generate an [App Password](https://support.google.com/accounts/answer/185833).)*

3. **Running the Application**
   - Start the backend server:
     ```bash
     npm start
     ```
   - The application will be accessible at: `http://localhost:3001`
   - Since the backend serves the frontend files statically, you do **not** need to run a separate server for the frontend.

## 📂 Project Structure

```text
Job Recuritment/
├── backend/            # Express.js server and API routes
│   ├── models/         # Mongoose schemas (User, Job, Application)
│   ├── uploads/        # Stored resume files
│   ├── server.js       # Main server entry point
│   └── .env            # Environment configuration
├── frontend/           # HTML, CSS, and Client-side JS
│   ├── index.html      # Landing page
│   ├── admin.html      # Admin dashboard
│   ├── apply.html      # Application form
│   └── style.css       # Core design system
└── README.md           # Project documentation
```

## 🔑 Admin Access

Default administrator credentials:
- **Email**: `swarna@gmail.com`
- **Password**: `swarna@123`

## 🔍 Detailed Feature Guide

### 1. User Registration & Login
- **Sign Up**: Navigate to the "Register" page. Provide your full name, email, 10-digit mobile number, state, and a secure password. The system checks if the email is already registered and validates the mobile number length.
- **Login**: Use your registered email and password to access the portal.
- **Admin Login**: Use the special admin credentials to unlock recruiter features.

### 2. Job Exploration
- **Search**: Use the search bar on the homepage to find jobs by title (e.g., "Developer"), company (e.g., "Google"), or location.
- **Sector Filtering**: Toggle between "Private" and "Government" sectors to view specific opportunities.
- **Bookmarks**: Click the star icon on any job card to save it to your "Saved Jobs" list for quick access later.

### 3. Applying for a Job
- **Apply Form**: Click "Apply" on a job card. The form pre-fills your basic details if you are logged in.
- **Resume Upload**: You must upload a resume in `.pdf`, `.doc`, or `.docx` format.
- **Submission**: Once submitted, your application is stored in the database and marked as "Under Review".

### 4. Admin Management
- **Dashboard**: Admins see real-time statistics of active jobs and placements.
- **Add Job**: Admins can post new jobs with details like salary package, deadline, and sector.
- **Application Review**: Admins can see all user applications, download resumes, and change the status to "Accepted" or "Rejected".
- **Email Alerts**: When an admin updates a status, the system automatically sends a professionally formatted email to the student.

## 📝 Workflow Diagram

1. **Student** registers/logins -> Browses jobs -> Uploads Resume -> Submits Application.
2. **Database** (MongoDB Atlas) stores the application and resume path.
3. **Admin** logins -> Reviews application -> Downloads resume -> Clicks "Accept".
4. **System** updates status in DB -> Sends **Email Notification** to the student.
5. **Student** logs in -> Sees "Accepted" status on their dashboard.

---

Designed and Developed with ❤️ by **Swarna**
