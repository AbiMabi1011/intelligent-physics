from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    role = Column(String, default="student") # 'admin' or 'student'
    full_name = Column(String, nullable=True)
    class_name = Column(String, nullable=True)
    approval_status = Column(String, default="approved") # 'pending', 'approved', 'rejected'

    items = relationship("Item", back_populates="owner")
    quiz_results = relationship("QuizResult", back_populates="student")

class Quiz(Base):
    __tablename__ = "quizzes"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    class_name = Column(String, nullable=True)
    is_published = Column(Boolean, default=False)
    scheduled_time = Column(String, nullable=True)
    duration_minutes = Column(Integer, default=30)
    expiry_mode = Column(String, default="end_time") # 'end_time', 'one_day', 'custom_days', 'never'
    expiry_days = Column(Integer, default=1)
    
    questions = relationship("Question", back_populates="quiz", cascade="all, delete-orphan")
    results = relationship("QuizResult", back_populates="quiz")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    text = Column(String)
    option_a = Column(String)
    option_b = Column(String)
    option_c = Column(String)
    option_d = Column(String)
    option_e = Column(String, nullable=True)
    correct_option = Column(String, nullable=True)  # 'A', 'B', 'C', 'D', 'E', or None/blank (ungraded)
    image_url = Column(String, nullable=True)  # optional graph/diagram image
    option_a_image_url = Column(String, nullable=True)
    option_b_image_url = Column(String, nullable=True)
    option_c_image_url = Column(String, nullable=True)
    option_d_image_url = Column(String, nullable=True)
    option_e_image_url = Column(String, nullable=True)

    quiz = relationship("Quiz", back_populates="questions")

class QuizResult(Base):
    __tablename__ = "quiz_results"
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    score = Column(Integer)
    total_questions = Column(Integer)
    created_at = Column(String, default=lambda: "2026-02-24") # Simple date
    
    quiz = relationship("Quiz", back_populates="results")
    student = relationship("User", back_populates="quiz_results")

class Mark(Base):
    __tablename__ = "marks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String, nullable=True)
    class_name = Column(String, nullable=True)
    file_url = Column(String, nullable=True)
    subject = Column(String)
    term = Column(String) # Mid-term, Final
    score = Column(Integer, nullable=True)
    max_score = Column(Integer, default=100, nullable=True)
    student = relationship("User")

class StudyPaper(Base):
    __tablename__ = "study_papers"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    subject = Column(String)
    class_name = Column(String)
    paper_type = Column(String, default="Other")
    file_url = Column(String)
    scheme_url = Column(String, nullable=True)
    created_at = Column(String, default=lambda: "2026-02-24")
    visibility = Column(String, default="both")

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="items")

class Batch(Base):
    __tablename__ = "batches"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(String)
    image_url = Column(String, nullable=True)
    class_name = Column(String) # Batches
    created_at = Column(String)
    visibility = Column(String, default="both")

class ClassRecording(Base):
    __tablename__ = "class_recordings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    video_url = Column(String)
    class_name = Column(String)
    subject = Column(String, default="Physics")
    recorded_at = Column(String)
    visibility = Column(String, default="both")

class Slider(Base):
    __tablename__ = "sliders"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True)
    subtitle = Column(String, nullable=True)
    image_url = Column(String)
    button_text = Column(String, nullable=True)
    button_link = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    order_index = Column(Integer, default=0)

class HomeAd(Base):
    __tablename__ = "home_ads"

    id = Column(Integer, primary_key=True, index=True)
    badge = Column(String, nullable=True)          # e.g. "🔥 Now Open"
    title = Column(String)                          # headline
    description = Column(String, nullable=True)    # body text
    cta_text = Column(String, nullable=True)       # button label
    cta_link = Column(String, nullable=True)       # button URL / route
    image_url = Column(String, nullable=True)      # optional image
    position = Column(String, default="left")      # 'left' | 'right'
    accent = Column(String, default="#6366f1")     # hex accent colour
    gradient = Column(String, default="linear-gradient(145deg,#0f0b2e,#1a116b)")
    is_active = Column(Boolean, default=True)
    order_index = Column(Integer, default=0)

class HomeStat(Base):
    __tablename__ = "home_stats"

    id = Column(Integer, primary_key=True, index=True)
    value = Column(String)                         # e.g. "1,200+"
    label = Column(String)                         # e.g. "Students Enrolled"
    icon = Column(String)                          # e.g. "🎓"
    color = Column(String, default="#3b82f6")      # hex text color
    bg = Column(String, default="rgba(59,130,246,.12)") # hex/rgba background
    is_active = Column(Boolean, default=True)
    order_index = Column(Integer, default=0)

class TeacherProfile(Base):
    __tablename__ = "teacher_profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    title = Column(String, default="Lead Lecturer")
    credentials = Column(String)
    bio_text = Column(String)
    image_url = Column(String, nullable=True)
    mediums = Column(String)

class SyllabusUnit(Base):
    __tablename__ = "syllabus_units"

    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String, index=True)
    icon = Column(String)
    desc = Column(String)
    subtopics_json = Column(String) # JSON string list of subtopics
    color = Column(String)
    order_index = Column(Integer, default=0)

class LmsFeature(Base):
    __tablename__ = "lms_features"

    id = Column(Integer, primary_key=True, index=True)
    icon = Column(String)
    title = Column(String)
    desc = Column(String)
    color = Column(String)
    order_index = Column(Integer, default=0)

class HomeBatch(Base):
    __tablename__ = "home_batches"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    status = Column(String)
    seats_left = Column(String)
    schedule = Column(String)
    description = Column(String)
    features_json = Column(String) # JSON string list of inclusion items
    color = Column(String)
    enroll_link = Column(String, default="/login")
    order_index = Column(Integer, default=0)

class Testimonial(Base):
    __tablename__ = "testimonials"

    id = Column(Integer, primary_key=True, index=True)
    quote = Column(String)
    name = Column(String)
    result = Column(String)
    stars = Column(Integer, default=5)
    order_index = Column(Integer, default=0)

class HomeFaq(Base):
    __tablename__ = "home_faqs"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String)
    answer = Column(String)
    order_index = Column(Integer, default=0)
