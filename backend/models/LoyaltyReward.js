const mongoose = require('mongoose');

const loyaltyRewardSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pointsEarned: { type: Number, required: true },
    reason: { type: String, required: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

module.exports = mongoose.model('LoyaltyReward', loyaltyRewardSchema);
