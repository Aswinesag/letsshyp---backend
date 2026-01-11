class Courier {
    constructor({ id, name, currentLocation, isAvailable = true, currentOrderId = null }) {
        this.id = id;
        this.name = name;
        this.currentLocation = currentLocation;
        this.isAvailable = isAvailable;
        this.currentOrderId = currentOrderId;
    }

    static validate(data) {
        const errors = [];

        if (!data.name || typeof data.name !== 'string') {
            errors.push('Courier name is required and must be a string');
        }

        if (!data.currentLocation || typeof data.currentLocation.lat !== 'number' || typeof data.currentLocation.lng !== 'number') {
            errors.push('Invalid current location. Required: { lat: number, lng: number }');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    markBusy(orderId) {
        this.isAvailable = false;
        this.currentOrderId = orderId;
    }

    markAvailable() {
        this.isAvailable = true;
        this.currentOrderId = null;
    }

    updateLocation(newLocation) {
        if (newLocation && typeof newLocation.lat === 'number' && typeof newLocation.lng === 'number') {
                this.currentLocation = newLocation;
                return true;
        }
        return false;
    }

    moveTowards(targetLocation, stepSize = 0.01) {
        const latDiff = targetLocation.lat - this.currentLocation.lat;
        const lngDiff = targetLocation.lng - this.currentLocation.lng;

        const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    
        if (distance < stepSize) {
            this.currentLocation = { ...targetLocation };
            return { reached: true, location: this.currentLocation };
        }

        const ratio = stepSize / distance;
        this.currentLocation = {
            lat: this.currentLocation.lat + (latDiff * ratio),
            lng: this.currentLocation.lng + (lngDiff * ratio)
        };

        return { reached: false, location: this.currentLocation };
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            currentLocation: this.currentLocation,
            isAvailable: this.isAvailable,
            currentOrderId: this.currentOrderId
        };
    }
}

module.exports = Courier;