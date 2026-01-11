const express = require('express');
const cors = require('cors');
const store = require('./storage/InMemoryStore');
const { calculateManhattanDistance, EXPRESS_MAX_DISTANCE_KM } = require('./utils/distanceCalculator');
const { canTransition, getValidNextStates } = require('./utils/stateValidator');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const orderService = require('./services/OrderService');
const courierService = require('./services/CourierService');

console.log('OrderService loaded:', typeof orderService);
console.log('OrderService.createOrder:', typeof orderService.createOrder);


app.get('/', (req, res) => {
    res.json({
        message: 'Let\'s Shyp Backend API',
        status: 'running',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/stats', (req, res) => {
    res.json(store.getStats());
});

app.get('/stats', (req, res) => {
    res.json(store.getStats());
});

app.get('/couriers', (req, res) => {
    res.json({
        couriers: store.getAllCouriers()
    });
});

app.get('/api/test/couriers', (req, res) => {
    res.json({
        couriers: store.getAllCouriers()
    });
});

app.get('/api/test/utils', (req, res) => {
    const loc1 = { lat: 19.0760, lng: 72.8777 };
    const loc2 = { lat: 19.0896, lng: 72.8656 };

    res.json({
        distanceCalculator: {
            location1: loc1,
            location2: loc2,
            distance: calculateManhattanDistance(loc1, loc2),
            expressMaxDistance: EXPRESS_MAX_DISTANCE_KM
        },
        stateValidator: {
            canTransitionCreatedToAssigned: canTransition('CREATED', 'ASSIGNED'),
            canTransitionCreatedToDelivered: canTransition('CREATED', 'DELIVERED'),
            validNextStatesFromCreated: getValidNextStates('CREATED'),
            validNextStatesFromAssigned: getValidNextStates('ASSIGNED')
        }
    });
});

app.get('/simple-test', (req, res) => {
    res.json({ message: 'Simple route works!' });
});

app.post('/simple-post', (req, res) => {
    res.json({ message: 'Simple POST works!' });
});

app.post('/api/test/create-order', async (req, res, next) => {
    console.log('✅ Create order route hit!');
    try {
        const testOrder = {
            pickupLocation: { lat: 19.0760, lng: 72.8777 },
            dropLocation: { lat: 19.0896, lng: 72.8656 },
            deliveryType: 'EXPRESS',
            packageDetails: {
            weight: 5,
            dimensions: 'medium'
            }
        };

        console.log('Creating order...');
        const result = await orderService.createOrder(testOrder);
        console.log('Order created successfully');
    
        res.json({
            success: true,
            message: 'Order created successfully',
            ...result
        });
    } catch (error) {
        console.error('Error in create-order:', error);
        next(error);
    }
});

console.log('POST /api/test/create-order route registered');

app.get('/api/test/orders', (req, res, next) => {
    try {
        const orders = orderService.getAllOrders();
        res.json({
            count: orders.length,
            orders
        });
    } catch (error) {
        next(error);
    }
});

app.get('/api/test/orders/:id', (req, res, next) => {
    try {
        const order = orderService.getOrderById(req.params.id);
        res.json({ 
            success: true,
            order 
        });
    } catch (error) {
        next(error);
    }
});

app.patch('/api/test/orders/:id/state', async (req, res, next) => {
    try {
        const { state } = req.body;
        if (!state) {
            throw new Error('State is required in request body');
        }
        const order = await orderService.updateOrderState(req.params.id, state);
        res.json({
            success: true,
            message: `Order state updated to ${state}`,
            order
        });
    } catch (error) {
        next(error);
    }
});

app.post('/api/test/orders/:id/progress', async (req, res, next) => {
    try {
        const result = await orderService.simulateOrderProgression(req.params.id);
        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
});

app.delete('/api/test/orders/:id', async (req, res, next) => {
    try {
        const order = await orderService.cancelOrder(req.params.id);
        res.json({
            success: true,
            message: 'Order cancelled successfully',
            order
        });
    } catch (error) {
        next(error);
    }
});

app.post('/api/test/concurrent-orders', async (req, res, next) => {
    try {
        const testOrder1 = {
            pickupLocation: { lat: 19.0760, lng: 72.8777 },
            dropLocation: { lat: 19.0896, lng: 72.8656 },
            deliveryType: 'EXPRESS',
            packageDetails: { weight: 3, dimensions: 'small' }
        };

        const testOrder2 = {
            pickupLocation: { lat: 19.0765, lng: 72.8780 },
            dropLocation: { lat: 19.0900, lng: 72.8660 },
            deliveryType: 'EXPRESS',
            packageDetails: { weight: 4, dimensions: 'medium' }
        };

        const results = await Promise.all([
            orderService.createOrder(testOrder1),
            orderService.createOrder(testOrder2)
        ]);

        res.json({
            success: true,
            message: 'Both orders created concurrently',
            order1: results[0],
            order2: results[1],
            sameCourier: results[0].order.courierId === results[1].order.courierId,
            note: 'sameCourier should be false (different couriers assigned)'
        });
    } catch (error) {
        next(error);
    }
});

app.post('/api/test/express-no-courier', async (req, res, next) => {
    try {
        const testOrder = {
            pickupLocation: { lat: 20.0000, lng: 73.0000 },
            dropLocation: { lat: 20.0100, lng: 73.0100 },
            deliveryType: 'EXPRESS',
            packageDetails: { weight: 2, dimensions: 'small' }
        };

        const result = await orderService.createOrder(testOrder);
            res.json({
                success: true,
                message: 'Order created but assignment may have failed',
                ...result
            });
    } catch (error) {
        next(error);
    }
});

app.post('/api/test/invalid-transition', async (req, res, next) => {
    try {
        const testOrder = {
            pickupLocation: { lat: 19.0760, lng: 72.8777 },
            dropLocation: { lat: 19.0896, lng: 72.8656 },
            deliveryType: 'NORMAL',
            packageDetails: { weight: 5, dimensions: 'medium' }
        };

        const result = await orderService.createOrder(testOrder);
        const orderId = result.order.id;

        try {
            await orderService.updateOrderState(orderId, 'DELIVERED');
            res.json({ 
                success: false, 
                message: 'Should have failed but didn\'t!' 
            });
        } catch (error) {
            res.json({
                success: true,
                message: 'Invalid transition correctly blocked!',
                error: error.message,
                orderId
            });
        }
    } catch (error) {
        next(error);
    }
});

app.get('/api/routes', (req, res) => {
    const routes = [];
    if (app._router && app._router.stack) {
        app._router.stack.forEach((middleware) => {
            if (middleware.route) {
                routes.push({
                    path: middleware.route.path,
                    methods: Object.keys(middleware.route.methods)
                });
            }
        });
    }
    res.json({ 
        totalRoutes: routes.length,
        routes 
    });
});

app.use(errorHandler);

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`\n Server running on http://localhost:${PORT}`);
    console.log(`Stats: http://localhost:${PORT}/api/stats`);
    console.log(`Couriers: http://localhost:${PORT}/couriers`);
    console.log(`\nTest Endpoints:`);
    console.log(`POST http://localhost:${PORT}/api/test/create-order`);
    console.log(`GET  http://localhost:${PORT}/api/test/orders`);
    console.log(`POST http://localhost:${PORT}/api/test/concurrent-orders`);
    console.log(`GET  http://localhost:${PORT}/api/routes\n`);
});

module.exports = app;