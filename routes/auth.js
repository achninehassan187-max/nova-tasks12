const express = require('express');
const router = express.Router();
const path = require('path');
const User = require(path.join(__dirname, '../models/User'));
const GmailTask = require(path.join(__dirname, '../models/GmailTask'));
const ShortlinkTask = require(path.join(__dirname, '../models/ShortlinkTask'));
const SpecialTask = require(path.join(__dirname, '../models/SpecialTask'));
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Middleware للتحقق من JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'لا توجد رموز' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'رمز غير صحيح' });
    req.userId = decoded.userId;
    next();
  });
};

// تسجيل مستخدم جديد
router.post('/register', async (req, res) => {
  try {
    const { telegramId, username, email, password, referralLink } = req.body;
    
    // التحقق من وجود المستخدم
    const existingUser = await User.findOne({ $or: [{ telegramId }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'المستخدم موجود بالفعل' });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء مستخدم جديد
    const newUser = new User({
      telegramId,
      username,
      email,
      password: hashedPassword,
      referrerUserId: referralLink ? await User.findOne({ referralLink }) : null,
    });

    await newUser.save();

    // إنشاء JWT Token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'تم التسجيل بنجاح',
      token,
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في التسجيل: ' + error.message });
  }
});

// تسجيل الدخول
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تسجيل الدخول: ' + error.message });
  }
});

// الحصول على معلومات المستخدم
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'خطأ: ' + error.message });
  }
});

// تحديث الملف الشخصي
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { username, email, language, theme } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { username, email, language, theme },
      { new: true }
    );

    res.json({ message: 'تم التحديث بنجاح', user });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في التحديث: ' + error.message });
  }
});

// الحصول على الرابط الإحالي
router.get('/referral-link', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ referralLink: user.referralLink });
  } catch (error) {
    res.status(500).json({ error: 'خطأ: ' + error.message });
  }
});

// الحصول على معلومات الرصيد
router.get('/balance', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({
      mainBalance: user.mainBalance,
      escrowBalance: user.escrowBalance,
      totalBalance: user.mainBalance + user.escrowBalance,
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ: ' + error.message });
  }
});

module.exports = router;
