const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Order routes
router.post('/', orderController.createOrder);
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/state', orderController.updateOrderState);
router.delete('/:id', orderController.cancelOrder);
router.post('/:id/progress', orderController.progressOrder);

module.exports = router;