"""
Configuration settings
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/edulearn.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Telegram
    BOT_TOKEN: str = ""
    WEBAPP_URL: str = ""
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    
    # Admin
    ADMIN_IDS: str = ""
    
    # Premium
    MONTHLY_PRICE: int = 50000
    YEARLY_PRICE: int = 500000
    PAYMENT_CARD: str = "8600 1234 5678 9012"
    PAYMENT_HOLDER: str = "EDULEARN"
    ADMIN_USERNAME: str = "@edulearn_admin"
    
    @property
    def admin_ids_list(self) -> List[int]:
        if not self.ADMIN_IDS:
            return []
        return [int(x.strip()) for x in self.ADMIN_IDS.split(",")]
    
    class Config:
        env_file = ".env"


settings = Settings()
