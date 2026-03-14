"""
XP Engine - XP calculation logic
"""
from dataclasses import dataclass


@dataclass
class XPConfig:
    LESSON_BASE_XP: int = 50
    QUIZ_BASE_XP: int = 100
    QUIZ_PERFECT_BONUS: int = 50
    DAILY_CHALLENGE_XP: int = 25
    STREAK_BONUS_PER_DAY: int = 5
    MAX_STREAK_BONUS: int = 50


class XPEngine:
    """
    XP Calculation Engine
    
    XP Sources:
    - Lesson completion: 50 XP (configurable per lesson)
    - Quiz: (correct/total) * 100 XP + perfect bonus
    - Daily challenge: 25 XP + streak bonus
    """
    
    def __init__(self, config: XPConfig = None):
        self.config = config or XPConfig()
    
    def calculate_lesson_xp(self, lesson_xp_reward: int = None) -> int:
        """
        Dars uchun XP hisoblash
        Formula: base_xp + lesson_specific_bonus
        """
        return lesson_xp_reward or self.config.LESSON_BASE_XP
    
    def calculate_quiz_xp(
        self, 
        correct_answers: int, 
        total_questions: int,
        quiz_xp_reward: int = None
    ) -> int:
        """
        Quiz uchun XP hisoblash
        Formula: (correct/total) * base_xp + perfect_bonus
        
        Example:
        - 8/10 to'g'ri: (0.8) * 100 = 80 XP
        - 10/10 to'g'ri: (1.0) * 100 + 50 = 150 XP
        """
        if total_questions == 0:
            return 0
        
        base = quiz_xp_reward or self.config.QUIZ_BASE_XP
        percentage = correct_answers / total_questions
        xp = int(percentage * base)
        
        # Perfect score bonus
        if correct_answers == total_questions:
            xp += self.config.QUIZ_PERFECT_BONUS
        
        return xp
    
    def calculate_daily_challenge_xp(self, streak_days: int = 0) -> int:
        """
        Daily challenge XP + streak bonus
        Formula: base_xp + min(streak * bonus_per_day, max_bonus)
        
        Example:
        - Day 1: 25 + 0 = 25 XP
        - Day 5: 25 + 25 = 50 XP
        - Day 10: 25 + 50 = 75 XP (capped)
        """
        base = self.config.DAILY_CHALLENGE_XP
        streak_bonus = min(
            streak_days * self.config.STREAK_BONUS_PER_DAY,
            self.config.MAX_STREAK_BONUS
        )
        return base + streak_bonus
    
    def get_xp_breakdown(
        self,
        correct_answers: int,
        total_questions: int,
        quiz_xp_reward: int = None
    ) -> dict:
        """Quiz XP breakdown for UI"""
        if total_questions == 0:
            return {"base": 0, "bonus": 0, "total": 0}
        
        base = quiz_xp_reward or self.config.QUIZ_BASE_XP
        percentage = correct_answers / total_questions
        base_xp = int(percentage * base)
        
        bonus = 0
        if correct_answers == total_questions:
            bonus = self.config.QUIZ_PERFECT_BONUS
        
        return {
            "base": base_xp,
            "bonus": bonus,
            "total": base_xp + bonus,
            "percentage": round(percentage * 100, 1)
        }
