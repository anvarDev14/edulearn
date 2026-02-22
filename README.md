# 🎓 EduLearn - Gamified Learning Platform

Telegram Mini App asosida o'quv platformasi.

## 🚀 Features

- 📚 **Modullar va Darslar** - Video va matnli kontent
- 📝 **Quiz System** - Savol-javob tizimi
- 🎮 **Gamification** - XP, Level, Badges, Leaderboard
- 👑 **Premium System** - Chek orqali to'lov
- 📰 **News Feed** - Yangiliklar
- 👔 **Admin Panel** - To'liq boshqaruv

## 🛠 Tech Stack

- **Backend**: FastAPI + SQLite
- **Frontend**: React + Tailwind CSS
- **Bot**: Aiogram 3.x
- **Deployment**: Docker

## 📦 Installation

### 1. Clone
```bash
git clone https://github.com/your/edulearn.git
cd edulearn
```

### 2. Environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Docker
```bash
docker-compose up -d --build
```

### 4. Access
- Frontend: http://localhost:3000
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📁 Project Structure

```
edulearn/
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── api/       # API endpoints
│   │   ├── core/      # XP, Level engines
│   │   ├── models/    # Database models
│   │   └── main.py
│   └── Dockerfile
├── frontend/          # React Mini App
│   ├── src/
│   │   ├── api/       # API client
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── App.jsx
│   └── Dockerfile
├── bot/               # Telegram Bot
│   └── app/bot.py
├── nginx/
├── docker-compose.yml
└── .env.example
```

## 🎮 XP & Level System

### XP Sources
- Dars tugatish: 50 XP
- Quiz: (to'g'ri/jami) × 100 XP
- Perfect score bonus: +50 XP
- Daily challenge: 25 XP + streak bonus

### Level Formula
```
XP = 100 × (level ^ 1.5)
```

## 💳 Premium System

1. User Premium sahifasiga kiradi
2. Karta raqamga pul o'tkazadi
3. Chek screenshot yuklaydi
4. Admin tasdiqlaydi
5. User Premium bo'ladi

## 📝 License

MIT License

## 👤 Author

Created with ❤️ for Oriental University
