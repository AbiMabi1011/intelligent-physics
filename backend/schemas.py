from pydantic import BaseModel
from typing import List, Optional

class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    class_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    role: Optional[str] = "student"
    full_name: Optional[str] = None
    class_name: Optional[str] = None

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

# --- QUIZ SCHEMAS ---

class QuestionBase(BaseModel):
    text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str # 'A', 'B', 'C', 'D'

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
