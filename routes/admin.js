const express = require('express');
const router = express.Router();
const path = require('path');
const User = require(path.join(__dirname, '../models/User'));
const GmailTask = require(path.join(__dirname, '../models/GmailTask'));
const Withdrawal = require(path.join(__dirname, '../models/Withdrawal'));
const SystemSettings = require(path.join(__dirname, '../models/SystemSettings'));
const jwt = require('jsonwebtoken');

const ADMIN_ID = process.env.ADMIN_ID || '6713604795';

// Middleware للتحقق من الإدارة
const verifyAdmin = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'لا توجد رموز' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'رمز غير صحيح' });
    
    User.findById(decoded.userId).then(user => {
      if (user.telegramId !== ADMIN_ID) {
        return res.status(403).json({ error: 'ليس لديك صلاحيات إدارية' });
      }
      req.userId = decoded.userId;
      next();
    });
  });
};

// لوحة المعلومات
router.get('/dashboard', verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalGmailTasks = await GmailTask.countDocuments();
    const pendingGmailTasks = await GmailTask.countDocuments({ status: 'submitted' });
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });

    res.json({
      totalUsers,
      totalGmailTasks,
      pendingGmailTasks,
      pendingWithdrawals,
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ: ' + error.message });
  }
});

// موافقة على مهمة Gmail
router.post('/gmail/approve/:taskId', verifyAdmin, async (req, res) => {
  try {
    const task = await GmailTask.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'المهمة غير موجودة' });

    const user = await User.findById(task.submittedBy);
    user.escrowBalance -= task.reward;
    user.mainBalance += task.reward;
    user.completedTasksCount += 1;
    await user.save();

    task.status = 'approved';
    task.approvedAt = new Date();
    await task.save();

    res.json({ message: 'تم الموافقة على المهمة بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'خطأ: ' + error.message });
  }
});

// رفض مهمة Gmail
router.post('/gmail/reject/:taskId', verifyAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const task = await GmailTask.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'المهمة غير موجودة' });

    const user = await User.findById(task.submittedBy);
    user.escrowBalance -= task.reward;
    await user.save();

    task.status = 'rejected';
    task.rejectionReason = reason;
    task.rejectedAt = new Date();
    await task.save();

    res.json({ message: 'تم رفض المهمة بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'خطأ: ' + error.message });
  }
});

// موافقة على طلب السحب
router.post('/withdrawal/approve/:withdrawalId', verifyAdmin, async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.withdrawalId);
    if (!withdrawal) return res.status(404).json({ error: 'طلب السحب غير موجود' });

    withdrawal.status = 'completed';
    withdrawal.processedAt = new Date();
    withdrawal.processedBy = req.userId;
    await withdrawal.save();

    res.json({ message: 'تمت الموافقة على طلب السحب بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'خطأ: ' + error.message });
  }
});

// رفض طلب السحب
router.post('/withdrawal/reject/:withdrawalId', verifyAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const withdrawal = await Withdrawal.findById(req.params.withdrawalId);
    if (!withdrawal) return res.status(404).json({ error: 'طلب السحب غير موجود' });

    const user = await User.findById(withdrawal.userId);
    user.mainBalance += withdrawal.amount;
    await user.save();

    withdrawal.status = 'rejected';
    withdrawal.rejectionReason = reason;
    withdrawal.processedAt = new Date();
    withdrawal.processedBy = req.userId;
    await withdrawal.save();

    res.json({ message: 'تم رفض طلب السحب بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'خطأ: ' + error.message });
  }
});

module.exports = router;