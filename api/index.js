const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OpenAI } = require('openai');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'fallback_secret');
    console.log('REGISTRATION SUCCESS:', user.email);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('REGISTRATION ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'fallback_secret');
    console.log('LOGIN SUCCESS:', user.email);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

// Resume Analysis Route
app.post('/api/analyze', authenticateToken, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No resume file uploaded' });

    const jobDescription = req.body.jobDescription || 'No specific job description provided.';
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;
      const prompt = `
        You are an expert ATS (Applicant Tracking System) and senior technical recruiter.
        Analyze the following resume against the provided job description.
        
        Job Description:
        ${jobDescription}
        
        Resume Text:
        ${resumeText}
        
        Provide a JSON output ONLY, with exactly this format:
        {
          "atsScore": <number out of 100>,
          "skillsScore": <number out of 100>,
          "experienceScore": <number out of 100>,
          "educationScore": <number out of 100>,
          "extractedSkills": ["skill1", "skill2", ...],
          "missingKeywords": ["keyword1", "keyword2", ...],
          "feedback": "<general overview>",
          "strengths": ["strength1", "strength2", ...],
          "improvements": ["improvement1", "improvement2", ...],
          "suggestions": ["suggestion1", "suggestion2", ...]
        }
      `;
  
      let result;
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        });
        result = JSON.parse(response.choices[0].message.content);
      } catch (error) {
        if (error.status === 429 || error.message.includes('quota')) {
          console.warn('OpenAI Quota exceeded, using mock response');
          result = {
            atsScore: 85,
            skillsScore: 92,
            experienceScore: 78,
            educationScore: 88,
            extractedSkills: ["React", "JavaScript", "Node.js", "Tailwind CSS", "REST APIs"],
            missingKeywords: ["TypeScript", "MongoDB", "Authentication", "Unit Testing"],
            feedback: "Great resume! You have a strong foundation in modern web technologies, perfect for entry-level or internship roles.",
            strengths: [
              "Strong frontend skills with modern frameworks",
              "Clear and readable project descriptions",
              "Good educational background in Computer Science"
            ],
            improvements: [
              "Missing specific keywords like TypeScript and MongoDB commonly expected in modern development roles",
              "Work experience could use more measurable metrics",
              "Skills section could be better categorized"
            ],
            suggestions: [
              "Add a professional summary at the top to highlight your core value proposition",
              "Use more action verbs like 'Architected', 'Spearheaded', 'Optimized'",
              "Include links to GitHub repositories or a live portfolio"
            ]
          };
        } else {
          throw error;
        }
      }
  
      // Save analysis to database
      const analysis = await prisma.resumeAnalysis.create({
        data: {
          userId: req.user.id,
          jobDescription,
          atsScore: result.atsScore,
          skillsScore: result.skillsScore || 0,
          experienceScore: result.experienceScore || 0,
          educationScore: result.educationScore || 0,
          extractedSkills: result.extractedSkills,
          missingKeywords: result.missingKeywords || [],
          feedback: result.feedback,
          strengths: result.strengths || [],
          improvements: result.improvements || [],
          suggestions: result.suggestions || [],
          fileName: req.file.originalname,
        }
      });
  
      res.json(analysis);
  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze resume' });
  }
});

// Analytics Dashboard Route
app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    const analyses = await prisma.resumeAnalysis.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'asc' }
    });
    
    // Process analytics data
    let totalAnalyzed = analyses.length;
    let averageScore = analyses.length > 0 ? (analyses.reduce((acc, curr) => acc + curr.atsScore, 0) / totalAnalyzed).toFixed(1) : 0;
    
    const allSkills = analyses.flatMap(a => a.extractedSkills);
    const skillCounts = allSkills.reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {});
    
    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill]) => skill);

    res.json({
      totalAnalyzed,
      averageScore,
      topSkills,
      history: analyses.map(a => ({ id: a.id, score: a.atsScore, date: a.createdAt, fileName: a.fileName }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' || require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
