const express = require("express");
const mongoose = require("mongoose");

const MenuCategory = require("../models/MenuCategory");
const MenuItem = require("../models/MenuItem");
const { protect, authorizeRoles } = require("../middleware/auth");

const router = express.Router();



router.get("/categories/:restaurantId", async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Restaurant ID",
      });
    }

    const categories = await MenuCategory.find({
      restaurantId,
    }).sort({ categoryName: 1 });

    res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
});



router.post(
  "/categories",
  protect,
  authorizeRoles("restaurantOwner", "admin"),
  async (req, res, next) => {
    try {
      const { restaurantId, categoryName } = req.body;

      if (!restaurantId || !categoryName?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Restaurant ID and category name are required",
        });
      }

      const existing = await MenuCategory.findOne({
        restaurantId,
        categoryName: categoryName.trim(),
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Category already exists",
        });
      }

      const category = await MenuCategory.create({
        restaurantId,
        categoryName: categoryName.trim(),
      });

      res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category,
      });
    } catch (err) {
      next(err);
    }
  }
);


router.delete(
  "/categories/:id",
  protect,
  authorizeRoles("restaurantOwner", "admin"),
  async (req, res, next) => {
    try {
      const category = await MenuCategory.findById(req.params.id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      const items = await MenuItem.countDocuments({
        categoryId: category._id,
      });

      if (items > 0) {
        return res.status(400).json({
          success: false,
          message:
            "Delete menu items before deleting this category",
        });
      }

      await category.deleteOne();

      res.json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  }
);



router.get("/items/:restaurantId", async (req, res, next) => {
  try {
    const items = await MenuItem.find({
      restaurantId: req.params.restaurantId,
    }).populate("categoryId");

    res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (err) {
    next(err);
  }
});


router.post(
  "/items",
  protect,
  authorizeRoles("restaurantOwner", "admin"),
  async (req, res, next) => {
    try {
      const item = await MenuItem.create(req.body);

      res.status(201).json({
        success: true,
        message: "Menu item created",
        data: item,
      });
    } catch (err) {
      next(err);
    }
  }
);


router.patch(
  "/items/:id",
  protect,
  authorizeRoles("restaurantOwner", "admin"),
  async (req, res, next) => {
    try {
      const item = await MenuItem.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Menu item not found",
        });
      }

      res.json({
        success: true,
        message: "Menu item updated",
        data: item,
      });
    } catch (err) {
      next(err);
    }
  }
);


router.delete(
  "/items/:id",
  protect,
  authorizeRoles("restaurantOwner", "admin"),
  async (req, res, next) => {
    try {
      const item = await MenuItem.findById(req.params.id);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Menu item not found",
        });
      }

      await item.deleteOne();

      res.json({
        success: true,
        message: "Menu item deleted",
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
