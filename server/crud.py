from sqlalchemy.orm import Session
from typing import List, Optional
from models import User, Quiz, QuizSubmission, Essay, EssaySubmission

# User CRUD
def get_user_by_firebase_uid(db: Session, firebase_uid: str) -> Optional[User]:
    return db.query(User).filter(User.firebase_uid == firebase_uid).first()

def create_user(db: Session, user_data: dict) -> User:
    user = User(**user_data)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# Quiz CRUD
def create_quiz(db: Session, quiz_data: dict, teacher_id: int) -> Quiz:
    quiz_data["teacher_id"] = teacher_id
    quiz = Quiz(**quiz_data)
    db.add(quiz)
    db.commit()
    db.refresh(quiz)
    return quiz

def get_quiz(db: Session, quiz_id: int) -> Optional[Quiz]:
    return db.query(Quiz).filter(Quiz.id == quiz_id).first()

def create_quiz_submission(db: Session, submission_data: dict) -> QuizSubmission:
    # Calculate score
    quiz = get_quiz(db, submission_data["quiz_id"])
    correct_answers = 0
    total_questions = len(quiz.questions)
    
    for i, question in enumerate(quiz.questions):
        if submission_data["answers"].get(str(i)) == question["correct_answer"]:
            correct_answers += 1
    
    score = int((correct_answers / total_questions) * 100) if total_questions > 0 else 0
    submission_data["score"] = score
    
    submission = QuizSubmission(**submission_data)
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission

# Essay CRUD
def create_essay(db: Session, essay_data: dict, teacher_id: int) -> Essay:
    essay_data["teacher_id"] = teacher_id
    essay = Essay(**essay_data)
    db.add(essay)
    db.commit()
    db.refresh(essay)
    return essay

def get_essay(db: Session, essay_id: int) -> Optional[Essay]:
    return db.query(Essay).filter(Essay.id == essay_id).first()

async def create_essay_submission(db: Session, submission_data: dict, ai_feedback_service) -> EssaySubmission:
    essay = get_essay(db, submission_data["essay_id"])
    
    # Generate AI feedback
    ai_feedback = await ai_feedback_service.generate_essay_feedback(
        submission_data["text"], 
        essay.rubric
    )
    
    submission_data["ai_feedback"] = ai_feedback
    submission = EssaySubmission(**submission_data)
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission