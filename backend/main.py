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
        "full_name": db_user.full_name
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

# --- PAPERS ENDPOINTS ---

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

@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    student_count = db.query(models.User).filter(models.User.email != "raakul").count()
    quiz_count = db.query(models.Quiz).count()
    result_count = db.query(models.QuizResult).count()
    paper_count = db.query(models.StudyPaper).count()
    
    return {
        "students": student_count,
        "quizzes": quiz_count,
        "submissions": result_count,
        "papers": paper_count
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
    users = db.query(models.User).filter(models.User.email != "raakul").all() 
    # Note: Our schema logic might need adjustment if UserResponse isn't defined
    return users

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
        duration_minutes=quiz.duration_minutes
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
            correct_option=q.correct_option
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
            correct_option=q.correct_option
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
