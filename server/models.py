from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    role = Column(String)  # "teacher" or "student"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    quizzes = relationship("Quiz", back_populates="teacher")
    quiz_submissions = relationship("QuizSubmission", back_populates="student")
    essays = relationship("Essay", back_populates="teacher")
    essay_submissions = relationship("EssaySubmission", back_populates="student")

class Quiz(Base):
    __tablename__ = "quizzes"
    
    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    questions = Column(JSON)  # List of questions with options, correct answers
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    teacher = relationship("User", back_populates="quizzes")
    submissions = relationship("QuizSubmission", back_populates="quiz")

class QuizSubmission(Base):
    __tablename__ = "quiz_submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    answers = Column(JSON)  # Student's answers
    score = Column(Integer)  # Percentage score
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    
    quiz = relationship("Quiz", back_populates="submissions")
    student = relationship("User", back_populates="quiz_submissions")

class Essay(Base):
    __tablename__ = "essays"
    
    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"))
    prompt = Column(Text)
    rubric = Column(JSON)  # Grading criteria
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    teacher = relationship("User", back_populates="essays")
    submissions = relationship("EssaySubmission", back_populates="essay")

class EssaySubmission(Base):
    __tablename__ = "essay_submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    essay_id = Column(Integer, ForeignKey("essays.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    text = Column(Text)
    ai_feedback = Column(JSON)  # AI-generated feedback
    rubric_scores = Column(JSON)  # Scores based on rubric
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    
    essay = relationship("Essay", back_populates="submissions")
    student = relationship("User", back_populates="essay_submissions")