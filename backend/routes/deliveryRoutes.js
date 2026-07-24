const express = require("express");
const mongoose = require("mongoose");

const DeliveryAgent = require("../models/DeliveryAgent");
const DeliveryTracking = require("../models/DeliveryTracking");
const Order = require("../models/Order");
const { protect, authorizeRoles } = require("../middleware/auth");

const router = express.Router();



router.get(
  "/agents/me",
  protect,
  authorizeRoles("deliveryAgent", "admin"),
  async (req, res, next) => {
    try {
      const agent = await DeliveryAgent.findOne({ userId: req.user._id });

      if (!agent) {
        return res.status(404).json({
          success: false,
          message: "Delivery agent not found",
        });
      }

      res.json({
        success: true,
        data: agent,
      });
    } catch (err) {
      next(err);
    }
  }
);



router.get(
  "/agents/me/orders",
  protect,
  authorizeRoles("deliveryAgent", "admin"),
  async (req, res, next) => {
    try {
      const agent = await DeliveryAgent.findOne({
        userId: req.user._id,
      });

      if (!agent) {
        return res.status(404).json({
          success: false,
          message: "Delivery agent not found",
        });
      }

      const orders = await Order.find({
        deliveryAgentId: agent._id,
      }).sort({
        createdAt: -1,
      });

      res.json({
        success: true,
        count: orders.length,
        data: orders,
      });
    } catch (err) {
      next(err);
    }
  }
);



router.put(
  "/orders/:orderId/assign-me",
  protect,
  authorizeRoles("deliveryAgent", "admin"),
  async (req, res, next) => {
    try {
      const { orderId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID",
        });
      }

      const agent = await DeliveryAgent.findOne({
        userId: req.user._id,
      });

      if (!agent) {
        return res.status(404).json({
          success: false,
          message: "Delivery agent not found",
        });
      }

      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      if (order.deliveryAgentId) {
        return res.status(400).json({
          success: false,
          message: "Order already assigned",
        });
      }

      if (
        order.orderStatus === "cancelled" ||
        order.orderStatus === "delivered"
      ) {
        return res.status(400).json({
          success: false,
          message: "Order cannot be assigned",
        });
      }

      order.deliveryAgentId = agent._id;
      order.orderStatus = "outForDelivery";

      await order.save();

      res.json({
        success: true,
        message: "Order assigned successfully",
        data: order,
      });
    } catch (err) {
      next(err);
    }
  }
);


router.post(
  "/agents",
  protect,
  async (req, res, next) => {
    try {
      const existing = await DeliveryAgent.findOne({
        userId: req.user._id,
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Already registered as delivery agent",
        });
      }

      const agent = await DeliveryAgent.create({
        ...req.body,
        userId: req.user._id,
      });

      res.status(201).json({
        success: true,
        data: agent,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/agents/available", async (req, res, next) => {
  try {
    const agents = await DeliveryAgent.find({
      isAvailable: true,
    });

    res.json({
      success: true,
      count: agents.length,
      data: agents,
    });
  } catch (err) {
    next(err);
  }
});



router.put(
  "/agents/me/availability",
  protect,
  authorizeRoles("deliveryAgent", "admin"),
  async (req, res, next) => {
    try {
      if (typeof req.body.isAvailable !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isAvailable must be boolean",
        });
      }

      const agent = await DeliveryAgent.findOne({
        userId: req.user._id,
      });

      if (!agent) {
        return res.status(404).json({
          success: false,
          message: "Delivery agent not found",
        });
      }

      agent.isAvailable = req.body.isAvailable;

      await agent.save();

      res.json({
        success: true,
        data: agent,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/agents/me/location",
  protect,
  authorizeRoles("deliveryAgent", "admin"),
  async (req, res, next) => {
    try {
      const { latitude, longitude } = req.body;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return res.status(400).json({ success: false, message: "Enter a valid latitude and longitude" });
      }

      const agent = await DeliveryAgent.findOne({ userId: req.user._id });
      if (!agent) {
        return res.status(404).json({ success: false, message: "Delivery agent not found" });
      }

      agent.currentLocation = { type: "Point", coordinates: [longitude, latitude] };
      await agent.save();
      res.json({ success: true, data: agent });
    } catch (err) {
      next(err);
    }
  }
);


router.post(
  "/tracking",
  protect,
  authorizeRoles("deliveryAgent", "admin"),
  async (req, res, next) => {
    try {
      const { orderId, latitude, longitude } = req.body;

      const agent = await DeliveryAgent.findOne({
        userId: req.user._id,
      });

      if (!agent) {
        return res.status(404).json({
          success: false,
          message: "Delivery agent not found",
        });
      }

      const order = await Order.findOne({ orderId, deliveryAgentId: agent._id });
      if (!order) {
        return res.status(403).json({ success: false, message: "This order is not assigned to you" });
      }

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return res.status(400).json({ success: false, message: "Enter a valid latitude and longitude" });
      }

      agent.currentLocation = { type: "Point", coordinates: [longitude, latitude] };
      await agent.save();

      const tracking = await DeliveryTracking.create({
        orderId,
        deliveryAgentId: agent._id,
        latitude,
        longitude,
        timestamp: new Date(),
      });

      res.status(201).json({
        success: true,
        data: tracking,
      });
    } catch (err) {
      next(err);
    }
  }
);


router.get(
  "/tracking/:orderId",
  protect,
  async (req, res, next) => {
    try {
      const tracking = await DeliveryTracking.findOne({
        orderId: req.params.orderId,
      }).sort({
        timestamp: -1,
      });

      res.json({
        success: true,
        data: tracking || null,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
