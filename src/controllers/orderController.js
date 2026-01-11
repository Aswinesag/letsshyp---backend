const orderService = require('../services/OrderService');
const { AppError } = require('../middleware/errorHandler');

class OrderController {
    async createOrder(req, res, next) {
        try {
            const { pickupLocation, dropLocation, deliveryType, packageDetails } = req.body;
            if (!pickupLocation || !dropLocation || !deliveryType || !packageDetails) {
                throw new AppError('Missing required fields: pickupLocation, dropLocation, deliveryType, packageDetails', 400);
            }

            const orderData = {
                pickupLocation,
                dropLocation,
                deliveryType,
                packageDetails
            };

            const result = await orderService.createOrder(orderData);

            res.status(201).json({
                success: true,
                message: result.assignment.success ? 'Order created and courier assigned successfully': 'Order created but no courier available',
                data: {
                    order: result.order,
                    assignment: result.assignment
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllOrders(req, res, next) {
        try {
            const orders = orderService.getAllOrders();

            res.json({
                success: true,
                count: orders.length,
                data: { orders }
            });
        } catch (error) {
            next(error);
        }
    }

    async getOrderById(req, res, next) {
        try {
            const order = orderService.getOrderById(req.params.id);

            res.json({
                success: true,
                data: { order }
            });
        } catch (error) {
            next(error);
        }
    }

    async updateOrderState(req, res, next) {
        try {
            const { state } = req.body;

        if (!state) {
            throw new AppError('State is required in request body', 400);
        }

        const order = await orderService.updateOrderState(req.params.id, state);

        res.json({
            success: true,
            message: `Order state updated to ${state}`,
            data: { order }
        });
        } catch (error) {
            next(error);
        }
    }

    async cancelOrder(req, res, next) {
        try {
            const order = await orderService.cancelOrder(req.params.id);

            res.json({
                success: true,
                message: 'Order cancelled successfully',
                data: { order }
            });
        } catch (error) {
            next(error);
        }
    }

    async progressOrder(req, res, next) {
        try {
            const result = await orderService.simulateOrderProgression(req.params.id);

            res.json({
                success: true,
                message: result.progress.message,
                data: {
                    order: result.order,
                    courier: result.courier,
                    progress: result.progress
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new OrderController();