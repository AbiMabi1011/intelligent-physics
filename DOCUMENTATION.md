# 📘 Intelligent Physics LMS — Complete System Documentation & Feature Guide

---

## Executive Summary
**Intelligent Physics LMS** is a state-of-the-art Learning Management System designed for Advanced Level (A/L) Physics education. It features a public landing page, interactive public Knowledge Hub, student dashboard, online practice testing portal with AI variable evaluation and anti-cheat proctoring, and a complete sub-admin permitted Admin Panel.

---

## 🛠️ Technology Stack
- **Frontend**: React (Vite), TailwindCSS, Lucide Icons, QRCode.react, Framer Motion animations
- **Backend**: FastAPI (Python 3.10+), SQLAlchemy ORM, Pydantic, PyPDF
- **Database**: SQLite (default `database.db`) with complete MySQL compatibility
- **Authentication**: JWT-style sessions, role-based access control (Super Admin, Sub-Admin, Student)

---

## 🌐 Public & Student Portal Pages

### 1. Landing Page (`/`)
- **Hero Slider & Banners**: Rotates promotional banners and announcement slides created in the Admin Panel.
- **Lecturer Profile**: Displays teacher credentials, slogan, and bio.
- **Syllabus Units & Features**: Displays Interactive A/L Physics syllabus units and LMS features.
- **Batch Enrollment Cards**: Displays available theory and revision batches with live seat counts and schedule details.
- **Student Reviews**: Testimonials and district rank achievements.

### 2. Login & Registration (`/login`, `/set-password`)
- **Login Form**: Supports email/username login for Students, Sub-Admins, and Super Admins.
- **Registration System**: Students register with Name, Email, Class/Batch, and WhatsApp number. New registrations enter a **Pending Approval** state until approved by an admin.
- **Set Password Portal**: One-time activation link for invited or approved students.

### 3. Student Dashboard (`/dashboard`)
- **Notice Board**: Displays published announcements with notice tags and uploaded image banners.
- **My Assigned Quizzes**: Lists available live exams, countdown duration, and status (Upcoming, Active, Ended, Completed).
- **Class Recordings**: Filtered HD video lectures assigned to the student's batch.
- **Past Papers Vault**: View and download question papers and marking schemes assigned to their batch.
- **Student Marks**: Displays physical exam scores and feedback uploaded by teachers.

### 4. Public Knowledge Hub (`/knowledge-hub`)
- **Full-Width Public Workspace**: Open-access resource hub for guest and registered students.
- **Class Videos**: Watch public physics lecture videos.
- **Past Papers & Schemes**: Download public past papers.
- **Spark Quizzes**: Try public practice quizzes without batch restrictions.

### 5. Interactive Spark Quiz Engine (`AdvancedQuizPortal.jsx`)
- **Dynamic Physics Variables**: Evaluates formulas and variables (e.g. `[[v = 10..50]]`) so each student receives unique numeric values in questions and options!
- **Question & Option Shuffling**: Shuffles question order and option choices for every student to prevent copying.
- **Anti-Cheat Proctoring**:
  - Monitors window focus loss and browser tab switches.
  - Monitors fullscreen exit events.
  - Logs devtools shortcut attempts and mouse leave events.
- **Instant Result & Ranking**: Shows instant percentage score, correct answers review, and automated batch leaderboard position.

---

## 🛡️ Admin Panel Modules (`/admin`)

All admin pages are grouped cleanly into 5 sidebar navigation categories:

### Group 1: Home Page Management
- **Landing Page Content (`/admin/homepage`)**: Edit teacher bio, syllabus units, LMS features, and home FAQs.
- **Hero Sliders & Banners (`/admin/sliders`)**: Upload and manage rotating homepage slides, active filters, and slide links.

### Group 2: Learning Hub Management
- **Student Directory (`/admin/students`)**:
  - View all registered students.
  - Approve or Reject pending student registrations (with automated email notifications).
  - Bulk invite students via CSV or single invite links.
- **Student Marks (`/admin/marks`)**:
  - Upload physical classroom exam scores (CSV bulk import or single entry).
  - Attach optional PDF paper files and teacher remarks.
- **Exams & Quizzes (`/admin/quizzes`)**:
  - Create and edit interactive MCQ quizzes.
  - **AI PDF Quiz Generator**: Upload a PDF exam paper to extract questions and choices automatically!
  - **JSON Question Import**: Import structured questions in bulk.
  - Set schedule start time, duration minutes, expiry rules (`end_time`, `one_day`, `custom_days`, `never`), and publish status.
  - Select target batches or **"Knowledge Hub"** for public access.
  - **Quiz Versioning**: Editing an attempted quiz creates a new isolated exam version without erasing past student attempt histories!
- **Spark Exam Results & Proctoring (`/admin/results`)**:
  - View student scores categorized by exam name with horizontal category filter tabs.
  - Automated rank calculation (e.g., Rank 2 / 48).
  - **Security & Integrity Report Modal**: View IP address, device fingerprint, session timestamps, time taken, and live tab-switch violation logs.
- **Class Recordings (`/admin/recordings`)**:
  - Upload video links (Vimeo, YouTube, MP4) assigned to specific batches or Knowledge Hub.
- **Past Papers Vault (`/admin/papers`)**:
  - Upload PDF question papers and marking schemes.
- **Announcements & Notices (`/admin/announcements`)**:
  - Publish news and announcements with optional notice image banners and email notifications.

### Group 3: Administration & Security
- **System Settings (`/admin/settings`)**:
  - Edit Super-Admin email & password.
  - Manage student batches.
  - **Sub-Admin System**: Create sub-admin accounts with custom page-level permissions (e.g., allow a sub-admin to manage *Class Recordings* and *Past Papers* while restricting access to *Settings* or *Student Directory*).

---

## 🔑 User Roles & Permissions

| Role | Access Scope | Redirection on Login |
| :--- | :--- | :--- |
| **Super Admin** | Full access to all admin modules, system settings, and sub-admin manager | `/admin/dashboard` |
| **Sub-Admin** | Access restricted strictly to assigned module permissions | `/admin/dashboard` |
| **Student** | Access to Student Dashboard (`/dashboard`) and Knowledge Hub (`/knowledge-hub`) | `/dashboard` |

---

## ⚡ Quick Deployment Guide (`run.bat`)

Double-click `run.bat` in the project root to start the full application:
1. Starts the FastAPI backend at `http://localhost:8000`
2. Starts the Vite React frontend at `http://localhost:5173`

---

*Report generated by Applomic for Intelligent Physics.*
