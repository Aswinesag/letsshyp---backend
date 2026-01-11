const courierService = require('../services/CourierService');
const { AppError } = require('../middleware/errorHandler');

class CourierController {
    async getAllCouriers(req, res, next) {
        try {
            const couriers = courierService.getAllCouriers();

            res.json({
                success: true,
                count: couriers.length,
                data: { couriers }
            });
        } catch (error) {
            next(error);
        }
    }

    async getAvailableCouriers(req, res, next) {
        try {
            const couriers = courierService.getAvailableCouriers();

            res.json({
                success: true,
                count: couriers.length,
                data: { couriers }
            });
        } catch (error) {
            next(error);
        }
    }

    async getCourierById(req, res, next) {
        try {
            const courier = courierService.getCourierById(req.params.id);

            res.json({
                success: true,
                data: { courier }
            });
        } catch (error) {
            next(error);
        }
    }

    async updateCourierLocation(req, res, next) {
        try {
            const { location } = req.body;

            if (!location || !location.lat || !location.lng) {
                throw new AppError('Invalid location. Required: { location: { lat: number, lng: number } }', 400);
            }

            const courier = courierService.updateCourierLocation(req.params.id, location);

            res.json({
                success: true,
                message: 'Courier location updated successfully',
                data: { courier }
            });
        } catch (error) {
            next(error);
        }   
    }

    async moveCourier(req, res, next) {
        try {
            const { targetLocation, stepSize } = req.body;

            if (!targetLocation || !targetLocation.lat || !targetLocation.lng) {
                throw new AppError('Invalid targetLocation. Required: { lat: number, lng: number }', 400);
            }

            const result = courierService.moveCourierTowards(
                req.params.id, 
                targetLocation, 
                stepSize || 0.01
            );

            res.json({
                success: true,
                message: result.reached ? 'Courier reached target' : 'Courier moved towards target',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CourierController();