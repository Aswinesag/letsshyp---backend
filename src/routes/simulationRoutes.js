const express = require('express');
const router = express.Router();
const simulationController = require('../controllers/simulationController');

// Simulation control routes
router.post('/start', simulationController.startSimulation);
router.post('/stop', simulationController.stopSimulation);
router.get('/status', simulationController.getSimulationStatus);
router.patch('/speed', simulationController.setSimulationSpeed);
router.patch('/step-size', simulationController.setMovementStepSize);

// Order progression routes
router.post('/orders/:id/force-progress', simulationController.forceProgressOrder);
router.get('/orders/:id/debug', simulationController.debugOrder);

module.exports = router;
