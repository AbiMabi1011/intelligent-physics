# Intelligent Physics - Full Source Code & Deployment Guide

Welcome to the **Intelligent Physics** platform repository. This document provides a complete guide for setting up, configuring, running, and delivering this software product.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TailwindCSS, Lucide Icons, React Router DOM
- **Backend**: Python 3.10+, FastAPI, SQLAlchemy, SQLite (`physics.db`) / MySQL compatible
- **Authentication**: PBKDF2 Password Hashing, JWT / Role-based access control
- **Storage**: Local static uploads directory (`backend/uploads/`) with FastAPI static mounting

---

## 📋 Pre-Delivery Checklist Before Handover

Before zipping or delivering this source code to your client, check the following:

### 1. Security & Credentials
- [ ] **Sanitize `.env`**: Make sure your personal Gmail SMTP app passwords or private keys are not hardcoded. Provide the template in `.env.example`.
- [ ] **Admin Default Password**: Ensure the admin credentials (e.g. `intelligentphysics02@gmail.com`) have a secure password set, or inform the client of the default login password.

### 2. File Cleanup & Folders
- [ ] **`backend/uploads/` Folder**: Ensure `backend/uploads/` exists. Add an empty `.gitkeep` file so empty git clones don't crash on file upload.
- [ ] **Node Modules & Virtualenv**: Exclude `node_modules` and `venv` from zip deliveries (they should be installed on target machine via `npm install` and `pip install`).

---

## 🚀 Quick Start (Windows)

Simply double-click **`run.bat`** in the project root directory.

It will automatically:
1. Start the **React/Vite Frontend** on `http://localhost:5173`
2. Start the **FastAPI Backend** on `http://localhost:8000`

---

## 🔧 Manual Setup & Installation Guide

### 1. Backend Setup (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment (if not created)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install required packages
pip install -r requirements.txt

# Create environment configuration
copy .env.example .env

# Run FastAPI backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API documentation will be live at `http://localhost:8000/docs`.

### 2. Frontend Setup (React / Vite)

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Run Vite dev server
npm run dev
```

The website will be live at `http://localhost:5173`.

---

## ⚙️ Configuration & Environment Variables

### Backend `.env` Settings (`backend/.env`)

```env
# SMTP Email Configuration (for student notifications)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=intelligentphysics02@gmail.com
SMTP_PASSWORD=your-gmail-app-password
```

### Frontend API URL (`frontend/src/config.js`)

In development, `API_URL` points to `http://localhost:8000`.  
For production deployment, update `API_URL` to point to your live backend domain or server IP.

---

## 📁 Key Directory Structure

```
Intelligent Physics/
├── backend/
│   ├── main.py              # FastAPI routes & database auto-seeding
│   ├── models.py            # SQLAlchemy database models
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── database.py          # SQLite engine configuration
│   ├── physics.db           # SQLite database file
│   ├── uploads/             # Static file uploads (banners, PDFs)
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── pages/           # HomePage, KnowledgeHub, Login, Dashboard
│   │   ├── pages/admin/     # Admin management sub-pages
│   │   ├── components/      # Navbar, Footer, Modal components
│   │   └── config.js        # API_URL configuration
│   └── package.json         # Node dependencies
└── run.bat                  # One-click Windows startup script
```

---

## 🏷️ Credits & Branding

- **Platform**: Intelligent Physics
- **Development & Maintenance**: Powered by **Applomic** ([https://applomic.com](https://applomic.com))
