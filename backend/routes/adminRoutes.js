const express = require("express");
const mongoose = require("mongoose");

const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Order = require("../models/Order");
const DeliveryAgent = require("../models/DeliveryAgent");
const { protect, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

const ALLOWED_ROLES = [
  "customer",
  "restaurantOwner",
  "deliveryAgent",
  "admin",
];



router.get(
  "/stats",
  protect,
  authorizeRoles("admin"),
  async (req, res, next) => {
    try {
      const [
        userCount,
        restaurantCount,
        orderCount,
        agentCount,
        pendingOrders,
        deliveredOrders,
        availableAgents,
      ] = await Promise.all([
        User.countDocuments(),
        Restaurant.countDocuments(),
        Order.countDocuments(),
        DeliveryAgent.countDocuments(),
        Order.countDocuments({ orderStatus: "pending" }),
        Order.countDocuments({ orderStatus: "delivered" }),
        DeliveryAgent.countDocuments({ isAvailable: true }),
      ]);

      res.json({
        success: true,
        data: {
          userCount,
          restaurantCount,
          orderCount,
          agentCount,
          pendingOrders,
          deliveredOrders,
          availableAgents,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);



router.get(
  "/users",
  protect,
  authorizeRoles("admin"),
  async (req, res, next) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const totalUsers = await User.countDocuments();

      const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      res.json({
        success: true,
        page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        count: users.length,
        data: users,
      });
    } catch (err) {
      next(err);
    }
  }
);



router.patch(
  "/users/:id/role",
  protect,
  authorizeRoles("admin"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid User ID",
        });
      }

      if (!ALLOWED_ROLES.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role",
        });
      }

      const user = await User.findByIdAndUpdate(
        id,
        { role },
        {
          new: true,
          runValidators: true,
        }
      ).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        message: "User role updated successfully",
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }
);



router.get(
  "/restaurants",
  protect,
  authorizeRoles("admin"),
  async (req, res, next) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const totalRestaurants = await Restaurant.countDocuments();

      const restaurants = await Restaurant.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      res.json({
        success: true,
        page,
        totalPages: Math.ceil(totalRestaurants / limit),
        totalRestaurants,
        count: restaurants.length,
        data: restaurants,
      });
    } catch (err) {
      next(err);
    }
  }
);



router.patch(
  "/restaurants/:id/status",
  protect,
  authorizeRoles("admin"),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Restaurant ID",
        });
      }

      const restaurant = await Restaurant.findById(id);

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: "Restaurant not found",
        });
      }

      restaurant.isActive = !restaurant.isActive;

      await restaurant.save();

      res.json({
        success: true,
        message: `Restaurant ${
          restaurant.isActive ? "activated" : "deactivated"
        } successfully`,
        data: restaurant,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;