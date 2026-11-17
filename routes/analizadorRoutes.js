/**
 * Rutas del Módulo 1: Analizador Inteligente de Diseños Gráficos
 * DesignAI - INFOCAL Santa Cruz
 */
const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const analizadorController = require('../controllers/analizadorController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Evaluar diseño (con subida de imagen Multer y autenticación)
router.post('/evaluar', isAuthenticated, upload.single('imagen_diseno'), analizadorController.evaluarDiseno);

// Historial del estudiante
router.get('/historial', isAuthenticated, analizadorController.getHistorialAnalisis);

// Obtener análisis por ID
router.get('/:id', isAuthenticated, analizadorController.getAnalisisById);

module.exports = router;
