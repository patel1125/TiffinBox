const express = require('express');
const MenuCategory = require('../models/MenuCategory');
const MenuItem = require('../models/MenuItem');
const { protect, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/categories/:restaurantId', async (req, res, next) => {
  try {
    const categories = await MenuCategory.find({ restaurantId: req.params.restaurantId });
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

router.post('/categories', protect, authorizeRoles('restaurantOwner', 'admin'), async (req, res, next) => {
  try {
    const category = await MenuCategory.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

router.delete('/categories/:id', protect, authorizeRoles('restaurantOwner', 'admin'), async (req, res, next) => {
  try {
    await MenuCategory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
});

router.get('/items/:restaurantId', async (req, res, next) => {
  try {
    const items = await MenuItem.find({ restaurantId: req.params.restaurantId });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

router.post('/items', protect, authorizeRoles('restaurantOwner', 'admin'), async (req, res, next) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

router.put('/items/:id', protect, authorizeRoles('restaurantOwner', 'admin'), async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (error) {
    next(error);
  }
});

router.delete('/items/:id', protect, authorizeRoles('restaurantOwner', 'admin'), async (req, res, next) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
