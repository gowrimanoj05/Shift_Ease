const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');

console.log('🔧 Starting ShiftEase Backend...');

// Load env vars
dotenv.config();
console.log('📝 Environment variables loaded');
console.log('MongoDB URI:', process.env.MONGODB_URI);
console.log('Port:', process.env.PORT || 5000);

// Connect to database
connectDB()
  .then(() => {
    console.log('✅ Database connection successful');
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
  });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('✅ Middleware configured');

// Routes
try {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/shifts', require('./routes/shifts'));
  app.use('/api/swap-requests', require('./routes/swapRequests'));
  app.use('/api/gemini', require('./routes/gemini')); // Add this line
  console.log('✅ Routes configured');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
}

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'ShiftEase API is running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});