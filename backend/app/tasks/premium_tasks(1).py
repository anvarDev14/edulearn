"""
Premium background tasks
"""
from datetime import datetime, timedelta
from sqlalchemy import select, and_
from app.database import async_session
from app.models.user import User


async def check_premium_expiry():
    """
    Premium muddati tugayotganlarni tekshirish
    Har kuni 1 marta ishga tushadi
    """
    print("🔄 Premium expiry check boshlandi...")
    
    async with async_session() as db:
        # Muddati tugaganlar
        result = await db.execute(
            select(User)
            .where(and_(
                User.is_premium == True,
                User.premium_until < datetime.utcnow()
            ))
        )
        expired_users = result.scalars().all()
        
        for user in expired_users:
            user.is_premium = False
            print(f"⏰ Premium tugadi: {user.full_name} (ID: {user.id})")
        
        await db.commit()
        print(f"✅ {len(expired_users)} ta userning premiumi o'chirildi")
