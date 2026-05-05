# 🤖 AI Resume Analyzer

A powerful, full-stack AI application that analyzes resumes against job descriptions to provide a professional ATS (Applicant Tracking System) evaluation. 

![Project Header](https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=1000)

## 🚀 Features

- **AI Analysis**: Uses GPT-4o-mini to perform deep analysis on skills, experience, and education.
- **ATS Scoring**: Provides a weighted ATS score based on technical recruiter criteria.
- **Skill Gap Analysis**: Identifies missing keywords and suggests improvements.
- **Analytics Dashboard**: Tracks your analysis history with interactive charts (Chart.js).
- **Glassmorphism UI**: A premium, modern dark-mode interface.
- **PDF Export**: Download your analysis report as a professional PDF.
- **Secure Auth**: Full user registration and login system.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Chart.js, Vanilla CSS (Glassmorphism).
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL (Supabase).
- **ORM/Client**: Standard `pg` client for maximum stability.
- **AI**: OpenAI GPT-4o-mini API.
- **Deployment**: Vercel.

## ⚙️ Setup Instructions

### Prerequisites
- Node.js installed.
- A Supabase account (PostgreSQL).
- An OpenAI API Key.

### Environment Variables
Create a `.env` file in the `api` directory:
```env
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
```

### Installation
1. Clone the repository.
2. Install dependencies at the root:
   ```bash
   npm install
   ```
3. Sync the database:
   ```bash
   npx prisma db push --schema=api/prisma/schema.prisma
   ```
4. Run locally:
   ```bash
   # Root
   npm run dev
   ```

## 📦 Deployment

This project is configured for one-click deployment on **Vercel**. 

1. Push your code to GitHub.
2. Import the project to Vercel.
3. Add the Environment Variables in the Vercel Dashboard.
4. Deploy!

---
Developed with ❤️ by Asmitha
