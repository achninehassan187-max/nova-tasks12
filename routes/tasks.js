const express = require('express');
const router = express.Router();
const path = require('path');
const GmailTask = require(path.join(__dirname, '../models/GmailTask'));
const ShortlinkTask = require(path.join(__dirname, '../models/ShortlinkTask'));
const SpecialTask = require(path.join(__dirname, '../models/SpecialTask'));
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

// الحصول على مهام Gmail المتاحة
router.get('/gmail/available', async (req, res) => {
  try {
    const tasks = await GmailTask.find({ status: 'available' }).limit(20);
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: 'خطأ: ' + error.message });
  }
});

// حجز مهمة Gmail
router.post('/gmail/reserve/:taskId', verifyToken, async (req, res) => {
  try {
    const task = await GmailTask.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'المهمة غير موجودة' });
    if (task.status !== 'available') return res.status(400).json({ error: 'المهمة غير متاحة' });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 1000 * 60 * 60); // ساعة واحدة

    task.status = 'reserved';
    task.reservedBy = req.userId;
    task.reservedAt = now;
    task.reservationExpires = expiresAt;

    await task.save();

    res.json({
      message: 'تم حجز المهمة بنجاح',
      task,
      expiresAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ: ' + error.message });
  }
});

// تأكيد إتمام مهمة Gmail
router.post('/gmail/submit/:taskId', verifyToken, async (req, res) => {
  try {
    const task = await GmailTask.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'المهمة غير موجودة' });
    if (task.status !== 'reserved' || task.reservedBy.toString() !== req.userId) {
      return res.status(400).json({ error: 'لا يمكنك تقديم هذه المهمة' });
    }

    task.status = 'submitted';
    task.submittedBy = req.userId;
    task.submittedAt = new Date();

    await task.save();

    // إضافة الرصيد إلى Escrow Balance
    const user = await User.findById(req.userId);
    user.escrowBalance += task.reward;
    await user.save();

    res.json({
      message: 'تم تقديم المهمة بنجاح',
      reward: task.reward,
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ: ' + error.message });
  }
});

// الحصول على مهام Shortlink
router.get('/shortlink/available', async (req, res) => {
  try {
    const tasks = await ShortlinkTask.find({ status: 'active' }).limit(10);
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: 'خطأ: ' + error.message });
  }
});

// الحصول على مهام خاصة
router.get('/special/available', async (req, res) => {
  try {
    const tasks = await SpecialTask.find({ status: 'active' }).limit(10);
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: 'خطأ: ' + error.message });
  }
});

// تقديم مهمة خاصة
router.post('/special/submit/:taskId', verifyToken, async (req, res) => {
  try {
    const { userHandle, screenshot } = req.body;
    const task = await SpecialTask.findById(req.params.taskId);
    
    if (!task) return res.status(404).json({ error: 'المهمة غير موجودة' });

    task.submissions.push({
      userId: req.userId,
      userHandle,
      screenshotUrl: screenshot,
      submittedAt: new Date(),
    });

    await task.save();

    // إضافة الرصيد إلى Escrow Balance
    const user = await User.findById(req.userId);
    user.escrowBalance += task.reward;
    await user.save();

    res.json({
      message: 'تم تقديم المهمة بنجاح',
      reward: task.reward,
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ: ' + error.message });
  }
});

module.exports = router;