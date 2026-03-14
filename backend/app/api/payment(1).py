"""
Payment API
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
import os
import uuid

from app.database import get_db
from app.models.user import User
from app.models.payment import Payment
from app.api.deps import get_current_user, get_current_admin
from app.config import settings

router = APIRouter()

PLAN_PRICES = {
    "monthly": settings.MONTHLY_PRICE,
    "yearly": settings.YEARLY_PRICE
}

PLAN_DURATIONS = {
    "monthly": 30,
    "yearly": 365
}


class PaymentRequest(BaseModel):
    plan_type: str
    screenshot_url: str


class PaymentReview(BaseModel):
    approved: bool
    note: Optional[str] = None


@router.get("/plans")
async def get_plans():
    """Premium tariflar"""
    return {
        "plans": [
            {
                "type": "monthly",
                "name": "Oylik",
                "price": PLAN_PRICES["monthly"],
                "price_formatted": f"{PLAN_PRICES['monthly']:,} so'm",
                "duration": "30 kun",
                "features": [
                    "✅ Barcha darslar",
                    "✅ Barcha quizlar",
                    "✅ Premium badge",
                    "✅ Priority support"
                ]
            },
            {
                "type": "yearly",
                "name": "Yillik",
                "price": PLAN_PRICES["yearly"],
                "price_formatted": f"{PLAN_PRICES['yearly']:,} so'm",
                "duration": "365 kun",
                "discount": "17%",
                "features": [
                    "✅ Barcha darslar",
                    "✅ Barcha quizlar",
                    "✅ Premium badge",
                    "✅ Priority support",
                    "✅ 2 oy bepul!"
                ]
            }
        ],
        "payment_info": {
            "card_number": settings.PAYMENT_CARD,
            "card_holder": settings.PAYMENT_HOLDER,
            "admin_username": settings.ADMIN_USERNAME
        }
    }


@router.post("/upload-screenshot")
async def upload_screenshot(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Screenshot yuklash"""
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "Faqat rasm yuklash mumkin")
    
    # Create uploads directory
    upload_dir = "uploads/payments"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{current_user.id}_{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(upload_dir, filename)
    
    # Save file
    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)
    
    return {"url": filepath}


@router.post("/request")
async def create_payment_request(
    data: PaymentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """To'lov so'rovi yaratish"""
    if data.plan_type not in PLAN_PRICES:
        raise HTTPException(400, "Noto'g'ri tarif turi")
    
    # Check pending payments
    result = await db.execute(
        select(Payment)
        .where(and_(
            Payment.user_id == current_user.id,
            Payment.status == "pending"
        ))
    )
    pending = result.scalar_one_or_none()
    
    if pending:
        raise HTTPException(400, "Sizda tekshirilayotgan to'lov bor")
    
    payment = Payment(
        user_id=current_user.id,
        amount=PLAN_PRICES[data.plan_type],
        plan_type=data.plan_type,
        screenshot_url=data.screenshot_url,
        status="pending"
    )
    db.add(payment)
    await db.commit()
    await db.refresh(payment)
    
    return {
        "payment_id": payment.id,
        "status": "pending",
        "message": "To'lov tekshirilmoqda. Tez orada natija bildiriladi."
    }


@router.get("/status")
async def get_payment_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Premium status"""
    # Check if premium expired
    if current_user.is_premium and current_user.premium_until:
        if current_user.premium_until < datetime.utcnow():
            current_user.is_premium = False
            await db.commit()
    
    days_remaining = 0
    if current_user.is_premium and current_user.premium_until:
        days_remaining = (current_user.premium_until - datetime.utcnow()).days
    
    # Get latest payment
    result = await db.execute(
        select(Payment)
        .where(Payment.user_id == current_user.id)
        .order_by(Payment.created_at.desc())
        .limit(1)
    )
    latest_payment = result.scalar_one_or_none()
    
    return {
        "is_premium": current_user.is_premium,
        "premium_until": current_user.premium_until.isoformat() if current_user.premium_until else None,
        "days_remaining": max(0, days_remaining),
        "expiring_soon": 0 < days_remaining <= 3,
        "latest_payment": {
            "id": latest_payment.id,
            "status": latest_payment.status,
            "plan_type": latest_payment.plan_type,
            "created_at": latest_payment.created_at.isoformat()
        } if latest_payment else None
    }


# Admin endpoints
@router.get("/admin/pending")
async def get_pending_payments(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Kutilayotgan to'lovlar"""
    result = await db.execute(
        select(Payment)
        .where(Payment.status == "pending")
        .order_by(Payment.created_at.desc())
    )
    payments = result.scalars().all()
    
    payments_data = []
    for p in payments:
        # Get user
        user_result = await db.execute(select(User).where(User.id == p.user_id))
        user = user_result.scalar_one_or_none()
        
        payments_data.append({
            "id": p.id,
            "user": {
                "id": user.id,
                "username": user.username,
                "full_name": user.full_name
            } if user else None,
            "amount": p.amount,
            "plan_type": p.plan_type,
            "screenshot_url": p.screenshot_url,
            "created_at": p.created_at.isoformat()
        })
    
    return payments_data


@router.post("/admin/{payment_id}/review")
async def review_payment(
    payment_id: int,
    data: PaymentReview,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """To'lovni ko'rib chiqish"""
    result = await db.execute(select(Payment).where(Payment.id == payment_id))
    payment = result.scalar_one_or_none()
    
    if not payment:
        raise HTTPException(404, "To'lov topilmadi")
    
    if payment.status != "pending":
        raise HTTPException(400, "To'lov allaqachon ko'rib chiqilgan")
    
    payment.status = "approved" if data.approved else "rejected"
    payment.reviewed_by = admin.id
    payment.reviewed_at = datetime.utcnow()
    payment.admin_note = data.note
    
    if data.approved:
        # Grant premium
        user_result = await db.execute(select(User).where(User.id == payment.user_id))
        user = user_result.scalar_one_or_none()
        
        if user:
            duration_days = PLAN_DURATIONS[payment.plan_type]
            user.is_premium = True
            user.premium_until = datetime.utcnow() + timedelta(days=duration_days)
    
    await db.commit()
    
    return {
        "success": True,
        "status": payment.status,
        "message": "To'lov tasdiqlandi" if data.approved else "To'lov rad etildi"
    }
