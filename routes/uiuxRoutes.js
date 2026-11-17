/**
 * Rutas del Módulo 5: Evaluador de Interfaces UI/UX
 * DesignAI - INFOCAL Santa Cruz
 */
const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const uiuxController = require('../controllers/uiuxController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.post('/evaluar', isAuthenticated, upload.single('imagen_interfaz'), uiuxController.evaluarInterfaz);
router.get('/historial', isAuthenticated, uiuxController.getHistorialUIUX);

module.exports = router;
