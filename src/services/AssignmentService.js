const store = require('../storage/InMemoryStore');
const { calculateManhattanDistance, findNearest, EXPRESS_MAX_DISTANCE_KM } = require('../utils/distanceCalculator');
const { AppError } = require('../middleware/errorHandler');
const courierService = require('./CourierService');

class AssignmentService {
    async assignCourierToOrder(order) {
        await store.acquireLock();

        try {
            const availableCouriers = store.getAvailableCouriers();

            if (availableCouriers.length === 0) {
                return {
                    success: false,
                    reason: 'NO_COURIERS_AVAILABLE',
                    message: 'No couriers are currently available. Order remains unassigned.'
                };
            }

            const couriersWithDistance = availableCouriers.map(courier => ({
                courier,
                distance: calculateManhattanDistance(order.pickupLocation, courier.currentLocation)
            }));

            let eligibleCouriers = couriersWithDistance;

            if (order.deliveryType === 'EXPRESS') {
                eligibleCouriers = couriersWithDistance.filter(
                    cd => cd.distance <= EXPRESS_MAX_DISTANCE_KM
                );

                if (eligibleCouriers.length === 0) {
                    return {
                        success: false,
                        reason: 'NO_COURIERS_IN_EXPRESS_RANGE',
                        message: `No couriers available within ${EXPRESS_MAX_DISTANCE_KM}km for EXPRESS delivery. Order remains unassigned.`,
                        nearestCourierDistance: Math.min(...couriersWithDistance.map(cd => cd.distance))
                    };
                }
            }

            eligibleCouriers.sort((a, b) => a.distance - b.distance);

            const { courier, distance } = eligibleCouriers[0];

            courier.markBusy(order.id);
            store.saveCourier(courier);

            order.assignCourier(courier.id);
            store.saveOrder(order);

            return {
                success: true,
                courier,
                distance,
                message: `Order assigned to courier ${courier.name} (${distance}km away)`
            };

            } finally {
                store.releaseLock();
            }
        }

        findBestCourier(pickupLocation, deliveryType) {
            const availableCouriers = store.getAvailableCouriers();

            if (availableCouriers.length === 0) {
                return null;
            }

            const couriersWithDistance = availableCouriers.map(courier => ({
                courier,
                distance: calculateManhattanDistance(pickupLocation, courier.currentLocation)
            }));

            let eligibleCouriers = couriersWithDistance;

            if (deliveryType === 'EXPRESS') {
                eligibleCouriers = couriersWithDistance.filter(
                    cd => cd.distance <= EXPRESS_MAX_DISTANCE_KM
                );
            }

            if (eligibleCouriers.length === 0) {
                return null;
            }

            eligibleCouriers.sort((a, b) => a.distance - b.distance);

            return eligibleCouriers[0];
        }

        async unassignCourier(orderId, courierId) {
            if (!courierId) {
                return;
            }

            await store.acquireLock();

            try {
                const courier = store.getCourier(courierId);
                if (courier && courier.currentOrderId === orderId) {
                    courier.markAvailable();
                    store.saveCourier(courier);
                }
                } finally {
                    store.releaseLock();
                }
            }
}

module.exports = new AssignmentService();