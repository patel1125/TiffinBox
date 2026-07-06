const express = require('express');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, async (req, res, next) => {
  try {
    const payment = await Payment.create({ ...req.body, userId: req.user._id });
    if (payment.paymentStatus === 'success') {
      await Order.findByIdAndUpdate(payment.orderId, { paymentStatus: 'paid' });
    }
    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
});

router.get('/order/:orderId', protect, async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });
    res.json(payment);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
