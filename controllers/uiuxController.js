/**
 * Controlador del Módulo 5: Evaluador de Interfaces UI/UX
 * DesignAI - INFOCAL Santa Cruz
 */
const { EvaluadorUIUX, HistorialActividad } = require('../models');
const aiService = require('../services/aiService');

/**
 * Evalúa capturas de pantalla de interfaces móviles o de escritorio
 */
async function evaluarInterfaz(req, res) {
  try {
    const usuario = req.session.usuario || { id: 2 };
    const { titulo_pantalla, tipo_dispositivo, contexto, proyecto_id } = req.body;

    if (!req.file) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Por favor sube una captura de pantalla de la interfaz (JPG, PNG o WEBP).'
      });
    }

    const imagePath = req.file.path;
    const mimeType = req.file.mimetype;
    const imagenUrl = `/uploads/${req.file.filename}`;

    // 1. Invocar Gemini
    const resultadoIA = await aiService.evaluarUIUX({
      imagePath,
      mimeType,
      tituloPantalla: titulo_pantalla || 'Interfaz Digital',
      tipoDispositivo: tipo_dispositivo || 'mobile',
      contexto: contexto || ''
    });

    // 2. Persistir en MySQL
    let nuevoRegistro = null;
    try {
      nuevoRegistro = await EvaluadorUIUX.create({
        usuario_id: usuario.id,
        proyecto_id: proyecto_id ? parseInt(proyecto_id, 10) : null,
        titulo_pantalla: (titulo_pantalla || 'Interfaz de Usuario').trim(),
        tipo_dispositivo: tipo_dispositivo || 'mobile',
        imagen_url: imagenUrl,
        puntaje_usabilidad: resultadoIA.puntaje_usabilidad,
        evaluacion_distribucion: resultadoIA.analisis_distribucion,
        evaluacion_legibilidad: resultadoIA.analisis_legibilidad,
        evaluacion_accesibilidad: resultadoIA.analisis_accesibilidad,
        hallazgos_heuristica: {
          positivos: resultadoIA.hallazgos_positivos,
          mejoras: resultadoIA.oportunidades_mejora
        },
        recomendaciones_ux: resultadoIA.recomendaciones_accionables,
        resultado_json: resultadoIA
      });

      // Registrar en historial
      await HistorialActividad.create({
        usuario_id: usuario.id,
        modulo: 'ui_ux',
        accion: 'evaluacion_uiux',
        descripcion: `Auditoría UI/UX (${tipo_dispositivo}): "${titulo_pantalla || 'Pantalla'}" (Usabilidad: ${resultadoIA.puntaje_usabilidad}/10)`,
        referencia_id: nuevoRegistro.id,
        metadatos: { usabilidad: resultadoIA.puntaje_usabilidad, imagen_url: imagenUrl }
      }).catch(() => {});
    } catch (dbErr) {
      console.warn('⚠️ [uiuxController] Contingencia DB offline:', dbErr.message);
      nuevoRegistro = {
        id: Date.now(),
        usuario_id: usuario.id,
        titulo_pantalla: titulo_pantalla || 'Interfaz UI',
        imagen_url: imagenUrl,
        resultado_json: resultadoIA,
        creado_en: new Date()
      };
    }

    return res.status(201).json({
      exito: true,
      mensaje: '¡Auditoría UI/UX completada exitosamente!',
      evaluacion_id: nuevoRegistro.id,
      imagen_url: imagenUrl,
      resultado: resultadoIA
    });
  } catch (error) {
    console.error('❌ Error en evaluarInterfaz:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al evaluar la interfaz UI/UX: ' + error.message
    });
  }
}

/**
 * Obtener historial de auditorías UI/UX
 */
async function getHistorialUIUX(req, res) {
  try {
    const usuario = req.session.usuario || { id: 2 };
    let registros = [];
    try {
      registros = await EvaluadorUIUX.findAll({
        where: { usuario_id: usuario.id },
        order: [['creado_en', 'DESC']],
        limit: 20
      });
    } catch (dbErr) {
      console.warn('⚠️ [uiuxController.getHistorial] DB offline');
    }

    return res.json({
      exito: true,
      total: registros.length,
      evaluaciones: registros
    });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener el historial UI/UX.'
    });
  }
}

module.exports = {
  evaluarInterfaz,
  getHistorialUIUX
};
