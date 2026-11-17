/**
 * Rutas del Dashboard
 * DesignAI - INFOCAL Santa Cruz
 */
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Endpoint de estadísticas (con middleware de autenticación)
router.get('/stats', isAuthenticated, dashboardController.getStats);

module.exports = router;
