from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
import requests
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
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
student = APIRouter()  # New student router

# Auth routes (unchanged)
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
            "idToken": data["idToken"],
            "refreshToken": data["refreshToken"],
            "expiresIn": data["expiresIn"],
            "localId": data["localId"],
            "email": data["email"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")

@auth.get("/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# Quiz routes (unchanged)
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

# Essay routes (unchanged)
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

# Analytics routes (unchanged)
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

# Teacher routes (unchanged)
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

# Student routes - NEW
class DashboardResponse(BaseModel):
    pending_quizzes: int
    pending_essays: int
    completed_assignments: int
    pending_quizzes_list: List[schemas.Quiz]
    pending_essays_list: List[schemas.Essay]
    recent_activity: List[dict]

@student.get("/dashboard", response_model=DashboardResponse)
async def get_student_dashboard(
    current_user: models.User = Depends(get_student_user),
    db: Session = Depends(get_db)
):
    """Get student dashboard data"""
    
    # Get all quizzes and essays
    all_quizzes = db.query(models.Quiz).all()
    all_essays = db.query(models.Essay).all()
    
    # Get student's submissions
    quiz_submissions = db.query(models.QuizSubmission).filter(
        models.QuizSubmission.student_id == current_user.id
    ).all()
    
    essay_submissions = db.query(models.EssaySubmission).filter(
        models.EssaySubmission.student_id == current_user.id
    ).all()
    
    # Find pending quizzes (quizzes not submitted by student)
    submitted_quiz_ids = [sub.quiz_id for sub in quiz_submissions]
    pending_quizzes = [quiz for quiz in all_quizzes if quiz.id not in submitted_quiz_ids]
    
    # Find pending essays (essays not submitted by student)
    submitted_essay_ids = [sub.essay_id for sub in essay_submissions]
    pending_essays = [essay for essay in all_essays if essay.id not in submitted_essay_ids]
    
    # Calculate completed assignments
    completed_assignments = len(quiz_submissions) + len(essay_submissions)
    
    # Get recent activity (combine quiz and essay submissions)
    recent_activity = []
    
    # Add quiz submissions to recent activity
    for sub in quiz_submissions:
        recent_activity.append({
            "type": "quiz",
            "id": sub.id,
            "title": f"Quiz: {sub.quiz.title}",
            "score": sub.score,
            "submitted_at": sub.submitted_at,
            "status": "completed"
        })
    
    # Add essay submissions to recent activity
    for sub in essay_submissions:
        recent_activity.append({
            "type": "essay",
            "id": sub.id,
            "title": f"Essay: {sub.essay.prompt[:50]}...",
            "score": sub.ai_feedback.get('overall_score', 'Pending') if sub.ai_feedback else 'Pending',
            "submitted_at": sub.submitted_at,
            "status": "completed"
        })
    
    # Sort recent activity by submission date (newest first)
    recent_activity.sort(key=lambda x: x["submitted_at"], reverse=True)
    recent_activity = recent_activity[:10]  # Limit to 10 most recent
    
    return DashboardResponse(
        pending_quizzes=len(pending_quizzes),
        pending_essays=len(pending_essays),
        completed_assignments=completed_assignments,
        pending_quizzes_list=pending_quizzes,
        pending_essays_list=pending_essays,
        recent_activity=recent_activity
    )

@student.get("/quizzes/available", response_model=List[schemas.Quiz])
async def get_available_quizzes(
    current_user: models.User = Depends(get_student_user),
    db: Session = Depends(get_db)
):
    """Get all quizzes available for the student (not submitted yet)"""
    
    # Get all quizzes
    all_quizzes = db.query(models.Quiz).all()
    
    # Get student's submitted quiz IDs
    submitted_quiz_ids = db.query(models.QuizSubmission.quiz_id).filter(
        models.QuizSubmission.student_id == current_user.id
    ).all()
    submitted_quiz_ids = [qid for (qid,) in submitted_quiz_ids]
    
    # Filter out quizzes that student has already submitted
    available_quizzes = [quiz for quiz in all_quizzes if quiz.id not in submitted_quiz_ids]
    
    return available_quizzes

@student.get("/essays/available", response_model=List[schemas.Essay])
async def get_available_essays(
    current_user: models.User = Depends(get_student_user),
    db: Session = Depends(get_db)
):
    """Get all essays available for the student (not submitted yet)"""
    
    # Get all essays
    all_essays = db.query(models.Essay).all()
    
    # Get student's submitted essay IDs
    submitted_essay_ids = db.query(models.EssaySubmission.essay_id).filter(
        models.EssaySubmission.student_id == current_user.id
    ).all()
    submitted_essay_ids = [eid for (eid,) in submitted_essay_ids]
    
    # Filter out essays that student has already submitted
    available_essays = [essay for essay in all_essays if essay.id not in submitted_essay_ids]
    
    return available_essays

@student.get("/submissions/quizzes", response_model=List[schemas.QuizSubmission])
async def get_student_quiz_submissions(
    current_user: models.User = Depends(get_student_user),
    db: Session = Depends(get_db)
):
    """Get all quiz submissions by the student"""
    submissions = db.query(models.QuizSubmission).filter(
        models.QuizSubmission.student_id == current_user.id
    ).all()
    return submissions

@student.get("/submissions/essays", response_model=List[schemas.EssaySubmission])
async def get_student_essay_submissions(
    current_user: models.User = Depends(get_student_user),
    db: Session = Depends(get_db)
):
    """Get all essay submissions by the student"""
    submissions = db.query(models.EssaySubmission).filter(
        models.EssaySubmission.student_id == current_user.id
    ).all()
    return submissions


@teacher.get("/analytics/overview", response_model=schemas.TeacherOverviewResponse)
async def get_teacher_overview(
    current_user: models.User = Depends(get_teacher_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive overview for teacher dashboard"""
    
    # Get teacher's quizzes and essays
    teacher_quizzes = db.query(models.Quiz).filter(models.Quiz.teacher_id == current_user.id).all()
    teacher_essays = db.query(models.Essay).filter(models.Essay.teacher_id == current_user.id).all()
    
    quiz_ids = [quiz.id for quiz in teacher_quizzes]
    essay_ids = [essay.id for essay in teacher_essays]
    
    # Get all submissions for teacher's assignments
    quiz_submissions = db.query(models.QuizSubmission).filter(
        models.QuizSubmission.quiz_id.in_(quiz_ids)
    ).all() if quiz_ids else []
    
    essay_submissions = db.query(models.EssaySubmission).filter(
        models.EssaySubmission.essay_id.in_(essay_ids)
    ).all() if essay_ids else []
    
    # Calculate total students (unique students who submitted)
    student_ids = set()
    for sub in quiz_submissions:
        student_ids.add(sub.student_id)
    for sub in essay_submissions:
        student_ids.add(sub.student_id)
    
    total_students = len(student_ids)
    
    # Calculate average score
    total_score = 0
    total_submissions_with_score = 0
    
    for sub in quiz_submissions:
        total_score += sub.score
        total_submissions_with_score += 1
    
    for sub in essay_submissions:
        if sub.ai_feedback and 'overall_score' in sub.ai_feedback:
            total_score += sub.ai_feedback['overall_score']
            total_submissions_with_score += 1
        else:
            # Default score for essays without feedback
            total_score += 70
            total_submissions_with_score += 1
    
    average_score = total_score / total_submissions_with_score if total_submissions_with_score > 0 else 0
    
    # Calculate completion rate
    total_assignments = len(teacher_quizzes) + len(teacher_essays)
    total_expected_submissions = total_assignments * total_students if total_students > 0 else 0
    actual_submissions = len(quiz_submissions) + len(essay_submissions)
    completion_rate = (actual_submissions / total_expected_submissions * 100) if total_expected_submissions > 0 else 0
    
    # Calculate at-risk students (score < 70)
    student_scores = {}
    for sub in quiz_submissions:
        if sub.student_id not in student_scores:
            student_scores[sub.student_id] = []
        student_scores[sub.student_id].append(sub.score)
    
    for sub in essay_submissions:
        if sub.student_id not in student_scores:
            student_scores[sub.student_id] = []
        essay_score = sub.ai_feedback.get('overall_score', 70) if sub.ai_feedback else 70
        student_scores[sub.student_id].append(essay_score)
    
    at_risk_students = 0
    for student_id, scores in student_scores.items():
        avg_score = sum(scores) / len(scores)
        if avg_score < 70:
            at_risk_students += 1
    
    # Quiz performance data
    quiz_performance = []
    for quiz in teacher_quizzes:
        quiz_subs = [sub for sub in quiz_submissions if sub.quiz_id == quiz.id]
        if quiz_subs:
            avg_score = sum(sub.score for sub in quiz_subs) / len(quiz_subs)
            quiz_performance.append({
                "question": quiz.title[:20] + "...",
                "correct": avg_score,
                "incorrect": 100 - avg_score,
                "difficulty": "Easy" if avg_score > 80 else "Medium" if avg_score > 60 else "Hard"
            })
    
    # Class progress over time (last 6 weeks)
    class_progress = []
    for i in range(6, 0, -1):
        week_ago = datetime.now() - timedelta(weeks=i)
        week_subs = [sub for sub in quiz_submissions if sub.submitted_at >= week_ago]
        if week_subs:
            week_avg = sum(sub.score for sub in week_subs) / len(week_subs)
            class_progress.append({
                "name": f"Week {i}",
                "average": week_avg
            })
    
    # Assignment status
    assignment_status = [
        {"name": "Completed", "value": len(quiz_submissions) + len(essay_submissions), "color": "#8b5cf6"},
        {"name": "In Progress", "value": total_expected_submissions - (len(quiz_submissions) + len(essay_submissions)), "color": "#06b6d4"},
        {"name": "Not Started", "value": max(0, total_assignments - total_expected_submissions), "color": "#6b7280"}
    ]
    
    # Subject performance (mock data - you can categorize quizzes by title)
    subject_performance = [
        {"subject": "Math", "average": 78, "trend": "up"},
        {"subject": "Science", "average": 82, "trend": "up"},
        {"subject": "History", "average": 65, "trend": "down"},
        {"subject": "English", "average": 74, "trend": "up"}
    ]
    
    # Problem areas
    problem_areas = [
        {"topic": "Fractions", "failRate": 65, "students": 16},
        {"topic": "Essay Structure", "failRate": 45, "students": 11},
        {"topic": "Historical Dates", "failRate": 58, "students": 14},
        {"topic": "Grammar", "failRate": 38, "students": 9}
    ]
    
    return schemas.TeacherOverviewResponse(
        total_students=total_students,
        average_score=round(average_score, 1),
        completion_rate=round(completion_rate, 1),
        at_risk_students=at_risk_students,
        quiz_performance=quiz_performance,
        class_progress=class_progress,
        assignment_status=assignment_status,
        subject_performance=subject_performance,
        problem_areas=problem_areas
    )

@teacher.get("/analytics/students", response_model=List[schemas.StudentAnalyticsResponse])
async def get_student_analytics_list(
    current_user: models.User = Depends(get_teacher_user),
    db: Session = Depends(get_db)
):
    """Get detailed analytics for all students"""
    
    # Get teacher's assignments
    teacher_quizzes = db.query(models.Quiz).filter(models.Quiz.teacher_id == current_user.id).all()
    teacher_essays = db.query(models.Essay).filter(models.Essay.teacher_id == current_user.id).all()
    
    quiz_ids = [quiz.id for quiz in teacher_quizzes]
    essay_ids = [essay.id for essay in teacher_essays]
    
    # Get all submissions
    quiz_submissions = db.query(models.QuizSubmission).filter(
        models.QuizSubmission.quiz_id.in_(quiz_ids)
    ).all() if quiz_ids else []
    
    essay_submissions = db.query(models.EssaySubmission).filter(
        models.EssaySubmission.essay_id.in_(essay_ids)
    ).all() if essay_ids else []
    
    # Group submissions by student
    student_data = {}
    for sub in quiz_submissions:
        if sub.student_id not in student_data:
            student_data[sub.student_id] = {"quiz_scores": [], "essay_scores": []}
        student_data[sub.student_id]["quiz_scores"].append(sub.score)
    
    for sub in essay_submissions:
        if sub.student_id not in student_data:
            student_data[sub.student_id] = {"quiz_scores": [], "essay_scores": []}
        essay_score = sub.ai_feedback.get('overall_score', 70) if sub.ai_feedback else 70
        student_data[sub.student_id]["essay_scores"].append(essay_score)
    
    # Get student details and calculate analytics
    result = []
    for student_id, data in student_data.items():
        student = db.query(models.User).filter(models.User.id == student_id).first()
        if not student:
            continue
            
        quiz_scores = data["quiz_scores"]
        essay_scores = data["essay_scores"]
        all_scores = quiz_scores + essay_scores
        
        if all_scores:
            overall_score = sum(all_scores) / len(all_scores)
        else:
            overall_score = 0
        
        # Determine strengths and weaknesses based on performance
        strengths = []
        weaknesses = []
        
        if quiz_scores and sum(quiz_scores) / len(quiz_scores) > 80:
            strengths.append("Quiz Performance")
        elif quiz_scores and sum(quiz_scores) / len(quiz_scores) < 60:
            weaknesses.append("Quiz Performance")
            
        if essay_scores and sum(essay_scores) / len(essay_scores) > 80:
            strengths.append("Writing Skills")
        elif essay_scores and sum(essay_scores) / len(essay_scores) < 60:
            weaknesses.append("Writing Skills")
        
        result.append(schemas.StudentAnalyticsResponse(
            student_id=student_id,
            student_name=student.name,
            overall_score=round(overall_score, 1),
            quiz_count=len(quiz_scores),
            essay_count=len(essay_scores),
            strengths=strengths,
            weaknesses=weaknesses
        ))
    
    return result

@teacher.get("/analytics/quiz/{quiz_id}", response_model=schemas.QuizAnalyticsResponse)
async def get_quiz_detailed_analytics(
    quiz_id: int,
    current_user: models.User = Depends(get_teacher_user),
    db: Session = Depends(get_db)
):
    """Get detailed analytics for a specific quiz"""
    
    quiz = db.query(models.Quiz).filter(
        models.Quiz.id == quiz_id,
        models.Quiz.teacher_id == current_user.id
    ).first()
    
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    submissions = db.query(models.QuizSubmission).filter(
        models.QuizSubmission.quiz_id == quiz_id
    ).all()
    
    if not submissions:
        return schemas.QuizAnalyticsResponse(
            quiz_id=quiz_id,
            total_submissions=0,
            average_score=0,
            question_analytics=[]
        )
    
    total_submissions = len(submissions)
    average_score = sum(sub.score for sub in submissions) / total_submissions
    
    # Question analytics (mock - in real implementation, you'd analyze each question)
    question_analytics = []
    for i, question in enumerate(quiz.questions):
        # Simulate question performance based on overall score
        correct_percentage = max(40, min(95, average_score + (i * 5 - 10)))
        question_analytics.append({
            "question_id": i + 1,
            "correct_percentage": correct_percentage,
            "difficulty_level": "Easy" if correct_percentage > 70 else "Medium" if correct_percentage > 50 else "Hard"
        })
    
    return schemas.QuizAnalyticsResponse(
        quiz_id=quiz_id,
        total_submissions=total_submissions,
        average_score=round(average_score, 1),
        question_analytics=question_analytics
    )    