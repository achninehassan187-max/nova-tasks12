const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const dotenv = require('dotenv');

// تحميل المتغيرات البيئية
dotenv.config({ path: path.join(__dirname, '../.env') });

// استيراد قاعدة البيانات
const connectDB = require(path.join(__dirname, '../config/database'));

// استيراد المسارات
const authRoutes = require(path.join(__dirname, '../routes/auth'));
const userRoutes = require(path.join(__dirname, '../routes/user'));
const taskRoutes = require(path.join(__dirname, '../routes/tasks'));
const withdrawalRoutes = require(path.join(__dirname, '../routes/withdrawals'));
const adminRoutes = require(path.join(__dirname, '../routes/admin'));

const app = express();
const PORT = process.env.PORT || 3000;

// اتصال قاعدة البيانات
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 أيام
    },
  })
);

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'سيرفر يعمل بنجاح ✅', timestamp: new Date() });
});

// 404 Error Handler
app.use((req, res) => {
  res.status(404).json({ error: 'المسار غير موجود' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('خطأ:', err.message);
  res.status(500).json({ error: 'حدث خطأ في الخادم' });
});

// Keep-Alive Mechanism
setInterval(async () => {
  try {
    console.log('🔄 Keep-Alive Ping:', new Date().toISOString());
  } catch (error) {
    console.error('خطأ في Keep-Alive:', error);
  }
}, 5 * 60 * 1000); // كل 5 دقائق

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 خادم NOVA GMAIL يعمل على المنفذ: ${PORT}`);
  console.log(`📍 الرابط: http://localhost:${PORT}`);
});

module.exports = app;
