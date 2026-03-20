"""
Audio Library models
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class AudioCategory(Base):
    __tablename__ = "audio_categories"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    emoji = Column(String(10), default="🎧")
    order_index = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    audios = relationship("Audio", back_populates="category", cascade="all, delete-orphan")


class Audio(Base):
    __tablename__ = "audios"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("audio_categories.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    audio_url = Column(String(500), nullable=False)
    cover_url = Column(String(500), nullable=True)
    duration_sec = Column(Integer, default=0)  # seconds
    author = Column(String(255), nullable=True)
    language = Column(String(50), nullable=True)
    is_premium = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    category = relationship("AudioCategory", back_populates="audios")
