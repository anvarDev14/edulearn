"""
EduLearn Telegram Bot - Web Login Code Generator
"""
import asyncio
import logging
import aiohttp
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart, Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.enums import ParseMode
import os
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://yourdomain.com")
BACKEND_URL = os.getenv("BACKEND_URL", "http://backend:8000")

bot = Bot(token=BOT_TOKEN, parse_mode=ParseMode.HTML)
dp = Dispatcher()

logging.basicConfig(level=logging.INFO)


async def get_login_code(telegram_id: int, username: str, full_name: str) -> str | None:
    """Get login code from backend API"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{BACKEND_URL}/api/auth/generate-code",
                json={
                    "telegram_id": telegram_id,
                    "username": username,
                    "full_name": full_name
                }
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data.get("code")
    except Exception as e:
        logging.error(f"Backend error: {e}")
    return None


@dp.message(CommandStart())
async def cmd_start(message: types.Message):
    """Start command — generate login code"""
    user = message.from_user
    full_name = f"{user.first_name or ''} {user.last_name or ''}".strip()

    code = await get_login_code(user.id, user.username or "", full_name)

    if code:
        # Format code as XXX-XXX
        formatted = f"{code[:3]}-{code[3:]}"

        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🌐 Saytga o'tish", url=WEBAPP_URL)],
        ])

        await message.answer(
            f"👋 Salom, <b>{user.first_name}</b>!\n\n"
            f"🎓 <b>EduLearn</b> platformasiga xush kelibsiz!\n\n"
            f"🔑 Saytga kirish uchun kod:\n\n"
            f"<code>  {formatted}  </code>\n\n"
            f"⏱ Kod <b>10 daqiqa</b> davomida amal qiladi.\n"
            f"🔒 Kodni hech kimga bermang!\n\n"
            f"📱 Saytga o'ting va ushbu kodni kiriting:",
            reply_markup=keyboard
        )
    else:
        await message.answer(
            f"👋 Salom, <b>{user.first_name}</b>!\n\n"
            f"⚠️ Hozirda server bilan bog'lanishda muammo bor.\n"
            f"Bir oz kutib, qayta urinib ko'ring."
        )


@dp.message(Command("code"))
async def cmd_code(message: types.Message):
    """Generate new login code"""
    user = message.from_user
    full_name = f"{user.first_name or ''} {user.last_name or ''}".strip()

    code = await get_login_code(user.id, user.username or "", full_name)

    if code:
        formatted = f"{code[:3]}-{code[3:]}"
        await message.answer(
            f"🔑 Yangi kirish kodi:\n\n"
            f"<code>  {formatted}  </code>\n\n"
            f"⏱ Kod <b>10 daqiqa</b> amal qiladi."
        )
    else:
        await message.answer("⚠️ Kod yaratishda xato. Qayta urinib ko'ring.")


@dp.message()
async def echo(message: types.Message):
    """Handle all other messages"""
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🔑 Kirish kodi olish", callback_data="get_code")],
        [InlineKeyboardButton(text="🌐 Saytga o'tish", url=WEBAPP_URL)],
    ])
    await message.answer(
        "📚 <b>EduLearn</b> — o'quv platformasi\n\n"
        "Saytga kirish uchun <b>/start</b> yoki <b>/code</b> buyrug'ini yuboring:",
        reply_markup=keyboard
    )


@dp.callback_query(lambda c: c.data == "get_code")
async def callback_get_code(callback: types.CallbackQuery):
    user = callback.from_user
    full_name = f"{user.first_name or ''} {user.last_name or ''}".strip()
    code = await get_login_code(user.id, user.username or "", full_name)

    if code:
        formatted = f"{code[:3]}-{code[3:]}"
        await callback.message.answer(
            f"🔑 Kirish kodi:\n\n"
            f"<code>  {formatted}  </code>\n\n"
            f"⏱ Kod <b>10 daqiqa</b> amal qiladi."
        )
    else:
        await callback.message.answer("⚠️ Xato yuz berdi. Qayta urinib ko'ring.")

    await callback.answer()


async def main():
    print("🤖 EduLearn Bot ishga tushdi!")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
