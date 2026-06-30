const express = require('express');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const DeliveryAgent = require('../models/DeliveryAgent');
const { protect, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', protect, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const [userCount, restaurantCount, orderCount, agentCount] = await Promise.all([
      User.countDocuments(),
      Restaurant.countDocuments(),
      Order.countDocuments(),
      DeliveryAgent.countDocuments(),
    ]);
    res.json({ userCount, restaurantCount, orderCount, agentCount });
  } catch (error) {
    next(error);
  }
});

router.get('/users', protect, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.put('/users/:id/role', protect, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.get('/restaurants', protect, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });
    res.json(restaurants);
  } catch (error) {
    next(error);
  }
});

router.put('/restaurants/:id/toggle-active', protect, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    restaurant.isActive = !restaurant.isActive;
    await restaurant.save();
    res.json(restaurant);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
