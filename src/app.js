const express = require('express');
const cors = require('cors');
const store = require('./storage/InMemoryStore');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { calculateManhattanDistance, EXPRESS_MAX_DISTANCE_KM } = require('./utils/distanceCalculator');
const { canTransition, getValidNextStates } = require('./utils/stateValidator');
const { errorHandler } = require('./middleware/errorHandler');


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

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Stats: http://localhost:${PORT}/api/stats`);
    console.log(`Couriers: http://localhost:${PORT}/api/test/couriers`);
});

module.exports = app;