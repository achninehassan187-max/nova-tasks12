const express = require('express');
const router = express.Router();
const path = require('path');
const User = require(path.join(__dirname, '../models/User'));
const jwt = require('jsonwebtoken');

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

// الحصول على معلومات المستخدم الكاملة
router.get('/info', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password')
      .populate('referrerUserId', 'username');

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'خطأ: ' + error.message });
  }
});

// تحديث طريقة الدفع
router.put('/payment-method', verifyToken, async (req, res) => {
  try {
    const { method, address, username } = req.body;
    const user = await User.findById(req.userId);

    if (method === 'usdt') {
      user.withdrawalMethods.usdt.address = address;
    } else if (method === 'novabot') {
      user.withdrawalMethods.novaBotBalance.username = username;
    }

    await user.save();

    res.json({ message: 'تم تحديث طريقة الدفع بنجاح', user });
  } catch (error) {
    res.status(500).json({ error: 'خطأ: ' + error.message });
  }
});

// الحصول على سجل المهام المكتملة
router.get('/my-bookings', verifyToken, async (req, res) => {
  try {
    const GmailTask = require(path.join(__dirname, '../models/GmailTask'));
    const tasks = await GmailTask.find({ reservedBy: req.userId });
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: 'خطأ: ' + error.message });
  }
});

// الحصول على عدد الإحالات الناجحة
router.get('/referrals', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({
      referralCount: user.referralCount,
      referralLink: user.referralLink,
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ: ' + error.message });
  }
});

module.exports = router;