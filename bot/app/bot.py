"""
EduLearn Telegram Bot
"""
import asyncio
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from aiogram.enums import ParseMode
import os
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://yourdomain.com")

bot = Bot(token=BOT_TOKEN, parse_mode=ParseMode.HTML)
dp = Dispatcher()

logging.basicConfig(level=logging.INFO)


@dp.message(CommandStart())
async def cmd_start(message: types.Message):
    """Start command handler"""
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="📚 Platformani ochish",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )],
        [InlineKeyboardButton(
            text="📞 Yordam",
            url="https://t.me/edulearn_support"
        )]
    ])
    
    await message.answer(
        f"👋 Salom, <b>{message.from_user.first_name}</b>!\n\n"
        "🎓 <b>EduLearn</b> - gamified o'quv platformasiga xush kelibsiz!\n\n"
        "📱 Platformaga kirish uchun quyidagi tugmani bosing:",
        reply_markup=keyboard
    )


@dp.message()
async def echo(message: types.Message):
    """Handle all other messages"""
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="📚 Platformani ochish",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )]
    ])
    
    await message.answer(
        "📱 Platformaga kirish uchun quyidagi tugmani bosing:",
        reply_markup=keyboard
    )


async def main():
    print("🤖 Bot ishga tushdi!")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
