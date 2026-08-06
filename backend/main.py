from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from typing import List
import smtplib
import os
from dotenv import load_dotenv
load_dotenv()
import shutil
from pathlib import Path
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import io
import json
import urllib.request
import urllib.error
from pypdf import PdfReader
from datetime import datetime

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
SMTP_USERNAME = os.getenv("SMTP_USERNAME") or os.getenv("EMAIL_ADDRESS") or ""
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD") or os.getenv("EMAIL_PASSWORD") or ""

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
            image_html = f'<div style="margin-top:20px; text-align:center;"><img src="{image_url}" style="max-width:100%; border: 2px solid #0a0a0a; box-shadow: 4px 4px 0px #0a0a0a;" /></div>' if image_url else ''
            html = f"""
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f0e6; border: 2px solid #0a0a0a; box-shadow: 8px 8px 0px #0a0a0a;">
                <div style="background-color: #0a0a0a; padding: 25px 30px; text-align: center; border-bottom: 2px solid #0a0a0a;">
                    <h1 style="color: #ffffff; margin: 0; font-family: 'Trebuchet MS', sans-serif; text-transform: uppercase; letter-spacing: 2px; font-size: 24px;">Intelligent Physics</h1>
                </div>
                <div style="padding: 30px; background-color: #f9f6ee;">
                    <h2 style="color: #0a0a0a; margin-top: 0; font-size: 18px; font-weight: 800; text-transform: uppercase; border-left: 4px solid #b91c1c; padding-left: 15px; line-height: 1.2;">{subject}</h2>
                    <div style="color: #374151; font-size: 14px; line-height: 1.7; white-space: pre-wrap; margin-top: 20px; font-weight: 500;">{body}</div>
                    {image_html}
                    
                    <div style="text-align: center; margin-top: 30px; margin-bottom: 10px;">
                        <a href="http://localhost:5173/dashboard" style="display: inline-block; background-color: #0a0a0a; color: #ffffff; padding: 12px 25px; text-decoration: none; font-size: 12px; font-weight: bold; font-family: monospace; text-transform: uppercase; letter-spacing: 1px; border: 2px solid #0a0a0a; box-shadow: 4px 4px 0px #b91c1c; transition: all 0.2s;">
                            Access Student Portal 📢
                        </a>
                    </div>
                </div>
                <div style="background-color: #f4f0e6; padding: 15px; text-align: center; border-top: 1px solid #d5d0c2; font-family: monospace; font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">
                    Intelligent Physics © 2026 — Student Portal
                </div>
            </div>
            """
            msg.attach(MIMEText(html, 'html'))
            server.sendmail(SMTP_USERNAME, email, msg.as_string())
        server.quit()
        print(f"[EMAIL] Sent announcement email to {len(to_emails)} recipients.")
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")

def send_custom_html_email(to_emails: list, subject: str, html_body: str):
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print("[EMAIL] SMTP credentials not configured. Skipping email send.")
        return
    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        for email in to_emails:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"✨ {subject}"
            msg['From'] = SMTP_USERNAME
            msg['To'] = email
            msg.attach(MIMEText(html_body, 'html'))
            server.sendmail(SMTP_USERNAME, email, msg.as_string())
        server.quit()
        print(f"[EMAIL] Sent custom HTML email to {len(to_emails)} recipients.")
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")

def notify_students_of_quiz(quiz: models.Quiz, db: Session):
    # Fetch all approved students
    query = db.query(models.User).filter(models.User.role != "admin", models.User.approval_status == "approved")
    
    # Filter by class name if not All/empty
    if quiz.class_name and quiz.class_name.lower() != "all":
        users = query.all()
        target_emails = []
        quiz_batches = [b.strip().lower() for b in quiz.class_name.split(",") if b.strip()]
        for u in users:
            user_batches = [b.strip().lower() for b in (u.class_name or "").split(",") if b.strip()]
            if any(qb in user_batches for qb in quiz_batches):
                target_emails.append(u.email)
    else:
        target_emails = [u.email for u in query.all()]
        
    if not target_emails:
        print("[QUIZ NOTIFY] No matching approved students to notify.")
        return
        
    # Format Date and Time nicely
    scheduled_dt = "Available Immediately"
    if quiz.scheduled_time:
        try:
            from datetime import datetime
            dt = datetime.fromisoformat(quiz.scheduled_time.replace('Z', ''))
            scheduled_dt = dt.strftime("%A, %B %d, %Y at %I:%M %p")
        except Exception:
            scheduled_dt = quiz.scheduled_time

    subject = f"New Exam Available: {quiz.title}"
    
    # Elegant, premium retro-brutalist HTML template matching app branding
    html_content = f"""
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f0e6; border: 2px solid #0a0a0a; box-shadow: 8px 8px 0px #0a0a0a;">
        <div style="background-color: #0a0a0a; padding: 30px; text-align: center; border-bottom: 2px solid #0a0a0a;">
            <h1 style="color: #ffffff; margin: 0; font-family: 'Trebuchet MS', sans-serif; text-transform: uppercase; letter-spacing: 2px; font-size: 24px;">Intelligent Physics</h1>
            <p style="color: #b91c1c; margin: 5px 0 0 0; font-family: monospace; font-size: 12px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase;">Spark Exam Notification</p>
        </div>
        <div style="padding: 30px; background-color: #f9f6ee;">
            <h2 style="color: #0a0a0a; margin-top: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; border-left: 4px solid #b91c1c; padding-left: 15px; line-height: 1.2;">{quiz.title}</h2>
            <p style="color: #6b6558; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">A new exam/test has been published. Please review the schedule and duration details below:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; background-color: #f4f0e6; border: 1px solid #d5d0c2;">
                <tr>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #d5d0c2; font-family: monospace; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #6b6558; width: 30%;">Exam Date & Time</td>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #d5d0c2; font-size: 14px; font-weight: bold; color: #0a0a0a;">{scheduled_dt}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #d5d0c2; font-family: monospace; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #6b6558;">Duration</td>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #d5d0c2; font-size: 14px; font-weight: bold; color: #b91c1c;">{quiz.duration_minutes or 30} Minutes</td>
                </tr>
                <tr>
                    <td style="padding: 12px 15px; font-family: monospace; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #6b6558;">Instructions</td>
                    <td style="padding: 12px 15px; font-size: 13px; color: #6b6558; line-height: 1.4;">Ensure you have a stable internet connection. The timer starts automatically once you click start. Only one attempt is permitted.</td>
                </tr>
            </table>

            <div style="text-align: center; margin-top: 35px; margin-bottom: 20px;">
                <a href="http://localhost:5173/dashboard?quiz_id={quiz.id}" style="display: inline-block; background-color: #0a0a0a; color: #ffffff; padding: 14px 30px; text-decoration: none; font-size: 13px; font-weight: bold; font-family: monospace; text-transform: uppercase; letter-spacing: 1px; border: 2px solid #0a0a0a; box-shadow: 4px 4px 0px #b91c1c; transition: all 0.2s;">
                    Launch Exam Now 🚀
                </a>
            </div>
        </div>
        <div style="background-color: #f4f0e6; padding: 20px; text-align: center; border-top: 1px solid #d5d0c2; font-family: monospace; font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">
            Intelligent Physics © 2026 — All Rights Reserved
        </div>
    </div>
    """

    import threading
    thread = threading.Thread(
        target=send_custom_html_email,
        args=(target_emails, subject, html_content)
    )
    thread.start()

def send_simple_email_async(to_email: str, subject: str, body: str):
    import threading
    thread = threading.Thread(
        target=send_announcement_email,
        args=([to_email], subject, body)
    )
    thread.start()

def send_welcome_email_async(to_email: str, student_name: str, batch: str, whatsapp: str):
    subject = "Welcome to Intelligent Physics — Registration Pending Approval"
    
    html_content = f"""
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f0e6; border: 2px solid #0a0a0a; box-shadow: 8px 8px 0px #0a0a0a;">
        <div style="background-color: #0a0a0a; padding: 30px; text-align: center; border-bottom: 2px solid #0a0a0a;">
            <h1 style="color: #ffffff; margin: 0; font-family: 'Trebuchet MS', sans-serif; text-transform: uppercase; letter-spacing: 2px; font-size: 24px;">Intelligent Physics</h1>
            <p style="color: #b91c1c; margin: 5px 0 0 0; font-family: monospace; font-size: 12px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase;">Student Portal Registration</p>
        </div>
        <div style="padding: 30px; background-color: #f9f6ee;">
            <h2 style="color: #0a0a0a; margin-top: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; border-left: 4px solid #b91c1c; padding-left: 15px; line-height: 1.2;">Welcome, {student_name}!</h2>
            <p style="color: #6b6558; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
                Thank you for registering at Intelligent Physics. Your student profile request has been successfully received and is currently **pending administrator review**.
            </p>
            
            <p style="color: #0a0a0a; font-size: 12px; font-weight: bold; text-transform: uppercase; tracking-wider; mb: 10px;">Your Registered Details:</p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; background-color: #f4f0e6; border: 1px solid #d5d0c2;">
                <tr>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #d5d0c2; font-family: monospace; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #6b6558; width: 30%;">Full Name</td>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #d5d0c2; font-size: 13px; font-weight: bold; color: #0a0a0a;">{student_name}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #d5d0c2; font-family: monospace; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #6b6558;">Email Address</td>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #d5d0c2; font-size: 13px; color: #0a0a0a;">{to_email}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #d5d0c2; font-family: monospace; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #6b6558;">Selected Batch</td>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #d5d0c2; font-size: 13px; font-weight: bold; color: #656CFF;">{batch or 'N/A'}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 15px; font-family: monospace; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #6b6558;">WhatsApp No</td>
                    <td style="padding: 12px 15px; font-size: 13px; color: #0a0a0a;">{whatsapp or 'Not Provided'}</td>
                </tr>
            </table>

            <div style="border-left: 3px solid #b91c1c; padding-left: 15px; margin-bottom: 25px;">
                <p style="color: #6b6558; font-size: 13px; line-height: 1.5; margin: 0;">
                    <strong>What happens next?</strong> Once our enrollment administrators validate your registration, you will receive a second email notifying you of your account activation. You can then log into the portal.
                </p>
            </div>
        </div>
        <div style="background-color: #f4f0e6; padding: 20px; text-align: center; border-top: 1px solid #d5d0c2; font-family: monospace; font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">
            Intelligent Physics © 2026 — All Rights Reserved
        </div>
    </div>
    """
    import threading
    thread = threading.Thread(
        target=send_custom_html_email,
        args=([to_email], subject, html_content)
    )
    thread.start()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# ── Proctoring & Randomization Helpers ─────────────────────────────────────
import hashlib
import random
import re

def safe_eval(expr: str, variables: dict) -> float:
    expr = expr.strip()
    for var, val in sorted(variables.items(), key=lambda x: len(x[0]), reverse=True):
        expr = expr.replace(var, str(val))
    if not re.match(r'^[0-9\.\+\-\*\/\(\)\s\*\*]+$', expr):
        raise ValueError(f"Unsafe expression: {expr}")
    try:
        val = eval(expr, {"__builtins__": None}, {})
        if isinstance(val, float):
            if val.is_integer():
                return int(val)
            return round(val, 2)
        return val
    except Exception:
        return 0.0

def get_shuffled_and_randomized_questions(questions: list, student_email: str, quiz_id: int):
    email_key = student_email.strip().lower()
    seed_str = f"{email_key}_{quiz_id}"
    seed_bytes = hashlib.md5(seed_str.encode()).digest()
    seed_int = int.from_bytes(seed_bytes, 'big')
    
    shuffled = []
    quiz_random = random.Random(seed_int)
    question_indices = list(range(len(questions)))
    quiz_random.shuffle(question_indices)
    
    ordered_questions = [questions[i] for i in question_indices]
    
    for q in ordered_questions:
        q_seed_str = f"{email_key}_{quiz_id}_{q.id}"
        q_seed_bytes = hashlib.md5(q_seed_str.encode()).digest()
        q_seed_int = int.from_bytes(q_seed_bytes, 'big')
        q_random = random.Random(q_seed_int)
        
        var_pattern = r'\[\[\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([\d\.\-]+)\s*\.\.\s*([\d\.\-]+)(?:\s*\.\.\s*([\d\.\-]+))?\s*\]\]'
        matches = re.findall(var_pattern, q.text)
        
        variables = {}
        for var_name, min_val, max_val, step_val in matches:
            min_f = float(min_val)
            max_f = float(max_val)
            if step_val:
                step_f = float(step_val)
                choices = []
                curr = min_f
                while curr <= max_f + 1e-9:
                    choices.append(curr)
                    curr += step_f
                val = q_random.choice(choices) if choices else min_f
            else:
                if '.' in min_val or '.' in max_val:
                    val = q_random.uniform(min_f, max_f)
                else:
                    val = q_random.randint(int(min_f), int(max_f))
            
            if isinstance(val, float):
                val = round(val, 2)
                if val.is_integer():
                    val = int(val)
            variables[var_name] = val
            
        def repl(match):
            return str(variables.get(match.group(1), match.group(0)))
            
        final_text = re.sub(var_pattern, repl, q.text)
        
        orig_options = {
            'A': q.option_a,
            'B': q.option_b,
            'C': q.option_c,
            'D': q.option_d,
            'E': q.option_e
        }
        orig_option_images = {
            'A': q.option_a_image_url,
            'B': q.option_b_image_url,
            'C': q.option_c_image_url,
            'D': q.option_d_image_url,
            'E': q.option_e_image_url
        }
        
        evaluated_options = {}
        expr_pattern = r'\{\{([^}]+)\}\}'
        for opt_key, opt_val in orig_options.items():
            if not opt_val:
                evaluated_options[opt_key] = None
                continue
            def repl_expr(match):
                expr = match.group(1)
                try:
                    return str(safe_eval(expr, variables))
                except Exception:
                    return match.group(0)
            evaluated_options[opt_key] = re.sub(expr_pattern, repl_expr, opt_val)
            
        available_keys = [k for k, v in evaluated_options.items() if (v is not None or orig_option_images[k] is not None)]
        shuffled_keys = list(available_keys)
        q_random.shuffle(shuffled_keys)
        
        final_options = {}
        final_option_images = {}
        new_correct_option = None
        
        target_keys = ['A', 'B', 'C', 'D', 'E'][:len(shuffled_keys)]
        for t_key, s_key in zip(target_keys, shuffled_keys):
            final_options[t_key] = evaluated_options[s_key]
            final_option_images[t_key] = orig_option_images[s_key]
            if q.correct_option == s_key:
                new_correct_option = t_key
                
        for r_key in ['A', 'B', 'C', 'D', 'E'][len(shuffled_keys):]:
            final_options[r_key] = None
            final_option_images[r_key] = None
            
        shuffled.append({
            "id": q.id,
            "quiz_id": q.quiz_id,
            "text": final_text,
            "option_a": final_options.get('A'),
            "option_b": final_options.get('B'),
            "option_c": final_options.get('C'),
            "option_d": final_options.get('D'),
            "option_e": final_options.get('E'),
            "option_a_image_url": final_option_images.get('A'),
            "option_b_image_url": final_option_images.get('B'),
            "option_c_image_url": final_option_images.get('C'),
            "option_d_image_url": final_option_images.get('D'),
            "option_e_image_url": final_option_images.get('E'),
            "image_url": q.image_url,
            "correct_option": new_correct_option or q.correct_option
        })
        
    return shuffled

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
        whatsapp_number=user.whatsapp_number,
        is_active=True,
        approval_status="pending"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Send premium pending approval confirmation HTML email to the student
    send_welcome_email_async(
        to_email=new_user.email,
        student_name=new_user.full_name,
        batch=new_user.class_name,
        whatsapp=new_user.whatsapp_number
    )
    
    return new_user

@app.on_event("startup")
def startup_populate():
    # Auto-add 'whatsapp_number' column if missing
    try:
        from sqlalchemy import text
        db = next(get_db())
        db.execute(text("ALTER TABLE users ADD COLUMN whatsapp_number TEXT"))
        db.commit()
    except Exception:
        pass

    # Auto-add 'role' column if missing (SQLite specific helper)
    try:
        from sqlalchemy import text
        db = next(get_db())
        db.execute(text("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'student'"))
        db.commit()
    except Exception:
        # Column likely already exists or other error
        pass

    # Auto-add 'permissions' column if missing
    try:
        from sqlalchemy import text
        db = next(get_db())
        db.execute(text("ALTER TABLE users ADD COLUMN permissions TEXT"))
        db.commit()
    except Exception:
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
        "class_name": db_user.class_name,  # Required so frontend can filter data by batch
        "permissions": db_user.permissions,
        "whatsapp_number": db_user.whatsapp_number
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
        "class_name": user.class_name,
        "permissions": user.permissions,
        "whatsapp_number": user.whatsapp_number
    }

@app.put("/users/profile/{user_id}", response_model=schemas.UserResponse)
def update_user_profile(user_id: int, profile: schemas.UserProfileUpdate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_user.full_name = profile.full_name
    db_user.whatsapp_number = profile.whatsapp_number
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/users/change-password/{user_id}")
def change_user_password(user_id: int, pwd: schemas.UserPasswordChange, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not verify_password(pwd.current_password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    db_user.hashed_password = get_password_hash(pwd.new_password)
    db.commit()
    return {"status": "success", "message": "Password changed successfully"}

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

@app.get("/admin/sub-admins")
def get_sub_admins(db: Session = Depends(get_db)):
    sub_admins = db.query(models.User).filter(models.User.role == "sub_admin").all()
    return sub_admins

@app.post("/admin/sub-admins")
def create_sub_admin(sub_admin: schemas.SubAdminCreate, db: Session = Depends(get_db)):
    # Clean email
    email = sub_admin.email.strip().lower()
    
    # Check duplicate
    existing = db.query(models.User).filter(models.User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    hashed_pw = get_password_hash(sub_admin.password)
    new_sub = models.User(
        email=email,
        hashed_password=hashed_pw,
        role="sub_admin",
        full_name=sub_admin.full_name,
        permissions=sub_admin.permissions,
        approval_status="approved",
        is_active=True
    )
    db.add(new_sub)
    db.commit()
    db.refresh(new_sub)
    return new_sub

@app.put("/admin/sub-admins/{id}")
def update_sub_admin(id: int, sub_admin: schemas.SubAdminUpdate, db: Session = Depends(get_db)):
    db_sub = db.query(models.User).filter(models.User.id == id, models.User.role == "sub_admin").first()
    if not db_sub:
        raise HTTPException(status_code=404, detail="Sub-admin not found")
        
    if sub_admin.email is not None:
        email = sub_admin.email.strip().lower()
        if email != db_sub.email:
            existing = db.query(models.User).filter(models.User.email == email).first()
            if existing:
                raise HTTPException(status_code=400, detail="User with this email already exists")
            db_sub.email = email
            
    if sub_admin.full_name is not None:
        db_sub.full_name = sub_admin.full_name
        
    if sub_admin.permissions is not None:
        db_sub.permissions = sub_admin.permissions
        
    if sub_admin.password is not None and sub_admin.password != "":
        db_sub.hashed_password = get_password_hash(sub_admin.password)
        
    db.commit()
    db.refresh(db_sub)
    return db_sub

@app.delete("/admin/sub-admins/{id}")
def delete_sub_admin(id: int, db: Session = Depends(get_db)):
    db_sub = db.query(models.User).filter(models.User.id == id, models.User.role == "sub_admin").first()
    if not db_sub:
        raise HTTPException(status_code=404, detail="Sub-admin not found")
        
    db.delete(db_sub)
    db.commit()
    return {"status": "success", "message": "Sub-admin deleted successfully"}

@app.put("/users/profile/{user_id}", response_model=schemas.UserResponse)
def update_user_profile(user_id: int, profile: schemas.UserProfileUpdate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_user.full_name = profile.full_name.strip()
    if profile.whatsapp_number is not None:
        db_user.whatsapp_number = profile.whatsapp_number.strip()
        
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/users/change-password/{user_id}")
def change_user_password(user_id: int, payload: schemas.UserPasswordChange, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not verify_password(payload.current_password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
        
    db_user.hashed_password = get_password_hash(payload.new_password)
    db.commit()
    return {"status": "success", "message": "Password changed successfully"}

# --- EMAIL CONFIGURATION ---
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import BackgroundTasks
from pydantic import BaseModel

def send_invite_email(to_email: str, link: str):
    if not SMTP_USERNAME or "your.email" in SMTP_USERNAME:
        print("❌ Email credentials not set in .env file. Skipping email send.")
        return

    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
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
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(SMTP_USERNAME, to_email, text)
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
    results = db.query(models.QuizResult).all()
    out = []
    for r in results:
        session = db.query(models.QuizSession).filter(
            models.QuizSession.user_id == r.user_id,
            models.QuizSession.quiz_id == r.quiz_id
        ).first()
        violations = db.query(models.QuizViolation).filter(
            models.QuizViolation.user_id == r.user_id,
            models.QuizViolation.quiz_id == r.quiz_id
        ).all()
        out.append({
            "id": r.id,
            "quiz_id": r.quiz_id,
            "user_id": r.user_id,
            "score": r.score,
            "total_questions": r.total_questions,
            "created_at": r.created_at,
            "student": r.student,
            "quiz": r.quiz,
            "session": session,
            "violations": violations
        })
    return out

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

    # Send email notifications for all announcements
    if True:
        try:
            all_students = db.query(models.User).filter(models.User.role != 'admin', models.User.approval_status == 'approved').all()
            if not announcement.class_name or announcement.class_name.lower() == "all":
                target_emails = [s.email for s in all_students]
            else:
                batch_names = [b.strip().lower() for b in announcement.class_name.split(',')]
                target_emails = []
                for s in all_students:
                    user_batches = [b.strip().lower() for b in (s.class_name or "").split(",") if b.strip()]
                    if any(b in user_batches for b in batch_names):
                        target_emails.append(s.email)

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

DEFAULT_HOME_STATS = [
    {"value": "1,200+", "label": "ACTIVE STUDENTS", "icon": "🎓", "color": "#3b82f6", "bg": "rgba(59,130,246,.12)", "is_active": True, "order_index": 0},
    {"value": "500+", "label": "SOLVED PAPERS", "icon": "📝", "color": "#6366f1", "bg": "rgba(99,102,241,.12)", "is_active": True, "order_index": 1},
    {"value": "300+", "label": "LECTURE VIDEOS", "icon": "📹", "color": "#06b6d4", "bg": "rgba(6,182,212,.12)", "is_active": True, "order_index": 2},
    {"value": "94%", "label": "PASS RATE (A/B)", "icon": "🏆", "color": "#10b981", "bg": "rgba(16,185,129,.12)", "is_active": True, "order_index": 3},
]

@app.get("/home-stats", response_model=List[schemas.HomeStatResponse])
def get_home_stats(db: Session = Depends(get_db)):
    stats = db.query(models.HomeStat).order_by(models.HomeStat.order_index).all()
    if not stats:
        for s in DEFAULT_HOME_STATS:
            db_stat = models.HomeStat(**s)
            db.add(db_stat)
        db.commit()
        stats = db.query(models.HomeStat).order_by(models.HomeStat.order_index).all()
    return stats

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

# --- TEACHER PROFILE ENDPOINTS ---
@app.get("/teacher-profile", response_model=Optional[schemas.TeacherProfileResponse])
def get_teacher_profile(db: Session = Depends(get_db)):
    profile = db.query(models.TeacherProfile).first()
    if not profile:
        profile = models.TeacherProfile(
            name="Mr. R. Raakulan",
            title="LEAD LECTURER",
            credentials="B.Sc. Physics · University of Jaffna",
            bio_text="Physics Teacher at New Science Hall (Tamil and English Medium classes). A dedicated tutor for Advanced Level Physics students with a proven record of helping 75% of students pass while sparking a genuine interest in learning.",
            mediums="Tamil and English Medium classes"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@app.post("/teacher-profile", response_model=schemas.TeacherProfileResponse)
@app.put("/teacher-profile", response_model=schemas.TeacherProfileResponse)
def save_teacher_profile(data: schemas.TeacherProfileCreate, db: Session = Depends(get_db)):
    profile = db.query(models.TeacherProfile).first()
    if not profile:
        profile = models.TeacherProfile(**data.dict())
        db.add(profile)
    else:
        for k, v in data.dict().items():
            setattr(profile, k, v)
    db.commit()
    db.refresh(profile)
    return profile

# --- SYLLABUS UNITS ENDPOINTS ---
DEFAULT_SYLLABUS = [
    {"topic": "Measurement & Units", "icon": "Ruler", "desc": "SI system, dimensions, vector analysis, and error propagation.", "subtopics_json": '["SI Units & Dimensions","Errors & Uncertainty","Vector Analysis"]', "color": "border-blue-200 bg-blue-50/20 hover:border-blue-400 hover:shadow-blue-500/5", "order_index": 0},
    {"topic": "Mechanics", "icon": "Activity", "desc": "Kinematics, Newton's Laws, Work-Energy, Circular motion, and Momentum.", "subtopics_json": '["Kinematics & Motion","Newton\'s Laws","Work, Energy & Power"]', "color": "border-blue-200 bg-blue-50/20 hover:border-blue-400 hover:shadow-blue-500/5", "order_index": 1},
    {"topic": "Oscillations & Waves", "icon": "Radio", "desc": "Simple harmonic motion, wave mechanics, sound resonance, and optics.", "subtopics_json": '["Simple Harmonic Motion","Wave Interference","Optics & Resonance"]', "color": "border-blue-200 bg-blue-50/20 hover:border-blue-400 hover:shadow-blue-500/5", "order_index": 2},
    {"topic": "Thermal Physics", "icon": "Flame", "desc": "Kinetic theory of gases, thermodynamics laws, and heat transfer.", "subtopics_json": '["Thermal Expansion","Thermodynamics","Gas Laws"]', "color": "border-blue-200 bg-blue-50/20 hover:border-blue-400 hover:shadow-blue-500/5", "order_index": 3},
    {"topic": "Gravitational & Electrostatic Fields", "icon": "Globe", "desc": "Field theory, potential energy, orbital dynamics, and Coulomb's law.", "subtopics_json": '["Gravitational Fields","Electrostatics","Potential Energy"]', "color": "border-blue-200 bg-blue-50/20 hover:border-blue-400 hover:shadow-blue-500/5", "order_index": 4},
    {"topic": "Electricity & Magnetism", "icon": "Zap", "desc": "Current electricity, circuits, magnetic induction, and AC circuits.", "subtopics_json": '["Current Electricity","Magnetic Fields","Electromagnetic Induction"]', "color": "border-blue-200 bg-blue-50/20 hover:border-blue-400 hover:shadow-blue-500/5", "order_index": 5},
    {"topic": "Electronics & Modern Physics", "icon": "Cpu", "desc": "Semiconductors, logic gates, photoelectric effect, and nuclear physics.", "subtopics_json": '["Semiconductors","Photoelectric Effect","Nuclear Physics"]', "color": "border-blue-200 bg-blue-50/20 hover:border-blue-400 hover:shadow-blue-500/5", "order_index": 6},
]

@app.get("/syllabus-units", response_model=List[schemas.SyllabusUnitResponse])
def get_syllabus_units(db: Session = Depends(get_db)):
    units = db.query(models.SyllabusUnit).order_by(models.SyllabusUnit.order_index).all()
    if not units:
        for u in DEFAULT_SYLLABUS:
            db_u = models.SyllabusUnit(**u)
            db.add(db_u)
        db.commit()
        units = db.query(models.SyllabusUnit).order_by(models.SyllabusUnit.order_index).all()
    return units

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

# --- LMS FEATURES ENDPOINTS ---
DEFAULT_LMS_FEATURES = [
    {"icon": "Video", "title": "1080p HD Live & Recorded Classes", "desc": "Access high-definition recorded lectures anytime with chapter markers.", "color": "border-blue-200 bg-blue-50/30 hover:border-blue-400", "order_index": 0},
    {"icon": "FileText", "title": "Past Papers & Model Schemes", "desc": "Comprehensive paper archive with detailed step-by-step marking schemes.", "color": "border-blue-200 bg-blue-50/30 hover:border-blue-400", "order_index": 1},
    {"icon": "BookOpen", "title": "Adaptive Physics Quizzes", "desc": "Practice topic-wise timed quizzes with instant AI feedback.", "color": "border-blue-200 bg-blue-50/30 hover:border-blue-400", "order_index": 2},
    {"icon": "Award", "title": "Rank Tracking & Score Analytics", "desc": "Track performance against island-wide batch rankings.", "color": "border-blue-200 bg-blue-50/30 hover:border-blue-400", "order_index": 3},
]

@app.get("/lms-features", response_model=List[schemas.LmsFeatureResponse])
def get_lms_features(db: Session = Depends(get_db)):
    feats = db.query(models.LmsFeature).order_by(models.LmsFeature.order_index).all()
    if not feats:
        for f in DEFAULT_LMS_FEATURES:
            db_f = models.LmsFeature(**f)
            db.add(db_f)
        db.commit()
        feats = db.query(models.LmsFeature).order_by(models.LmsFeature.order_index).all()
    return feats

@app.post("/lms-features", response_model=schemas.LmsFeatureResponse)
def create_lms_feature(feature: schemas.LmsFeatureCreate, db: Session = Depends(get_db)):
    new_feat = models.LmsFeature(**feature.dict())
    db.add(new_feat)
    db.commit()
    db.refresh(new_feat)
    return new_feat

@app.put("/lms-features/{feature_id}", response_model=schemas.LmsFeatureResponse)
def update_lms_feature(feature_id: int, feature: schemas.LmsFeatureCreate, db: Session = Depends(get_db)):
    db_feat = db.query(models.LmsFeature).filter(models.LmsFeature.id == feature_id).first()
    if not db_feat:
        raise HTTPException(status_code=404, detail="Feature not found")
    for k, v in feature.dict().items():
        setattr(db_feat, k, v)
    db.commit()
    db.refresh(db_feat)
    return db_feat

@app.delete("/lms-features/{feature_id}")
def delete_lms_feature(feature_id: int, db: Session = Depends(get_db)):
    db_feat = db.query(models.LmsFeature).filter(models.LmsFeature.id == feature_id).first()
    if not db_feat:
        raise HTTPException(status_code=404, detail="Feature not found")
    db.delete(db_feat)
    db.commit()
    return {"message": "Deleted successfully"}

# --- HOME BATCHES ENDPOINTS ---
DEFAULT_HOME_BATCHES = [
    {"name": "2025 A/L Physics Batch", "status": "Active", "seats_left": "Open", "schedule": "Weekend Classes & Online", "description": "Comprehensive theory completion and paper practice for 2025 A/L students.", "features_json": '["Full Theory & Revision","Monthly Model Papers","Recorded Video Access"]', "color": "border-[#656CFF] bg-[#656CFF]/10", "enroll_link": "/login", "order_index": 0},
    {"name": "2026 A/L Physics Batch", "status": "Active", "seats_left": "Open", "schedule": "Weekday & Weekend Sessions", "description": "Foundational theory, problem-solving workshops, and continuous assessments.", "features_json": '["Unit-by-Unit Fundamentals","Interactive Quizzes","Recorded Video Access"]', "color": "border-blue-500 bg-blue-500/10", "enroll_link": "/login", "order_index": 1},
    {"name": "2027 A/L Physics Batch", "status": "Active", "seats_left": "Open", "schedule": "Starter Sessions", "description": "Introduction to Advanced Level Physics concepts and analytical thinking.", "features_json": '["Basic Measurement & Vectors","Foundational Practice","Recorded Video Access"]', "color": "border-purple-500 bg-purple-500/10", "enroll_link": "/login", "order_index": 2},
]

@app.get("/home-batches", response_model=List[schemas.HomeBatchResponse])
def get_home_batches(db: Session = Depends(get_db)):
    batches = db.query(models.HomeBatch).order_by(models.HomeBatch.order_index).all()
    if not batches:
        for b in DEFAULT_HOME_BATCHES:
            db_b = models.HomeBatch(**b)
            db.add(db_b)
        db.commit()
        batches = db.query(models.HomeBatch).order_by(models.HomeBatch.order_index).all()
    return batches

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

# --- TESTIMONIALS ENDPOINTS ---
DEFAULT_TESTIMONIALS = [
    {"quote": "Mr. Raakulan made complex mechanics and field theory so clear. My physics grade improved from C to A!", "name": "K. Thivyan", "result": "District Rank 04 (A/L 2024)", "stars": 5, "order_index": 0},
    {"quote": "The paper schemes and structured quizzes in the LMS gave me the confidence to score top marks.", "name": "S. Nitharsan", "result": "District Rank 12 (A/L 2024)", "stars": 5, "order_index": 1},
]

@app.get("/home-testimonials", response_model=List[schemas.TestimonialResponse])
def get_home_testimonials(db: Session = Depends(get_db)):
    tests = db.query(models.Testimonial).order_by(models.Testimonial.order_index).all()
    if not tests:
        for t in DEFAULT_TESTIMONIALS:
            db_t = models.Testimonial(**t)
            db.add(db_t)
        db.commit()
        tests = db.query(models.Testimonial).order_by(models.Testimonial.order_index).all()
    return tests

@app.post("/home-testimonials", response_model=schemas.TestimonialResponse)
def create_home_testimonial(test: schemas.TestimonialCreate, db: Session = Depends(get_db)):
    new_t = models.Testimonial(**test.dict())
    db.add(new_t)
    db.commit()
    db.refresh(new_t)
    return new_t

@app.put("/home-testimonials/{testimonial_id}", response_model=schemas.TestimonialResponse)
def update_home_testimonial(testimonial_id: int, test: schemas.TestimonialCreate, db: Session = Depends(get_db)):
    db_t = db.query(models.Testimonial).filter(models.Testimonial.id == testimonial_id).first()
    if not db_t:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    for k, v in test.dict().items():
        setattr(db_t, k, v)
    db.commit()
    db.refresh(db_t)
    return db_t

@app.delete("/home-testimonials/{testimonial_id}")
def delete_home_testimonial(testimonial_id: int, db: Session = Depends(get_db)):
    db_t = db.query(models.Testimonial).filter(models.Testimonial.id == testimonial_id).first()
    if not db_t:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    db.delete(db_t)
    db.commit()
    return {"message": "Deleted successfully"}

# --- HOME FAQS ENDPOINTS ---
DEFAULT_FAQS = [
    {"question": "How can I join the A/L Physics classes?", "answer": "Click on LEARNING HUB in the top navigation bar or log in with your credentials to access live sessions and materials.", "order_index": 0},
    {"question": "Are both Tamil and English Medium classes available?", "answer": "Yes, classes and study materials are available for both Tamil Medium and English Medium students.", "order_index": 1},
    {"question": "Can I access recorded video lectures if I miss a class?", "answer": "Yes, all lectures are recorded in 1080p HD and available on demand in the Knowledge Hub.", "order_index": 2},
]

@app.get("/home-faqs", response_model=List[schemas.HomeFaqResponse])
def get_home_faqs(db: Session = Depends(get_db)):
    faqs = db.query(models.HomeFaq).order_by(models.HomeFaq.order_index).all()
    if not faqs:
        for f in DEFAULT_FAQS:
            db_f = models.HomeFaq(**f)
            db.add(db_f)
        db.commit()
        faqs = db.query(models.HomeFaq).order_by(models.HomeFaq.order_index).all()
    return faqs

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
    
    # Send account approval email
    subject = "Account Approved - Intelligent Physics"
    body = (
        f"Dear {db_user.full_name},\n\n"
        f"Great news! Your account registration at Intelligent Physics has been approved by the administrator.\n\n"
        f"You can now log in to the Student Portal and start your learning journey using your email and password.\n\n"
        f"Student Portal Login: http://localhost:5173/login\n\n"
        f"Best regards,\n"
        f"Intelligent Physics Team"
    )
    send_simple_email_async(db_user.email, subject, body)
    
    return {"status": "success"}

@app.post("/admin/requests/{user_id}/reject")
def reject_request(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Send account rejection email before deletion
    subject = "Registration Request Declined - Intelligent Physics"
    body = (
        f"Dear {db_user.full_name},\n\n"
        f"Your account registration request at Intelligent Physics has been reviewed and declined by the administrator.\n"
        f"If you believe this was an error, please contact your administrator.\n\n"
        f"Best regards,\n"
        f"Intelligent Physics Team"
    )
    send_simple_email_async(db_user.email, subject, body)
    
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
            image_url=q.image_url,
            option_a_image_url=q.option_a_image_url,
            option_b_image_url=q.option_b_image_url,
            option_c_image_url=q.option_c_image_url,
            option_d_image_url=q.option_d_image_url,
            option_e_image_url=q.option_e_image_url
        )
        db.add(new_q)
    
    db.commit()
    db.refresh(new_quiz)
    
    if new_quiz.is_published:
        notify_students_of_quiz(new_quiz, db)
        
    return new_quiz

@app.put("/quizzes/{quiz_id}", response_model=schemas.QuizResponse)
def update_quiz(quiz_id: int, quiz: schemas.QuizCreate, db: Session = Depends(get_db)):
    db_quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not db_quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
        
    was_published = db_quiz.is_published

    db_quiz.title = quiz.title
    db_quiz.description = quiz.description
    db_quiz.class_name = quiz.class_name
    db_quiz.is_published = quiz.is_published
    db_quiz.scheduled_time = quiz.scheduled_time
    db_quiz.duration_minutes = quiz.duration_minutes
    db_quiz.expiry_mode = quiz.expiry_mode
    db_quiz.expiry_days = quiz.expiry_days
    
    # Reset rankings: delete old quiz results
    db.query(models.QuizResult).filter(models.QuizResult.quiz_id == quiz_id).delete()

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
            image_url=q.image_url,
            option_a_image_url=q.option_a_image_url,
            option_b_image_url=q.option_b_image_url,
            option_c_image_url=q.option_c_image_url,
            option_d_image_url=q.option_d_image_url,
            option_e_image_url=q.option_e_image_url
        )
        db.add(new_q)
        
    db.commit()
    db.refresh(db_quiz)

    if db_quiz.is_published and not was_published:
        notify_students_of_quiz(db_quiz, db)

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
    was_published = quiz.is_published
    quiz.is_published = True
    db.commit()
    db.refresh(quiz)
    
    if not was_published:
        notify_students_of_quiz(quiz, db)
        
    return quiz

@app.get("/quizzes/student/{email}/taken")
def get_taken_quizzes(email: str, db: Session = Depends(get_db)):
    student = db.query(models.User).filter(models.User.email == email).first()
    if not student:
        return []
    results = db.query(models.QuizResult).filter(models.QuizResult.user_id == student.id).all()
    # Return list of quiz IDs already taken
    return [r.quiz_id for r in results]

@app.get("/quizzes/student/{email}/scores")
def get_student_scores(email: str, db: Session = Depends(get_db)):
    student = db.query(models.User).filter(models.User.email == email).first()
    if not student:
        return {}
    results = db.query(models.QuizResult).filter(models.QuizResult.user_id == student.id).all()
    out = {}
    for r in results:
        all_quiz_results = db.query(models.QuizResult).filter(models.QuizResult.quiz_id == r.quiz_id).all()
        higher_scores_count = sum(1 for qr in all_quiz_results if qr.score > r.score)
        rank = higher_scores_count + 1
        out[r.quiz_id] = {
            "score": r.score,
            "total": r.total_questions,
            "rank": rank,
            "total_participants": len(all_quiz_results)
        }
    return out

from fastapi import Request
import uuid

@app.post("/quizzes/{quiz_id}/start")
def start_quiz_session(quiz_id: int, payload: dict, request: Request, db: Session = Depends(get_db)):
    student_email = payload.get("student_email")
    device_fingerprint = payload.get("device_fingerprint")
    client_session_token = payload.get("session_token")
    
    student = db.query(models.User).filter(models.User.email == student_email).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
        
    already_submitted = db.query(models.QuizResult).filter(
        models.QuizResult.quiz_id == quiz_id,
        models.QuizResult.user_id == student.id
    ).first()
    if already_submitted:
        raise HTTPException(status_code=400, detail="You have already taken this quiz.")
        
    active_session = db.query(models.QuizSession).filter(
        models.QuizSession.user_id == student.id,
        models.QuizSession.quiz_id == quiz_id,
        models.QuizSession.submitted_at.is_(None)
    ).first()
    
    ip_addr = request.client.host
    user_agent = request.headers.get("user-agent")
    
    if active_session:
        started_time = datetime.fromisoformat(active_session.started_at)
        elapsed_seconds = (datetime.now() - started_time).total_seconds()
        duration_seconds = (quiz.duration_minutes or 30) * 60
        
        if elapsed_seconds < duration_seconds + 60:
            if client_session_token == active_session.session_token or active_session.device_fingerprint == device_fingerprint:
                remaining_time = max(0, int(duration_seconds - elapsed_seconds))
                shuffled_questions = get_shuffled_and_randomized_questions(quiz.questions, student_email, quiz_id)
                saved_answers = json.loads(active_session.answers_json) if active_session.answers_json else {}
                
                return {
                    "status": "resumed",
                    "session_token": active_session.session_token,
                    "started_at": active_session.started_at,
                    "duration_seconds": remaining_time,
                    "questions": shuffled_questions,
                    "answers": saved_answers
                }
            else:
                raise HTTPException(
                    status_code=403, 
                    detail="Session locked: Active exam session detected in another tab or device. Only one active tab/device is allowed."
                )
        else:
            active_session.submitted_at = datetime.now().isoformat()
            db.commit()
            raise HTTPException(status_code=400, detail="Quiz session has expired.")
            
    session_token = str(uuid.uuid4())
    started_at = datetime.now().isoformat()
    duration_seconds = (quiz.duration_minutes or 30) * 60
    
    new_session = models.QuizSession(
        user_id=student.id,
        quiz_id=quiz_id,
        started_at=started_at,
        session_token=session_token,
        ip_address=ip_addr,
        user_agent=user_agent,
        device_fingerprint=device_fingerprint,
        answers_json="{}"
    )
    db.add(new_session)
    db.commit()
    
    shuffled_questions = get_shuffled_and_randomized_questions(quiz.questions, student_email, quiz_id)
    
    return {
        "status": "started",
        "session_token": session_token,
        "started_at": started_at,
        "duration_seconds": duration_seconds,
        "questions": shuffled_questions,
        "answers": {}
    }

@app.post("/quizzes/{quiz_id}/sync")
def sync_quiz_answers(quiz_id: int, payload: dict, db: Session = Depends(get_db)):
    student_email = payload.get("student_email")
    session_token = payload.get("session_token")
    answers = payload.get("answers", {})
    
    student = db.query(models.User).filter(models.User.email == student_email).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    session = db.query(models.QuizSession).filter(
        models.QuizSession.user_id == student.id,
        models.QuizSession.quiz_id == quiz_id,
        models.QuizSession.submitted_at.is_(None)
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="No active quiz session found.")
        
    if session.session_token != session_token:
        raise HTTPException(status_code=403, detail="Session lock error: Token mismatch.")
        
    session.answers_json = json.dumps(answers)
    db.commit()
    return {"status": "synced"}

@app.get("/quizzes/{quiz_id}/session")
def check_quiz_session(quiz_id: int, email: str, token: str, db: Session = Depends(get_db)):
    student = db.query(models.User).filter(models.User.email == email).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    session = db.query(models.QuizSession).filter(
        models.QuizSession.user_id == student.id,
        models.QuizSession.quiz_id == quiz_id,
        models.QuizSession.submitted_at.is_(None)
    ).first()
    if not session:
        return {"status": "inactive"}
    if session.session_token != token:
        return {"status": "locked"}
    return {"status": "active"}

@app.post("/quizzes/submit", response_model=schemas.QuizResultResponse)
def submit_quiz(submission: schemas.QuizSubmission, db: Session = Depends(get_db)):
    student = db.query(models.User).filter(models.User.email == submission.student_email).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    quiz = db.query(models.Quiz).filter(models.Quiz.id == submission.quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
        
    session = db.query(models.QuizSession).filter(
        models.QuizSession.user_id == student.id,
        models.QuizSession.quiz_id == submission.quiz_id,
        models.QuizSession.submitted_at.is_(None)
    ).first()
    
    if session:
        started_time = datetime.fromisoformat(session.started_at)
        elapsed_seconds = (datetime.now() - started_time).total_seconds()
        duration_seconds = (quiz.duration_minutes or 30) * 60
        
        # We allow submission even if expired but keep a record of elapsed time.
        session.submitted_at = datetime.now().isoformat()
        session.answers_json = json.dumps(submission.answers)
    else:
        # Fallback to creating a new manual submission session
        session = models.QuizSession(
            user_id=student.id,
            quiz_id=submission.quiz_id,
            started_at=datetime.now().isoformat(),
            submitted_at=datetime.now().isoformat(),
            session_token="manual-submit-" + str(uuid.uuid4()),
            answers_json=json.dumps(submission.answers)
        )
        db.add(session)
        
    already_taken = db.query(models.QuizResult).filter(
        models.QuizResult.quiz_id == submission.quiz_id,
        models.QuizResult.user_id == student.id
    ).first()
    if already_taken:
        raise HTTPException(status_code=400, detail="You have already taken this quiz.")
    
    score = 0
    total = len(quiz.questions)
    
    shuffled_questions = get_shuffled_and_randomized_questions(quiz.questions, submission.student_email, quiz.id)
    shuffled_map = {q["id"]: q for q in shuffled_questions}
    
    for q_id, q_data in shuffled_map.items():
        q_id_str = str(q_id)
        if q_id_str in submission.answers:
            if submission.answers[q_id_str] == q_data["correct_option"]:
                score += 1
    
    result = models.QuizResult(
        quiz_id=quiz.id,
        user_id=student.id,
        score=score,
        total_questions=total
    )
    db.add(result)
    db.commit()
    db.refresh(result)

    all_quiz_results = db.query(models.QuizResult).filter(models.QuizResult.quiz_id == quiz.id).all()
    higher_scores_count = sum(1 for qr in all_quiz_results if qr.score > score)
    rank = higher_scores_count + 1

    return {
        "score": score,
        "total": total,
        "percentage": (score / total) * 100 if total > 0 else 0,
        "rank": rank,
        "total_participants": len(all_quiz_results)
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

BAMINI_MAP = {
    "sp": "ளி", "hp": "ரி", "hP": "ரீ", "uP": "ரீ", "u;": "ர்", "h;": "ர்", "H": "ர்",
    "nfs": "கௌ", "Nfh": "கோ", "nfh": "கொ", "fh": "கா", "fp": "கி", "fP": "கீ",
    "F": "கு", "$": "கூ", "nf": "கெ", "Nf": "கே", "if": "கை", "f;": "க்", "f": "க",
    "nqs": "ஙௌ", "Nqh": "ஙோ", "nqh": "ஙொ", "qh": "ஙா", "qp": "ஙி", "qP": "ஙீ",
    "nq": "ஙெ", "Nq": "ஙே", "iq": "ஙை", "q;": "ங்", "q": "ங",
    "nrs": "சௌ", "Nrh": "சோ", "nrh": "சொ", "rh": "சா", "rp": "சி", "rP": "சீ",
    "R": "சு", "#": "சூ", "nr": "செ", "Nr": "சே", "ir": "சை", "r;": "ச்", "r": "ச",
    "n[s": "ஜௌ", "N[h": "ஜோ", "n[h": "ஜொ", "[h": "ஜா", "[p": "ஜி", "[P": "ஜீ",
    "[{": "ஜு", "[_": "ஜூ", "n[": "ஜெ", "N[": "ஜே", "i[": "ஜை", "[;": "ஜ்",
    "nQs": "ஞௌ", "NQh": "ஞோ", "nQh": "ஞொ", "Qh": "ஞா", "Qp": "ஞி", "QP": "ஞீ",
    "nQ": "ஞெ", "NQ": "ஞே", "iQ": "ஞை", "Q;": "ஞ்", "Q": "ஞ",
    "nls": "டௌ", "Nlh": "டோ", "nlh": "டொ", "lp": "டி", "lP": "டீ", "lh": "டா",
    "b": "டி", "B": "டீ", "L": "டு", "^": "டூ", "nl": "டெ", "Nl": "டே", "il": "டை",
    "l;": "ட்", "l": "ட",
    "nzs": "ணௌ", "Nzh": "ணோ", "nzh": "ணொ", "zh": "ணா", "zp": "ணி", "zP": "ணீ",
    "Zh": "ணூ", "Z}": "ணூ", "nz": "ணெ", "Nz": "ணே", "iz": "ணை", "z;": "ண்", "Z": "ணு", "z": "ண",
    "njs": "தௌ", "Njh": "தோ", "njh": "தொ", "jh": "தா", "jp": "தி", "jP": "தீ",
    "Jh": "தூ", "J}": "தூ", "J": "து", "nj": "தெ", "Nj": "தே", "ij": "தை", "j;": "த்", "j": "த",
    "nes": "நௌ", "Neh": "நோ", "neh": "நொ", "eh": "நா", "ep": "நி", "eP": "நீ",
    "E}": "நூ", "Eh": "நூ", "E": "நு", "ne": "நெ", "Ne": "நே", "ie": "நை", "e;": "ந்", "e": "ந",
    "nds": "னௌ", "Ndh": "னோ", "ndh": "னொ", "dh": "னா", "dp": "னி", "dP": "னீ",
    "D}": "னூ", "Dh": "னூ", "D": "னு", "nd": "னெ", "Nd": "னே", "id": "னை", "d;": "ன்", "d": "ன",
    "ngs": "பௌ", "Ngh": "போ", "ngh": "பொ", "gh": "பா", "gp": "பி", "gP": "பீ",
    "G": "பு", "ng": "பெ", "Ng": "பே", "ig": "பை", "g;": "ப்", "g": "ப",
    "nks": "மௌ", "Nkh": "மோ", "nkh": "மொ", "kh": "மா", "kp": "மி", "kP": "மீ",
    "K": "மு", "%": "மூ", "nk": "மெ", "Nk": "மே", "ik": "மை", "k;": "ம்", "k": "ம",
    "nas": "யௌ", "Nah": "யோ", "nah": "யொ", "ah": "யா", "ap": "யி", "aP": "யீ",
    "A": "யு", "A+": "யூ", "na": "யெ", "Na": "யே", "ia": "யை", "a;": "ய்", "a": "ய",
    "nus": "ரௌ", "Nuh": "ரோ", "nuh": "ரொ", "uh": "ரா", "up": "ரி", "U": "ரு",
    "&": "ரூ", "nu": "ரெ", "Nu": "ரே", "iu": "ரை", "u": "ர",
    "nys": "லௌ", "Nyh": "லோ", "nyh": "லொ", "yh": "லா", "yp": "லி", "yP": "லீ",
    "Yh": "லூ", "Y}": "லூ", "Y": "லு", "ny": "லெ", "Ny": "லே", "iy": "லை", "y;": "ல்", "y": "ல",
    "nss": "ளௌ", "Nsh": "ளோ", "nsh": "ளொ", "sh": "ளா", "sP": "ளீ", "Sh": "ளூ",
    "S": "ளு", "ns": "ளெ", "Ns": "ளே", "is": "ளை", "s;": "ள்", "s": "ள",
    "ntt": "வௌ", "Nth": "வோ", "nth": "வொ", "th": "வா", "tp": "வி", "tP": "வீ",
    "nt": "வெ", "Nt": "வே", "it": "வை", "t;": "வ்", "t": "வ",
    "noo": "ழௌ", "Noh": "ழோ", "noh": "ழொ", "oh": "ழா", "op": "ழி", "oP": "ழீ",
    "*": "ழூ", "O": "ழு", "no": "ழெ", "No": "ழே", "io": "ழை", "o;": "ழ்", "o": "ழ",
    "nws": "றௌ", "Nwh": "றோ", "nwh": "றொ", "wh": "றா", "wp": "றி", "wP": "றீ",
    "Wh": "றூ", "W}": "றூ", "W": "று", "nw": "றெ", "Nw": "றே", "iw": "றை", "w;": "ற்", "w": "ற",
    "n``": "ஹௌ", "N`h": "ஹோ", "n`h": "ஹொ", "`h": "ஹா", "`p": "ஹி", "`P": "ஹீ",
    "n`": "ஹெ", "N`": "ஹே", "i`": "ஹை", "`;": "ஹ்", "`": "ஹ",
    "n\\s": "ஷௌ", "N\\h": "ஷோ", "n\\h": "ஷொ", "\\h": "ஷா", "\\p": "ஷி", "\\P": "ஷீ",
    "n\\\\": "ஷெ", "N\\\\": "ஷே", "i\\\\": "ஷை", "\\\\;": "ஷ்", "\\\\": "ஷ",
    "n]s": "ஸௌ", "N]h": "ஸோ", "n]h": "ஸொ", "]h": "ஸா", "]p": "ஸி", "]P": "ஸீ",
    "n]": "ஸெ", "N]": "ஸே", "i]": "ஸை", "];": "ஸ்",
    "m": "அ", "M": "ஆ", "<": "ஈ", "c": "உ", "C": "ஊ", "v": "எ", "V": "ஏ", "I": "ஐ",
    "x": "ஒ", "X": "ஓ", "xs": "ஔ", "/": "ஃ", ",": "இ", "=": "ஸ்ரீ", ">": ",", "T": "வு",
    "வு+": "வூ", "பு+": "பூ", "யு+": "யூ", "சு+": "சூ", "+": "ooh", ";": "்", "@": ";",
    "¿f": "கை", "¿q": "ஙை", "¿r": "சை", "¿[": "ஜை", "¿Q": "ஞை", "¿l": "டை", "¿z": "ணை",
    "¿j": "தை", "¿e": "நை", "¿d": "னை", "¿g": "பை", "¿k": "மை", "¿a": "யை", "¿u": "ரை",
    "¿y": "லை", "¿s": "ளை", "¿t": "வை", "¿o": "ழை", "¿w": "றை", "¿`": "ஹை", "¿\\": "ஷை",
    "¿]": "ஸை", "¿": "ை", "≈": "ௐ", "xk;": "உம்", "[": "ஐ"
}

B_REPLACEMENT = sorted(BAMINI_MAP.items(), key=lambda x: len(x[0]), reverse=True)

def convert_bamini_to_unicode(text: str) -> str:
    unicode_text = text
    for p, r in B_REPLACEMENT:
        unicode_text = unicode_text.replace(p, r)
    return unicode_text

def is_bamini(text: str) -> bool:
    import re
    return bool(re.search(r'MdJ|Nthy;w;W|,yj;jpud;|[jrlztngkahyvwdqcs];', text))

def fix_tamil_unicode_reordering(text: str) -> str:
    import re
    # Swap visual vowel signs (ெ, ே, ை) that precede a consonant,
    # ensuring they are NOT already preceded by a consonant (using negative lookbehind)
    fixed = re.sub(r'(?<![\u0B95-\u0BB9])([\u0BC6\u0BC7\u0BC8])([\u0B95-\u0BB9])', r'\2\1', text)
    return fixed

def translate_bamini_text(text: str) -> str:
    import re
    # Convert Celsius degree typos (e.g. 400C -> 40°C, 100C -> 10°C)
    text = re.sub(r'(\d+)0C\b', r'\1°C', text)
    if is_bamini(text):
        def replace_token(match):
            token = match.group(0)
            if len(token) <= 1:
                if re.match(r'^[a-zA-Z]$', token):
                    return token
                return convert_bamini_to_unicode(token)
            if re.match(r'^\[[a-zA-Z]\]$', token):
                return token
            if re.match(r'^(GMm|GM|eV|N|G|M|m|r|r\^2|GMm\/r|GMm\/r\^2|GM\/r)$', token, re.IGNORECASE):
                return token
            if re.match(r'^[Mmr],?[Mmr]?$', token):
                return token
            if '/' in token or '^' in token:
                return token
            
            # Keep a single English letter variable followed by a number (e.g., r1, v2)
            if re.match(r'^[a-zA-Z]\d+$', token):
                return token

            # Split variable name followed by number if merged with suffix (e.g., r1ck; -> r1 + ck;)
            var_num_match = re.match(r'^([a-zA-Z]\d+)([a-zA-Z;,<>]+)$', token)
            if var_num_match:
                return var_num_match.group(1) + convert_bamini_to_unicode(var_num_match.group(2))

            # Keep numbers followed by a single English letter variable (e.g., 2L, 2d, 400C)
            if re.match(r'^\d+[a-zA-Z]$', token):
                return token

            # Split variable name preceded by number if merged with suffix (e.g., 2Lck; -> 2L + ck;)
            num_var_match = re.match(r'^(\d+[a-zA-Z])([a-zA-Z;,<>]+)$', token)
            if num_var_match:
                return num_var_match.group(1) + convert_bamini_to_unicode(num_var_match.group(2))

            # Split variable name if merged with suffix (e.g., Yxk; -> Y + xk;)
            var_match = re.match(r'^([XY])([a-zA-Z;,<>]+)$', token)
            if var_match:
                return var_match.group(1) + convert_bamini_to_unicode(var_match.group(2))
                
            return convert_bamini_to_unicode(token)
            
        text = re.sub(r'[a-zA-Z;,<>\\^\\/\\*\\-\\+0-9\[\]$#%&_\{\}¿≈]+', replace_token, text)
    return fix_tamil_unicode_reordering(text)

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
        "Structure them exactly matching the JSON response format requested. Ensure all questions have exactly 5 options (options A, B, C, D, and E) "
        "and a valid correct_option (A, B, C, D, or E) fully populated. No option or correct_option field should be left blank or empty. "
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


# General System Settings Management Endpoints
@app.get("/settings/{key}")
def get_setting(key: str, db: Session = Depends(get_db)):
    setting = db.query(models.SystemSetting).filter(models.SystemSetting.key == key).first()
    if not setting:
        return {"key": key, "value": None}
    return {"key": key, "value": setting.value}



@app.post("/settings/{key}")
def set_setting(key: str, payload: dict, db: Session = Depends(get_db)):
    setting = db.query(models.SystemSetting).filter(models.SystemSetting.key == key).first()
    if not setting:
        setting = models.SystemSetting(key=key, value=payload.get("value"))
        db.add(setting)
    else:
        setting.value = payload.get("value")
    db.commit()
    return {"key": key, "value": setting.value}


# ── Quiz Violation / Proctoring Alert ──────────────────────────────────────────

import threading as _threading
from datetime import datetime as _datetime

@app.post("/quizzes/violation")
def report_quiz_violation(payload: dict, db: Session = Depends(get_db)):
    """
    Called by the frontend whenever a student tries to leave the exam
    (tab switch, minimize, close, back-button etc.).
    Fires an instant alert email to all admin accounts.
    """
    student_email  = payload.get("student_email", "Unknown")
    student_name   = payload.get("student_name",  "Unknown Student")
    quiz_title     = payload.get("quiz_title",    "Unknown Quiz")
    violation_type = payload.get("violation_type","Unknown")
    violation_count = payload.get("violation_count", 1)
    timestamp_str   = payload.get("timestamp", _datetime.now().isoformat())
    details        = payload.get("details", None)
    quiz_id        = payload.get("quiz_id", None)

    # Resolve student and quiz ID
    student = db.query(models.User).filter(models.User.email == student_email).first()
    
    if not quiz_id and quiz_title != "Unknown Quiz":
        qz = db.query(models.Quiz).filter(models.Quiz.title == quiz_title).first()
        if qz:
            quiz_id = qz.id

    if student and quiz_id:
        new_violation = models.QuizViolation(
            user_id=student.id,
            quiz_id=quiz_id,
            violation_type=violation_type,
            violation_count=violation_count,
            details=details,
            timestamp=timestamp_str
        )
        db.add(new_violation)
        db.commit()

    # Friendly label
    labels = {
        "tab_switch":    "🔀 Tab / Window Switch",
        "minimize":      "🔽 Window Minimized / Hidden",
        "beforeunload":  "🚪 Attempted to Close / Leave Page",
        "back_button":   "⬅️ Browser Back Button Pressed",
    }
    label = labels.get(violation_type, violation_type)

    try:
        dt = _datetime.fromisoformat(timestamp_str.replace("Z",""))
        friendly_time = dt.strftime("%d %b %Y, %I:%M:%S %p")
    except Exception:
        friendly_time = timestamp_str

    # Find admin emails
    admins = db.query(models.User).filter(models.User.role == "admin").all()
    admin_emails = [a.email for a in admins if a.email]
    if not admin_emails:
        admin_emails = [SMTP_USERNAME]   # fallback: send to the SMTP account itself

    subject = f"⚠️ Exam Violation Alert — {student_name}"

    severity_color = "#EF4444" if violation_count >= 3 else "#F59E0B"
    severity_label = "HIGH RISK" if violation_count >= 3 else "WARNING"

    html = f"""
    <div style="font-family:'Segoe UI',sans-serif;max-width:620px;margin:auto;background:#06070E;border:2px solid #1E2130;border-radius:16px;overflow:hidden;">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#1a1b2e,#0f1020);padding:28px 32px;border-bottom:1px solid #1E2130;">
        <table width="100%"><tr>
          <td>
            <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#64748B;">Intelligent Physics — Proctoring System</p>
            <h1 style="margin:8px 0 0;font-size:22px;font-weight:900;color:#ffffff;">Exam Violation Detected</h1>
          </td>
          <td align="right">
            <span style="display:inline-block;padding:6px 14px;border-radius:8px;font-size:11px;font-weight:900;letter-spacing:2px;text-transform:uppercase;background:{severity_color}20;color:{severity_color};border:1px solid {severity_color}50;">{severity_label}</span>
          </td>
        </tr></table>
      </div>

      <!-- Body -->
      <div style="padding:32px;background:#0D0E18;">

        <!-- Student info -->
        <div style="background:#0A0B14;border:1px solid #1E2130;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#475569;">Student</p>
          <p style="margin:0;font-size:20px;font-weight:900;color:#ffffff;">{student_name}</p>
          <p style="margin:4px 0 0;font-size:13px;color:#64748B;">{student_email}</p>
        </div>

        <!-- Quiz info -->
        <div style="background:#0A0B14;border:1px solid #1E2130;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#475569;">Exam</p>
          <p style="margin:0;font-size:16px;font-weight:800;color:#A5B4FC;">{quiz_title}</p>
        </div>

        <!-- Violation details -->
        <table width="100%" style="border-collapse:collapse;margin-bottom:24px;">
          <tr>
            <td style="padding:14px 18px;background:#0A0B14;border:1px solid #1E2130;border-radius:10px 10px 0 0;">
              <p style="margin:0;font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#475569;">Violation Type</p>
              <p style="margin:4px 0 0;font-size:15px;font-weight:800;color:{severity_color};">{label}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 18px;background:#0A0B14;border:1px solid #1E2130;border-left:1px solid #1E2130;border-right:1px solid #1E2130;">
              <p style="margin:0;font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#475569;">Total Violations (This Session)</p>
              <p style="margin:4px 0 0;font-size:24px;font-weight:900;color:{severity_color};">{violation_count}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 18px;background:#0A0B14;border:1px solid #1E2130;border-radius:0 0 10px 10px;">
              <p style="margin:0;font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#475569;">Timestamp</p>
              <p style="margin:4px 0 0;font-size:14px;font-weight:700;color:#94A3B8;">{friendly_time}</p>
            </td>
          </tr>
        </table>

        {'<div style="padding:14px 18px;background:#EF444412;border:1px solid #EF444430;border-radius:10px;margin-bottom:24px;"><p style="margin:0;font-size:13px;font-weight:700;color:#FCA5A5;">⚠️ This student has triggered multiple violations. Immediate review recommended.</p></div>' if violation_count >= 3 else ''}

      </div>

      <!-- Footer -->
      <div style="padding:16px 32px;background:#06070E;border-top:1px solid #1E2130;text-align:center;">
        <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#334155;">Intelligent Physics — Automated Proctoring Alert · {_datetime.now().year}</p>
      </div>
    </div>
    """

    def _send():
        send_custom_html_email(admin_emails, subject, html)

    _threading.Thread(target=_send, daemon=True).start()

    print(f"[PROCTORING] Violation '{violation_type}' by {student_name} ({student_email}) — count: {violation_count}")
    return {"status": "ok"}
