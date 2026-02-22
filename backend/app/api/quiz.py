"""
Quiz API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.quiz import Quiz, Question
from app.models.progress import UserProgress
from app.models.xp_history import XPHistory
from app.api.deps import get_current_user
from app.core.xp_engine import XPEngine
from app.core.level_engine import LevelEngine

router = APIRouter()
xp_engine = XPEngine()
level_engine = LevelEngine()


class QuizAnswer(BaseModel):
    question_id: int
    answer: str


class QuizSubmit(BaseModel):
    answers: List[QuizAnswer]


@router.get("/{quiz_id}")
async def get_quiz(
    quiz_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Quiz olish"""
    result = await db.execute(
        select(Quiz)
        .options(selectinload(Quiz.questions), selectinload(Quiz.lesson))
        .where(Quiz.id == quiz_id)
    )
    quiz = result.scalar_one_or_none()
    
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz topilmadi")
    
    # Check premium
    if quiz.lesson.is_premium and not current_user.is_premium and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail={"error": "premium_required", "message": "Bu quiz faqat Premium uchun"}
        )
    
    questions = []
    for q in quiz.questions:
        questions.append({
            "id": q.id,
            "question_text": q.question_text,
            "question_type": q.question_type,
            "options": q.options
            # correct_answer ni yubormaymiz!
        })
    
    return {
        "id": quiz.id,
        "title": quiz.title,
        "description": quiz.description,
        "xp_reward": quiz.xp_reward,
        "pass_percentage": quiz.pass_percentage,
        "time_limit_sec": quiz.time_limit_sec,
        "total_questions": len(questions),
        "questions": questions
    }


@router.post("/{quiz_id}/submit")
async def submit_quiz(
    quiz_id: int,
    data: QuizSubmit,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Quiz javoblarini yuborish"""
    result = await db.execute(
        select(Quiz)
        .options(selectinload(Quiz.questions), selectinload(Quiz.lesson))
        .where(Quiz.id == quiz_id)
    )
    quiz = result.scalar_one_or_none()
    
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz topilmadi")
    
    # Check answers
    correct_answers = 0
    total_questions = len(quiz.questions)
    
    questions_dict = {q.id: q for q in quiz.questions}
    results = []
    
    for answer in data.answers:
        question = questions_dict.get(answer.question_id)
        if question:
            is_correct = answer.answer == question.correct_answer
            if is_correct:
                correct_answers += 1
            
            results.append({
                "question_id": question.id,
                "your_answer": answer.answer,
                "correct_answer": question.correct_answer,
                "is_correct": is_correct,
                "explanation": question.explanation
            })
    
    # Calculate score
    score = round((correct_answers / total_questions * 100) if total_questions > 0 else 0, 1)
    passed = score >= quiz.pass_percentage
    
    # Get or create progress
    progress_result = await db.execute(
        select(UserProgress)
        .where(and_(
            UserProgress.user_id == current_user.id,
            UserProgress.lesson_id == quiz.lesson_id
        ))
    )
    progress = progress_result.scalar_one_or_none()
    
    if not progress:
        progress = UserProgress(
            user_id=current_user.id,
            lesson_id=quiz.lesson_id
        )
        db.add(progress)
    
    # Update progress
    progress.quiz_attempts += 1
    
    # Only update score if better
    if progress.quiz_score is None or score > progress.quiz_score:
        progress.quiz_score = score
    
    # Award XP only if passed and first time or better score
    xp_gained = 0
    level_up = False
    old_level = current_user.level
    
    if passed:
        xp_breakdown = xp_engine.get_xp_breakdown(correct_answers, total_questions, quiz.xp_reward)
        xp_gained = xp_breakdown["total"]
        
        # Award XP
        current_user.total_xp += xp_gained
        new_level = level_engine.calculate_level(current_user.total_xp)
        level_up = new_level > old_level
        current_user.level = new_level
        
        # Mark lesson as completed
        if not progress.is_completed:
            progress.is_completed = True
            progress.completed_at = datetime.utcnow()
        
        # XP History
        xp_history = XPHistory(
            user_id=current_user.id,
            amount=xp_gained,
            source="quiz",
            source_id=quiz_id,
            description=f"Quiz: {quiz.title} ({score}%)"
        )
        db.add(xp_history)
    
    await db.commit()
    
    level_info = level_engine.get_level_info(current_user.total_xp)
    
    return {
        "passed": passed,
        "score": score,
        "correct_answers": correct_answers,
        "total_questions": total_questions,
        "pass_percentage": quiz.pass_percentage,
        "xp_gained": xp_gained,
        "xp_breakdown": xp_engine.get_xp_breakdown(correct_answers, total_questions, quiz.xp_reward),
        "level_up": level_up,
        "old_level": old_level,
        "new_level": current_user.level,
        "level_info": level_info,
        "results": results,
        "attempts": progress.quiz_attempts
    }
