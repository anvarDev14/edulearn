"""
Module model
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Module(Base):
    __tablename__ = "modules"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    emoji = Column(String(10), default="📚")
    image_url = Column(String(500), nullable=True)
    order_index = Column(Integer, default=0)
    is_premium = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    lessons = relationship("Lesson", back_populates="module", order_by="Lesson.order_index", cascade="all, delete-orphan")
