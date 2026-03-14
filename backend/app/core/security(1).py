"""
Security - Auth and verification
"""
import hashlib
import hmac
import json
import jwt
from urllib.parse import unquote, parse_qsl
from datetime import datetime, timedelta
from typing import Optional
from app.config import settings


def verify_telegram_webapp(init_data: str) -> Optional[dict]:
    """Telegram WebApp ma'lumotlarini tekshirish"""
    try:
        parsed = dict(parse_qsl(init_data))
        hash_value = parsed.pop('hash', None)
        
        if not hash_value:
            return None
        
        data_check_string = '\n'.join(
            f"{k}={v}" for k, v in sorted(parsed.items())
        )
        
        secret_key = hmac.new(
            b"WebAppData",
            settings.BOT_TOKEN.encode(),
            hashlib.sha256
        ).digest()
        
        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if calculated_hash == hash_value:
            if 'user' in parsed:
                return json.loads(unquote(parsed['user']))
        
        return None
    except Exception as e:
        print(f"Auth verification error: {e}")
        return None


def create_token(user_id: int, expires_delta: timedelta = None) -> str:
    """JWT token yaratish"""
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    expire = datetime.utcnow() + expires_delta
    
    payload = {
        "sub": str(user_id),
        "exp": expire
    }
    
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return token


def verify_token(token: str) -> Optional[int]:
    """JWT tokenni tekshirish"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = int(payload.get("sub"))
        return user_id
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None
