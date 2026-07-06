const express = require('express');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, async (req, res, next) => {
  try {
    const review = await Review.create({ ...req.body, userId: req.user._id });
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
});

router.get('/restaurant/:restaurantId', async (req, res, next) => {
  try {
    const reviews = await Review.find({ restaurantId: req.params.restaurantId }).populate('userId', 'name profileImage');
    res.json(reviews);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    await Review.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
