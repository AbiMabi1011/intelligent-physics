from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from typing import List
import smtplib
import os
import shutil
from pathlib import Path
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import io
import json
import urllib.request
import urllib.error
from pypdf import PdfReader

import models
import schemas
from database import engine, get_db

# Create Tables
models.Base.metadata.create_all(bind=engine)

# Create uploads directory
UPLOADS_DIR = Path("uploads")
UPLOADS_DIR.mkdir(exist_ok=True)

app = FastAPI()

# CORS (Allow Frontend to talk to Backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow ALL origins for dev convenience
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files statically
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# Password Hashing
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

# Email Configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")  # Set in .env file
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")  # Set in .env file

def send_announcement_email(to_emails: list, subject: str, body: str, image_url: str = None):
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print("[EMAIL] SMTP credentials not configured. Skipping email send.")
        return
    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        for email in to_emails:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"📢 {subject}"
            msg['From'] = SMTP_USERNAME
            msg['To'] = email
            image_html = f'<img src="{image_url}" style="max-width:100%;border-radius:8px;margin-top:16px;" />' if image_url else ''
            html = f"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;">
                <div style="background:linear-gradient(135deg,#1e3a8a,#3b82f6);padding:20px;border-radius:12px 12px 0 0;">
                    <h1 style="color:white;margin:0;font-size:22px;">📢 Intelligent Physics</h1>
                </div>
                <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:24px;border-radius:0 0 12px 12px;">
                    <h2 style="color:#1f2937;">{subject}</h2>
                    <p style="color:#374151;line-height:1.7;white-space:pre-wrap;">{body}</p>
                    {image_html}
                    <hr style="margin-top:24px;border:none;border-top:1px solid #e5e7eb;"/>
                    <p style="color:#9ca3af;font-size:12px;">Intelligent Physics — Student Portal</p>
                </div>
            </div>
            """
            msg.attach(MIMEText(html, 'html'))
            server.sendmail(SMTP_USERNAME, email, msg.as_string())
        server.quit()
        print(f"[EMAIL] Sent announcement to {len(to_emails)} recipients.")
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Routes

@app.get("/")
def read_root():
    return {"message": "Intelligent Physics Backend Running!"}

@app.post("/auth/register", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    # Registration is now pending by default
    new_user = models.User(
        email=user.email, 
        hashed_password=hashed_password,
        full_name=user.full_name,
        class_name=user.class_name,
        is_active=False,
        approval_status="pending"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.on_event("startup")
def startup_populate():
    # Auto-add 'role' column if missing (SQLite specific helper)
    try:
        from sqlalchemy import text
        db = next(get_db())
        db.execute(text("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'student'"))
        db.commit()
    except Exception:
        # Column likely already exists or other error
        pass

    db = next(get_db())
    # Ensure default admin exists
    admin_email = "raakul"
    admin = db.query(models.User).filter(models.User.email == admin_email).first()
    if not admin:
        hashed_pw = pwd_context.hash("12345")
        new_admin = models.User(
            email=admin_email,
            hashed_password=hashed_pw,
            role="admin",
            full_name="Administrator"
        )
        db.add(new_admin)
        db.commit()

    # Ensure default teacher profile exists
    teacher = db.query(models.TeacherProfile).first()
    if not teacher:
        new_teacher = models.TeacherProfile(
            name="Mr. R. Raakulan",
            title="Lead Lecturer",
            credentials="B.Sc. Physics · University of Jaffna",
            bio_text="Being a tutor and teacher of Physics for Advance Level students, I've achieved good results and gained several experiences. 75% of my students pass Physics and they all show a keen interest in learning. Zoom Webinar classes and the participation of students also are being a great success for me, that much positive feedback is sent from the students and parents as well.",
            image_url="",
            mediums="Tamil and English Medium class"
        )
        db.add(new_teacher)
        db.commit()

    # Ensure default syllabus units exist
    if db.query(models.SyllabusUnit).count() == 0:
        import json
        syllabuses = [
            { "topic": "Measurement", "icon": "📏", "desc": "Physical quantities, SI units, scalars & vectors, errors and uncertainties.", "subtopics": ["SI Units & Base Quantities", "Dimensional Analysis", "Errors & Uncertainties", "Measuring Instruments", "Vector Addition & Resolution"], "color": "border-blue-200 bg-blue-50/20 hover:border-blue-400 hover:shadow-blue-500/5", "order": 1 },
            { "topic": "Mechanics", "icon": "⚙️", "desc": "Kinematics, Newton's Laws, momentum, work, energy, power and circular motion.", "subtopics": ["Linear Kinematics & Projectiles", "Newton's Laws of Motion", "Momentum & Impulse", "Work, Energy & Power", "Circular Motion & Rotational Dynamics"], "color": "border-indigo-200 bg-indigo-50/20 hover:border-indigo-400 hover:shadow-indigo-500/5", "order": 2 },
            { "topic": "Oscillation & Waves", "icon": "〰️", "desc": "SHM, wave properties, sound, light, diffraction and interference.", "subtopics": ["Simple Harmonic Motion", "Transverse & Longitudinal Waves", "Superposition & Interference", "Sound Waves & Doppler Effect", "Wave Optics & Polarization"], "color": "border-cyan-200 bg-cyan-50/20 hover:border-cyan-400 hover:shadow-cyan-500/5", "order": 3 },
            { "topic": "Thermal Physics", "icon": "🌡️", "desc": "Heat transfer, ideal gas laws, internal energy and first law of thermodynamics.", "subtopics": ["Warmth & Temperature Scales", "Thermal Expansion & Conduction", "Kinetic Theory of Gases", "First Law of Thermodynamics", "Heat Engines & Efficiency"], "color": "border-rose-200 bg-rose-50/20 hover:border-rose-400 hover:shadow-rose-500/5", "order": 4 },
            { "topic": "Gravitational Field", "icon": "🪐", "desc": "Newton's law of gravitation, gravitational potential and satellite motion.", "subtopics": ["Newton's Law of Gravitation", "Gravitational Field Strength (g)", "Gravitational Potential", "Satellite Motion & Escape Velocity"], "color": "border-purple-200 bg-purple-50/20 hover:border-purple-400 hover:shadow-purple-500/5", "order": 5 },
            { "topic": "Electric Field", "icon": "⚡", "desc": "Coulomb's law, electric potential, capacitance and energy in electric fields.", "subtopics": ["Coulomb's Law", "Electric Field Intensity", "Electric Potential & Equipotentials", "Capacitors in Series & Parallel", "Energy Stored in Capacitors"], "color": "border-amber-200 bg-amber-50/20 hover:border-amber-400 hover:shadow-amber-500/5", "order": 6 },
            { "topic": "Magnetic Field", "icon": "🧲", "desc": "Magnetic flux density, force on conductors, electromagnetic induction.", "subtopics": ["Magnetic Field of Currents", "Force on Charge in Magnetic Fields", "Electromagnetic Induction & Lenz's Law", "Self & Mutual Inductance", "Transformers & Generator Principle"], "color": "border-emerald-200 bg-emerald-50/20 hover:border-emerald-400 hover:shadow-emerald-500/5", "order": 7 },
            { "topic": "Current Electricity", "icon": "🔌", "desc": "Ohm's law, resistance, EMF, Kirchhoff's laws and AC circuits.", "subtopics": ["Ohm's Law & Resistivity", "Kirchhoff's Laws", "Potentiometer & Wheatstone Bridge", "Internal Resistance & Maximum Power", "Alternating Current (AC) Circuits"], "color": "border-teal-200 bg-teal-50/20 hover:border-teal-400 hover:shadow-teal-500/5", "order": 8 },
            { "topic": "Electronics", "icon": "💡", "desc": "Semiconductors, logic gates and op-amps.", "subtopics": ["Intrinsic & Extrinsic Semiconductors", "PN Junction Diodes & Rectification", "Bipolar Junction Transistors", "Operational Amplifiers (Op-Amps)", "Digital Logic Gates"], "color": "border-orange-200 bg-orange-50/20 hover:border-orange-400 hover:shadow-orange-500/5", "order": 9 },
            { "topic": "Mechanical Properties", "icon": "🔩", "desc": "Stress, strain, Young's modulus, elasticity and fluid pressure.", "subtopics": ["Stress, Strain & Hooke's Law", "Young's Modulus", "Elastic Potential Energy", "Fluid Pressure & Archimedes' Principle", "Viscosity & Surface Tension"], "color": "border-sky-200 bg-sky-50/20 hover:border-sky-400 hover:shadow-sky-500/5", "order": 10 },
            { "topic": "Matter & Radiation", "icon": "☢️", "desc": "Photoelectric effect, atomic structure, nuclear reactions and radioactive decay.", "subtopics": ["Photoelectric Effect", "X-Rays & Line Spectra", "Wave-Particle Duality", "Radioactivity & Half-life", "Nuclear Fission & Fusion"], "color": "border-violet-200 bg-violet-50/20 hover:border-violet-400 hover:shadow-violet-500/5", "order": 11 }
        ]
        for s in syllabuses:
            db.add(models.SyllabusUnit(
                topic=s["topic"], icon=s["icon"], desc=s["desc"],
                subtopics_json=json.dumps(s["subtopics"]), color=s["color"],
                order_index=s["order"]
            ))
        db.commit()

    # Ensure default features exist
    if db.query(models.LmsFeature).count() == 0:
        features = [
            { "icon": "📚", "title": "Solved Past Paper Bank", "desc": "Full archive of G.C.E. A/L past papers categorized by unit, accompanied by grading schemes and examiner notes.", "color": "border-blue-200 bg-blue-50/30 hover:border-blue-400", "order": 1 },
            { "icon": "🧩", "title": "Adaptive Physics Quizzes", "desc": "Evaluations that gauge your understanding of complex topics and help identify specific knowledge gaps.", "color": "border-indigo-200 bg-indigo-50/30 hover:border-indigo-400", "order": 2 },
            { "icon": "🎬", "title": "Full HD Class Recordings", "desc": "Every lecture is archived in 1080p high definition, with timestamped sections for easy revision.", "color": "border-cyan-200 bg-cyan-50/30 hover:border-cyan-400", "order": 3 },
            { "icon": "📊", "title": "Live Result Analytics", "desc": "Grades, performance metrics, and comparison stats are delivered instantly to your profile after assessments.", "color": "border-emerald-200 bg-emerald-50/30 hover:border-emerald-400", "order": 4 },
            { "icon": "📢", "title": "Real-Time Batch Notices", "desc": "Instant desktop notices for new lecture notes, timetable updates, and upcoming exam dates.", "color": "border-amber-200 bg-amber-50/30 hover:border-amber-400", "order": 5 },
            { "icon": "🏆", "title": "Leaderboards & Rankings", "desc": "Compete constructively with peer batches, earn rank points, and track your weekly status.", "color": "border-rose-200 bg-rose-50/30 hover:border-rose-400", "order": 6 }
        ]
        for f in features:
            db.add(models.LmsFeature(
                icon=f["icon"], title=f["title"], desc=f["desc"],
                color=f["color"], order_index=f["order"]
            ))
        db.commit()

    # Ensure default batches exist
    if db.query(models.HomeBatch).count() == 0:
        import json
        batches = [
            {
                "name": "A/L 2026 Theory",
                "status": "Enrolling Now",
                "seats_left": "14 seats remaining",
                "schedule": "Thursdays · 4:00 PM - 7:00 PM",
                "description": "Perfect for students starting their A/Ls. Covers syllabus units from basic measurements to current electricity.",
                "features": ["100% Comprehensive coverage", "Weekly adaptive assessments", "Hardcopy study packs mailed", "Personalized tutor support"],
                "color": "border-blue-200 bg-blue-50/10 hover:border-blue-400",
                "order": 1
            },
            {
                "name": "A/L 2025 Revision",
                "status": "Fast Filling",
                "seats_left": "8 seats remaining",
                "schedule": "Sundays · 8:30 AM - 1:30 PM",
                "description": "High-intensity session focused on solving complex problems, past papers, and structural question strategies.",
                "features": ["Full syllabus summarization", "500+ Past paper analysis", "Full syllabus mock exams", "Speed development strategies"],
                "color": "border-indigo-200 bg-indigo-50/10 hover:border-indigo-400",
                "order": 2
            },
            {
                "name": "A/L 2025 Theory",
                "status": "Completed / Archive Access",
                "seats_left": "Video Access Only",
                "schedule": "Tuesdays · 4:00 PM - 7:00 PM",
                "description": "All core modules are archived. Available for students who want to self-pace through the entire curriculum.",
                "features": ["All recorded lectures archive", "Full past paper repository", "Online chapter quizzes", "Instant auto-grading"],
                "color": "border-teal-200 bg-teal-50/10 hover:border-teal-400",
                "order": 3
            }
        ]
        for b in batches:
            db.add(models.HomeBatch(
                name=b["name"], status=b["status"], seats_left=b["seats_left"],
                schedule=b["schedule"], description=b["description"],
                features_json=json.dumps(b["features"]), color=b["color"],
                enroll_link="/login", order_index=b["order"]
            ))
        db.commit()

    # Ensure default testimonials exist
    if db.query(models.Testimonial).count() == 0:
        testimonials = [
            { "quote": "Intelligent Physics completely transformed my approach to mechanics and field theory. The adaptive quizzes and recorded sessions helped me secure my A/L island rank!", "name": "Sanduni Perera", "result": "Island Rank 12 — G.C.E. A/L Physics", "order": 1 },
            { "quote": "The structured coverages of thermal physics and oscillation are top-tier. I went from a C to a solid A in my school term tests!", "name": "Amal Rodrigo", "result": "District Rank 3 — Gampaha", "order": 2 },
            { "quote": "Best digital platform for Sri Lankan A/L students. The live results database and prompt video uploads make self-studying incredibly easy.", "name": "Fathima Ruzna", "result": "A/L 2025 Theory Batch", "order": 3 }
        ]
        for t in testimonials:
            db.add(models.Testimonial(
                quote=t["quote"], name=t["name"], result=t["result"],
                stars=5, order_index=t["order"]
            ))
        db.commit()

    # Ensure default FAQs exist
    if db.query(models.HomeFaq).count() == 0:
        faqs = [
            { "q": "Who is Intelligent Physics designed for?", "a": "Sri Lankan A-Level Physics students following the national Sinhala or English medium syllabus, from first-year theory batches to exam-year crash revision classes.", "order": 1 },
            { "q": "How do I join a batch and access the Learning Hub?", "a": "Click the \"Learning Hub\" button, sign up for a student profile, select your target exam batch, and await instant credentials once your student enrollment is validated.", "order": 2 },
            { "q": "Can I watch classes if I miss the live sessions?", "a": "Yes. All live lessons are recorded in 1080p HD and uploaded to the platform within 6 hours, complete with navigation timeline tags so you can jump to specific concepts.", "order": 3 },
            { "q": "How does the adaptive quiz system help me learn?", "a": "Our system tracks your quiz responses. If you struggle with a specific sub-topic like Rotational Dynamics, the quiz prioritizes simple mechanical concepts first and scales up as your speed and accuracy improve.", "order": 4 },
            { "q": "How are results and answers processed?", "a": "Students submit answers via the Learning Hub. Assessment marks, correct answers, step-by-step explanations, and your rank in the batch are available immediately.", "order": 5 }
        ]
        for f in faqs:
            db.add(models.HomeFaq(
                question=f["q"], answer=f["a"], order_index=f["order"]
            ))
        db.commit()

@app.post("/auth/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    # Standardize input
    search_email = user.username.strip().lower()
    
    db_user = db.query(models.User).filter(models.User.email == search_email).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if db_user.approval_status == "pending":
        raise HTTPException(status_code=403, detail="Your account is pending admin approval.")
    elif db_user.approval_status == "rejected":
        raise HTTPException(status_code=403, detail="Your registration request was rejected.")
    
    return {
        "status": "success", 
        "user_id": db_user.id, 
        "email": db_user.email,
        "role": db_user.role,
        "full_name": db_user.full_name,
        "class_name": db_user.class_name  # Required so frontend can filter data by batch
    }

@app.post("/auth/qr-login")
def login_via_qr(payload: dict, db: Session = Depends(get_db)):
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid QR data")
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")
    
    if user.approval_status == "pending":
        raise HTTPException(status_code=403, detail="Your account is pending admin approval.")
    elif user.approval_status == "rejected":
        raise HTTPException(status_code=403, detail="Your registration request was rejected.")

    return {
        "status": "success", 
        "user_id": user.id, 
        "email": user.email,
        "role": user.role,
        "full_name": user.full_name,
        "class_name": user.class_name
    }

@app.post("/admin/credentials")
def update_admin_credentials(creds: schemas.AdminCredentialsUpdate, db: Session = Depends(get_db)):
    search_email = creds.current_email.strip().lower()
    
    db_user = db.query(models.User).filter(models.User.email == search_email, models.User.role == "admin").first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid admin credentials")
    
    if not verify_password(creds.current_password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid admin credentials")
    
    new_email = creds.new_email.strip().lower()
    if new_email != search_email:
        exist_user = db.query(models.User).filter(models.User.email == new_email).first()
        if exist_user:
            raise HTTPException(status_code=400, detail="New email already registered")
        db_user.email = new_email

    if creds.new_password:
        db_user.hashed_password = get_password_hash(creds.new_password)
    
    db.commit()
    return {"status": "success", "message": "Admin credentials updated successfully", "new_email": db_user.email}

# --- EMAIL CONFIGURATION ---
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import os
from fastapi import BackgroundTasks
from pydantic import BaseModel

load_dotenv()
EMAIL_Address = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

def send_invite_email(to_email: str, link: str):
    if not EMAIL_Address or "your.email" in EMAIL_Address:
        print("❌ Email credentials not set in .env file. Skipping email send.")
        return

    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_Address
        msg['To'] = to_email
        msg['Subject'] = "Welcome to Intelligent Physics - Set Your Password"

        body = f"""
        <html>
            <body>
                <h2>Welcome to Intelligent Physics!</h2>
                <p>An account has been created for you.</p>
                <p>Please click the link below to set your password and activate your account:</p>
                <p>
                    <a href="{link}" style="background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Activate Account</a>
                </p>
                <p>Or verify using this link: <a href="{link}">{link}</a></p>
                <br>
                <p>If you did not expect this email, please ignore it.</p>
            </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))

        # Connect to Gmail SMTP (change if using Outlook/Yahoo)
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(EMAIL_Address, EMAIL_PASSWORD)
        text = msg.as_string()
        server.sendmail(EMAIL_Address, to_email, text)
        server.quit()
        print(f"✅ Email sent successfully to {to_email}")
    except Exception as e:
        print(f"❌ Failed to send email: {e}")

class ForgotPasswordRequest(BaseModel):
    email: str

@app.post("/auth/forgot-password")
def forgot_password(request: ForgotPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == request.email).first()
    if not db_user:
        # Don't leak if user exists or not, but for simplicity returning success
        return {"message": "If that email is registered, you will receive a reset link."}
    
    reset_link = f"https://intelligentphy.netlify.app/set-password?email={db_user.email}"
    background_tasks.add_task(send_invite_email, db_user.email, reset_link)
    return {"message": "If that email is registered, you will receive a reset link."}

@app.post("/users/invite", response_model=schemas.User)
def invite_user(user: schemas.UserBase, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Check if exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create with NO password
    # Frontend sends { email, full_name, class_name }
    new_user = models.User(
        email=user.email, 
        hashed_password=None, 
        is_active=False,
        full_name=user.full_name,
        class_name=user.class_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate Link for live Netlify site
    invite_link = f"https://intelligentphy.netlify.app/set-password?email={user.email}"
    
    # Send Email in Background
    background_tasks.add_task(send_invite_email, user.email, invite_link)
    
    return new_user

@app.post("/users/bulk-invite")
def bulk_invite_users(payload: schemas.BulkInviteRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    added_users = []
    skipped_users = []
    for user_data in payload.users:
        db_user = db.query(models.User).filter(models.User.email == user_data.email).first()
        if db_user:
            skipped_users.append(user_data.email)
            continue
        
        new_user = models.User(
            email=user_data.email, 
            hashed_password=None, 
            is_active=False,
            full_name=user_data.full_name,
            class_name=user_data.class_name
        )
        db.add(new_user)
        added_users.append(new_user)
    
    db.commit()
    
    for u in added_users:
        db.refresh(u)
        invite_link = f"https://intelligentphy.netlify.app/set-password?email={u.email}"
        background_tasks.add_task(send_invite_email, u.email, invite_link)
        
    return {
        "message": f"Successfully added {len(added_users)} users. Skipped {len(skipped_users)} existing users.",
        "added": [u.email for u in added_users],
        "skipped": skipped_users
    }

@app.get("/results", response_model=List[schemas.FullQuizResult])
def get_all_results(db: Session = Depends(get_db)):
    return db.query(models.QuizResult).all()

# --- MARKS ENDPOINTS ---

@app.get("/marks", response_model=List[schemas.MarkResponse])
def get_marks(db: Session = Depends(get_db)):
    return db.query(models.Mark).all()

@app.post("/marks", response_model=schemas.MarkResponse)
def create_mark(mark: schemas.MarkCreate, db: Session = Depends(get_db)):
    new_mark = models.Mark(**mark.dict())
    db.add(new_mark)
    db.commit()
    db.refresh(new_mark)
    return new_mark

@app.post("/marks/bulk")
def bulk_upload_marks(payload: schemas.BulkMarkUploadRequest, db: Session = Depends(get_db)):
    added_marks = []
    errors = []
    
    for mark_data in payload.marks:
        user = db.query(models.User).filter(models.User.email == mark_data.email).first()
        if not user:
            errors.append(f"User {mark_data.email} not found")
            continue
            
        new_mark = models.Mark(
            user_id=user.id,
            subject=mark_data.subject,
            term=mark_data.term,
            score=mark_data.score,
            max_score=mark_data.max_score
        )
        db.add(new_mark)
        added_marks.append(new_mark)
        
    db.commit()
    
    return {
        "message": f"Successfully added {len(added_marks)} marks. Failed: {len(errors)}.",
        "errors": errors
    }

# --- ANNOUNCEMENT ENDPOINTS ---

@app.post("/announcements", response_model=schemas.AnnouncementResponse)
def create_announcement(announcement: schemas.AnnouncementCreate, db: Session = Depends(get_db)):
    new_announcement = models.Announcement(
        title=announcement.title,
        content=announcement.content,
        image_url=announcement.image_url,
        class_name=announcement.class_name,
        created_at=announcement.created_at,
        visibility=announcement.visibility
    )
    db.add(new_announcement)
    db.commit()
    db.refresh(new_announcement)

    # Send email notifications if requested
    if announcement.send_email:
        try:
            batch_names = [b.strip() for b in announcement.class_name.split(',')]
            all_students = db.query(models.User).filter(models.User.role != 'admin').all()
            # Filter students whose class_name matches any selected batch
            target_emails = [
                s.email for s in all_students
                if s.class_name and any(b in s.class_name for b in batch_names)
            ]
            if target_emails:
                send_announcement_email(
                    to_emails=target_emails,
                    subject=announcement.title,
                    body=announcement.content,
                    image_url=announcement.image_url
                )
        except Exception as e:
            print(f"[EMAIL SEND ERROR] {e}")

    return new_announcement

@app.get("/announcements", response_model=List[schemas.AnnouncementResponse])
def get_announcements(db: Session = Depends(get_db)):
    return db.query(models.Announcement).order_by(models.Announcement.id.desc()).all()

@app.delete("/announcements/{announcement_id}")
def delete_announcement(announcement_id: int, db: Session = Depends(get_db)):
    ann = db.query(models.Announcement).filter(models.Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    db.delete(ann)
    db.commit()
    return {"message": "Deleted successfully"}

# --- PAPERS ENDPOINTS ---

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a file (PDF, image) and return its public URL."""
    safe_name = file.filename.replace(" ", "_")
    file_path = UPLOADS_DIR / safe_name
    # Avoid name collision
    counter = 1
    stem = Path(safe_name).stem
    suffix = Path(safe_name).suffix
    while file_path.exists():
        safe_name = f"{stem}_{counter}{suffix}"
        file_path = UPLOADS_DIR / safe_name
        counter += 1
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"file_url": f"/uploads/{safe_name}", "url": f"/uploads/{safe_name}"}

@app.get("/papers", response_model=List[schemas.PaperResponse])
def get_papers(db: Session = Depends(get_db)):
    return db.query(models.StudyPaper).all()

@app.post("/papers", response_model=schemas.PaperResponse)
def create_paper(paper: schemas.PaperCreate, db: Session = Depends(get_db)):
    new_paper = models.StudyPaper(**paper.dict())
    db.add(new_paper)
    db.commit()
    db.refresh(new_paper)
    return new_paper

@app.delete("/papers/{paper_id}")
def delete_paper(paper_id: int, db: Session = Depends(get_db)):
    paper = db.query(models.StudyPaper).filter(models.StudyPaper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    db.delete(paper)
    db.commit()
    return {"message": "Deleted successfully"}

# --- CLASS RECORDINGS ENDPOINTS ---

@app.get("/recordings", response_model=List[schemas.ClassRecordingResponse])
def get_recordings(db: Session = Depends(get_db)):
    return db.query(models.ClassRecording).order_by(models.ClassRecording.id.desc()).all()

@app.post("/recordings", response_model=schemas.ClassRecordingResponse)
def create_recording(recording: schemas.ClassRecordingCreate, db: Session = Depends(get_db)):
    new_rec = models.ClassRecording(**recording.dict())
    db.add(new_rec)
    db.commit()
    db.refresh(new_rec)
    return new_rec

@app.delete("/recordings/{recording_id}")
def delete_recording(recording_id: int, db: Session = Depends(get_db)):
    rec = db.query(models.ClassRecording).filter(models.ClassRecording.id == recording_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recording not found")
    db.delete(rec)
    db.commit()
    return {"message": "Deleted successfully"}

# --- SLIDER ENDPOINTS ---

@app.get("/sliders", response_model=List[schemas.SliderResponse])
def get_sliders(db: Session = Depends(get_db)):
    return db.query(models.Slider).order_by(models.Slider.order_index).all()

@app.post("/sliders", response_model=schemas.SliderResponse)
def create_slider(slider: schemas.SliderCreate, db: Session = Depends(get_db)):
    new_slider = models.Slider(**slider.dict())
    db.add(new_slider)
    db.commit()
    db.refresh(new_slider)
    return new_slider

@app.put("/sliders/{slider_id}", response_model=schemas.SliderResponse)
def update_slider(slider_id: int, slider: schemas.SliderCreate, db: Session = Depends(get_db)):
    db_slider = db.query(models.Slider).filter(models.Slider.id == slider_id).first()
    if not db_slider:
        raise HTTPException(status_code=404, detail="Slider not found")
    for k, v in slider.dict().items():
        setattr(db_slider, k, v)
    db.commit()
    db.refresh(db_slider)
    return db_slider

@app.delete("/sliders/{slider_id}")
def delete_slider(slider_id: int, db: Session = Depends(get_db)):
    slider = db.query(models.Slider).filter(models.Slider.id == slider_id).first()
    if not slider:
        raise HTTPException(status_code=404, detail="Slider not found")
    db.delete(slider)
    db.commit()
    return {"message": "Deleted successfully"}

# --- HOME ADS ENDPOINTS ---

@app.get("/home-ads", response_model=List[schemas.HomeAdResponse])
def get_home_ads(db: Session = Depends(get_db)):
    return db.query(models.HomeAd).order_by(models.HomeAd.position, models.HomeAd.order_index).all()

@app.post("/home-ads", response_model=schemas.HomeAdResponse)
def create_home_ad(ad: schemas.HomeAdCreate, db: Session = Depends(get_db)):
    new_ad = models.HomeAd(**ad.dict())
    db.add(new_ad)
    db.commit()
    db.refresh(new_ad)
    return new_ad

@app.put("/home-ads/{ad_id}", response_model=schemas.HomeAdResponse)
def update_home_ad(ad_id: int, ad: schemas.HomeAdCreate, db: Session = Depends(get_db)):
    db_ad = db.query(models.HomeAd).filter(models.HomeAd.id == ad_id).first()
    if not db_ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    for k, v in ad.dict().items():
        setattr(db_ad, k, v)
    db.commit()
    db.refresh(db_ad)
    return db_ad

@app.delete("/home-ads/{ad_id}")
def delete_home_ad(ad_id: int, db: Session = Depends(get_db)):
    db_ad = db.query(models.HomeAd).filter(models.HomeAd.id == ad_id).first()
    if not db_ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    db.delete(db_ad)
    db.commit()
    return {"message": "Deleted successfully"}

# --- HOME STATS ENDPOINTS ---

@app.get("/home-stats", response_model=List[schemas.HomeStatResponse])
def get_home_stats(db: Session = Depends(get_db)):
    return db.query(models.HomeStat).order_by(models.HomeStat.order_index).all()

@app.post("/home-stats", response_model=schemas.HomeStatResponse)
def create_home_stat(stat: schemas.HomeStatCreate, db: Session = Depends(get_db)):
    new_stat = models.HomeStat(**stat.dict())
    db.add(new_stat)
    db.commit()
    db.refresh(new_stat)
    return new_stat

@app.put("/home-stats/{stat_id}", response_model=schemas.HomeStatResponse)
def update_home_stat(stat_id: int, stat: schemas.HomeStatCreate, db: Session = Depends(get_db)):
    db_stat = db.query(models.HomeStat).filter(models.HomeStat.id == stat_id).first()
    if not db_stat:
        raise HTTPException(status_code=404, detail="Stat not found")
    for k, v in stat.dict().items():
        setattr(db_stat, k, v)
    db.commit()
    db.refresh(db_stat)
    return db_stat

@app.delete("/home-stats/{stat_id}")
def delete_home_stat(stat_id: int, db: Session = Depends(get_db)):
    db_stat = db.query(models.HomeStat).filter(models.HomeStat.id == stat_id).first()
    if not db_stat:
        raise HTTPException(status_code=404, detail="Stat not found")
    db.delete(db_stat)
    db.commit()
    return {"message": "Deleted successfully"}

# --- BATCHES ENDPOINTS ---

@app.get("/batches", response_model=List[schemas.BatchResponse])
def get_batches(db: Session = Depends(get_db)):
    return db.query(models.Batch).all()

@app.post("/batches", response_model=schemas.BatchResponse)
def create_batch(batch: schemas.BatchCreate, db: Session = Depends(get_db)):
    db_batch = db.query(models.Batch).filter(models.Batch.name == batch.name).first()
    if db_batch:
        raise HTTPException(status_code=400, detail="Batch already exists")
    new_batch = models.Batch(**batch.dict())
    db.add(new_batch)
    db.commit()
    db.refresh(new_batch)
    return new_batch

@app.delete("/batches/{batch_id}")
def delete_batch(batch_id: int, db: Session = Depends(get_db)):
    db_batch = db.query(models.Batch).filter(models.Batch.id == batch_id).first()
    if not db_batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    db.delete(db_batch)
    db.commit()
    return {"status": "deleted", "id": batch_id}

# --- ADMIN STATS ---

@app.get("/stats", response_model=schemas.DashboardStats)
def get_stats(db: Session = Depends(get_db)):
    student_count = db.query(models.User).filter(models.User.role != "admin").count()
    quiz_count = db.query(models.Quiz).count()
    result_count = db.query(models.QuizResult).count()
    paper_count = db.query(models.StudyPaper).count()
    
    # Recent Activities
    recent_results = db.query(models.QuizResult).order_by(models.QuizResult.id.desc()).limit(3).all()
    recent_papers = db.query(models.StudyPaper).order_by(models.StudyPaper.id.desc()).limit(2).all()
    
    activity = []
    for r in recent_results:
        activity.append({
            "title": "Quiz Attempt",
            "desc": f"{r.student.full_name if r.student else 'A student'} finished {r.quiz.title if r.quiz else 'a quiz'}",
            "time": "Just now",
            "color": "#10B981"
        })
    for p in recent_papers:
        activity.append({
            "title": "Document Added",
            "desc": f"Uploaded {p.title}",
            "time": "Recently",
            "color": "#656CFF"
        })
        
    perf = [
        { "name": 'JAN', "value": max(0, student_count - 20), "goal": 10 },
        { "name": 'FEB', "value": max(0, student_count - 15), "goal": 20 },
        { "name": 'MAR', "value": max(0, student_count - 10), "goal": 30 },
        { "name": 'APR', "value": max(0, student_count - 5), "goal": 40 },
        { "name": 'MAY', "value": max(0, student_count - 2), "goal": 50 },
        { "name": 'JUN', "value": student_count, "goal": 60 },
    ]
    
    return {
        "students": student_count,
        "quizzes": quiz_count,
        "submissions": result_count,
        "papers": paper_count,
        "recent_activity": activity,
        "performance_data": perf
    }


@app.post("/auth/set-password")
def set_password(data: schemas.PasswordSet, db: Session = Depends(get_db)): # 165
    try:
        print(f"Received password length: {len(data.password)}")
        if len(data.password.encode('utf-8')) > 72:
            raise HTTPException(status_code=400, detail="Password too long (max 72 characters)")

        db_user = db.query(models.User).filter(models.User.email == data.email).first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        db_user.hashed_password = get_password_hash(data.password)
        db_user.is_active = True
        db.commit()
        return {"status": "activated", "email": db_user.email}
    except Exception as e:
        print(f"Error in set_password: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/requests", response_model=List[schemas.UserResponse])
def get_pending_requests(db: Session = Depends(get_db)):
    return db.query(models.User).filter(models.User.approval_status == "pending").all()

@app.post("/admin/requests/{user_id}/approve")
def approve_request(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_user.approval_status = "approved"
    db_user.is_active = True
    db.commit()
    return {"status": "success"}

@app.post("/admin/requests/{user_id}/reject")
def reject_request(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    return {"status": "rejected_and_deleted"}

@app.delete("/users/{email}")
def delete_user(email: str, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete related records
    db.query(models.QuizResult).filter(models.QuizResult.user_id == db_user.id).delete()
    db.query(models.Mark).filter(models.Mark.user_id == db_user.id).delete()
    db.query(models.Item).filter(models.Item.owner_id == db_user.id).delete()
    
    db.delete(db_user)
    db.commit()
    return {"status": "deleted", "email": email}

@app.get("/users", response_model=List[schemas.UserResponse]) # Create schema for response if not exists or use User
def get_users(db: Session = Depends(get_db)):
    users = db.query(models.User).filter(models.User.role != "admin").all() 
    return users

@app.get("/students", response_model=List[schemas.UserResponse])
def get_students(db: Session = Depends(get_db)):
    return get_users(db)

# --- QUIZ ENDPOINTS ---

@app.post("/quizzes", response_model=schemas.QuizResponse)
def create_quiz(quiz: schemas.QuizCreate, db: Session = Depends(get_db)):
    # Create Quiz
    new_quiz = models.Quiz(
        title=quiz.title, 
        description=quiz.description, 
        class_name=quiz.class_name,
        is_published=quiz.is_published,
        scheduled_time=quiz.scheduled_time,
        duration_minutes=quiz.duration_minutes,
        expiry_mode=quiz.expiry_mode,
        expiry_days=quiz.expiry_days
    )
    db.add(new_quiz)
    db.commit()
    db.refresh(new_quiz)
    
    # Create Questions
    for q in quiz.questions:
        new_q = models.Question(
            quiz_id=new_quiz.id,
            text=q.text,
            option_a=q.option_a,
            option_b=q.option_b,
            option_c=q.option_c,
            option_d=q.option_d,
            option_e=q.option_e,
            correct_option=q.correct_option,
            image_url=q.image_url
        )
        db.add(new_q)
    
    db.commit()
    db.refresh(new_quiz)
    return new_quiz

@app.put("/quizzes/{quiz_id}", response_model=schemas.QuizResponse)
def update_quiz(quiz_id: int, quiz: schemas.QuizCreate, db: Session = Depends(get_db)):
    db_quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not db_quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
        
    db_quiz.title = quiz.title
    db_quiz.description = quiz.description
    db_quiz.class_name = quiz.class_name
    db_quiz.is_published = quiz.is_published
    db_quiz.scheduled_time = quiz.scheduled_time
    db_quiz.duration_minutes = quiz.duration_minutes
    db_quiz.expiry_mode = quiz.expiry_mode
    db_quiz.expiry_days = quiz.expiry_days
    
    # Remove old questions
    db.query(models.Question).filter(models.Question.quiz_id == quiz_id).delete()
    
    # Add new questions
    for q in quiz.questions:
        new_q = models.Question(
            quiz_id=db_quiz.id,
            text=q.text,
            option_a=q.option_a,
            option_b=q.option_b,
            option_c=q.option_c,
            option_d=q.option_d,
            option_e=q.option_e,
            correct_option=q.correct_option,
            image_url=q.image_url
        )
        db.add(new_q)
        
    db.commit()
    db.refresh(db_quiz)
    return db_quiz

@app.get("/quizzes", response_model=List[schemas.QuizResponse])
def get_quizzes(db: Session = Depends(get_db)):
    quizzes = db.query(models.Quiz).all()
    return quizzes

@app.get("/quizzes/{quiz_id}", response_model=schemas.QuizResponse)
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz

@app.put("/quizzes/{quiz_id}/publish", response_model=schemas.QuizResponse)
def publish_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    quiz.is_published = True
    db.commit()
    db.refresh(quiz)
    return quiz

@app.get("/quizzes/student/{email}/taken")
def get_taken_quizzes(email: str, db: Session = Depends(get_db)):
    student = db.query(models.User).filter(models.User.email == email).first()
    if not student:
        return []
    results = db.query(models.QuizResult).filter(models.QuizResult.user_id == student.id).all()
    # Return list of quiz IDs already taken
    return [r.quiz_id for r in results]

@app.post("/quizzes/submit", response_model=schemas.QuizResultResponse)
def submit_quiz(submission: schemas.QuizSubmission, db: Session = Depends(get_db)):
    # Find Student (Optional: require auth)
    student = db.query(models.User).filter(models.User.email == submission.student_email).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    quiz = db.query(models.Quiz).filter(models.Quiz.id == submission.quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
        
    already_taken = db.query(models.QuizResult).filter(
        models.QuizResult.quiz_id == submission.quiz_id,
        models.QuizResult.user_id == student.id
    ).first()
    if already_taken:
        raise HTTPException(status_code=400, detail="You have already taken this quiz.")
    
    score = 0
    total = len(quiz.questions)
    
    # Calculate Score
    # answers is dict { "question_id_str": "A" }
    for q in quiz.questions:
        q_id_str = str(q.id)
        if q_id_str in submission.answers:
            if submission.answers[q_id_str] == q.correct_option:
                score += 1
    
    # Save Result
    result = models.QuizResult(
        quiz_id=quiz.id,
        user_id=student.id,
        score=score,
        total_questions=total
    )
    db.add(result)
    db.commit()
    
    return {
        "score": score,
        "total": total,
        "percentage": (score / total) * 100 if total > 0 else 0
    }

# --- TEACHER PROFILE API ---
@app.get("/teacher-profile", response_model=schemas.TeacherProfileResponse)
def get_teacher_profile(db: Session = Depends(get_db)):
    profile = db.query(models.TeacherProfile).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@app.put("/teacher-profile", response_model=schemas.TeacherProfileResponse)
def update_teacher_profile(profile: schemas.TeacherProfileCreate, db: Session = Depends(get_db)):
    db_profile = db.query(models.TeacherProfile).first()
    if not db_profile:
        db_profile = models.TeacherProfile(**profile.dict())
        db.add(db_profile)
    else:
        for k, v in profile.dict().items():
            setattr(db_profile, k, v)
    db.commit()
    db.refresh(db_profile)
    return db_profile

# --- SYLLABUS UNITS API ---
@app.get("/syllabus-units", response_model=List[schemas.SyllabusUnitResponse])
def get_syllabus_units(db: Session = Depends(get_db)):
    return db.query(models.SyllabusUnit).order_by(models.SyllabusUnit.order_index).all()

@app.post("/syllabus-units", response_model=schemas.SyllabusUnitResponse)
def create_syllabus_unit(unit: schemas.SyllabusUnitCreate, db: Session = Depends(get_db)):
    new_unit = models.SyllabusUnit(**unit.dict())
    db.add(new_unit)
    db.commit()
    db.refresh(new_unit)
    return new_unit

@app.put("/syllabus-units/{unit_id}", response_model=schemas.SyllabusUnitResponse)
def update_syllabus_unit(unit_id: int, unit: schemas.SyllabusUnitCreate, db: Session = Depends(get_db)):
    db_unit = db.query(models.SyllabusUnit).filter(models.SyllabusUnit.id == unit_id).first()
    if not db_unit:
        raise HTTPException(status_code=404, detail="Syllabus unit not found")
    for k, v in unit.dict().items():
        setattr(db_unit, k, v)
    db.commit()
    db.refresh(db_unit)
    return db_unit

@app.delete("/syllabus-units/{unit_id}")
def delete_syllabus_unit(unit_id: int, db: Session = Depends(get_db)):
    db_unit = db.query(models.SyllabusUnit).filter(models.SyllabusUnit.id == unit_id).first()
    if not db_unit:
        raise HTTPException(status_code=404, detail="Syllabus unit not found")
    db.delete(db_unit)
    db.commit()
    return {"message": "Deleted successfully"}

# --- LMS FEATURES API ---
@app.get("/lms-features", response_model=List[schemas.LmsFeatureResponse])
def get_lms_features(db: Session = Depends(get_db)):
    return db.query(models.LmsFeature).order_by(models.LmsFeature.order_index).all()

@app.post("/lms-features", response_model=schemas.LmsFeatureResponse)
def create_lms_feature(feature: schemas.LmsFeatureCreate, db: Session = Depends(get_db)):
    new_feat = models.LmsFeature(**feature.dict())
    db.add(new_feat)
    db.commit()
    db.refresh(new_feat)
    return new_feat

@app.put("/lms-features/{feat_id}", response_model=schemas.LmsFeatureResponse)
def update_lms_feature(feat_id: int, feature: schemas.LmsFeatureCreate, db: Session = Depends(get_db)):
    db_feat = db.query(models.LmsFeature).filter(models.LmsFeature.id == feat_id).first()
    if not db_feat:
        raise HTTPException(status_code=404, detail="Feature not found")
    for k, v in feature.dict().items():
        setattr(db_feat, k, v)
    db.commit()
    db.refresh(db_feat)
    return db_feat

@app.delete("/lms-features/{feat_id}")
def delete_lms_feature(feat_id: int, db: Session = Depends(get_db)):
    db_feat = db.query(models.LmsFeature).filter(models.LmsFeature.id == feat_id).first()
    if not db_feat:
        raise HTTPException(status_code=404, detail="Feature not found")
    db.delete(db_feat)
    db.commit()
    return {"message": "Deleted successfully"}

# --- HOME BATCHES API ---
@app.get("/home-batches", response_model=List[schemas.HomeBatchResponse])
def get_home_batches(db: Session = Depends(get_db)):
    return db.query(models.HomeBatch).order_by(models.HomeBatch.order_index).all()

@app.post("/home-batches", response_model=schemas.HomeBatchResponse)
def create_home_batch(batch: schemas.HomeBatchCreate, db: Session = Depends(get_db)):
    new_batch = models.HomeBatch(**batch.dict())
    db.add(new_batch)
    db.commit()
    db.refresh(new_batch)
    return new_batch

@app.put("/home-batches/{batch_id}", response_model=schemas.HomeBatchResponse)
def update_home_batch(batch_id: int, batch: schemas.HomeBatchCreate, db: Session = Depends(get_db)):
    db_batch = db.query(models.HomeBatch).filter(models.HomeBatch.id == batch_id).first()
    if not db_batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    for k, v in batch.dict().items():
        setattr(db_batch, k, v)
    db.commit()
    db.refresh(db_batch)
    return db_batch

@app.delete("/home-batches/{batch_id}")
def delete_home_batch(batch_id: int, db: Session = Depends(get_db)):
    db_batch = db.query(models.HomeBatch).filter(models.HomeBatch.id == batch_id).first()
    if not db_batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    db.delete(db_batch)
    db.commit()
    return {"message": "Deleted successfully"}

# --- TESTIMONIALS API ---
@app.get("/home-testimonials", response_model=List[schemas.TestimonialResponse])
def get_testimonials(db: Session = Depends(get_db)):
    return db.query(models.Testimonial).order_by(models.Testimonial.order_index).all()

@app.post("/home-testimonials", response_model=schemas.TestimonialResponse)
def create_testimonial(test: schemas.TestimonialCreate, db: Session = Depends(get_db)):
    new_test = models.Testimonial(**test.dict())
    db.add(new_test)
    db.commit()
    db.refresh(new_test)
    return new_test

@app.put("/home-testimonials/{test_id}", response_model=schemas.TestimonialResponse)
def update_testimonial(test_id: int, test: schemas.TestimonialCreate, db: Session = Depends(get_db)):
    db_test = db.query(models.Testimonial).filter(models.Testimonial.id == test_id).first()
    if not db_test:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    for k, v in test.dict().items():
        setattr(db_test, k, v)
    db.commit()
    db.refresh(db_test)
    return db_test

@app.delete("/home-testimonials/{test_id}")
def delete_testimonial(test_id: int, db: Session = Depends(get_db)):
    db_test = db.query(models.Testimonial).filter(models.Testimonial.id == test_id).first()
    if not db_test:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    db.delete(db_test)
    db.commit()
    return {"message": "Deleted successfully"}

# --- FAQs API ---
@app.get("/home-faqs", response_model=List[schemas.HomeFaqResponse])
def get_home_faqs(db: Session = Depends(get_db)):
    return db.query(models.HomeFaq).order_by(models.HomeFaq.order_index).all()

@app.post("/home-faqs", response_model=schemas.HomeFaqResponse)
def create_home_faq(faq: schemas.HomeFaqCreate, db: Session = Depends(get_db)):
    new_faq = models.HomeFaq(**faq.dict())
    db.add(new_faq)
    db.commit()
    db.refresh(new_faq)
    return new_faq

@app.put("/home-faqs/{faq_id}", response_model=schemas.HomeFaqResponse)
def update_home_faq(faq_id: int, faq: schemas.HomeFaqCreate, db: Session = Depends(get_db)):
    db_faq = db.query(models.HomeFaq).filter(models.HomeFaq.id == faq_id).first()
    if not db_faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    for k, v in faq.dict().items():
        setattr(db_faq, k, v)
    db.commit()
    db.refresh(db_faq)
    return db_faq

@app.delete("/home-faqs/{faq_id}")
def delete_home_faq(faq_id: int, db: Session = Depends(get_db)):
    db_faq = db.query(models.HomeFaq).filter(models.HomeFaq.id == faq_id).first()
    if not db_faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    db.delete(db_faq)
    db.commit()
    return {"message": "Deleted successfully"}

# --- PDF QUIZ GENERATOR ---
import io
import json
import urllib.request
import urllib.error
from pypdf import PdfReader

# 1. Consonant translation matrix
CONSONANTS = {
    'f': 'க', 'r': 'ச', 'l': 'ட', 'z': 'ண', 'j': 'த', 'n': 'ந', 'g': 'ப', 'k': 'ம',
    'a': 'ய', 'u': 'ர', 'y': 'ல', 't': 'வ', 's': 'ள', 'w': 'ற', 'd': 'ன', 'q': 'ங', 'o': 'ழ'
}

B_REPLACEMENT = []

# 1. Prefix and suffix combinations
for k, val in CONSONANTS.items():
    B_REPLACEMENT.append(('N' + k + 'h;', val + 'ோ'))
    B_REPLACEMENT.append(('N' + k + 'h', val + 'ோ'))
    B_REPLACEMENT.append(('N' + k + ';', val + 'ே'))
    B_REPLACEMENT.append(('N' + k, val + 'ே'))
    
    B_REPLACEMENT.append(('e' + k + 'h;', val + 'ொ'))
    B_REPLACEMENT.append(('e' + k + 'h', val + 'ொ'))
    B_REPLACEMENT.append(('e' + k + ';', val + 'ெ'))
    B_REPLACEMENT.append(('e' + k, val + 'ெ'))
    
    B_REPLACEMENT.append(('i' + k + ';', val + 'ை'))
    B_REPLACEMENT.append(('i' + k, val + 'ை'))

    # base combinations
    B_REPLACEMENT.append((k + 'p;', val + 'ீ'))
    B_REPLACEMENT.append((k + 'p', val + 'ி'))
    B_REPLACEMENT.append((k + 'P', val + 'ீ'))
    B_REPLACEMENT.append((k + 'h;', val + 'ா'))
    B_REPLACEMENT.append((k + 'h', val + 'ா'))
    B_REPLACEMENT.append((k + ';', val + '்'))

# Extra static rules
EXTRA_RULES = [
    ('A', 'அ'), ('M', 'ஆ'), ('I', 'ஐ'), ('X', 'ஓ'), ('x', 'ஒ'),
    ('c', 'உ'), ('C', 'ஊ'), ('v', 'எ'), ('V', 'ஏ'), (',', 'இ'),
    ('<', 'ஈ'), ('F', 'கு'), ('G', 'பு'), ('K', 'ழு'), ('W', 'று'),
    ('J', 'து'), ('L', 'ட'), ('S', 'ளு'), ('T', 'வு'), ('U', 'ரு'), ('D', 'னு'),
    ('Jh', 'தூ'), ('\\', 'ஹ')
]

for k, val in CONSONANTS.items():
    B_REPLACEMENT.append((k, val))

B_REPLACEMENT.extend(EXTRA_RULES)

# Sort replacements by pattern length descending to guarantee longest matches replace first!
B_REPLACEMENT.sort(key=lambda x: len(x[0]), reverse=True)

def convert_bamini_to_unicode(text: str) -> str:
    unicode_text = text
    for p, r in B_REPLACEMENT:
        unicode_text = unicode_text.replace(p, r)
    return unicode_text

def is_bamini(text: str) -> bool:
    import re
    return bool(re.search(r'MdJ|Nthy;w;W|,yj;jpud;|[jrlztngkahyvwdqcs];', text))

def translate_bamini_text(text: str) -> str:
    import re
    if is_bamini(text):
        def replace_token(match):
            token = match.group(0)
            if len(token) <= 1:
                return token
            if re.match(r'^(GMm|GM|eV|N|G|M|m|r|r\^2|GMm\/r|GMm\/r\^2|GM\/r)$', token, re.IGNORECASE):
                return token
            if re.match(r'^[Mmr],?[Mmr]?$', token):
                return token
            if '/' in token or '^' in token:
                return token
            return convert_bamini_to_unicode(token)
            
        return re.sub(r'[a-zA-Z;,<>\\^\\/\\*\\-\\+0-9]+', replace_token, text)
    return text

@app.post("/quizzes/generate-from-pdf")
async def generate_quiz_from_pdf(file: UploadFile = File(...)):
    # 1. Extract text from uploaded PDF
    try:
        pdf_bytes = await file.read()
        reader = PdfReader(io.BytesIO(pdf_bytes))
        extracted_text = ""
        for page in reader.pages:
            extracted_text += page.extract_text() or ""
            extracted_text += "\n"
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read PDF: {str(e)}")

    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail="The uploaded PDF contains no readable text content.")

    # 2. Decode legacy Bamini Tamil to Unicode Tamil
    decoded_text = translate_bamini_text(extracted_text)

    # 3. Call Google Gemini API
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY environment variable is not configured on the server.")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    
    prompt = (
        "You are an expert physics teacher. Extract all the multiple choice questions (MCQs) from the following exam text. "
        "Structure them exactly matching the JSON response format requested. Ensure all question texts, options A through E, "
        "and correct_option (A, B, C, D, or E) are populated. If option E is not present in the question, set option_e to empty string. "
        "Format any mathematical expressions or variables nicely.\n\n"
        "Exam Text:\n" + decoded_text
    )

    payload = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "ARRAY",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "text": { "type": "STRING" },
                        "option_a": { "type": "STRING" },
                        "option_b": { "type": "STRING" },
                        "option_c": { "type": "STRING" },
                        "option_d": { "type": "STRING" },
                        "option_e": { "type": "STRING" },
                        "correct_option": { "type": "STRING", "description": "A, B, C, D, or E" }
                    },
                    "required": ["text", "option_a", "option_b", "option_c", "option_d", "option_e", "correct_option"]
                }
            }
        }
    }

    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            
        candidate = res_data.get("candidates", [{}])[0]
        text_content = candidate.get("content", {}).get("parts", [{}])[0].get("text", "[]")
        
        questions = json.loads(text_content)
        return {"questions": questions}
    except urllib.error.HTTPError as he:
        err_msg = he.read().decode("utf-8")
        print(f"Gemini API HTTP Error: {err_msg}")
        raise HTTPException(status_code=502, detail=f"Gemini API returned error: {err_msg}")
    except Exception as e:
        print(f"Failed to generate quiz: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to parse and generate quiz: {str(e)}")

