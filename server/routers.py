from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List
import requests
from sqlalchemy.orm import Session
from config import settings
from database import get_db

# Import modules instead of individual classes
import models
import schemas

from auth import get_current_user, get_teacher_user, get_student_user
from crud import (
    get_user_by_firebase_uid, create_user, create_quiz, get_quiz, 
    create_quiz_submission, create_essay, get_essay, create_essay_submission
)
from ai_feedback import ai_feedback_service

# Create routers
auth = APIRouter()
quizzes = APIRouter()
essays = APIRouter()
analytics = APIRouter()
teacher = APIRouter()

# Auth routes
@auth.post("/register", response_model=schemas.User)
async def register_user(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = get_user_by_firebase_uid(db, user_data.firebase_uid)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    user_dict = user_data.model_dump()
    user = create_user(db, user_dict)
    return user

class LoginRequest(BaseModel):
    email: str
    password: str

@auth.post("/login")
async def login(request: LoginRequest):
    try:
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={settings.FIREBASE_API_KEY}"
        
        payload = {
            "email": request.email,
            "password": request.password,
            "returnSecureToken": True
        }
        
        res = requests.post(url, json=payload)
        data = res.json()
        
        if res.status_code != 200:
            raise HTTPException(status_code=401, detail=data.get("error", {}).get("message", "Login failed"))
        
        return {
            "idToken": data["idToken"],          # Firebase ID token
            "refreshToken": data["refreshToken"],# to refresh session
            "expiresIn": data["expiresIn"],      # in seconds
            "localId": data["localId"],          # Firebase user ID
            "email": data["email"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")

@auth.get("/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# Quiz routes
@quizzes.post("/", response_model=schemas.Quiz)
async def create_new_quiz(
    quiz_data: schemas.QuizCreate,
    current_user: models.User = Depends(get_teacher_user),
    db: Session = Depends(get_db)
):
    return create_quiz(db, quiz_data.model_dump(), current_user.id)

@quizzes.get("/{quiz_id}", response_model=schemas.Quiz)
async def get_quiz_by_id(
    quiz_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    quiz = get_quiz(db, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz

@quizzes.post("/{quiz_id}/submit", response_model=schemas.QuizSubmission)
async def submit_quiz_answers(
    quiz_id: int,
    submission_data: schemas.QuizSubmissionCreate,
    current_user: models.User = Depends(get_student_user),
    db: Session = Depends(get_db)
):
    submission_dict = submission_data.model_dump()
    submission_dict.update({"quiz_id": quiz_id, "student_id": current_user.id})
    return create_quiz_submission(db, submission_dict)

# Essay routes
@essays.post("/", response_model=schemas.Essay)
async def create_essay_prompt(
    essay_data: schemas.EssayCreate,
    current_user: models.User = Depends(get_teacher_user),
    db: Session = Depends(get_db)
):
    return create_essay(db, essay_data.model_dump(), current_user.id)

@essays.post("/{essay_id}/submit", response_model=schemas.EssaySubmission)
async def submit_essay(
    essay_id: int,
    submission_data: schemas.EssaySubmissionCreate,
    current_user: models.User = Depends(get_student_user),
    db: Session = Depends(get_db)
):
    submission_dict = submission_data.model_dump()
    submission_dict.update({"essay_id": essay_id, "student_id": current_user.id})
    return await create_essay_submission(db, submission_dict, ai_feedback_service)

@essays.post("/{essay_id}/feedback")
async def generate_ai_feedback(
    essay_id: int,
    submission_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    submission = db.query(models.EssaySubmission).filter(
        models.EssaySubmission.id == submission_id,
        models.EssaySubmission.essay_id == essay_id
    ).first()
    
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    essay = get_essay(db, essay_id)
    new_feedback = await ai_feedback_service.generate_essay_feedback(
        submission.text, essay.rubric
    )
    
    submission.ai_feedback = new_feedback
    db.commit()
    return {"feedback": new_feedback}

# Analytics routes
@analytics.get("/quiz/{quiz_id}", response_model=schemas.QuizAnalytics)
async def get_quiz_analytics(
    quiz_id: int,
    current_user: models.User = Depends(get_teacher_user),
    db: Session = Depends(get_db)
):
    quiz = get_quiz(db, quiz_id)
    if not quiz or quiz.teacher_id != current_user.id:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    submissions = db.query(models.QuizSubmission).filter(models.QuizSubmission.quiz_id == quiz_id).all()
    
    if not submissions:
        return schemas.QuizAnalytics(
            quiz_id=quiz_id,
            average_score=0,
            question_analytics=[],
            student_performance=[]
        )
    
    total_score = sum(sub.score for sub in submissions)
    average_score = total_score / len(submissions)
    
    question_analytics = []
    student_performance = [
        {"student_id": sub.student_id, "score": sub.score}
        for sub in submissions
    ]
    
    return schemas.QuizAnalytics(
        quiz_id=quiz_id,
        average_score=average_score,
        question_analytics=question_analytics,
        student_performance=student_performance
    )

@analytics.get("/essay/{essay_id}", response_model=schemas.EssayAnalytics)
async def get_essay_analytics(
    essay_id: int,
    current_user: models.User = Depends(get_teacher_user),
    db: Session = Depends(get_db)
):
    essay = get_essay(db, essay_id)
    if not essay or essay.teacher_id != current_user.id:
        raise HTTPException(status_code=404, detail="Essay not found")
    
    submissions = db.query(models.EssaySubmission).filter(models.EssaySubmission.essay_id == essay_id).all()
    
    if not submissions:
        return schemas.EssayAnalytics(
            essay_id=essay_id,
            average_score=0,
            common_strengths=[],
            common_weaknesses=[],
            student_performance=[]
        )
    
    student_performance = [
        {
            "student_id": sub.student_id,
            "score": sub.ai_feedback.get('overall_score', 70) if sub.ai_feedback else 70
        }
        for sub in submissions
    ]
    
    return schemas.EssayAnalytics(
        essay_id=essay_id,
        average_score=75,
        common_strengths=["Good structure", "Clear arguments"],
        common_weaknesses=["Grammar issues", "Need more examples"],
        student_performance=student_performance
    )

@analytics.get("/student/{student_id}", response_model=schemas.StudentAnalytics)
async def get_student_analytics(
    student_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "student" and current_user.id != student_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    quiz_submissions = db.query(models.QuizSubmission).filter(models.QuizSubmission.student_id == student_id).all()
    essay_submissions = db.query(models.EssaySubmission).filter(models.EssaySubmission.student_id == student_id).all()
    
    avg_quiz_score = sum(sub.score for sub in quiz_submissions) / len(quiz_submissions) if quiz_submissions else 0
    avg_essay_score = 75
    
    recent_submissions = []
    
    return schemas.StudentAnalytics(
        student_id=student_id,
        average_quiz_score=avg_quiz_score,
        average_essay_score=avg_essay_score,
        recent_submissions=recent_submissions
    )

# Teacher routes
@teacher.get("/quizzes", response_model=List[schemas.Quiz])
async def get_teacher_quizzes(
    current_user: models.User = Depends(get_teacher_user),
    db: Session = Depends(get_db)
):
    """Get all quizzes created by the current teacher"""
    quizzes = db.query(models.Quiz).filter(models.Quiz.teacher_id == current_user.id).all()
    return quizzes

@teacher.get("/essays", response_model=List[schemas.Essay])
async def get_teacher_essays(
    current_user: models.User = Depends(get_teacher_user),
    db: Session = Depends(get_db)
):
    """Get all essays created by the current teacher"""
    essays = db.query(models.Essay).filter(models.Essay.teacher_id == current_user.id).all()
    return essays