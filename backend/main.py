from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from typing import List

import models
import schemas
from database import engine, get_db

# Create Tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS (Allow Frontend to talk to Backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow ALL origins for dev convenience
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password Hashing
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

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
    new_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/auth/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.username).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    return {"status": "success", "user_id": db_user.id, "email": db_user.email}

# --- EMAIL CONFIGURATION ---
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import os
from fastapi import BackgroundTasks

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
    
    # Generate Link (Assuming frontend runs on 5173 or 5174 - adjust if needed)
    invite_link = f"http://127.0.0.1:5173/set-password?email={user.email}"
    
    # Send Email in Background
    background_tasks.add_task(send_invite_email, user.email, invite_link)
    
    return new_user

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

@app.delete("/users/{email}")
def delete_user(email: str, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    return {"status": "deleted", "email": email}

@app.get("/users", response_model=List[schemas.UserResponse]) # Create schema for response if not exists or use User
def get_users(db: Session = Depends(get_db)):
    users = db.query(models.User).filter(models.User.email != "raakul").all() 
    # Note: Our schema logic might need adjustment if UserResponse isn't defined
    return users

# --- QUIZ ENDPOINTS ---

@app.post("/quizzes", response_model=schemas.QuizResponse)
def create_quiz(quiz: schemas.QuizCreate, db: Session = Depends(get_db)):
    # Create Quiz
    new_quiz = models.Quiz(title=quiz.title, description=quiz.description)
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
            correct_option=q.correct_option
        )
        db.add(new_q)
    
    db.commit()
    db.refresh(new_quiz)
    return new_quiz

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

@app.post("/quizzes/submit", response_model=schemas.QuizResultResponse)
def submit_quiz(submission: schemas.QuizSubmission, db: Session = Depends(get_db)):
    # Find Student (Optional: require auth)
    student = db.query(models.User).filter(models.User.email == submission.student_email).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    quiz = db.query(models.Quiz).filter(models.Quiz.id == submission.quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
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
