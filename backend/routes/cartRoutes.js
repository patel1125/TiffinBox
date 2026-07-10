const express = require("express");
const mongoose = require("mongoose");

const Cart = require("../models/Cart");
const MenuItem = require("../models/MenuItem");
const { protect } = require("../middleware/auth");

const router = express.Router();


const recalculateTotal = (cart) => {
  cart.totalAmount = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
};



router.get("/", protect, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({
      userId: req.user._id,
    }).populate("items.menuItemId");

    return res.json({
      success: true,
      data: cart || {
        items: [],
        totalAmount: 0,
      },
    });
  } catch (err) {
    next(err);
  }
});



router.post("/add", protect, async (req, res, next) => {
  try {
    const { restaurantId, menuItemId, quantity = 1 } = req.body;

    if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Menu Item ID",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero",
      });
    }

    const menuItem = await MenuItem.findById(menuItemId);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    let cart = await Cart.findOne({
      userId: req.user._id,
    });

    if (!cart) {
      cart = new Cart({
        userId: req.user._id,
        restaurantId,
        items: [],
      });
    }

    /* Prevent multiple restaurant cart */

    if (
      cart.restaurantId &&
      cart.restaurantId.toString() !== restaurantId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You can order from only one restaurant at a time. Clear your cart first.",
      });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.menuItemId.toString() === menuItemId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        menuItemId,
        quantity,
        price: menuItem.price,
      });
    }

    recalculateTotal(cart);

    await cart.save();

    await cart.populate("items.menuItemId");

    res.status(201).json({
      success: true,
      message: "Item added to cart",
      data: cart,
    });
  } catch (err) {
    next(err);
  }
});



router.put("/update", protect, async (req, res, next) => {
  try {
    const { menuItemId, quantity } = req.body;

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity cannot be negative",
      });
    }

    const cart = await Cart.findOne({
      userId: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (item) =>
        item.menuItemId.toString() === menuItemId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    if (quantity === 0) {
      cart.items = cart.items.filter(
        (item) =>
          item.menuItemId.toString() !== menuItemId
      );
    } else {
      item.quantity = quantity;
    }

    recalculateTotal(cart);

    await cart.save();

    await cart.populate("items.menuItemId");

    res.json({
      success: true,
      message: "Cart updated",
      data: cart,
    });
  } catch (err) {
    next(err);
  }
});



router.delete(
  "/remove/:menuItemId",
  protect,
  async (req, res, next) => {
    try {
      const cart = await Cart.findOne({
        userId: req.user._id,
      });

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: "Cart not found",
        });
      }

      cart.items = cart.items.filter(
        (item) =>
          item.menuItemId.toString() !==
          req.params.menuItemId
      );

      if (cart.items.length === 0) {
        await Cart.findByIdAndDelete(cart._id);

        return res.json({
          success: true,
          message: "Cart is now empty",
        });
      }

      recalculateTotal(cart);

      await cart.save();

      await cart.populate("items.menuItemId");

      res.json({
        success: true,
        message: "Item removed",
        data: cart,
      });
    } catch (err) {
      next(err);
    }
  }
);



router.delete("/clear", protect, async (req, res, next) => {
  try {
    await Cart.findOneAndDelete({
      userId: req.user._id,
    });

    res.json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;