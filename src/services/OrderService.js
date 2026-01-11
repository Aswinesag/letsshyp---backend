const store = require('../storage/InMemoryStore');
const Order = require('../models/Order');
const { AppError } = require('../middleware/errorHandler');
const { canTransition, isTerminalState } = require('../utils/stateValidator');
const ProgressionValidator = require('../utils/progressionValidator');
const assignmentService = require('./AssignmentService');
const courierService = require('./CourierService');

class OrderService {
    async createOrder(orderData) {
        const validation = Order.validate(orderData);
        if (!validation.isValid) {
            throw new AppError(`Validation failed: ${validation.errors.join(', ')}`, 400);
        }

        const order = new Order(orderData);
        order.id = store.generateOrderId();

        store.saveOrder(order);

        const assignmentResult = await assignmentService.assignCourierToOrder(order);

        return {
            order: store.getOrder(order.id),
            assignment: assignmentResult
        };
    }

    getAllOrders() {
        return store.getAllOrders();
    }

    getOrderById(orderId) {
        const order = store.getOrder(orderId);
        if (!order) {
            throw new AppError(`Order with ID ${orderId} not found`, 404);
        }
        return order;
    }

    async updateOrderState(orderId, newState, isManualUpdate = true) {
        const order = this.getOrderById(orderId);

        // For manual updates, validate that the transition is allowed
        if (isManualUpdate) {
            const courier = order.courierId ? store.getCourier(order.courierId) : null;
            const manualValidation = ProgressionValidator.validateManualStateTransition(
                order.state, 
                newState, 
                order, 
                courier
            );

            if (!manualValidation.canTransition) {
                throw new AppError(manualValidation.reason, 400);
            }
        }

        // For automatic updates, check basic state transition rules
        if (!canTransition(order.state, newState)) {
            throw new AppError(
            `Invalid state transition: ${order.state} → ${newState}. Valid transitions from ${order.state}: ${require('../utils/stateValidator').getValidNextStates(order.state).join(', ')}`,
            400
            );
        }

        if (newState === 'PICKED_UP' && !order.courierId) {
            throw new AppError('Cannot mark as PICKED_UP: No courier assigned to this order', 400);
        }

        // For automatic progression, validate logical conditions
        if (!isManualUpdate && newState !== 'CANCELLED') {
            const courier = store.getCourier(order.courierId);
            const progressionValidation = ProgressionValidator.validateOrderProgression(order, courier);
            
            if (!progressionValidation.canProgress) {
                throw new AppError(`Cannot progress to ${newState}: ${progressionValidation.reason}`, 400);
            }
        }

        order.updateState(newState);
        store.saveOrder(order);

        if (newState === 'DELIVERED' || newState === 'CANCELLED') {
            await assignmentService.unassignCourier(order.id, order.courierId);
        }

        return order;
    }

    async cancelOrder(orderId) {
        const order = this.getOrderById(orderId);

        if (isTerminalState(order.state)) {
            throw new AppError(`Cannot cancel order in ${order.state} state`, 400);
        }

        if (!canTransition(order.state, 'CANCELLED')) {
            throw new AppError(
            `Cannot cancel order in ${order.state} state. Cancellation only allowed in CREATED or ASSIGNED state`,
            400
            );
            }

            order.updateState('CANCELLED');
            store.saveOrder(order);
            
            await assignmentService.unassignCourier(order.id, order.courierId);

            return order;
        }

        async simulateOrderProgression(orderId) {
            const order = this.getOrderById(orderId);

            if (!order.courierId) {
                throw new AppError('No courier assigned to this order', 400);
            }

            const courier = courierService.getCourierById(order.courierId);

            // Validate if order can progress based on current conditions
            const progressionValidation = ProgressionValidator.validateOrderProgression(order, courier);
            
            let progressUpdate = {};

            switch (order.state) {
                case 'ASSIGNED':
                    if (progressionValidation.canProgress) {
                        await this.updateOrderState(order.id, 'PICKED_UP', false);
                        progressUpdate = { message: 'Courier reached pickup location', state: 'PICKED_UP' };
                    } else {
                        // Move courier towards pickup
                        const pickupMove = courierService.moveCourierTowards(
                            courier.id,
                            order.pickupLocation,
                            0.01
                        );
                        progressUpdate = { 
                            message: progressionValidation.reason || 'Courier moving towards pickup', 
                            location: pickupMove.location 
                        };
                    }
                    break;

                case 'PICKED_UP':
                    await this.updateOrderState(order.id, 'IN_TRANSIT', false);
                    progressUpdate = { message: 'Package picked up, now in transit', state: 'IN_TRANSIT' };
                    break;

                case 'IN_TRANSIT':
                    if (progressionValidation.canProgress) {
                        await this.updateOrderState(order.id, 'DELIVERED', false);
                        progressUpdate = { message: 'Order delivered successfully!', state: 'DELIVERED' };
                    } else {
                        // Move courier towards drop location
                        const dropMove = courierService.moveCourierTowards(
                            courier.id,
                            order.dropLocation,
                            0.01
                        );
                        progressUpdate = { 
                            message: progressionValidation.reason || 'Courier moving towards drop location', 
                            location: dropMove.location 
                        };
                    }
                    break;

                case 'DELIVERED':
                case 'CANCELLED':
                    throw new AppError(`Order is already in terminal state: ${order.state}`, 400);

                default:
                    throw new AppError(`Cannot progress from state: ${order.state}`, 400);
            }

            return {
                order: store.getOrder(order.id),
                courier: store.getCourier(courier.id),
                progress: progressUpdate
            };
        }
    }

module.exports = new OrderService();