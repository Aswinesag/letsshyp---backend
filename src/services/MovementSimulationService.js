const store = require('../storage/InMemoryStore');
const orderService = require('./OrderService');
const courierService = require('./CourierService');
const { AppError } = require('../middleware/errorHandler');

class MovementSimulationService {
    constructor() {
        this.isRunning = false;
        this.simulationInterval = null;
        this.updateInterval = 2000; // Update every 2 seconds
        this.stepSize = 0.005; // Movement step size
    }

    startSimulation() {
        if (this.isRunning) {
            throw new AppError('Movement simulation is already running', 400);
        }

        this.isRunning = true;
        console.log('🚀 Starting courier movement simulation...');

        this.simulationInterval = setInterval(() => {
            this.simulateAllActiveOrders();
        }, this.updateInterval);

        return {
            success: true,
            message: 'Movement simulation started',
            interval: this.updateInterval
        };
    }

    stopSimulation() {
        if (!this.isRunning) {
            throw new AppError('Movement simulation is not running', 400);
        }

        this.isRunning = false;
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }

        console.log('🛑 Stopped courier movement simulation');

        return {
            success: true,
            message: 'Movement simulation stopped'
        };
    }

    getSimulationStatus() {
        return {
            isRunning: this.isRunning,
            updateInterval: this.updateInterval,
            stepSize: this.stepSize,
            activeOrders: this.getActiveOrdersCount()
        };
    }

    getActiveOrdersCount() {
        const allOrders = store.getAllOrders();
        return allOrders.filter(order => 
            order.courierId && 
            ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(order.state)
        ).length;
    }

    async simulateAllActiveOrders() {
        try {
            const allOrders = store.getAllOrders();
            const activeOrders = allOrders.filter(order => 
                order.courierId && 
                ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(order.state)
            );

            for (const order of activeOrders) {
                try {
                    await this.simulateOrderMovement(order);
                } catch (error) {
                    console.error(`Error simulating order ${order.id}:`, error.message);
                }
            }
        } catch (error) {
            console.error('Error in movement simulation cycle:', error);
        }
    }

    async simulateOrderMovement(order) {
        const courier = store.getCourier(order.courierId);
        if (!courier) {
            console.warn(`Courier ${order.courierId} not found for order ${order.id}`);
            return;
        }

        let targetLocation;
        let nextState;
        let progressMessage;

        switch (order.state) {
            case 'ASSIGNED':
                targetLocation = order.pickupLocation;
                nextState = 'PICKED_UP';
                progressMessage = 'Moving towards pickup location';
                break;

            case 'PICKED_UP':
                // First move to transit state, then start moving to drop
                await orderService.updateOrderState(order.id, 'IN_TRANSIT');
                console.log(`📦 Order ${order.id} picked up, now IN_TRANSIT`);
                return;

            case 'IN_TRANSIT':
                targetLocation = order.dropLocation;
                nextState = 'DELIVERED';
                progressMessage = 'Moving towards drop location';
                break;

            default:
                return; // Skip other states
        }

        if (!targetLocation) {
            console.warn(`No target location for order ${order.id} in state ${order.state}`);
            return;
        }

        // Move courier towards target
        const moveResult = courierService.moveCourierTowards(
            courier.id,
            targetLocation,
            this.stepSize
        );

        if (moveResult.reached) {
            // Courier reached target, update order state
            try {
                await orderService.updateOrderState(order.id, nextState);
                console.log(`✅ Order ${order.id} progressed to ${nextState}`);
                
                if (nextState === 'DELIVERED') {
                    console.log(`🎉 Order ${order.id} delivered successfully!`);
                }
            } catch (error) {
                console.error(`Error updating order ${order.id} to ${nextState}:`, error.message);
            }
        } else {
            console.log(`🚶 Courier ${courier.id} ${progressMessage} - Location: ${moveResult.location.lat.toFixed(4)}, ${moveResult.location.lng.toFixed(4)}`);
        }
    }

    setSimulationSpeed(intervalMs) {
        if (intervalMs < 1000 || intervalMs > 30000) {
            throw new AppError('Interval must be between 1000ms and 30000ms', 400);
        }

        this.updateInterval = intervalMs;

        if (this.isRunning) {
            this.stopSimulation();
            this.startSimulation();
        }

        return {
            success: true,
            message: `Simulation interval set to ${intervalMs}ms`,
            interval: this.updateInterval
        };
    }

    setMovementStepSize(stepSize) {
        if (stepSize < 0.001 || stepSize > 0.1) {
            throw new AppError('Step size must be between 0.001 and 0.1', 400);
        }

        this.stepSize = stepSize;
        return {
            success: true,
            message: `Movement step size set to ${stepSize}`,
            stepSize: this.stepSize
        };
    }

    async forceProgressOrder(orderId) {
        const order = store.getOrder(orderId);
        if (!order) {
            throw new AppError(`Order ${orderId} not found`, 404);
        }

        if (!order.courierId) {
            throw new AppError('No courier assigned to this order', 400);
        }

        // Use a larger step size for force progression to speed up testing
        const originalStepSize = this.stepSize;
        this.stepSize = 0.1; // Use larger step for testing
        
        try {
            const result = await orderService.simulateOrderProgression(orderId);
            return result;
        } finally {
            // Restore original step size
            this.stepSize = originalStepSize;
        }
    }
}

module.exports = new MovementSimulationService();
