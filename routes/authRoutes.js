/**
 * Rutas de Autenticación
 * DesignAI - INFOCAL Santa Cruz
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Endpoints públicos
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.getCurrentUser);

module.exports = router;
