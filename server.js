/**
 * =============================================================================
 * SERVIDOR PRINCIPAL: DesignAI
 * Plataforma Inteligente de Asistencia para el Aprendizaje de Diseño Gráfico
 * INFOCAL Santa Cruz - Carrera de Diseño Gráfico y Comunicación Visual
 * =============================================================================
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
require('dotenv').config();

const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// =============================================================================
// MIDDLEWARES GENERALES
// =============================================================================

// Permitir solicitudes de orígenes cruzados (CORS)
app.use(cors());

// Parseo de cuerpos de petición JSON y URL-Encoded
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Parseo de cookies
app.use(cookieParser());

// Gestión de sesiones de usuario
app.use(session({
  secret: process.env.SESSION_SECRET || 'infocal_designai_default_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Servir la carpeta de vistas para HTML/Templates
app.use('/views', express.static(path.join(__dirname, 'views')));

// =============================================================================
// RUTA DE VERIFICACIÓN DE ESTADO (HEALTH CHECK)
// =============================================================================
app.get('/api/health', async (req, res) => {
  let dbStatus = 'Desconectada';
  try {
    await sequelize.authenticate();
    dbStatus = 'Conectada y operativa';
  } catch (err) {
    dbStatus = `Error de conexión: ${err.message}`;
  }

  const hasApiKey = Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('tu_clave'));

  res.json({
    sistema: 'DesignAI - INFOCAL Santa Cruz',
    version: '1.0.0',
    estado: 'Servidor en línea',
    timestamp: new Date().toISOString(),
    entorno: process.env.NODE_ENV || 'development',
    base_de_datos: {
      motor: 'MySQL (Sequelize)',
      estado: dbStatus,
      nombre: process.env.DB_NAME || 'designai_db'
    },
    inteligencia_artificial: {
      proveedor: 'Google Gemini Official SDK (@google/genai)',
      modelo: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      clave_configurada: hasApiKey,
      modo: hasApiKey ? 'En línea (Gemini Cloud API)' : 'Pedagógico / Demostración local'
    }
  });
});

// =============================================================================
// RUTAS DE LA API Y VISTAS
// =============================================================================
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const analizadorRoutes = require('./routes/analizadorRoutes');
const coloresRoutes = require('./routes/coloresRoutes');
const tipografiaRoutes = require('./routes/tipografiaRoutes');
const ideasRoutes = require('./routes/ideasRoutes');
const uiuxRoutes = require('./routes/uiuxRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analizador', analizadorRoutes);
app.use('/api/colores', coloresRoutes);
app.use('/api/tipografia', tipografiaRoutes);
app.use('/api/ideas', ideasRoutes);
app.use('/api/uiux', uiuxRoutes);

// Rutas de navegación web
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/analizador', (req, res) => res.sendFile(path.join(__dirname, 'public', 'analizador.html')));
app.get('/colores', (req, res) => res.sendFile(path.join(__dirname, 'public', 'colores.html')));
app.get('/tipografia', (req, res) => res.sendFile(path.join(__dirname, 'public', 'tipografia.html')));
app.get('/ideas', (req, res) => res.sendFile(path.join(__dirname, 'public', 'ideas.html')));
app.get('/uiux', (req, res) => res.sendFile(path.join(__dirname, 'public', 'uiux.html')));

// Ruta raíz por defecto
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// =============================================================================
// MANEJO GLOBAL DE ERRORES Y 404
// =============================================================================

// Manejador de rutas no encontradas
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      exito: false,
      mensaje: `Endpoint '${req.originalUrl}' no encontrado en DesignAI.`
    });
  }
  next();
});

// Manejador centralizado de errores robusto
app.use((err, req, res, next) => {
  console.error('❌ Error capturado en el servidor:', err.message || err);

  // Errores de Multer (Tamaño y Carga de Archivos)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      exito: false,
      mensaje: 'El archivo excede el límite máximo permitido de 10MB. Por favor optimiza la imagen antes de subirla.',
      codigo_error: 'LIMIT_FILE_SIZE'
    });
  }

  if (err.message && err.message.includes('Formato de imagen no soportado')) {
    return res.status(400).json({
      exito: false,
      mensaje: err.message,
      codigo_error: 'INVALID_FILE_TYPE'
    });
  }

  // Error de sintaxis en el JSON enviado por el cliente
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      exito: false,
      mensaje: 'Cuerpo de solicitud JSON con formato incorrecto o corrupto.',
      codigo_error: 'INVALID_JSON'
    });
  }

  // Errores de Cuota o Acceso a la API de Google Gemini
  if (err.message && (err.message.includes('429') || err.message.includes('quota') || err.message.includes('RESOURCE_EXHAUSTED'))) {
    return res.status(429).json({
      exito: false,
      mensaje: 'Se ha alcanzado temporalmente el límite de cuota de la API de Gemini. Las funciones continúan disponibles en modo pedagógico.',
      codigo_error: 'GEMINI_QUOTA_EXCEEDED'
    });
  }

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    exito: false,
    mensaje: err.message || 'Ocurrió un error inesperado en el servidor.',
    codigo_error: err.code || 'INTERNAL_SERVER_ERROR'
  });
});

// =============================================================================
// INICIO DEL SERVIDOR Y VERIFICACIÓN DE BASE DE DATOS
// =============================================================================
async function startServer() {
  try {
    console.log('===============================================================');
    console.log('🎨 DesignAI - INFOCAL Santa Cruz');
    console.log('   Plataforma de Asistencia para el Aprendizaje de Diseño Gráfico');
    console.log('===============================================================');

    // Intentar verificación no bloqueante de conexión a Base de Datos
    sequelize.authenticate()
      .then(() => {
        console.log('✅ Base de Datos MySQL conectada exitosamente.');
      })
      .catch((err) => {
        console.warn('⚠️  Aviso: No se pudo conectar a MySQL en este momento (' + err.message + ').');
        console.warn('    Asegúrate de que el servicio MySQL esté iniciado y corre "npm run db:migrate".');
      });

    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en: http://localhost:${PORT}`);
      console.log(`📡 Endpoint de diagnóstico: http://localhost:${PORT}/api/health`);
      console.log(`🤖 Modelo Gemini configurado: ${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}`);
      console.log('===============================================================');
    });
  } catch (error) {
    console.error('❌ Error fatal al iniciar el servidor:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
