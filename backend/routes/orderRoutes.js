const express = require('express');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Cart = require('../models/Cart');
const { protect, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

const generateOrderNumber = () => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

router.post('/', protect, async (req, res, next) => {
  try {
    const { deliveryAddress } = req.body;
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || cart.items.length === 0) {
      res.status(400);
      throw new Error('Cart is empty');
    }
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      userId: req.user._id,
      restaurantId: cart.restaurantId,
      totalAmount: cart.totalAmount,
      deliveryAddress,
    });
    await Promise.all(
      cart.items.map((item) =>
        OrderItem.create({
          orderId: order._id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
        })
      )
    );
    await Cart.findOneAndDelete({ userId: req.user._id });
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

router.get('/my-orders', protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    const items = await OrderItem.find({ orderId: order._id }).populate('menuItemId');
    res.json({ order, items });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/status', protect, authorizeRoles('restaurantOwner', 'admin', 'deliveryAgent'), async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: req.body.orderStatus }, { new: true });
    res.json(order);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
