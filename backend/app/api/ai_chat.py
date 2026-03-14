"""
AI Chat & AI Explain API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional
import httpx
import json

from app.database import get_db
from app.models.user import User
from app.models.ai_chat import AIChatHistory
from app.models.lesson import Lesson
from app.api.deps import get_current_user
from app.config import settings

router = APIRouter()

ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    lesson_id: Optional[int] = None
    history: Optional[List[ChatMessage]] = []


class ExplainRequest(BaseModel):
    text: str
    lesson_id: Optional[int] = None


async def call_claude(messages: list, system: str = "") -> str:
    """Call Anthropic Claude API"""
    if not settings.ANTHROPIC_API_KEY:
        return "AI Chat hozircha mavjud emas. API kaliti sozlanmagan."

    async with httpx.AsyncClient(timeout=30.0) as client:
        payload = {
            "model": "claude-haiku-4-5-20251001",
            "max_tokens": 1024,
            "messages": messages
        }
        if system:
            payload["system"] = system

        try:
            response = await client.post(
                ANTHROPIC_API_URL,
                headers={
                    "x-api-key": settings.ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json"
                },
                json=payload
            )
            data = response.json()
            if "content" in data and data["content"]:
                return data["content"][0]["text"]
            return "Javob olishda xato yuz berdi."
        except Exception as e:
            return f"AI xizmatida xato: {str(e)}"


@router.post("/chat")
async def ai_chat(
    data: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """General AI chat for learning questions"""
    system = (
        "Siz EduLearn ta'lim platformasining AI yordamchisisiz. "
        "Foydalanuvchilarga o'qishda yordam bering. "
        "O'zbek tilida qisqa va aniq javob bering. "
        "Faqat ta'lim bilan bog'liq savollarga javob bering."
    )

    # Add lesson context if provided
    if data.lesson_id:
        lesson_result = await db.execute(select(Lesson).where(Lesson.id == data.lesson_id))
        lesson = lesson_result.scalar_one_or_none()
        if lesson:
            system += f"\n\nFoydalanuvchi hozir '{lesson.title}' darsini o'qimoqda."

    # Build messages
    messages = []
    if data.history:
        for msg in data.history[-6:]:  # last 6 messages for context
            messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": data.message})

    response = await call_claude(messages, system)

    # Save to history
    user_msg = AIChatHistory(
        user_id=current_user.id,
        role="user",
        content=data.message,
        lesson_id=data.lesson_id
    )
    assistant_msg = AIChatHistory(
        user_id=current_user.id,
        role="assistant",
        content=response,
        lesson_id=data.lesson_id
    )
    db.add(user_msg)
    db.add(assistant_msg)
    await db.commit()

    return {"response": response}


@router.post("/explain")
async def ai_explain(
    data: ExplainRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """AI explains selected text in simple terms"""
    system = (
        "Siz ta'lim yordamchisisiz. Tanlangan matnni oddiy va tushunarli tarzda izohlang. "
        "O'zbek tilida javob bering. Qisqa, aniq va misollar bilan tushuntiring."
    )

    if data.lesson_id:
        lesson_result = await db.execute(select(Lesson).where(Lesson.id == data.lesson_id))
        lesson = lesson_result.scalar_one_or_none()
        if lesson:
            system += f"\n\nKontekst: '{lesson.title}' darsi."

    prompt = f"Quyidagi matnni tushuntiring:\n\n{data.text}"
    messages = [{"role": "user", "content": prompt}]

    response = await call_claude(messages, system)
    return {"explanation": response}


@router.get("/history")
async def get_chat_history(
    lesson_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get AI chat history"""
    query = select(AIChatHistory).where(
        AIChatHistory.user_id == current_user.id
    ).order_by(AIChatHistory.created_at.asc()).limit(50)

    if lesson_id:
        query = query.where(AIChatHistory.lesson_id == lesson_id)

    result = await db.execute(query)
    messages = result.scalars().all()

    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "created_at": m.created_at.isoformat()
        }
        for m in messages
    ]
