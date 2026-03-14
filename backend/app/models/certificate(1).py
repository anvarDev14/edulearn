"""
Certificate model
"""
from sqlalchemy import Column, Integer, ForeignKey, DateTime, String, Float
from datetime import datetime
from app.database import Base


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    certificate_code = Column(String(20), unique=True, nullable=False)
    score = Column(Float, default=0.0)
    issued_at = Column(DateTime, default=datetime.utcnow)
