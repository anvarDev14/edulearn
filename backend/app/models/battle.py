"""
Battle (1v1 Quiz) models
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Battle(Base):
    __tablename__ = "battles"

    id = Column(Integer, primary_key=True, index=True)

    # Participants
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    opponent_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Quiz source — which module's questions to use
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)

    # Status: waiting | active | finished | cancelled
    status = Column(String(20), default="waiting")

    # Selected question IDs (JSON list) — filled when battle starts
    question_ids = Column(JSON, default=list)

    # Scores
    creator_score = Column(Integer, default=0)
    opponent_score = Column(Integer, default=0)

    # Winner
    winner_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # XP reward for winner
    xp_reward = Column(Integer, default=50)

    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)

    answers = relationship("BattleAnswer", back_populates="battle", cascade="all, delete-orphan")


class BattleAnswer(Base):
    __tablename__ = "battle_answers"

    id = Column(Integer, primary_key=True, index=True)
    battle_id = Column(Integer, ForeignKey("battles.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    selected_answer = Column(String(500), nullable=False)
    is_correct = Column(Boolean, default=False)
    answered_at = Column(DateTime, default=datetime.utcnow)

    battle = relationship("Battle", back_populates="answers")
