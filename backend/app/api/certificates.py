"""
Certificates API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import random
import string
from datetime import datetime
from app.database import get_db
from app.models.user import User
from app.models.certificate import Certificate
from app.models.module import Module
from app.models.progress import UserProgress
from app.models.lesson import Lesson
from app.api.deps import get_current_user

router = APIRouter()


def generate_cert_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=12))


@router.get("/")
async def get_my_certificates(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Certificate).where(Certificate.user_id == current_user.id)
        .order_by(Certificate.issued_at.desc())
    )
    certs = result.scalars().all()

    output = []
    for cert in certs:
        module_result = await db.execute(select(Module).where(Module.id == cert.module_id))
        module = module_result.scalar_one_or_none()
        output.append({
            "id": cert.id,
            "certificate_code": cert.certificate_code,
            "score": cert.score,
            "issued_at": cert.issued_at.isoformat(),
            "module": {
                "id": module.id if module else None,
                "title": module.title if module else "Unknown",
                "icon": getattr(module, 'icon', '📚') if module else '📚'
            }
        })
    return output


@router.post("/claim/{module_id}")
async def claim_certificate(
    module_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check if already has certificate
    result = await db.execute(
        select(Certificate).where(
            Certificate.user_id == current_user.id,
            Certificate.module_id == module_id
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Sertifikat allaqachon olindi")

    # Check completion
    lessons_result = await db.execute(
        select(Lesson).where(Lesson.module_id == module_id)
    )
    lessons = lessons_result.scalars().all()

    if not lessons:
        raise HTTPException(status_code=400, detail="Bu modulda darslar yo'q")

    completed = 0
    total_score = 0.0
    for lesson in lessons:
        progress_result = await db.execute(
            select(UserProgress).where(
                UserProgress.user_id == current_user.id,
                UserProgress.lesson_id == lesson.id,
                UserProgress.is_completed == True
            )
        )
        p = progress_result.scalar_one_or_none()
        if p:
            completed += 1
            if p.quiz_score:
                total_score += p.quiz_score

    if completed < len(lessons):
        raise HTTPException(status_code=400, detail="Barcha darslarni tugatmadingiz")

    avg_score = total_score / len(lessons) if lessons else 0

    cert = Certificate(
        user_id=current_user.id,
        module_id=module_id,
        certificate_code=generate_cert_code(),
        score=avg_score,
        issued_at=datetime.utcnow()
    )
    db.add(cert)
    await db.commit()
    await db.refresh(cert)
    return {"message": "Sertifikat olindi!", "certificate_code": cert.certificate_code}
