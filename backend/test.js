const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shiftcalendar';

console.log('🔧 Starting ShiftEase Backend...');
console.log('📝 Environment variables loaded');
console.log('MongoDB URI:', MONGODB_URI);
console.log('Port:', PORT);

// Optional: connect to MongoDB asynchronously (does not block server start)
const connectDB = require('./config/database');
connectDB()
.then(() => console.log('✅ Database connection successful'))
.catch(err => console.error('❌ Database connection failed:', err.message));

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log('✅ Middleware configured');

// Routes (wrapped in try/catch to prevent crashing)
try {
app.use('/api/auth', require('./routes/auth'));
app.use('/api/shifts', require('./routes/shifts'));
app.use('/api/swap-requests', require('./routes/swapRequests'));
app.use('/api/dialogflow', require('./routes/dialogflow'));
console.log('✅ Routes configured');
} catch (err) {
console.error('❌ Error loading routes:', err.message);
}

// Health check
app.get('/api/health', (req, res) => {
res.status(200).json({ status: 'OK', message: 'ShiftEase API is running' });
});

// Global error handler
app.use((err, req, res, next) => {
console.error('❌ Server error:', err.stack);
res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server immediately
const server = app.listen(PORT, () => {
console.log(`🚀 Server running on port ${PORT}`);
console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
console.error('❌ Unhandled Rejection:', err.message);
server.close(() => process.exit(1));
});
