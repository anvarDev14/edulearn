"""
Lesson model
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Lesson(Base):
    __tablename__ = "lessons"
    
    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    video_url = Column(String(500), nullable=True)
    xp_reward = Column(Integer, default=50)
    order_index = Column(Integer, default=0)
    is_premium = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    duration_min = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    module = relationship("Module", back_populates="lessons")
    quiz = relationship("Quiz", back_populates="lesson", uselist=False, cascade="all, delete-orphan")
    progress = relationship("UserProgress", back_populates="lesson", cascade="all, delete-orphan")
