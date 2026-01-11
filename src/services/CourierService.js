const store = require('../storage/InMemoryStore');
const Courier = require('../models/Courier');
const { AppError } = require('../middleware/errorHandler');

class CourierService {
    getAllCouriers() {
        return store.getAllCouriers();
    }
    
    getCourierById(courierId) {
        const courier = store.getCourier(courierId);
        if (!courier) {
            throw new AppError(`Courier with ID ${courierId} not found`, 404);
        }
        return courier;
    }
    
    getAvailableCouriers() {
        return store.getAvailableCouriers();
    }
    
    updateCourierLocation(courierId, newLocation) {
        const courier = this.getCourierById(courierId);
    
        if (!newLocation || typeof newLocation.lat !== 'number' || typeof newLocation.lng !== 'number') {
            throw new AppError('Invalid location format. Required: { lat: number, lng: number }', 400);
        }

        courier.currentLocation = newLocation;
        store.saveCourier(courier);

        return courier;
    }
    
    markCourierBusy(courierId, orderId) {
        const courier = this.getCourierById(courierId);
    
        if (!courier.isAvailable) {
            throw new AppError(`Courier ${courierId} is already busy with order ${courier.currentOrderId}`, 400);
        }

        courier.markBusy(orderId);
        store.saveCourier(courier);

        return courier;
    }
    
    markCourierAvailable(courierId) {
        const courier = this.getCourierById(courierId);
    
        courier.markAvailable();
        store.saveCourier(courier);

        return courier;
    }

    moveCourierTowards(courierId, targetLocation, stepSize = 0.01) {
        const courier = this.getCourierById(courierId);
    
        if (!targetLocation || typeof targetLocation.lat !== 'number' || typeof targetLocation.lng !== 'number') {
            throw new AppError('Invalid target location format', 400);
        }

        const result = courier.moveTowards(targetLocation, stepSize);
        store.saveCourier(courier);

        return {
            courier,
            ...result
        };
    }
}

module.exports = new CourierService();