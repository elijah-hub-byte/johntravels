# 🚗 John Travels — Full-Stack Flask App

Premium cab booking website for Ravulapalem, Andhra Pradesh.

---

## 📁 Folder Structure
```
john_travels/
├── app.py               ← Flask application factory + all routes
├── config.py            ← Dev / Prod configuration
├── extensions.py        ← SQLAlchemy singleton
├── models.py            ← DB models: Enquiry, ContactMessage, Testimonial, SiteStats
├── wsgi.py              ← Production WSGI entry point
├── Procfile             ← Deployment (Railway / Render / Heroku)
├── requirements.txt     ← Python dependencies
├── .env.example         ← Copy to .env and edit
├── database/
│   └── john_travels.db  ← Auto-created SQLite DB
├── static/
│   ├── css/style.css
│   ├── js/main.js
│   ├── js/translations.js
│   ├── images/          ← swift.png, dzire.png, ertiga.png, innova.png, john.jpeg
│   ├── videos/head.mp4
│   └── manifest.json    ← PWA manifest
└── templates/
    ├── index.html        ← Main website
    └── admin.html        ← Admin panel
```

---

## ⚡ Step-by-Step Local Setup

### 1 — Install Python 3.10+
Download from https://python.org and make sure `python --version` works.

### 2 — Create virtual environment
```bash
cd john_travels
python -m venv venv

# Windows:
venv\Scripts\activate

# Mac / Linux:
source venv/bin/activate
```

### 3 — Install dependencies
```bash
pip install -r requirements.txt
```

### 4 — Create .env file
```bash
cp .env.example .env
# Edit .env and set your SECRET_KEY
```

### 5 — Run the app
```bash
python app.py
```
Open http://localhost:5000 in your browser.

### 6 — Admin panel
Open http://localhost:5000/admin to manage bookings and edit live stats.

---

## 🌐 Deploy to Web (Railway — FREE)

1. Push code to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Set environment variable: `FLASK_ENV=production`
4. Railway auto-detects Procfile and deploys ✅
5. Your site goes live at `https://john-travels.up.railway.app`

---

## 🌐 Deploy to Render (FREE)

1. Push code to GitHub
2. Go to https://render.com → New Web Service
3. Connect your repo
4. Build command: `pip install -r requirements.txt`
5. Start command: `gunicorn wsgi:app`
6. Add env var: `FLASK_ENV=production`
7. Deploy ✅

---

## 📱 Mobile App (PWA)

This app is a **Progressive Web App (PWA)**. Users can install it on their phone:

- **Android:** Open site in Chrome → 3-dot menu → "Add to Home Screen"
- **iPhone:** Open site in Safari → Share → "Add to Home Screen"

The app then works like a native app with an icon on the home screen!

---

## 🔗 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET  | `/` | Main website |
| GET  | `/api/stats` | Get site statistics |
| PUT  | `/api/stats` | Update statistics (admin) |
| POST | `/api/enquiry` | Submit booking enquiry |
| PATCH| `/api/enquiry/<id>` | Update enquiry status |
| DELETE| `/api/enquiry/<id>` | Delete enquiry |
| POST | `/api/contact` | Submit contact message |
| GET  | `/api/testimonials` | Get customer reviews |
| GET  | `/admin` | Admin dashboard |

---

## 📞 Contact Info
- Phone / WhatsApp: **9603689642**
- Location: Ravulapalem, East Godavari, AP
