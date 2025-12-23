import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';

const app = express();

// CORS - MUST BE FIRST
// CORS middleware - MUST BE FIRST
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'https://b12-a11-ph-assignment.netlify.app',  // Your Netlify URL
    process.env.CLIENT_URL
  ];
  
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  }
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

app.use(express.json());
app.use(cookieParser());

// Import routes AFTER dotenv is configured
const connectDB = (await import('./config/db.js')).default;
const authRoutes = (await import('./routes/auth.js')).default;
const userRoutes = (await import('./routes/users.js')).default;
const loanRoutes = (await import('./routes/loans.js')).default;
const applicationRoutes = (await import('./routes/applications.js')).default;

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/applications', applicationRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'LoanLink API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});