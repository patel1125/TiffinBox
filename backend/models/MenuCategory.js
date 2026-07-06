const mongoose = require('mongoose');

const menuCategorySchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  categoryName: { type: String, required: true },
});

module.exports = mongoose.model('MenuCategory', menuCategorySchema);
