/**
 * Rutas del Módulo 3: Asistente Tipográfico
 * DesignAI - INFOCAL Santa Cruz
 */
const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const tipografiaController = require('../controllers/tipografiaController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Recomendación por proyecto / estilo
router.post('/recomendar', isAuthenticated, tipografiaController.recomendarTipografia);

// Identificación y emparejamiento multimodal desde imagen
router.post('/recomendar-imagen', isAuthenticated, upload.single('imagen_tipografia'), tipografiaController.recomendarTipografiaImagen);

// Historial
router.get('/historial', isAuthenticated, tipografiaController.getHistorialTipografia);

module.exports = router;
