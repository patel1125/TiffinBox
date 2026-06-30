const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['card', 'upi', 'cod', 'wallet'], required: true },
    transactionId: { type: String },
    paymentStatus: { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
