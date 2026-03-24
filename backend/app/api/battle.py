"""
Battle API — 1v1 Quiz Battles
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import random

from app.database import get_db
from app.models.user import User
from app.models.module import Module
from app.models.lesson import Lesson
from app.models.quiz import Quiz, Question
from app.models.battle import Battle, BattleAnswer
from app.models.xp_history import XPHistory
from app.api.deps import get_current_user

router = APIRouter()

QUESTIONS_PER_BATTLE = 10


class CreateBattle(BaseModel):
    module_id: int


class AnswerSubmit(BaseModel):
    question_id: int
    selected_answer: str


def _battle_dict(b: Battle, user_id: int, module_title: str = "", creator_name: str = "") -> dict:
    return {
        "id": b.id,
        "module_id": b.module_id,
        "module_title": module_title,
        "status": b.status,
        "creator_id": b.creator_id,
        "creator_name": creator_name,
        "opponent_id": b.opponent_id,
        "creator_score": b.creator_score,
        "opponent_score": b.opponent_score,
        "winner_id": b.winner_id,
        "xp_reward": b.xp_reward,
        "question_count": len(b.question_ids or []),
        "created_at": b.created_at.isoformat(),
        "started_at": b.started_at.isoformat() if b.started_at else None,
        "finished_at": b.finished_at.isoformat() if b.finished_at else None,
        "is_creator": b.creator_id == user_id,
    }


async def _pick_questions(module_id: int, db: AsyncSession) -> list[int]:
    """Get random questions from all quizzes in module's lessons"""
    lessons_res = await db.execute(
        select(Lesson.id).where(Lesson.module_id == module_id)
    )
    lesson_ids = [r[0] for r in lessons_res.all()]
    if not lesson_ids:
        return []

    quizzes_res = await db.execute(
        select(Quiz.id).where(Quiz.lesson_id.in_(lesson_ids))
    )
    quiz_ids = [r[0] for r in quizzes_res.all()]
    if not quiz_ids:
        return []

    questions_res = await db.execute(
        select(Question.id).where(Question.quiz_id.in_(quiz_ids))
    )
    all_ids = [r[0] for r in questions_res.all()]
    random.shuffle(all_ids)
    return all_ids[:QUESTIONS_PER_BATTLE]


# ── Lobby list ──────────────────────────────────────────────────────────────

@router.get("/lobbies")
async def get_lobbies(
    module_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Ochiq lobbylar (boshqa userlar yaratgan, waiting holat)"""
    q = select(Battle).where(
        Battle.status == "waiting",
        Battle.creator_id != current_user.id,
        Battle.opponent_id == None,
    )
    if module_id:
        q = q.where(Battle.module_id == module_id)
    q = q.order_by(Battle.created_at.desc()).limit(20)

    res = await db.execute(q)
    battles = res.scalars().all()

    result = []
    for b in battles:
        mod = await db.get(Module, b.module_id)
        creator = await db.get(User, b.creator_id)
        result.append({
            **_battle_dict(b, current_user.id,
                           module_title=mod.title if mod else "",
                           creator_name=creator.full_name if creator else ""),
            "module_emoji": mod.emoji if mod else "📚",
        })
    return result


# ── Create battle / lobby ───────────────────────────────────────────────────

@router.post("/create")
async def create_battle(
    data: CreateBattle,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Yangi lobby yaratish"""
    # Cancel any existing waiting battle by this user
    existing = await db.execute(
        select(Battle).where(
            Battle.creator_id == current_user.id,
            Battle.status == "waiting"
        )
    )
    for old in existing.scalars().all():
        old.status = "cancelled"

    mod = await db.get(Module, data.module_id)
    if not mod:
        raise HTTPException(404, "Modul topilmadi")

    battle = Battle(
        creator_id=current_user.id,
        module_id=data.module_id,
        status="waiting",
    )
    db.add(battle)
    await db.commit()
    await db.refresh(battle)

    return {"id": battle.id, "status": "waiting", "module_title": mod.title}


# ── Join battle ─────────────────────────────────────────────────────────────

@router.post("/{battle_id}/join")
async def join_battle(
    battle_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Lobbyga qo'shilish"""
    battle = await db.get(Battle, battle_id)
    if not battle:
        raise HTTPException(404, "Battle topilmadi")
    if battle.status != "waiting":
        raise HTTPException(400, "Bu lobby allaqachon to'lgan yoki tugagan")
    if battle.creator_id == current_user.id:
        raise HTTPException(400, "O'z lobbyingizga qo'shila olmaysiz")

    # Pick questions
    q_ids = await _pick_questions(battle.module_id, db)
    if len(q_ids) < 3:
        raise HTTPException(400, "Bu modulda yetarli savol yo'q (kamida 3 ta kerak)")

    battle.opponent_id = current_user.id
    battle.status = "active"
    battle.started_at = datetime.utcnow()
    battle.question_ids = q_ids
    await db.commit()

    return {"id": battle.id, "status": "active", "question_count": len(q_ids)}


# ── Active battle ───────────────────────────────────────────────────────────

@router.get("/active")
async def get_active_battle(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mening joriy battle (waiting yoki active)"""
    res = await db.execute(
        select(Battle).where(
            or_(
                Battle.creator_id == current_user.id,
                Battle.opponent_id == current_user.id,
            ),
            Battle.status.in_(["waiting", "active"])
        ).order_by(Battle.created_at.desc()).limit(1)
    )
    battle = res.scalar_one_or_none()
    if not battle:
        return None

    mod = await db.get(Module, battle.module_id)
    creator = await db.get(User, battle.creator_id)
    opponent = await db.get(User, battle.opponent_id) if battle.opponent_id else None

    return {
        **_battle_dict(battle, current_user.id,
                       module_title=mod.title if mod else "",
                       creator_name=creator.full_name if creator else ""),
        "module_emoji": mod.emoji if mod else "📚",
        "opponent_name": opponent.full_name if opponent else None,
        "opponent_photo": opponent.photo_url if opponent else None,
        "creator_photo": creator.photo_url if creator else None,
    }


# ── Battle status (poll) ────────────────────────────────────────────────────

@router.get("/{battle_id}/status")
async def get_battle_status(
    battle_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Battle holati va savollar"""
    battle = await db.get(Battle, battle_id)
    if not battle:
        raise HTTPException(404, "Battle topilmadi")

    is_participant = battle.creator_id == current_user.id or battle.opponent_id == current_user.id
    if not is_participant:
        raise HTTPException(403, "Bu battlega ruxsat yo'q")

    mod = await db.get(Module, battle.module_id)
    creator = await db.get(User, battle.creator_id)
    opponent = await db.get(User, battle.opponent_id) if battle.opponent_id else None

    # Get questions with details (only when active/finished)
    questions = []
    if battle.status in ("active", "finished") and battle.question_ids:
        qs_res = await db.execute(
            select(Question).where(Question.id.in_(battle.question_ids))
        )
        qs = {q.id: q for q in qs_res.scalars().all()}
        # Keep the order from battle.question_ids
        questions = [
            {
                "id": qs[qid].id,
                "question_text": qs[qid].question_text,
                "options": qs[qid].options,
                # don't reveal correct_answer during active
                "correct_answer": qs[qid].correct_answer if battle.status == "finished" else None,
            }
            for qid in battle.question_ids if qid in qs
        ]

    # My answers
    my_answers_res = await db.execute(
        select(BattleAnswer).where(
            BattleAnswer.battle_id == battle_id,
            BattleAnswer.user_id == current_user.id,
        )
    )
    my_answers = {a.question_id: a.selected_answer for a in my_answers_res.scalars().all()}

    winner = None
    if battle.winner_id:
        w = await db.get(User, battle.winner_id)
        winner = w.full_name if w else None

    return {
        **_battle_dict(battle, current_user.id,
                       module_title=mod.title if mod else "",
                       creator_name=creator.full_name if creator else ""),
        "module_emoji": mod.emoji if mod else "📚",
        "creator_photo": creator.photo_url if creator else None,
        "opponent_name": opponent.full_name if opponent else None,
        "opponent_photo": opponent.photo_url if opponent else None,
        "questions": questions,
        "my_answers": my_answers,
        "answered_count": len(my_answers),
        "winner_name": winner,
    }


# ── Submit answer ───────────────────────────────────────────────────────────

@router.post("/{battle_id}/answer")
async def submit_answer(
    battle_id: int,
    data: AnswerSubmit,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Javob yuborish"""
    battle = await db.get(Battle, battle_id)
    if not battle or battle.status != "active":
        raise HTTPException(400, "Battle active emas")

    is_participant = battle.creator_id == current_user.id or battle.opponent_id == current_user.id
    if not is_participant:
        raise HTTPException(403, "Ruxsat yo'q")

    if data.question_id not in (battle.question_ids or []):
        raise HTTPException(400, "Bu savol ushbu battlega tegishli emas")

    # Prevent duplicate answer
    existing = await db.execute(
        select(BattleAnswer).where(
            BattleAnswer.battle_id == battle_id,
            BattleAnswer.user_id == current_user.id,
            BattleAnswer.question_id == data.question_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Bu savolga allaqachon javob berilgan")

    # Check correct
    q = await db.get(Question, data.question_id)
    is_correct = q.correct_answer.strip().lower() == data.selected_answer.strip().lower() if q else False

    answer = BattleAnswer(
        battle_id=battle_id,
        user_id=current_user.id,
        question_id=data.question_id,
        selected_answer=data.selected_answer,
        is_correct=is_correct,
    )
    db.add(answer)

    # Update score
    if is_correct:
        if battle.creator_id == current_user.id:
            battle.creator_score += 1
        else:
            battle.opponent_score += 1

    await db.commit()

    # Check if both finished all questions
    total_qs = len(battle.question_ids or [])
    creator_count_res = await db.execute(
        select(func.count(BattleAnswer.id)).where(
            BattleAnswer.battle_id == battle_id,
            BattleAnswer.user_id == battle.creator_id,
        )
    )
    opponent_count_res = await db.execute(
        select(func.count(BattleAnswer.id)).where(
            BattleAnswer.battle_id == battle_id,
            BattleAnswer.user_id == battle.opponent_id,
        )
    )
    creator_done = creator_count_res.scalar() >= total_qs
    opponent_done = opponent_count_res.scalar() >= total_qs

    if creator_done and opponent_done:
        await _finish_battle(battle, db)

    return {"is_correct": is_correct, "battle_finished": battle.status == "finished"}


async def _finish_battle(battle: Battle, db: AsyncSession):
    """Battle ni yakunlash va XP berish"""
    battle.status = "finished"
    battle.finished_at = datetime.utcnow()

    if battle.creator_score > battle.opponent_score:
        battle.winner_id = battle.creator_id
    elif battle.opponent_score > battle.creator_score:
        battle.winner_id = battle.opponent_id
    else:
        battle.winner_id = None  # Draw

    if battle.winner_id:
        winner = await db.get(User, battle.winner_id)
        if winner:
            winner.total_xp += battle.xp_reward
            xp_log = XPHistory(
                user_id=winner.id,
                amount=battle.xp_reward,
                source="battle",
                description=f"Battle g'olibi"
            )
            db.add(xp_log)

    await db.commit()


# ── Cancel battle ───────────────────────────────────────────────────────────

@router.post("/{battle_id}/cancel")
async def cancel_battle(
    battle_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Lobbyni bekor qilish"""
    battle = await db.get(Battle, battle_id)
    if not battle:
        raise HTTPException(404, "Topilmadi")
    if battle.creator_id != current_user.id:
        raise HTTPException(403, "Faqat lobby yaratuvchisi bekor qila oladi")
    if battle.status != "waiting":
        raise HTTPException(400, "Faqat kutish holatidagi lobby bekor qilinadi")

    battle.status = "cancelled"
    await db.commit()
    return {"success": True}


# ── History ─────────────────────────────────────────────────────────────────

@router.get("/history")
async def get_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Oxirgi 10 ta battle natijasi"""
    res = await db.execute(
        select(Battle).where(
            or_(
                Battle.creator_id == current_user.id,
                Battle.opponent_id == current_user.id,
            ),
            Battle.status == "finished"
        ).order_by(Battle.finished_at.desc()).limit(10)
    )
    battles = res.scalars().all()
    result = []
    for b in battles:
        mod = await db.get(Module, b.module_id)
        opponent_id = b.opponent_id if b.creator_id == current_user.id else b.creator_id
        opp = await db.get(User, opponent_id) if opponent_id else None
        my_score = b.creator_score if b.creator_id == current_user.id else b.opponent_score
        opp_score = b.opponent_score if b.creator_id == current_user.id else b.creator_score
        result.append({
            "id": b.id,
            "module_title": mod.title if mod else "",
            "module_emoji": mod.emoji if mod else "📚",
            "opponent_name": opp.full_name if opp else "Raqib",
            "my_score": my_score,
            "opponent_score": opp_score,
            "won": b.winner_id == current_user.id,
            "draw": b.winner_id is None,
            "finished_at": b.finished_at.isoformat() if b.finished_at else None,
        })
    return result
