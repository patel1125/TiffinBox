const mongoose = require('mongoose');

const deliveryAgentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleType: { type: String, enum: ['bike', 'scooter', 'bicycle', 'car'], required: true },
    licenseNumber: { type: String, required: true },
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

deliveryAgentSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('DeliveryAgent', deliveryAgentSchema);
