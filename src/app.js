const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware (simple)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Let\'s Shyp Backend API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/api/health',
            stats: '/api/stats',
            orders: '/api/orders',
            couriers: '/api/couriers'
        }
    });
});

// Mount API routes
app.use('/api', apiRoutes);

// Error handling (must be after all routes)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        error: 'Route not found' 
    });
});

// Start server
app.listen(PORT, () => {
    console.log('\n========================================');
    console.log(' Let\'s Shyp Backend Server Started');
    console.log('========================================');
    console.log(` Server URL: http://localhost:${PORT}`);
    console.log(` Stats: http://localhost:${PORT}/api/stats`);
    console.log(` Health: http://localhost:${PORT}/api/health`);
    console.log('\n API Endpoints:');
    console.log('   Orders:');
    console.log('     POST   /api/orders - Create order');
    console.log('     GET    /api/orders - Get all orders');
    console.log('     GET    /api/orders/:id - Get order by ID');
    console.log('     PATCH  /api/orders/:id/state - Update order state');
    console.log('     DELETE /api/orders/:id - Cancel order');
    console.log('     POST   /api/orders/:id/progress - Progress order');
    console.log('\n   Couriers:');
    console.log('     GET    /api/couriers - Get all couriers');
    console.log('     GET    /api/couriers/available - Get available couriers');
    console.log('     GET    /api/couriers/:id - Get courier by ID');
    console.log('     PATCH  /api/couriers/:id/location - Update location');
    console.log('     POST   /api/couriers/:id/move - Move courier');
    console.log('========================================\n');
});

module.exports = app;