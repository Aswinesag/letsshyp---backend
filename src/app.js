const express = require('express');
const cors = require('cors');
const store = require('./storage/InMemoryStore');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

app.get('/api/test/couriers', (req, res) => {
    res.json({
        couriers: store.getAllCouriers()
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Stats: http://localhost:${PORT}/api/stats`);
    console.log(`Couriers: http://localhost:${PORT}/api/test/couriers`);
});

module.exports = app;