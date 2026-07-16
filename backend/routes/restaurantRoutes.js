const express = require("express");
const mongoose = require("mongoose");

const Restaurant = require("../models/Restaurant");
const { protect, authorizeRoles } = require("../middleware/auth");

const router = express.Router();


router.get("/", async (req, res, next) => {
  try {
    const {
      cuisine,
      search,
      page = 1,
      limit = 10,
      city,
    } = req.query;

    const filter = {
      isActive: true,
    };

    if (cuisine) {
      filter.cuisineType = cuisine;
    }

    if (city) {
      filter.city = {
        $regex: city,
        $options: "i",
      };
    }

    if (search) {
      filter.restaurantName = {
        $regex: search,
        $options: "i",
      };
    }

    const skip = (page - 1) * limit;

    const totalRestaurants =
      await Restaurant.countDocuments(filter);

    const restaurants = await Restaurant.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      page: Number(page),
      totalPages: Math.ceil(
        totalRestaurants / limit
      ),
      totalRestaurants,
      count: restaurants.length,
      data: restaurants,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Restaurant ID",
      });
    }

    const restaurant =
      await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    res.json({
      success: true,
      data: restaurant,
    });
  } catch (err) {
    next(err);
  }
});


router.post(
  "/",
  protect,
  authorizeRoles("restaurantOwner", "admin"),
  async (req, res, next) => {
    try {
      const existing =
        await Restaurant.findOne({
          ownerId: req.user._id,
          restaurantName:
            req.body.restaurantName,
        });

      if (existing) {
        return res.status(400).json({
          success: false,
          message:
            "Restaurant already exists",
        });
      }

      const restaurant =
        await Restaurant.create({
          ...req.body,
          ownerId: req.user._id,
        });

      res.status(201).json({
        success: true,
        message:
          "Restaurant created successfully",
        data: restaurant,
      });
    } catch (err) {
      next(err);
    }
  }
);


router.patch(
  "/:id",
  protect,
  authorizeRoles("restaurantOwner", "admin"),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Restaurant ID",
        });
      }

      const filter =
        req.user.role === "admin"
          ? { _id: id }
          : {
              _id: id,
              ownerId: req.user._id,
            };

      const restaurant =
        await Restaurant.findOneAndUpdate(
          filter,
          req.body,
          {
            new: true,
            runValidators: true,
          }
        );

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message:
            "Restaurant not found",
        });
      }

      res.json({
        success: true,
        message:
          "Restaurant updated successfully",
        data: restaurant,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("restaurantOwner", "admin"),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Restaurant ID",
        });
      }

      const filter =
        req.user.role === "admin"
          ? { _id: id }
          : {
              _id: id,
              ownerId: req.user._id,
            };

      const restaurant =
        await Restaurant.findOneAndDelete(
          filter
        );

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message:
            "Restaurant not found",
        });
      }

      res.json({
        success: true,
        message:
          "Restaurant deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;