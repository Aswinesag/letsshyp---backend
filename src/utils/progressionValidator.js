const { AppError } = require('../middleware/errorHandler');

class ProgressionValidator {
    /**
     * Validates if order can progress based on logical conditions
     * @param {Object} order - Order object
     * @param {Object} courier - Courier object
     * @returns {Object} Validation result with canProgress and reason
     */
    static validateOrderProgression(order, courier) {
        if (!order || !courier) {
            return { canProgress: false, reason: 'Order or courier not found' };
        }

        switch (order.state) {
            case 'CREATED':
                return { canProgress: false, reason: 'Order must be assigned to a courier first' };

            case 'ASSIGNED':
                return this.validateAssignedToPickup(order, courier);

            case 'PICKED_UP':
                return this.validatePickedUpToTransit(order, courier);

            case 'IN_TRANSIT':
                return this.validateInTransitToDelivered(order, courier);

            case 'DELIVERED':
            case 'CANCELLED':
                return { canProgress: false, reason: `Order is in terminal state: ${order.state}` };

            default:
                return { canProgress: false, reason: `Unknown order state: ${order.state}` };
        }
    }

    /**
     * Validates progression from ASSIGNED to PICKED_UP
     * Courier must be at pickup location
     */
    static validateAssignedToPickup(order, courier) {
        const distance = this.calculateDistance(courier.currentLocation, order.pickupLocation);
        const threshold = 0.01; // Distance threshold to consider "reached"

        if (distance <= threshold) {
            return { canProgress: true, reason: 'Courier reached pickup location' };
        }

        return { 
            canProgress: false, 
            reason: `Courier is ${distance.toFixed(4)} units away from pickup location (threshold: ${threshold})` 
        };
    }

    /**
     * Validates progression from PICKED_UP to IN_TRANSIT
     * This is an immediate state change once package is picked up
     */
    static validatePickedUpToTransit(order, courier) {
        // PICKED_UP to IN_TRANSIT should happen immediately after pickup
        return { canProgress: true, reason: 'Package picked up, ready for transit' };
    }

    /**
     * Validates progression from IN_TRANSIT to DELIVERED
     * Courier must be at drop location
     */
    static validateInTransitToDelivered(order, courier) {
        const distance = this.calculateDistance(courier.currentLocation, order.dropLocation);
        const threshold = 0.01; // Distance threshold to consider "reached"

        if (distance <= threshold) {
            return { canProgress: true, reason: 'Courier reached drop location' };
        }

        return { 
            canProgress: false, 
            reason: `Courier is ${distance.toFixed(4)} units away from drop location (threshold: ${threshold})` 
        };
    }

    /**
     * Validates if manual state transition is allowed
     * Only allows certain manual transitions for testing/admin purposes
     */
    static validateManualStateTransition(currentState, newState, order, courier) {
        // Define allowed manual transitions (restrictive)
        const allowedManualTransitions = {
            'CREATED': ['CANCELLED'],
            'ASSIGNED': ['CANCELLED'],
            // All other transitions should be automatic based on movement
        };

        const allowedStates = allowedManualTransitions[currentState] || [];
        
        if (!allowedStates.includes(newState)) {
            return { 
                canTransition: false, 
                reason: `Manual transition from ${currentState} to ${newState} is not allowed. State progression must be automatic based on courier movement.` 
            };
        }

        // Additional validation for cancellation
        if (newState === 'CANCELLED') {
            return { canTransition: true, reason: 'Order cancellation allowed' };
        }

        return { canTransition: false, reason: 'Manual transition not permitted' };
    }

    /**
     * Calculates Manhattan distance between two points
     */
    static calculateDistance(point1, point2) {
        if (!point1 || !point2) {
            return Infinity;
        }

        const latDiff = Math.abs(point1.lat - point2.lat);
        const lngDiff = Math.abs(point1.lng - point2.lng);
        return latDiff + lngDiff; // Manhattan distance
    }

    /**
     * Checks if courier is moving in the right direction
     */
    static validateCourierDirection(courier, targetLocation) {
        if (!courier || !targetLocation) {
            return { isValidDirection: false, reason: 'Invalid courier or target location' };
        }

        // For simplicity, we assume any movement towards the target is valid
        // In a real system, you might track previous positions to validate direction
        return { isValidDirection: true, reason: 'Courier movement direction is valid' };
    }

    /**
     * Validates that order progression follows the expected sequence
     */
    static validateProgressionSequence(order, proposedNextState) {
        const expectedSequence = ['CREATED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];
        const currentIndex = expectedSequence.indexOf(order.state);
        const nextIndex = expectedSequence.indexOf(proposedNextState);

        if (currentIndex === -1 || nextIndex === -1) {
            return { validSequence: false, reason: 'Invalid state in sequence' };
        }

        // Allow only the next state in sequence (except for cancellation)
        if (proposedNextState !== 'CANCELLED' && nextIndex !== currentIndex + 1) {
            return { 
                validSequence: false, 
                reason: `Invalid progression sequence. Expected ${expectedSequence[currentIndex + 1]} after ${order.state}, got ${proposedNextState}` 
            };
        }

        return { validSequence: true, reason: 'Valid progression sequence' };
    }
}

module.exports = ProgressionValidator;
