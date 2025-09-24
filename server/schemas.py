from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: str
    name: str
    role: str

class UserCreate(UserBase):
    firebase_uid: str

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Quiz Schemas - FIXED
class Question(BaseModel):
    question_text: str
    options: List[str]
    correct_answer: int

class QuizBase(BaseModel):
    title: str
    questions: List[Dict[str, Any]]  # Changed from List[Question] to handle JSON

class QuizCreate(QuizBase):
    pass

class Quiz(QuizBase):
    id: int
    teacher_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class QuizSubmissionBase(BaseModel):
    answers: Dict[str, int]  # question_id -> answer_index

class QuizSubmissionCreate(QuizSubmissionBase):
    pass

class QuizSubmission(QuizSubmissionBase):
    id: int
    quiz_id: int
    student_id: int
    score: int
    submitted_at: datetime
    
    class Config:
        from_attributes = True

# Essay Schemas - FIXED
class RubricItem(BaseModel):
    description: str
    max_score: int

class EssayBase(BaseModel):
    prompt: str
    rubric: Dict[str, Any]  # Changed from Dict[str, RubricItem] to handle JSON

class EssayCreate(EssayBase):
    pass

class Essay(EssayBase):
    id: int
    teacher_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class EssaySubmissionBase(BaseModel):
    text: str

class EssaySubmissionCreate(EssaySubmissionBase):
    pass

class EssaySubmission(EssaySubmissionBase):
    id: int
    essay_id: int
    student_id: int
    ai_feedback: Optional[Dict[str, Any]] = None
    rubric_scores: Optional[Dict[str, Any]] = None
    submitted_at: datetime
    
    class Config:
        from_attributes = True

# Analytics Schemas
class QuizAnalytics(BaseModel):
    quiz_id: int
    average_score: float
    question_analytics: List[Dict[str, Any]]
    student_performance: List[Dict[str, Any]]

class EssayAnalytics(BaseModel):
    essay_id: int
    average_score: float
    common_strengths: List[str]
    common_weaknesses: List[str]
    student_performance: List[Dict[str, Any]]

class StudentAnalytics(BaseModel):
    student_id: int
    average_quiz_score: float
    average_essay_score: float
    recent_submissions: List[Dict[str, Any]]

# Auth Schemas
class FirebaseUser(BaseModel):
    uid: str
    email: str
    name: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

# Dashboard Schemas - NEW
class RecentActivity(BaseModel):
    type: str  # "quiz" or "essay"
    id: int
    title: str
    score: Any  # Can be int or str like "Pending"
    submitted_at: datetime
    status: str

class DashboardResponse(BaseModel):
    pending_quizzes: int
    pending_essays: int
    completed_assignments: int
    pending_quizzes_list: List[Quiz]
    pending_essays_list: List[Essay]
    recent_activity: List[Dict[str, Any]]