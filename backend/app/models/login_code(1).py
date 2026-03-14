"""
Login Code model - Web login via Telegram bot
"""
from sqlalchemy import Column, Integer, BigInteger, String, Boolean, DateTime
from datetime import datetime
from app.database import Base


class LoginCode(Base):
    __tablename__ = "login_codes"

    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(BigInteger, nullable=False, index=True)
    code = Column(String(6), nullable=False, index=True)
    is_used = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
