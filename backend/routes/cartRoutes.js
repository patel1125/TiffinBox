const express = require('express');
const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');
const { protect } = require('../middleware/auth');

const router = express.Router();

const recalcTotal = (cart) => {
  cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

router.get('/', protect, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.menuItemId');
    res.json(cart || { items: [], totalAmount: 0 });
  } catch (error) {
    next(error);
  }
});

router.post('/add', protect, async (req, res, next) => {
  try {
    const { restaurantId, menuItemId, quantity } = req.body;
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      res.status(404);
      throw new Error('Menu item not found');
    }
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, restaurantId, items: [] });
    }
    const existing = cart.items.find((i) => i.menuItemId.toString() === menuItemId);
    if (existing) {
      existing.quantity += quantity || 1;
    } else {
      cart.items.push({ menuItemId, quantity: quantity || 1, price: menuItem.price });
    }
    recalcTotal(cart);
    await cart.save();
    res.status(201).json(cart);
  } catch (error) {
    next(error);
  }
});

router.put('/update', protect, async (req, res, next) => {
  try {
    const { menuItemId, quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      res.status(404);
      throw new Error('Cart not found');
    }
    const item = cart.items.find((i) => i.menuItemId.toString() === menuItemId);
    if (!item) {
      res.status(404);
      throw new Error('Item not in cart');
    }
    item.quantity = quantity;
    recalcTotal(cart);
    await cart.save();
    res.json(cart);
  } catch (error) {
    next(error);
  }
});

router.delete('/remove/:menuItemId', protect, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      res.status(404);
      throw new Error('Cart not found');
    }
    cart.items = cart.items.filter((i) => i.menuItemId.toString() !== req.params.menuItemId);
    recalcTotal(cart);
    await cart.save();
    res.json(cart);
  } catch (error) {
    next(error);
  }
});

router.delete('/clear', protect, async (req, res, next) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user._id });
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
