from pydantic import BaseModel
from typing import List, Optional

class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    class_name: Optional[str] = None

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

    class Config:
        from_attributes = True

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
    answers: dict # { "QuestionID": "A", "QuestionID": "B" } assuming QID is key
    # Or simpler:
    # Key is Question ID (as string), Value is Option (A, B, C, D)

class QuizResultResponse(BaseModel):
    score: int
    total: int
    percentage: float

class FullQuizResult(BaseModel):
    id: int
    quiz_id: int
    user_id: int
    score: int
    total_questions: int
    created_at: str
    student: UserBase
    quiz: QuizBase

    class Config:
        from_attributes = True

class MarkBase(BaseModel):
    user_id: int
    subject: str
    term: str
    score: int
    max_score: int = 100

class MarkCreate(MarkBase):
    pass

class MarkResponse(MarkBase):
    id: int
    student: UserBase

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

class ClassRecordingCreate(ClassRecordingBase):
    pass

class ClassRecordingResponse(ClassRecordingBase):
    id: int

    class Config:
        from_attributes = True

class SliderBase(BaseModel):
    title: str
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
