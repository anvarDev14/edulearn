"""
Quiz and Question models
"""
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Quiz(Base):
    __tablename__ = "quizzes"
    
    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    xp_reward = Column(Integer, default=100)
    pass_percentage = Column(Integer, default=70)
    time_limit_sec = Column(Integer, default=300)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    lesson = relationship("Lesson", back_populates="quiz")
    questions = relationship("Question", back_populates="quiz", order_by="Question.order_index", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    question_text = Column(String(1000), nullable=False)
    question_type = Column(String(50), default="multiple_choice")
    options = Column(JSON, nullable=False)  # ["A", "B", "C", "D"]
    correct_answer = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)
    
    # Relationships
    quiz = relationship("Quiz", back_populates="questions")
