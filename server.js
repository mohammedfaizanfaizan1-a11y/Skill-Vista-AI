const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./db');
const { User, Scholarship, WellnessLog, CareerPath } = require('./models');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Init DB and seed mock data
sequelize.sync({ force: true }).then(async () => {
  console.log("Database synced");
  
  // Seed Mock Scholarships (Realistic Indian & Global data)
  await Scholarship.bulkCreate([
    { 
      title: "PMSS - Prime Minister's Scholarship Scheme", 
      provider: "National Scholarship Portal", 
      amount: 36000, 
      deadline: new Date("2026-10-31"), 
      eligibility: "Dependent wards / widows of ex-servicemen. Minimum 60% in 12th.", 
      location: "India",
      category: "Government",
      education_level: "Undergraduate",
      application_link: "https://scholarships.gov.in/",
      verified: true
    },
    { 
      title: "Google Anita Borg Memorial Scholarship", 
      provider: "Google", 
      amount: 75000, 
      deadline: new Date("2026-12-05"), 
      eligibility: "Female students pursuing Computer Science or related fields. Strong academic record.", 
      location: "Global",
      category: "Corporate Tech",
      education_level: "Undergraduate/Postgraduate",
      application_link: "https://buildyourfuture.withgoogle.com/scholarships",
      verified: true
    },
    { 
      title: "HDFC Bank Parivartan's ECS Scholarship", 
      provider: "Buddy4Study", 
      amount: 50000, 
      deadline: new Date("2026-08-31"), 
      eligibility: "Meritorious students from underprivileged backgrounds. Family income < 2.5 LPA.", 
      location: "India",
      category: "NGO/Corporate",
      education_level: "School/Undergraduate",
      application_link: "https://www.buddy4study.com/",
      verified: true
    },
    { 
      title: "AICTE - Pragati Scholarship Scheme", 
      provider: "AICTE", 
      amount: 50000, 
      deadline: new Date("2026-11-15"), 
      eligibility: "Girl students admitted to first-year degree/diploma programs.", 
      location: "India",
      category: "Government",
      education_level: "Undergraduate",
      application_link: "https://www.aicte-india.org/",
      verified: true
    }
  ]);

  await User.create({ name: "Demo Student", email: "demo@skillvista.ai", password: "password123", xp: 1250 });
});

// API Routes
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });
  
  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ success: false, message: "Email already in use" });
    
    const user = await User.create({ name: name || "User", email, password, xp: 100 });
    res.json({ success: true, user });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });
  
  try {
    const user = await User.findOne({ where: { email } });
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/scholarships', async (req, res) => {
  const { location, category, interest } = req.query;
  let scholarships = await Scholarship.findAll();

  // Simulated AI Filtering & Ranking Logic
  // In production, this would use OpenAI/LangChain to vectorize user profiles and compare against DB.
  
  let rankedScholarships = scholarships.map(scholarship => {
    let aiMatchScore = 50; // Base score

    // Simulate basic NLP keyword matching
    const profileString = `${location || ''} ${category || ''} ${interest || ''}`.toLowerCase();
    const scholarshipText = `${scholarship.title} ${scholarship.eligibility} ${scholarship.location}`.toLowerCase();
    
    // Increase score based on text similarity
    if (location && scholarshipText.includes(location.toLowerCase())) aiMatchScore += 20;
    if (interest && scholarshipText.includes(interest.toLowerCase())) aiMatchScore += 15;
    if (scholarship.verified) aiMatchScore += 10;
    
    // Random variance for MVP realistic simulation
    aiMatchScore += Math.floor(Math.random() * 5); 
    
    if (aiMatchScore > 99) aiMatchScore = 99;

    return {
      ...scholarship.toJSON(),
      aiMatchScore
    };
  });

  // Sort by highest match score
  rankedScholarships.sort((a, b) => b.aiMatchScore - a.aiMatchScore);

  res.json(rankedScholarships);
});

// Admin Route: Create Scholarship
app.post('/api/scholarships', async (req, res) => {
  try {
    const newScholarship = await Scholarship.create(req.body);
    res.json({ success: true, scholarship: newScholarship });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Route: Delete/Remove Expired Scholarship
app.delete('/api/scholarships/:id', async (req, res) => {
  try {
    await Scholarship.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/user', async (req, res) => {
  const { email } = req.query;
  let user;
  if (email) {
    user = await User.findOne({ where: { email } });
  } else {
    user = await User.findOne();
  }
  res.json(user);
});

app.post('/api/wellness', async (req, res) => {
  const { mood, stress_level } = req.body;
  const user = await User.findOne();
  const log = await WellnessLog.create({ mood, stress_level, date: new Date(), UserId: user.id });
  
  // Basic AI emotional response mock
  let ai_response = "Great to hear you're doing well! Keep it up.";
  if (stress_level > 7) ai_response = "I noticed your stress is high. Consider taking a 15-minute break and practicing some deep breathing.";
  
  res.json({ log, ai_response });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
