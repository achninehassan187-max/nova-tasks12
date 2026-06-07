const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB متصل بالفعل');
      return;
    }

    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ اتصال MongoDB بنجاح');
  } catch (error) {
    console.error('❌ خطأ في الاتصال بـ MongoDB:', error.message);
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
