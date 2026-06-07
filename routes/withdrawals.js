const express = require('express');
const router = express.Router();
const path = require('path');
const Withdrawal = require(path.join(__dirname, '../models/Withdrawal'));
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

// طلب سحب أموال
router.post('/request', verifyToken, async (req, res) => {
  try {
    const { amount, method, methodDetails } = req.body;
    const user = await User.findById(req.userId);

    if (amount < 0.45) {
      return res.status(400).json({ error: 'الحد الأدنى للسحب هو $0.45' });
    }

    if (user.mainBalance < amount) {
      return res.status(400).json({ error: 'الرصيد غير كافي' });
    }

    const withdrawal = new Withdrawal({
      userId: req.userId,
      amount,
      method,
      methodDetails,
    });

    await withdrawal.save();

    user.mainBalance -= amount;
    if (!user.withdrawalMethods[method === 'novabot' ? 'novaBotBalance' : method]) {
      if (method === 'usdt') {
        user.withdrawalMethods.usdt.address = methodDetails.address;
      } else if (method === 'novabot') {
        user.withdrawalMethods.novaBotBalance.username = methodDetails.username;
      }
    }
    await user.save();

    res.json({
      message: 'تم تقديم طلب السحب بنجاح',
      withdrawal,
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ: ' + error.message });
  }
});

// الحصول على سجل الانسحابات
router.get('/history', verifyToken, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ withdrawals });
  } catch (error) {
    res.status(500).json({ error: 'خطأ: ' + error.message });
  }
});

module.exports = router;