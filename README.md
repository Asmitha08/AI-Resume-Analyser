# 🧠 AI Resume Analyzer & ATS Optimizer

A professional, full-stack AI-powered Resume Analyzer designed to help job seekers (especially interns and entry-level developers) optimize their resumes for Applicant Tracking Systems (ATS). Using OpenAI's GPT-4o, the app provides deep insights into how well a resume matches a specific job description.

## 🚀 Key Features

*   **📊 Advanced ATS Scoring**: Get an overall match percentage along with a detailed **Match Breakdown** (Skills, Experience, and Education scores).
*   **👁️ Real-time PDF Preview**: Upload your resume and view it side-by-side with your analysis results instantly.
*   **🧠 Deep AI Insights**: Categorized feedback identifying **Strengths**, **Improvements**, and **Actionable Suggestions**.
*   **⚠️ Missing Keyword Detection**: Automatically identifies crucial keywords and skills missing from your resume that are required by the job description.
*   **📈 Progress Tracking**: A visual dashboard showing your score progression over time and analytics on your top skills.
*   **📄 Downloadable Reports**: Export your AI analysis into a professional, printable PDF report with one click.
*   **✨ Modern Glassmorphism UI**: A sleek, responsive, and high-performance interface built with React and Vanilla CSS.

## 🛠️ Tech Stack

*   **Frontend**: React.js, Vite, Chart.js, React Router
*   **Backend**: Node.js, Express
*   **Database**: PostgreSQL (via Prisma ORM)
*   **AI Engine**: OpenAI API (GPT-3.5/GPT-4o)
*   **Auth**: JSON Web Tokens (JWT) & Bcrypt
*   **File Handling**: Multer & PDF-Parse

## ⚡ Quick Start

### 1. Prerequisites
*   Node.js installed
*   PostgreSQL database running
*   OpenAI API Key

### 2. Backend Setup
```bash
cd server
npm install
# Create a .env file with:
# PORT=5000
# DATABASE_URL="postgresql://user:password@localhost:5432/db_name"
# JWT_SECRET="your_secret_key"
# OPENAI_API_KEY="your_openai_key"

npx prisma db push
npx prisma generate
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

## 📸 Preview
*(Tip: Add a screenshot of your Dashboard and Analysis page here to make your repo stand out!)*

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
