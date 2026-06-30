const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String },
    reviewPoints: { type: Number, default: 0 },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
