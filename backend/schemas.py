from pydantic import BaseModel
from typing import List, Optional

class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    class_name: Optional[str] = None
    whatsapp_number: Optional[str] = None

class UserCreate(UserBase):
    password: str

class BulkInviteRequest(BaseModel):
    users: List[UserBase]

class UserResponse(UserBase):
    id: int
    is_active: bool
    role: Optional[str] = "student"
    full_name: Optional[str] = None
    class_name: Optional[str] = None
    approval_status: Optional[str] = "approved"
    permissions: Optional[str] = None
    whatsapp_number: Optional[str] = None

    class Config:
        from_attributes = True

class SubAdminCreate(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None
    permissions: Optional[str] = None

class SubAdminUpdate(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    full_name: Optional[str] = None
    permissions: Optional[str] = None

class User(UserResponse):
    pass

class UserLogin(BaseModel):
    username: str 
    password: str

class PasswordSet(BaseModel):
    email: str
    password: str

class AdminCredentialsUpdate(BaseModel):
    current_email: str
    current_password: str
    new_email: str
    new_password: Optional[str] = None

# --- QUIZ SCHEMAS ---

class QuestionBase(BaseModel):
    text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    option_e: Optional[str] = None
    correct_option: str # 'A', 'B', 'C', 'D', 'E'
    image_url: Optional[str] = None
    option_a_image_url: Optional[str] = None
    option_b_image_url: Optional[str] = None
    option_c_image_url: Optional[str] = None
    option_d_image_url: Optional[str] = None
    option_e_image_url: Optional[str] = None

class QuestionCreate(QuestionBase):
    pass

class QuestionResponse(QuestionBase):
    id: int
    quiz_id: int

    class Config:
        from_attributes = True

class QuizBase(BaseModel):
    title: str
    description: Optional[str] = None
    class_name: Optional[str] = None
    is_published: bool = False
    scheduled_time: Optional[str] = None
    duration_minutes: Optional[int] = 30
    expiry_mode: Optional[str] = "end_time"
    expiry_days: Optional[int] = 1

class AnnouncementBase(BaseModel):
    title: str
    content: str
    image_url: Optional[str] = None
    class_name: str
    created_at: str
    send_email: Optional[bool] = False
    visibility: Optional[str] = "both"

class AnnouncementCreate(AnnouncementBase):
    pass

class AnnouncementResponse(AnnouncementBase):
    id: int

    class Config:
        from_attributes = True

class QuizCreate(QuizBase):
    questions: List[QuestionCreate]

class QuizResponse(QuizBase):
    id: int
    questions: List[QuestionResponse] = []

    class Config:
        from_attributes = True

class QuizSubmission(BaseModel):
    quiz_id: int
    student_email: str
    answers: dict
    session_token: Optional[str] = None

class QuizResultResponse(BaseModel):
    score: int
    total: int
    percentage: float
    rank: Optional[int] = None
    total_participants: Optional[int] = None

class QuizViolationResponse(BaseModel):
    id: int
    user_id: int
    quiz_id: int
    violation_type: str
    violation_count: int
    details: Optional[str] = None
    timestamp: str

    class Config:
        from_attributes = True

class QuizSessionResponse(BaseModel):
    id: int
    user_id: int
    quiz_id: int
    started_at: str
    submitted_at: Optional[str] = None
    session_token: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    device_fingerprint: Optional[str] = None

    class Config:
        from_attributes = True

class FullQuizResult(BaseModel):
    id: int
    quiz_id: int
    user_id: int
    score: int
    total_questions: int
    created_at: str
    student: UserBase
    quiz: QuizBase
    session: Optional[QuizSessionResponse] = None
    violations: List[QuizViolationResponse] = []

    class Config:
        from_attributes = True

class MarkBase(BaseModel):
    title: Optional[str] = None
    class_name: Optional[str] = None
    file_url: Optional[str] = None
    user_id: Optional[int] = None
    subject: str
    term: str
    score: Optional[int] = None
    max_score: Optional[int] = 100

class MarkCreate(MarkBase):
    pass

class MarkResponse(MarkBase):
    id: int
    student: Optional[UserBase] = None

    class Config:
        from_attributes = True

class BulkMarkUploadItem(BaseModel):
    email: str
    subject: str
    term: str
    score: int
    max_score: int

class BulkMarkUploadRequest(BaseModel):
    marks: List[BulkMarkUploadItem]

class PaperBase(BaseModel):
    title: str
    subject: str
    class_name: str
    paper_type: str = "Other"
    file_url: str
    scheme_url: Optional[str] = None
    visibility: Optional[str] = "both"

class PaperCreate(PaperBase):
    pass

class PaperResponse(PaperBase):
    id: int
    created_at: str

    class Config:
        from_attributes = True

class BatchBase(BaseModel):
    name: str
    description: Optional[str] = None

class BatchCreate(BatchBase):
    pass

class BatchResponse(BatchBase):
    id: int

    class Config:
        from_attributes = True

class ClassRecordingBase(BaseModel):
    title: str
    description: Optional[str] = None
    video_url: str
    class_name: str
    subject: Optional[str] = "Physics"
    recorded_at: str
    visibility: Optional[str] = "both"

class ClassRecordingCreate(ClassRecordingBase):
    pass

class ClassRecordingResponse(ClassRecordingBase):
    id: int

    class Config:
        from_attributes = True

class SliderBase(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    image_url: str
    button_text: Optional[str] = None
    button_link: Optional[str] = None
    is_active: Optional[bool] = True
    order_index: Optional[int] = 0

class SliderCreate(SliderBase):
    pass

class SliderResponse(SliderBase):
    id: int

    class Config:
        from_attributes = True

# --- HOME ADS SCHEMAS ---

class HomeAdBase(BaseModel):
    badge: Optional[str] = None
    title: str
    description: Optional[str] = None
    cta_text: Optional[str] = None
    cta_link: Optional[str] = None
    image_url: Optional[str] = None
    position: Optional[str] = "left"
    accent: Optional[str] = "#6366f1"
    gradient: Optional[str] = "linear-gradient(145deg,#0f0b2e,#1a116b)"
    is_active: Optional[bool] = True
    order_index: Optional[int] = 0

class HomeAdCreate(HomeAdBase):
    pass

class HomeAdResponse(HomeAdBase):
    id: int

    class Config:
        from_attributes = True

# --- HOME STATS SCHEMAS ---

class HomeStatBase(BaseModel):
    value: str
    label: str
    icon: str
    color: Optional[str] = "#3b82f6"
    bg: Optional[str] = "rgba(59,130,246,.12)"
    is_active: Optional[bool] = True
    order_index: Optional[int] = 0

class HomeStatCreate(HomeStatBase):
    pass

class HomeStatResponse(HomeStatBase):
    id: int

    class Config:
        from_attributes = True
# --- DASHBOARD SCHEMAS ---

class ActivityItem(BaseModel):
    title: str
    desc: str
    time: str
    color: str

class DashboardStats(BaseModel):
    students: int
    quizzes: int
    submissions: int
    papers: int
    recent_activity: List[ActivityItem]
    # No performance_data for now to keep it simple, or add a List[dict]
    performance_data: List[dict]

# --- TEACHER PROFILE SCHEMAS ---
class TeacherProfileBase(BaseModel):
    name: str
    title: Optional[str] = "Lead Lecturer"
    credentials: str
    bio_text: str
    image_url: Optional[str] = None
    mediums: str

class TeacherProfileCreate(TeacherProfileBase):
    pass

class TeacherProfileResponse(TeacherProfileBase):
    id: int
    class Config:
        from_attributes = True

# --- SYLLABUS UNIT SCHEMAS ---
class SyllabusUnitBase(BaseModel):
    topic: str
    icon: str
    desc: str
    subtopics_json: str
    color: str
    order_index: Optional[int] = 0

class SyllabusUnitCreate(SyllabusUnitBase):
    pass

class SyllabusUnitResponse(SyllabusUnitBase):
    id: int
    class Config:
        from_attributes = True

# --- LMS FEATURE SCHEMAS ---
class LmsFeatureBase(BaseModel):
    icon: str
    title: str
    desc: str
    color: str
    order_index: Optional[int] = 0

class LmsFeatureCreate(LmsFeatureBase):
    pass

class LmsFeatureResponse(LmsFeatureBase):
    id: int
    class Config:
        from_attributes = True

# --- HOME BATCH SCHEMAS ---
class HomeBatchBase(BaseModel):
    name: str
    status: str
    seats_left: str
    schedule: str
    description: str
    features_json: str
    color: str
    enroll_link: Optional[str] = "/login"
    order_index: Optional[int] = 0

class HomeBatchCreate(HomeBatchBase):
    pass

class HomeBatchResponse(HomeBatchBase):
    id: int
    class Config:
        from_attributes = True

# --- TESTIMONIAL SCHEMAS ---
class TestimonialBase(BaseModel):
    quote: str
    name: str
    result: str
    stars: Optional[int] = 5
    order_index: Optional[int] = 0

class TestimonialCreate(TestimonialBase):
    pass

class TestimonialResponse(TestimonialBase):
    id: int
    class Config:
        from_attributes = True

# --- HOME FAQ SCHEMAS ---
class HomeFaqBase(BaseModel):
    question: str
    answer: str
    order_index: Optional[int] = 0

class HomeFaqCreate(HomeFaqBase):
    pass

class HomeFaqResponse(HomeFaqBase):
    id: int
    class Config:
        from_attributes = True

# --- USER PROFILE & PASSWORD SCHEMAS ---
class UserProfileUpdate(BaseModel):
    full_name: str
    whatsapp_number: Optional[str] = None

class UserPasswordChange(BaseModel):
    current_password: str
    new_password: str

