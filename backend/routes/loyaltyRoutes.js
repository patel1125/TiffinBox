const express = require("express");
const mongoose = require("mongoose");

const LoyaltyReward = require("../models/LoyaltyReward");
const User = require("../models/User");
const { protect, authorizeRoles } = require("../middleware/auth");

const router = express.Router();


router.get(
  "/my-rewards",
  protect,
  async (req, res, next) => {
    try {
      const rewards = await LoyaltyReward.find({
        userId: req.user._id,
      }).sort({
        createdAt: -1,
      });

      res.json({
        success: true,
        count: rewards.length,
        data: rewards,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  async (req, res, next) => {
    try {
      const { userId, pointsEarned, reason } = req.body;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid User ID",
        });
      }

      if (
        !Number.isInteger(pointsEarned) ||
        pointsEarned <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Points must be a positive integer",
        });
      }

      if (!reason || !reason.trim()) {
        return res.status(400).json({
          success: false,
          message: "Reward reason is required",
        });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const reward = await LoyaltyReward.create({
        userId,
        pointsEarned,
        reason: reason.trim(),
      });

      user.loyaltyPoints += pointsEarned;

      await user.save();

      res.status(201).json({
        success: true,
        message: "Loyalty points awarded successfully",
        data: reward,
      });
    } catch (err) {
      next(err);
    }
  }
);


router.get(
  "/my-points",
  protect,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id).select(
        "loyaltyPoints"
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        loyaltyPoints: user.loyaltyPoints,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;