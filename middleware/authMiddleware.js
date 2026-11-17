/**
 * Middlewares de Control de Autenticación y Autorización por Roles
 * DesignAI - INFOCAL Santa Cruz
 */

/**
 * Verifica si el usuario ha iniciado sesión.
 * Si es una petición API, responde con 401 JSON.
 * Si es una petición de navegación web, redirige a /login.html.
 */
function isAuthenticated(req, res, next) {
  if (req.session && req.session.usuario) {
    // Usuario autenticado, adjuntar datos al objeto de respuesta local
    res.locals.usuario = req.session.usuario;
    return next();
  }

  // Petición a endpoints API
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(401).json({
      exito: false,
      mensaje: 'Acceso no autorizado. Debes iniciar sesión para utilizar esta función.',
      codigo: 'UNAUTHORIZED'
    });
  }

  // Petición de navegación web
  return res.redirect('/login.html');
}

/**
 * Middleware para restringir acceso según el rol del usuario ('estudiante', 'docente', 'administrador').
 * @param  {...string} rolesPermitidos Lista de roles con permiso
 */
function hasRole(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.session || !req.session.usuario) {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(401).json({
          exito: false,
          mensaje: 'Sesión expirada o no iniciada.'
        });
      }
      return res.redirect('/login.html');
    }

    const { rol } = req.session.usuario;
    if (rolesPermitidos.includes(rol)) {
      return next();
    }

    if (req.originalUrl.startsWith('/api/')) {
      return res.status(403).json({
        exito: false,
        mensaje: `Acceso restringido. Esta función requiere rol: [${rolesPermitidos.join(', ')}]. Tu rol actual es: ${rol}.`,
        codigo: 'FORBIDDEN'
      });
    }

    return res.status(403).send('Acceso denegado: No tienes los privilegios necesarios para esta sección.');
  };
}

module.exports = {
  isAuthenticated,
  hasRole
};
