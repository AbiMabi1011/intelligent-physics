from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    is_active = Column(Boolean, default=True)
    role = Column(String(50), default="student") # 'admin' or 'student'
    full_name = Column(String(255), nullable=True)
    class_name = Column(String(100), nullable=True)
    approval_status = Column(String(50), default="approved") # 'pending', 'approved', 'rejected'
    permissions = Column(String(255), nullable=True) # Comma-separated list for sub-admins
    whatsapp_number = Column(String(50), nullable=True)

    items = relationship("Item", back_populates="owner")
    quiz_results = relationship("QuizResult", back_populates="student")

class Quiz(Base):
    __tablename__ = "quizzes"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    class_name = Column(String(100), nullable=True)
    is_published = Column(Boolean, default=False)
    scheduled_time = Column(String(100), nullable=True)
    duration_minutes = Column(Integer, default=30)
    expiry_mode = Column(String(50), default="end_time") # 'end_time', 'one_day', 'custom_days', 'never'
    expiry_days = Column(Integer, default=1)
    
    questions = relationship("Question", back_populates="quiz", cascade="all, delete-orphan")
    results = relationship("QuizResult", back_populates="quiz")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    text = Column(Text)
    option_a = Column(Text)
    option_b = Column(Text)
    option_c = Column(Text)
    option_d = Column(Text)
    option_e = Column(Text, nullable=True)
    correct_option = Column(String(10), nullable=True)  # 'A', 'B', 'C', 'D', 'E', or None/blank (ungraded)
    image_url = Column(String(255), nullable=True)  # optional graph/diagram image
    option_a_image_url = Column(String(255), nullable=True)
    option_b_image_url = Column(String(255), nullable=True)
    option_c_image_url = Column(String(255), nullable=True)
    option_d_image_url = Column(String(255), nullable=True)
    option_e_image_url = Column(String(255), nullable=True)

    quiz = relationship("Quiz", back_populates="questions")

class QuizResult(Base):
    __tablename__ = "quiz_results"
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    score = Column(Integer)
    total_questions = Column(Integer)
    created_at = Column(String(50), default=lambda: "2026-02-24") # Simple date
    
    quiz = relationship("Quiz", back_populates="results")
    student = relationship("User", back_populates="quiz_results")

class QuizSession(Base):
    __tablename__ = "quiz_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    started_at = Column(String(100))  # ISO timestamp on server
    submitted_at = Column(String(100), nullable=True)
    session_token = Column(String(255), unique=True, index=True)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(Text, nullable=True)
    device_fingerprint = Column(Text, nullable=True)
    answers_json = Column(Text, nullable=True)

    user = relationship("User")
    quiz = relationship("Quiz")

class QuizViolation(Base):
    __tablename__ = "quiz_violations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    violation_type = Column(String(100))
    violation_count = Column(Integer)
    details = Column(Text, nullable=True)
    timestamp = Column(String(100))

    user = relationship("User")
    quiz = relationship("Quiz")


class Mark(Base):
    __tablename__ = "marks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(255), nullable=True)
    class_name = Column(String(100), nullable=True)
    file_url = Column(String(255), nullable=True)
    subject = Column(String(100))
    term = Column(String(100)) # Mid-term, Final
    score = Column(Integer, nullable=True)
    max_score = Column(Integer, default=100, nullable=True)
    student = relationship("User")

class StudyPaper(Base):
    __tablename__ = "study_papers"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    subject = Column(String(100))
    class_name = Column(String(100))
    paper_type = Column(String(100), default="Other")
    file_url = Column(String(255))
    scheme_url = Column(String(255), nullable=True)
    created_at = Column(String(50), default=lambda: "2026-02-24")
    visibility = Column(String(50), default="both")

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True)
    description = Column(String(255), index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="items")

class Batch(Base):
    __tablename__ = "batches"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True)
    description = Column(Text, nullable=True)

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True)
    content = Column(Text)
    image_url = Column(String(255), nullable=True)
    class_name = Column(String(100)) # Batches
    created_at = Column(String(100))
    visibility = Column(String(50), default="both")

class ClassRecording(Base):
    __tablename__ = "class_recordings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    video_url = Column(String(255))
    class_name = Column(String(100))
    subject = Column(String(100), default="Physics")
    recorded_at = Column(String(100))
    visibility = Column(String(50), default="both")

class Slider(Base):
    __tablename__ = "sliders"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=True)
    subtitle = Column(String(255), nullable=True)
    image_url = Column(String(255))
    button_text = Column(String(100), nullable=True)
    button_link = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    order_index = Column(Integer, default=0)

class HomeAd(Base):
    __tablename__ = "home_ads"

    id = Column(Integer, primary_key=True, index=True)
    badge = Column(String(100), nullable=True)          # e.g. "🔥 Now Open"
    title = Column(String(255))                          # headline
    description = Column(Text, nullable=True)    # body text
    cta_text = Column(String(100), nullable=True)       # button label
    cta_link = Column(String(255), nullable=True)       # button URL / route
    image_url = Column(String(255), nullable=True)      # optional image
    position = Column(String(50), default="left")      # 'left' | 'right'
    accent = Column(String(255), default="#6366f1")     # hex accent colour
    gradient = Column(String(255), default="linear-gradient(145deg,#0f0b2e,#1a116b)")
    is_active = Column(Boolean, default=True)
    order_index = Column(Integer, default=0)

class HomeStat(Base):
    __tablename__ = "home_stats"

    id = Column(Integer, primary_key=True, index=True)
    value = Column(String(50))                         # e.g. "1,200+"
    label = Column(String(100))                         # e.g. "Students Enrolled"
    icon = Column(String(50))                          # e.g. "🎓"
    color = Column(String(255), default="#3b82f6")      # hex text color
    bg = Column(String(255), default="rgba(59,130,246,.12)") # hex/rgba background
    is_active = Column(Boolean, default=True)
    order_index = Column(Integer, default=0)

class TeacherProfile(Base):
    __tablename__ = "teacher_profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    title = Column(String(255), default="Lead Lecturer")
    credentials = Column(String(255))
    bio_text = Column(Text)
    image_url = Column(String(255), nullable=True)
    mediums = Column(String(255))

class SyllabusUnit(Base):
    __tablename__ = "syllabus_units"

    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String(255), index=True)
    icon = Column(String(100))
    desc = Column(Text)
    subtopics_json = Column(Text) # JSON string list of subtopics
    color = Column(String(255))
    order_index = Column(Integer, default=0)

class LmsFeature(Base):
    __tablename__ = "lms_features"

    id = Column(Integer, primary_key=True, index=True)
    icon = Column(String(100))
    title = Column(String(255))
    desc = Column(Text)
    color = Column(String(255))
    order_index = Column(Integer, default=0)

class HomeBatch(Base):
    __tablename__ = "home_batches"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    status = Column(String(100))
    seats_left = Column(String(50))
    schedule = Column(String(255))
    description = Column(Text)
    features_json = Column(Text) # JSON string list of inclusion items
    color = Column(String(255))
    enroll_link = Column(String(255), default="/login")
    order_index = Column(Integer, default=0)

class Testimonial(Base):
    __tablename__ = "testimonials"

    id = Column(Integer, primary_key=True, index=True)
    quote = Column(Text)
    name = Column(String(255))
    result = Column(String(255))
    stars = Column(Integer, default=5)
    order_index = Column(Integer, default=0)

class HomeFaq(Base):
    __tablename__ = "home_faqs"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text)
    answer = Column(Text)
    order_index = Column(Integer, default=0)

class SystemSetting(Base):
    __tablename__ = "system_settings"

    key = Column(String(255), primary_key=True, index=True)
    value = Column(Text, nullable=True)
