const express = require('express');
const Restaurant = require('../models/Restaurant');
const { protect, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { cuisine, search } = req.query;
    const filter = { isActive: true };
    if (cuisine) filter.cuisineType = cuisine;
    if (search) filter.restaurantName = { $regex: search, $options: 'i' };
    const restaurants = await Restaurant.find(filter);
    res.json(restaurants);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      res.status(404);
      throw new Error('Restaurant not found');
    }
    res.json(restaurant);
  } catch (error) {
    next(error);
  }
});

router.post('/', protect, authorizeRoles('restaurantOwner', 'admin'), async (req, res, next) => {
  try {
    const restaurant = await Restaurant.create({ ...req.body, ownerId: req.user._id });
    res.status(201).json(restaurant);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', protect, authorizeRoles('restaurantOwner', 'admin'), async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user._id },
      req.body,
      { new: true }
    );
    if (!restaurant) {
      res.status(404);
      throw new Error('Restaurant not found or not owned by you');
    }
    res.json(restaurant);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', protect, authorizeRoles('restaurantOwner', 'admin'), async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
    if (!restaurant) {
      res.status(404);
      throw new Error('Restaurant not found or not owned by you');
    }
    res.json({ message: 'Restaurant deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
