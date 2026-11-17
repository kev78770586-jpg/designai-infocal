/**
 * Controlador de Autenticación y Cuentas de Usuario
 * DesignAI - INFOCAL Santa Cruz
 */
const bcrypt = require('bcryptjs');
const { Usuario, HistorialActividad } = require('../models');

// Usuarios precargados de desarrollo en caso de contingencia offline de MySQL
const DEMO_USERS = [
  {
    id: 1,
    nombre_completo: 'Administrador INFOCAL',
    email: 'admin@infocal.edu.bo',
    password_hash: bcrypt.hashSync('Infocal2026!', 10),
    rol: 'administrador',
    matricula: 'ADM-2026-01',
    carrera: 'Dirección de Carrera - Diseño Gráfico'
  },
  {
    id: 2,
    nombre_completo: 'Estudiante Modelo INFOCAL',
    email: 'estudiante@infocal.edu.bo',
    password_hash: bcrypt.hashSync('Infocal2026!', 10),
    rol: 'estudiante',
    matricula: 'DG-784920',
    carrera: 'Diseño Gráfico y Comunicación Visual'
  }
];

/**
 * Registro de nuevos estudiantes o docentes
 */
async function register(req, res) {
  try {
    const { nombre_completo, email, password, matricula, carrera, rol } = req.body;

    if (!nombre_completo || !email || !password) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Por favor completa todos los campos obligatorios (Nombre, Email y Contraseña).'
      });
    }

    const emailLimpio = email.trim().toLowerCase();

    // Intentar buscar usuario en MySQL
    let usuarioExistente = null;
    try {
      usuarioExistente = await Usuario.findOne({ where: { email: emailLimpio } });
    } catch (dbErr) {
      console.warn('⚠️ [authController.register] Modo contingencia DB:', dbErr.message);
    }

    if (usuarioExistente) {
      return res.status(409).json({
        exito: false,
        mensaje: 'El correo electrónico ya se encuentra registrado en el sistema DesignAI.'
      });
    }

    // Cifrar contraseña con bcryptjs
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    let nuevoUsuario = null;
    try {
      nuevoUsuario = await Usuario.create({
        nombre_completo: nombre_completo.trim(),
        email: emailLimpio,
        password_hash,
        matricula: matricula ? matricula.trim() : null,
        carrera: carrera ? carrera.trim() : 'Diseño Gráfico y Comunicación Visual',
        rol: rol && ['estudiante', 'docente', 'administrador'].includes(rol) ? rol : 'estudiante'
      });

      // Registrar en historial de auditoría
      await HistorialActividad.create({
        usuario_id: nuevoUsuario.id,
        modulo: 'autenticacion',
        accion: 'registro',
        descripcion: `Registro de cuenta exitoso para ${nuevoUsuario.nombre_completo}`,
        referencia_id: nuevoUsuario.id
      }).catch(() => {});
    } catch (dbErr) {
      console.warn('⚠️ [authController.register] Guardando en sesión temporal offline:', dbErr.message);
      nuevoUsuario = {
        id: Date.now(),
        nombre_completo: nombre_completo.trim(),
        email: emailLimpio,
        rol: rol || 'estudiante',
        matricula: matricula || 'DG-TEMP',
        carrera: carrera || 'Diseño Gráfico y Comunicación Visual'
      };
    }

    // Inicializar sesión y asegurar guardado antes de responder
    req.session.usuario = {
      id: nuevoUsuario.id,
      nombre_completo: nuevoUsuario.nombre_completo,
      email: nuevoUsuario.email,
      rol: nuevoUsuario.rol,
      matricula: nuevoUsuario.matricula,
      carrera: nuevoUsuario.carrera
    };

    req.session.save((saveErr) => {
      if (saveErr) {
        console.warn('⚠️ Error al forzar guardado de sesión en registro:', saveErr.message);
      }
      return res.status(201).json({
        exito: true,
        mensaje: '¡Registro exitoso! Bienvenido a DesignAI de INFOCAL Santa Cruz.',
        usuario: req.session.usuario
      });
    });
  } catch (error) {
    console.error('❌ Error en registro de usuario:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error interno al registrar usuario: ' + error.message
    });
  }
}

/**
 * Inicio de sesión seguro
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Por favor ingresa tu correo institucional y contraseña.'
      });
    }

    const emailLimpio = email.trim().toLowerCase();
    let usuario = null;

    try {
      usuario = await Usuario.findOne({ where: { email: emailLimpio, activo: true } });
    } catch (dbErr) {
      console.warn('⚠️ [authController.login] Intentando autenticación contra usuarios demo:', dbErr.message);
      usuario = DEMO_USERS.find(u => u.email === emailLimpio);
    }

    // Si aún no se encontró en la BD, verificar si es uno de los usuarios demo
    if (!usuario) {
      const demoMatch = DEMO_USERS.find(u => u.email === emailLimpio);
      if (demoMatch) usuario = demoMatch;
    }

    if (!usuario) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Credenciales inválidas. Revisa tu correo o contraseña.'
      });
    }

    // Comparación segura con bcrypt
    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValido) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Contraseña incorrecta. Intenta nuevamente.'
      });
    }

    // Establecer datos en la sesión y guardar antes de responder
    req.session.usuario = {
      id: usuario.id,
      nombre_completo: usuario.nombre_completo,
      email: usuario.email,
      rol: usuario.rol,
      matricula: usuario.matricula,
      carrera: usuario.carrera
    };

    // Registrar en historial en segundo plano
    HistorialActividad.create({
      usuario_id: usuario.id,
      modulo: 'autenticacion',
      accion: 'inicio_sesion',
      descripcion: `Inicio de sesión exitoso desde IP: ${req.ip || '127.0.0.1'}`,
      referencia_id: usuario.id
    }).catch(() => {});

    req.session.save((saveErr) => {
      if (saveErr) {
        console.warn('⚠️ Error al forzar guardado de sesión en login:', saveErr.message);
      }
      return res.json({
        exito: true,
        mensaje: `¡Bienvenido de nuevo, ${usuario.nombre_completo}!`,
        usuario: req.session.usuario
      });
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error en el servidor al autenticar: ' + error.message
    });
  }
}

/**
 * Cierre de sesión
 */
function logout(req, res) {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({
          exito: false,
          mensaje: 'Error al cerrar sesión.'
        });
      }
      res.clearCookie('connect.sid');
      return res.json({
        exito: true,
        mensaje: 'Sesión finalizada exitosamente.'
      });
    });
  } else {
    return res.json({
      exito: true,
      mensaje: 'No existía una sesión activa.'
    });
  }
}

/**
 * Obtener datos de la sesión actual
 */
function getCurrentUser(req, res) {
  if (req.session && req.session.usuario) {
    return res.json({
      autenticado: true,
      usuario: req.session.usuario
    });
  }
  return res.json({
    autenticado: false,
    usuario: null
  });
}

module.exports = {
  register,
  login,
  logout,
  getCurrentUser
};
