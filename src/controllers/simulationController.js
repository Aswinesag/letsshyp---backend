const movementSimulationService = require('../services/MovementSimulationService');
const { AppError } = require('../middleware/errorHandler');

class SimulationController {
    async startSimulation(req, res, next) {
        try {
            const result = movementSimulationService.startSimulation();

            res.json({
                success: true,
                message: result.message,
                data: {
                    interval: result.interval,
                    status: movementSimulationService.getSimulationStatus()
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async stopSimulation(req, res, next) {
        try {
            const result = movementSimulationService.stopSimulation();

            res.json({
                success: true,
                message: result.message,
                data: {
                    status: movementSimulationService.getSimulationStatus()
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getSimulationStatus(req, res, next) {
        try {
            const status = movementSimulationService.getSimulationStatus();

            res.json({
                success: true,
                data: { status }
            });
        } catch (error) {
            next(error);
        }
    }

    async setSimulationSpeed(req, res, next) {
        try {
            const { interval } = req.body;

            if (!interval || typeof interval !== 'number') {
                throw new AppError('Interval is required and must be a number (milliseconds)', 400);
            }

            const result = movementSimulationService.setSimulationSpeed(interval);

            res.json({
                success: true,
                message: result.message,
                data: {
                    interval: result.interval,
                    status: movementSimulationService.getSimulationStatus()
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async setMovementStepSize(req, res, next) {
        try {
            const { stepSize } = req.body;

            if (!stepSize || typeof stepSize !== 'number') {
                throw new AppError('Step size is required and must be a number', 400);
            }

            const result = movementSimulationService.setMovementStepSize(stepSize);

            res.json({
                success: true,
                message: result.message,
                data: {
                    stepSize: result.stepSize,
                    status: movementSimulationService.getSimulationStatus()
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async forceProgressOrder(req, res, next) {
        try {
            const result = await movementSimulationService.forceProgressOrder(req.params.id);

            res.json({
                success: true,
                message: 'Order force-progressed successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async debugOrder(req, res, next) {
        try {
            const store = require('../storage/InMemoryStore');
            const order = store.getOrder(req.params.id);
            
            if (!order) {
                throw new AppError(`Order ${req.params.id} not found`, 404);
            }

            const courier = store.getCourier(order.courierId);
            const ProgressionValidator = require('../utils/progressionValidator');
            
            let debugInfo = {
                order: {
                    id: order.id,
                    state: order.state,
                    courierId: order.courierId,
                    pickupLocation: order.pickupLocation,
                    dropLocation: order.dropLocation
                }
            };

            if (courier) {
                debugInfo.courier = {
                    id: courier.id,
                    name: courier.name,
                    currentLocation: courier.currentLocation,
                    isAvailable: courier.isAvailable
                };

                const progressionValidation = ProgressionValidator.validateOrderProgression(order, courier);
                debugInfo.progression = progressionValidation;

                // Calculate distances
                const pickupDistance = ProgressionValidator.calculateDistance(courier.currentLocation, order.pickupLocation);
                const dropDistance = ProgressionValidator.calculateDistance(courier.currentLocation, order.dropLocation);
                
                debugInfo.distances = {
                    toPickup: pickupDistance,
                    toDrop: dropDistance,
                    threshold: 0.01
                };
            }

            res.json({
                success: true,
                data: debugInfo
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SimulationController();
