const express = require('express');
const LoyaltyReward = require('../models/LoyaltyReward');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/my-rewards', protect, async (req, res, next) => {
  try {
    const rewards = await LoyaltyReward.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(rewards);
  } catch (error) {
    next(error);
  }
});

router.post('/', protect, async (req, res, next) => {
  try {
    const { pointsEarned, reason } = req.body;
    const reward = await LoyaltyReward.create({ userId: req.user._id, pointsEarned, reason });
    await User.findByIdAndUpdate(req.user._id, { $inc: { loyaltyPoints: pointsEarned } });
    res.status(201).json(reward);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
