# 🎓 EduLearn — Gamified Learning Platform

## Yangiliklar (v2.0)

### 🔐 Yangi Login Tizimi
- **Telegram bot orqali login** — bot `/start` yuborganda 6 raqamli kod beradi
- Saytga kodni kiritib kirish (10 daqiqa amal qiladi)
- Eski Telegram WebApp login o'chirilmadi (backward compat)

### ✨ Yangi Funksiyalar
- 👥 **Friends System** — do'st qo'shish, so'rov yuborish/qabul qilish
- 🔖 **Bookmarks** — dars/kurs/testlarni saqlash
- 📜 **Certificates** — kurs tugatganda sertifikat olish
- 🔍 **Search** — kurs, dars, yangilik, foydalanuvchi qidirish
- 🏅 **Challenges** — kunlik/haftalik topshiriqlar
- 💬 **AI Chat** — AI bilan o'qish bo'yicha suhbat
- 🧠 **AI Explain** — tanlangan matnni AI tushuntiradi

### 📱 Responsive Design
- Telefon, planshet va laptop uchun moslashgan
- Minimalist dark theme
- Smooth animatsiyalar

---

## O'rnatish

### 1. .env fayl yarating
```bash
cp .env.example .env
# .env faylini to'ldiring
```

### 2. Docker bilan ishga tushirish
```bash
docker-compose up -d --build
```

### 3. Frontend (Vercel/Netlify)
```bash
cd frontend
npm install
VITE_API_URL=https://your-backend.com/api npm run build
```

---

## API Endpointlar

### Auth
- `POST /api/auth/generate-code` — Bot tomonidan kod yaratish
- `POST /api/auth/code` — Kod bilan login
- `GET /api/auth/me` — Joriy foydalanuvchi

### Yangi
- `GET/POST /api/friends` — Do'stlar
- `GET/POST /api/bookmarks` — Saqlangan
- `GET /api/certificates` — Sertifikatlar
- `GET /api/search?q=...` — Qidiruv
- `GET /api/challenges` — Topshiriqlar
- `POST /api/ai/chat` — AI Chat
- `POST /api/ai/explain` — AI Tushuntirish
