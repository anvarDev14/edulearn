"""
Level Engine - Level calculation logic
"""
from typing import Tuple


class LevelEngine:
    """
    Level Calculation Engine
    
    Formula: XP = 100 * (level ^ 1.5)
    
    Level thresholds:
    - Level 1:  0 XP
    - Level 2:  100 XP
    - Level 3:  283 XP
    - Level 4:  520 XP
    - Level 5:  800 XP
    - Level 10: 3162 XP
    - Level 20: 8944 XP
    - Level 50: 35355 XP
    """
    
    BASE_XP = 100
    EXPONENT = 1.5
    MAX_LEVEL = 100
    
    # Level badges
    LEVEL_BADGES = {
        1: "🌱",   # Beginner
        5: "🔥",   # Getting started
        10: "🎯",  # Focused
        20: "⭐",  # Star
        30: "🏆",  # Champion
        40: "💎",  # Diamond
        50: "👑",  # Master
    }
    
    def xp_for_level(self, level: int) -> int:
        """Level uchun kerakli XP"""
        if level <= 1:
            return 0
        return int(self.BASE_XP * (level ** self.EXPONENT))
    
    def calculate_level(self, total_xp: int) -> int:
        """XP dan level hisoblash"""
        if total_xp <= 0:
            return 1
        
        level = 1
        while level < self.MAX_LEVEL:
            required_xp = self.xp_for_level(level + 1)
            if total_xp < required_xp:
                break
            level += 1
        
        return level
    
    def xp_to_next_level(self, total_xp: int) -> int:
        """Keyingi levelgacha qancha XP kerak"""
        current_level = self.calculate_level(total_xp)
        if current_level >= self.MAX_LEVEL:
            return 0
        
        next_level_xp = self.xp_for_level(current_level + 1)
        return next_level_xp - total_xp
    
    def level_progress(self, total_xp: int) -> Tuple[int, float]:
        """
        Level va progress foizi
        Returns: (current_level, progress_percentage)
        """
        current_level = self.calculate_level(total_xp)
        if current_level >= self.MAX_LEVEL:
            return (current_level, 100.0)
        
        current_level_xp = self.xp_for_level(current_level)
        next_level_xp = self.xp_for_level(current_level + 1)
        
        xp_in_level = total_xp - current_level_xp
        xp_needed = next_level_xp - current_level_xp
        
        if xp_needed == 0:
            return (current_level, 100.0)
        
        progress = (xp_in_level / xp_needed) * 100
        return (current_level, round(progress, 1))
    
    def get_level_badge(self, level: int) -> str:
        """Level uchun badge emoji"""
        badge = "🌱"
        for lvl, emoji in sorted(self.LEVEL_BADGES.items()):
            if level >= lvl:
                badge = emoji
        return badge
    
    def get_level_title(self, level: int) -> str:
        """Level uchun title"""
        if level >= 50:
            return "Master"
        elif level >= 40:
            return "Diamond"
        elif level >= 30:
            return "Champion"
        elif level >= 20:
            return "Star"
        elif level >= 10:
            return "Focused"
        elif level >= 5:
            return "Rising"
        else:
            return "Beginner"
    
    def get_level_info(self, total_xp: int) -> dict:
        """Complete level info for UI"""
        level, progress = self.level_progress(total_xp)
        current_level_xp = self.xp_for_level(level)
        next_level_xp = self.xp_for_level(level + 1) if level < self.MAX_LEVEL else total_xp
        
        return {
            "level": level,
            "badge": self.get_level_badge(level),
            "title": self.get_level_title(level),
            "total_xp": total_xp,
            "current_level_xp": current_level_xp,
            "next_level_xp": next_level_xp,
            "xp_in_level": total_xp - current_level_xp,
            "xp_needed": next_level_xp - current_level_xp,
            "xp_to_next": self.xp_to_next_level(total_xp),
            "progress": progress,
            "is_max_level": level >= self.MAX_LEVEL
        }
