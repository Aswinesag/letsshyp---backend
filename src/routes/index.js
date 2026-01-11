const express = require('express');
const router = express.Router();
const orderRoutes = require('./orderRoutes');
const courierRoutes = require('./courierRoutes');
const simulationRoutes = require('./simulationRoutes');
const store = require('../storage/InMemoryStore');

// Health check
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Stats
router.get('/stats', (req, res) => {
    res.json({
        success: true,
        data: store.getStats()
    });
});

// Mount sub-routes
router.use('/orders', orderRoutes);
router.use('/couriers', courierRoutes);
router.use('/simulation', simulationRoutes);

module.exports = router;