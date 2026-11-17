/**
 * Rutas del Módulo 2: Generador Inteligente de Paletas de Colores
 * DesignAI - INFOCAL Santa Cruz
 */
const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const coloresController = require('../controllers/coloresController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Generación por concepto / brief
router.post('/generar', isAuthenticated, coloresController.generarPaleta);

// Extracción multimodal desde imagen
router.post('/extraer-imagen', isAuthenticated, upload.single('imagen_paleta'), coloresController.extraerPaletaImagen);

// Historial
router.get('/historial', isAuthenticated, coloresController.getHistorialPaletas);

module.exports = router;
