# 📘 Teacher Analysis Platform

A web-based platform that empowers teachers with deep insights into student performance. Teachers can create quizzes and essay prompts, students can submit their work, and the platform automatically analyzes results to highlight strengths, weaknesses, and class-wide trends.

Built during **VirtuHack 2025** 🚀

---

## ✨ Features

* 👩‍🏫 **Teacher Dashboard** — create quizzes and essay assignments.
* 🧑‍🎓 **Student Portal** — submit quizzes and essays easily.
* 📊 **Analytics Engine** — automatic insights into student weak areas, strengths, and performance trends.
* 🤖 **AI Feedback** — essay submissions include rubric-based scoring and instant feedback.

---

## 📂 Project Structure

```
root/
├── client/        # Frontend (React/Next.js)
│   ├── pages/
│   ├── components/
│   ├── public/
│   └── package.json
│
├── server/        # Backend (FastAPI + SQLAlchemy)
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── database.py
│   │   └── main.py
│   ├── requirements.txt
│
├── README.md      # Project documentation
└── ...
```

---

## ⚙️ Tech Stack

* **Frontend**: Next.js (React), TailwindCSS, shadcn/ui
* **Backend**: FastAPI, SQLAlchemy, PostgreSQL
* **Auth**: Firebase Authentication
* **AI Feedback**: OpenAI API (essay analysis)

---

## 🔑 Environment Variables


### Backend (`server/.env`)

```env
DATABASE_URL=postgresql://user:password@localhost/dbname
FIREBASE_CREDENTIALS={...}   # Paste the actual Firebase service account JSON here (not the file path)
FIREBASE_API_KEY=
OPENAI_API_KEY=
SECRET_KEY=your-secret-key-here 
```

### Frontend (`client/.env.local`)

```env
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_API_KEY=
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18+)
* Python 3.10+
* PostgreSQL (or SQLite for local testing)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/teacher-analysis-platform.git
cd teacher-analysis-platform
```

### 2. Run the Backend (FastAPI)

```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload
```

Server will be running on: `http://localhost:8000`

### 3. Run the Frontend (Next.js)

```bash
cd client
npm install
npm run dev
```

Frontend will be running on: `http://localhost:3000`

---

## 🧪 Testing the Project

1. Register/login as a **teacher**.
2. Create a quiz or essay assignment.
3. Switch to a **student account** and submit responses.
4. Return to the teacher dashboard to view **analytics & insights**.

---

