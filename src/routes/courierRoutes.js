const express = require('express');
const router = express.Router();
const courierController = require('../controllers/courierController');

// Courier routes
router.get('/', courierController.getAllCouriers);
router.get('/available', courierController.getAvailableCouriers);
router.get('/:id', courierController.getCourierById);
router.patch('/:id/location', courierController.updateCourierLocation);
router.post('/:id/move', courierController.moveCourier);

module.exports = router;