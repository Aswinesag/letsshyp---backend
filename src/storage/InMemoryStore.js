const Courier = require('../models/Courier');

class InMemoryStore {
    constructor() {
        this.orders = new Map();
        this.couriers = new Map();
        this.assignmentLock = false;
        this.orderCounter = 1;
        this.initializeCouriers();
    }

    initializeCouriers() {
        const initialCouriers = [
        {
            id: 'COU_001',
            name: 'Raj Kumar',
            currentLocation: { lat: 19.0760, lng: 72.8777 },
            isAvailable: true,
            currentOrderId: null
        },
        {
            id: 'COU_002',
            name: 'Priya Singh',
            currentLocation: { lat: 19.0896, lng: 72.8656 },
            isAvailable: true,
            currentOrderId: null
        },
        {
            id: 'COU_003',
            name: 'Amit Sharma',
            currentLocation: { lat: 19.1136, lng: 72.8697 },
            isAvailable: true,
            currentOrderId: null
        },
        {
            id: 'COU_004',
            name: 'Sneha Patel',
            currentLocation: { lat: 19.0330, lng: 72.8569 },
            isAvailable: true,
            currentOrderId: null
        },
        {
            id: 'COU_005',
            name: 'Vikram Rao',
            currentLocation: { lat: 19.0176, lng: 72.8561 },
            isAvailable: true,
            currentOrderId: null
        },
        {
            id: 'COU_006',
            name: 'Neha Desai',
            currentLocation: { lat: 19.0728, lng: 72.8826 },
            isAvailable: true,
            currentOrderId: null
        },
        {
            id: 'COU_007',
            name: 'Arjun Mehta',
            currentLocation: { lat: 19.1197, lng: 72.9046 },
            isAvailable: true,
            currentOrderId: null
        },
        {
            id: 'COU_008',
            name: 'Kavita Joshi',
            currentLocation: { lat: 19.0522, lng: 72.8820 },
            isAvailable: true,
            currentOrderId: null
        },
        {
            id: 'COU_009',
            name: 'Rohit Nair',
            currentLocation: { lat: 18.9894, lng: 72.8360 },
            isAvailable: true,
            currentOrderId: null
        },
        {
            id: 'COU_010',
            name: 'Anjali Verma',
            currentLocation: { lat: 19.0544, lng: 72.8320 },
            isAvailable: true,
            currentOrderId: null
        }
        ];

        initialCouriers.forEach(courierData => {
            const courier = new Courier(courierData);
            this.couriers.set(courier.id, courier);
        });

        console.log(`Initialized ${this.couriers.size} couriers`);
    }

    async acquireLock() {
        while (this.assignmentLock) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        this.assignmentLock = true;
    }

    releaseLock() {
        this.assignmentLock = false;
    }

    saveOrder(order) {
        this.orders.set(order.id, order);
        return order;
    }

    getOrder(orderId) {
        return this.orders.get(orderId);
    }

    getAllOrders() {
        return Array.from(this.orders.values());
    }

    deleteOrder(orderId) {
        return this.orders.delete(orderId);
    }

    generateOrderId() {
        const id = `ORD_${String(this.orderCounter).padStart(4, '0')}`;
        this.orderCounter++;
        return id;
    }

    saveCourier(courier) {
        this.couriers.set(courier.id, courier);
        return courier;
    }

    getCourier(courierId) {
        return this.couriers.get(courierId);
    }

    getAllCouriers() {
        return Array.from(this.couriers.values());
    }

    getAvailableCouriers() {
        return Array.from(this.couriers.values()).filter(c => c.isAvailable);
    }

    reset() {
        this.orders.clear();
        this.couriers.clear();
        this.orderCounter = 1;
        this.initializeCouriers();
    }

    getStats() {
        return {
            totalOrders: this.orders.size,
            totalCouriers: this.couriers.size,
            availableCouriers: this.getAvailableCouriers().length,
            ordersInProgress: Array.from(this.orders.values()).filter(
            o => !['DELIVERED', 'CANCELLED'].includes(o.state)
            ).length
        };
    }
}

module.exports = new InMemoryStore();