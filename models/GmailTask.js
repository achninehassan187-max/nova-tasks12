const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const gmailTaskSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    targetEmail: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      day: Number,
      month: Number,
      year: Number,
    },
    reward: {
      type: Number,
      required: true,
      default: 0.3,
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'submitted', 'approved', 'rejected'],
      default: 'available',
      index: true,
    },
    reservedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reservedAt: Date,
    reservationExpires: Date,
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    submittedAt: Date,
    approvedAt: Date,
    rejectionReason: String,
    rejectedAt: Date,
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

gmailTaskSchema.index({ status: 1, reservedBy: 1 });
gmailTaskSchema.index({ targetEmail: 1 });

module.exports = mongoose.model('GmailTask', gmailTaskSchema);
