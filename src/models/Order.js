class Order {
    constructor({
        pickupLocation,
        dropLocation,
        deliveryType,
        packageDetails
    }) {
        this.id = null;
        this.pickupLocation = pickupLocation;
        this.dropLocation = dropLocation;
        this.deliveryType = deliveryType;
        this.packageDetails = packageDetails;
        this.state = 'CREATED';
        this.courierId = null;
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    static validate(data) {
        const errors = [];

        if (!data.pickupLocation || typeof data.pickupLocation.lat !== 'number' || typeof data.pickupLocation.lng !== 'number') {
                errors.push('Invalid pickup location. Required: { lat: number, lng: number }');
            }

        if (!data.dropLocation || typeof data.dropLocation.lat !== 'number' || typeof data.dropLocation.lng !== 'number') {
                errors.push('Invalid drop location. Required: { lat: number, lng: number }');
            }

        if (!data.deliveryType || !['EXPRESS', 'NORMAL'].includes(data.deliveryType)) {
            errors.push('Invalid delivery type. Must be either EXPRESS or NORMAL');
        }

        if (!data.packageDetails) {
            errors.push('Package details are required');
        } else {
            if (!data.packageDetails.weight || data.packageDetails.weight <= 0) {
                errors.push('Package weight must be greater than 0');
            }
        if (!data.packageDetails.dimensions || !['small', 'medium', 'large'].includes(data.packageDetails.dimensions)) {
                errors.push('Package dimensions must be small, medium, or large');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
        };
    }

    updateState(newState) {
        this.state = newState;
        this.updatedAt = new Date().toISOString();
    }

    assignCourier(courierId) {
        this.courierId = courierId;
        this.state = 'ASSIGNED';
        this.updatedAt = new Date().toISOString();
    }

    toJSON() {
        return {
            id: this.id,
            pickupLocation: this.pickupLocation,
            dropLocation: this.dropLocation,
            deliveryType: this.deliveryType,
            packageDetails: this.packageDetails,
            state: this.state,
            courierId: this.courierId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Order;