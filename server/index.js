const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const app = express();

// Check if environment variables are loaded correctly
if (!process.env.MONGO_URL) {
  console.error('MONGO_URL is not set in .env file');
  process.exit(1); // Exit if environment variable is missing
}

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Database is connected'))
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1); // Exit if database connection fails
  });

app.use(express.json({ limit: '10mb' }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));



app.use(cors({
  credentials: true,
  origin: 'http://localhost:5173', // Frontend URL
}));

// Import and use routes
app.use('/', require('./routes/authRoutes')); // Assuming routes are correctly set up

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)});

