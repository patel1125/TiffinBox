const express = require('express');
const TableReservation = require('../models/TableReservation');
const { protect, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, async (req, res, next) => {
  try {
    const reservation = await TableReservation.create({ ...req.body, userId: req.user._id });
    res.status(201).json(reservation);
  } catch (error) {
    next(error);
  }
});

router.get('/my-reservations', protect, async (req, res, next) => {
  try {
    const reservations = await TableReservation.find({ userId: req.user._id }).sort({ reservationDate: -1 });
    res.json(reservations);
  } catch (error) {
    next(error);
  }
});

router.get('/restaurant/:restaurantId', protect, authorizeRoles('restaurantOwner', 'admin'), async (req, res, next) => {
  try {
    const reservations = await TableReservation.find({ restaurantId: req.params.restaurantId });
    res.json(reservations);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/status', protect, authorizeRoles('restaurantOwner', 'admin'), async (req, res, next) => {
  try {
    const reservation = await TableReservation.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(reservation);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    await TableReservation.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Reservation cancelled' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
