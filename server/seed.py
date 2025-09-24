from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import User, Quiz, QuizSubmission, Essay, EssaySubmission
import json

# Recreate tables (careful: drops everything!)
# Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

def seed_db():
    db: Session = SessionLocal()

    # --- Users ---
    teacher = User(
        firebase_uid="RF0NCQV945OzCAi61iO5diHG7Sx2",
        email="teacher@example.com",
        name="Alice Johnson",
        role="teacher"
    )
    student1 = User(
        firebase_uid="STUDENT123",
        email="student1@example.com",
        name="Bob Smith",
        role="student"
    )
    student2 = User(
        firebase_uid="STUDENT456",
        email="student2@example.com",
        name="Charlie Brown",
        role="student"
    )

    db.add_all([teacher, student1, student2])
    db.commit()

    # --- Quiz ---
    quiz = Quiz(
        teacher_id=teacher.id,
        title="Fractions Basics",
        questions=[
            {"question": "What is 1/2 + 1/4?", "options": ["1/4", "1/2", "3/4"], "answer": "3/4"},
            {"question": "Simplify 6/8", "options": ["3/4", "2/4", "6/4"], "answer": "3/4"},
        ]
    )
    db.add(quiz)
    db.commit()

    # --- Quiz Submissions ---
    sub1 = QuizSubmission(
        quiz_id=quiz.id,
        student_id=student1.id,
        answers=["3/4", "3/4"],
        score=100
    )
    sub2 = QuizSubmission(
        quiz_id=quiz.id,
        student_id=student2.id,
        answers=["1/2", "2/4"],
        score=50
    )
    db.add_all([sub1, sub2])
    db.commit()

    # --- Essay ---
    essay = Essay(
        teacher_id=teacher.id,
        prompt="Write an essay about climate change and its impact.",
        rubric={
            "clarity": "0-5",
            "grammar": "0-5",
            "content": "0-10"
        }
    )
    db.add(essay)
    db.commit()

    # --- Essay Submissions ---
    essay_sub1 = EssaySubmission(
        essay_id=essay.id,
        student_id=student1.id,
        text="Climate change affects weather and sea levels...",
        ai_feedback={"grammar": "Good", "clarity": "Clear", "keywords": ["climate", "sea levels"]},
        rubric_scores={"clarity": 4, "grammar": 5, "content": 8}
    )
    essay_sub2 = EssaySubmission(
        essay_id=essay.id,
        student_id=student2.id,
        text="It is bad for earth.",
        ai_feedback={"grammar": "Needs work", "clarity": "Too vague", "keywords": ["earth"]},
        rubric_scores={"clarity": 1, "grammar": 2, "content": 3}
    )
    db.add_all([essay_sub1, essay_sub2])
    db.commit()

    db.close()
    print("✅ Database seeded!")

if __name__ == "__main__":
    seed_db()
