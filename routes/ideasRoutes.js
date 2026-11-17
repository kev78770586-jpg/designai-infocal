/**
 * Rutas del Módulo 4: Generador de Ideas y Conceptos Creativos
 * DesignAI - INFOCAL Santa Cruz
 */
const express = require('express');
const router = express.Router();
const ideasController = require('../controllers/ideasController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.post('/generar', isAuthenticated, ideasController.generarIdeas);
router.get('/historial', isAuthenticated, ideasController.getHistorialIdeas);

module.exports = router;
