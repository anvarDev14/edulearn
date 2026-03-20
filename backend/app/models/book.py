"""
Book Library models
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class BookCategory(Base):
    __tablename__ = "book_categories"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    emoji = Column(String(10), default="📖")
    order_index = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    books = relationship("Book", back_populates="category", cascade="all, delete-orphan")


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("book_categories.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    file_url = Column(String(500), nullable=True)   # PDF yoki boshqa fayl
    cover_url = Column(String(500), nullable=True)
    author = Column(String(255), nullable=True)
    language = Column(String(50), nullable=True)
    pages = Column(Integer, nullable=True)
    is_premium = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    category = relationship("BookCategory", back_populates="books")
