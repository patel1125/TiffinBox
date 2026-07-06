const express = require('express');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const TableReservation = require('../models/TableReservation');
const { protect, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/my-restaurants', protect, authorizeRoles('restaurantOwner', 'admin'), async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find({ ownerId: req.user._id });
    res.json(restaurants);
  } catch (error) {
    next(error);
  }
});

router.get('/orders/:restaurantId', protect, authorizeRoles('restaurantOwner', 'admin'), async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.restaurantId, ownerId: req.user._id });
    if (!restaurant) {
      res.status(404);
      throw new Error('Restaurant not found or not owned by you');
    }
    const orders = await Order.find({ restaurantId: req.params.restaurantId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

router.get('/reservations/:restaurantId', protect, authorizeRoles('restaurantOwner', 'admin'), async (req, res, next) => {
  try {
    const reservations = await TableReservation.find({ restaurantId: req.params.restaurantId }).sort({ reservationDate: -1 });
    res.json(reservations);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
