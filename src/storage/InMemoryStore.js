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
            name: 'Aswin Kumar',
            currentLocation: { lat: 19.0760, lng: 72.8777 }, // Mumbai Central
            isAvailable: true,
            currentOrderId: null
        },
        {
            id: 'COU_002',
            name: 'Anil Kumar',
            currentLocation: { lat: 19.0896, lng: 72.8656 }, // Bandra
            isAvailable: true,
            currentOrderId: null
        },
        {
            id: 'COU_003',
            name: 'Santhi Anil',
            currentLocation: { lat: 19.1136, lng: 72.8697 }, // Andheri
            isAvailable: true,
            currentOrderId: null
        },
        {
            id: 'COU_004',
            name: 'Tejas Nair',
            currentLocation: { lat: 19.0330, lng: 72.8569 }, // Worli
            isAvailable: true,
            currentOrderId: null
        },
        {
            id: 'COU_005',
            name: 'John Doe',
            currentLocation: { lat: 19.0176, lng: 72.8561 }, // Lower Parel
            isAvailable: true,
            currentOrderId: null
        },
        {
            id: 'COU_006',
            name: 'Mike Tyson',
            currentLocation: { lat: 19.0728, lng: 72.8826 }, // Dadar
            isAvailable: true,
            currentOrderId: null
        },
        {
            id: 'COU_007',
            name: 'Arjun Reddy',
            currentLocation: { lat: 19.1197, lng: 72.9046 }, // Powai
            isAvailable: true,
            currentOrderId: null
        },
        {
            id: 'COU_008',
            name: 'Kavita Joshi',
            currentLocation: { lat: 19.0522, lng: 72.8820 }, // Parel
            isAvailable: true,
            currentOrderId: null
        },
        {
            id: 'COU_009',
            name: 'Rohit Nair',
            currentLocation: { lat: 18.9894, lng: 72.8360 }, // Colaba
            isAvailable: true,
            currentOrderId: null
        },
        {
            id: 'COU_010',
            name: 'Anjali Verma',
            currentLocation: { lat: 19.0544, lng: 72.8320 }, // Breach Candy
            isAvailable: true,
            currentOrderId: null
        }
    ];

    initialCouriers.forEach(courier => {
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
            ordersInProgress: Array.from(this.orders.values()).filter(o => !['DELIVERED', 'CANCELLED'].includes(o.state)).length
        };
    }
}

module.exports = new InMemoryStore();