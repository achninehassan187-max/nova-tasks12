const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    telegramId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      sparse: true,
    },
    email: {
      type: String,
      sparse: true,
    },
    password: {
      type: String,
    },
    mainBalance: {
      type: Number,
      default: 0,
    },
    escrowBalance: {
      type: Number,
      default: 0,
    },
    language: {
      type: String,
      enum: ['ar', 'en', 'ru'],
      default: 'ar',
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark',
    },
    deviceFingerprint: {
      type: String,
      sparse: true,
    },
    ipAddress: {
      type: String,
      sparse: true,
    },
    referralLink: {
      type: String,
      unique: true,
      default: () => 'ref_' + uuidv4().substring(0, 8),
    },
    referrerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    referralCount: {
      type: Number,
      default: 0,
    },
    completedTasksCount: {
      type: Number,
      default: 0,
    },
    joinedTelegramGroup: {
      type: Boolean,
      default: false,
    },
    telegramGroupBonus: {
      type: Number,
      default: 0,
    },
    gmailSubmissions: [
      {
        taskId: mongoose.Schema.Types.ObjectId,
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
        },
        submittedAt: Date,
        reviewedAt: Date,
        rejectionReason: String,
      },
    ],
    shortlinkAttempts: {
      type: Number,
      default: 0,
    },
    shortlinkLocked: {
      type: Boolean,
      default: false,
    },
    withdrawalMethods: {
      usdt: {
        address: String,
      },
      novaBotBalance: {
        username: String,
      },
      telegramStars: {
        enabled: Boolean,
        default: true,
      },
    },
    totalWithdrawn: {
      type: Number,
      default: 0,
    },
    accountBanned: {
      type: Boolean,
      default: false,
    },
    banReason: String,
    lastLogin: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

userSchema.index({ telegramId: 1 });
userSchema.index({ userId: 1 });
userSchema.index({ deviceFingerprint: 1 });
userSchema.index({ ipAddress: 1 });

module.exports = mongoose.model('User', userSchema);
