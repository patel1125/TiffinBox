const mongoose = require('mongoose');

const tableReservationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    reservationDate: { type: Date, required: true },
    reservationTime: { type: String, required: true },
    numberOfGuests: { type: Number, required: true },
    tableNumber: { type: String },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TableReservation', tableReservationSchema);
