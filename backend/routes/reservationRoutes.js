const express = require("express");
const mongoose = require("mongoose");

const TableReservation = require("../models/TableReservation");
const { protect, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

const ALLOWED_STATUS = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

router.post("/", protect, async (req, res, next) => {
  try {
    const {
      restaurantId,
      reservationDate,
      reservationTime,
      numberOfGuests,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Restaurant ID",
      });
    }

    if (!reservationTime) {
      return res.status(400).json({
        success: false,
        message: "Reservation time is required",
      });
    }

    if (!numberOfGuests || numberOfGuests <= 0) {
      return res.status(400).json({
        success: false,
        message: "Guest count must be greater than zero",
      });
    }

    const reservationDateTime = new Date(`${reservationDate}T${reservationTime}`);
    if (Number.isNaN(reservationDateTime.getTime()) || reservationDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Reservation date must be in the future",
      });
    }

    const reservation = await TableReservation.create({
      userId: req.user._id,
      restaurantId,
      reservationDate,
      reservationTime,
      numberOfGuests,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Reservation created successfully",
      data: reservation,
    });
  } catch (err) {
    next(err);
  }
});


router.get("/my-reservations", protect, async (req, res, next) => {
  try {
    const reservations = await TableReservation.find({
      userId: req.user._id,
    }).sort({
      reservationDate: -1,
    });

    res.json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/restaurant/:restaurantId",
  protect,
  authorizeRoles("restaurantOwner", "admin"),
  async (req, res, next) => {
    try {
      const { restaurantId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Restaurant ID",
        });
      }

      const reservations = await TableReservation.find({
        restaurantId,
      }).sort({
        reservationDate: 1,
      });

      res.json({
        success: true,
        count: reservations.length,
        data: reservations,
      });
    } catch (err) {
      next(err);
    }
  }
);


router.patch(
  "/:id/status",
  protect,
  authorizeRoles("restaurantOwner", "admin"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Reservation ID",
        });
      }

      if (!ALLOWED_STATUS.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid reservation status",
        });
      }

      const reservation =
        await TableReservation.findByIdAndUpdate(
          id,
          { status },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: "Reservation not found",
        });
      }

      res.json({
        success: true,
        message: "Reservation updated successfully",
        data: reservation,
      });
    } catch (err) {
      next(err);
    }
  }
);


router.delete("/:id", protect, async (req, res, next) => {
  try {
    const reservation =
      await TableReservation.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    if (reservation.status === "completed") {
      return res.status(400).json({
        success: false,
        message:
          "Completed reservations cannot be cancelled",
      });
    }

    await reservation.deleteOne();

    res.json({
      success: true,
      message: "Reservation cancelled successfully",
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
