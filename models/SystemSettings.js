const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema(
  {
    settingName: {
      type: String,
      unique: true,
      required: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maintenanceMessage: String,
    referralBonus: {
      type: Number,
      default: 0.01,
    },
    referralTasksRequired: {
      type: Number,
      default: 1,
    },
    telegramGroupLink: {
      type: String,
      default: 'https://t.me/+UgyTaWw0MMU4ZDA0',
    },
    telegramGroupBonus: {
      type: Number,
      default: 0.02,
    },
    gmailLockDuration: {
      type: Number,
      default: 3600000,
    },
    gmailVelocityLimit: {
      type: Number,
      default: 5,
    },
    gmailVelocityWindow: {
      type: Number,
      default: 172800000,
    },
    minimumWithdrawal: {
      type: Number,
      default: 0.45,
    },
    paymentMethods: {
      usdt: { type: Boolean, default: true },
      novabot: { type: Boolean, default: true },
      stars: { type: Boolean, default: true },
    },
    paymentMethodsDisabledReason: String,
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

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
