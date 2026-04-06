require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');

// Initialize app
const app = express();

// Middleware
const corsOptions = {
  origin: [
    'https://ai-career-navigator-sable.vercel.app',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://localhost:3000'
  ],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static Folder Front-end
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api', apiRoutes);
app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
