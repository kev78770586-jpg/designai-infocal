/**
 * Controlador del Módulo 1: Analizador Inteligente de Diseños Gráficos
 * DesignAI - INFOCAL Santa Cruz
 */
const path = require('path');
const fs = require('fs');
const { AnalisisDiseno, HistorialActividad, Proyecto } = require('../models');
const aiService = require('../services/aiService');

/**
 * Procesa y evalúa un diseño gráfico subido por el estudiante
 */
async function evaluarDiseno(req, res) {
  try {
    const usuario = req.session.usuario || { id: 2, nombre_completo: 'Estudiante INFOCAL' };
    const { titulo_diseno, tipo_diseno, contexto_diseno, proyecto_id } = req.body;

    if (!req.file) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Por favor selecciona una imagen para analizar (JPG, PNG o WEBP).'
      });
    }

    const imagePath = req.file.path;
    const mimeType = req.file.mimetype;
    const imagenUrl = `/uploads/${req.file.filename}`;

    // 1. Invocar el motor multimodal de Gemini
    const resultadoIA = await aiService.analizarDisenoGrafico({
      imagePath,
      mimeType,
      titulo: titulo_diseno || 'Diseño Gráfico',
      tipoDiseno: tipo_diseno || 'afiche',
      contexto: contexto_diseno || ''
    });

    // 2. Persistir en la base de datos MySQL
    let nuevoRegistro = null;
    try {
      nuevoRegistro = await AnalisisDiseno.create({
        usuario_id: usuario.id,
        proyecto_id: proyecto_id ? parseInt(proyecto_id, 10) : null,
        titulo_diseno: (titulo_diseno || 'Diseño Gráfico').trim(),
        tipo_diseno: tipo_diseno || 'afiche',
        contexto_diseno: contexto_diseno || null,
        imagen_url: imagenUrl,
        puntaje_general: resultadoIA.puntaje_general,
        puntaje_composicion: resultadoIA.puntaje_composicion,
        puntaje_jerarquia: resultadoIA.puntaje_jerarquia,
        puntaje_contraste: resultadoIA.puntaje_contraste,
        analisis_composicion: resultadoIA.analisis_composicion,
        analisis_jerarquia: resultadoIA.analisis_jerarquia,
        analisis_contraste: resultadoIA.analisis_contraste,
        recomendaciones_mejora: Array.isArray(resultadoIA.recomendaciones_mejora)
          ? resultadoIA.recomendaciones_mejora.join('\n')
          : resultadoIA.recomendaciones_mejora,
        resultado_json: resultadoIA
      });

      // Registrar en el historial de actividad
      await HistorialActividad.create({
        usuario_id: usuario.id,
        modulo: 'analizador',
        accion: 'analisis_diseno',
        descripcion: `Evaluación de ${tipo_diseno || 'diseño'}: "${titulo_diseno || 'Sin título'}" (Puntaje: ${resultadoIA.puntaje_general}/10)`,
        referencia_id: nuevoRegistro.id,
        metadatos: { puntaje: resultadoIA.puntaje_general, imagen_url: imagenUrl }
      }).catch(() => {});
    } catch (dbErr) {
      console.warn('⚠️ [analizadorController] Guardado en sesión temporal offline:', dbErr.message);
      nuevoRegistro = {
        id: Date.now(),
        usuario_id: usuario.id,
        titulo_diseno: titulo_diseno || 'Diseño Gráfico',
        imagen_url: imagenUrl,
        resultado_json: resultadoIA,
        creado_en: new Date()
      };
    }

    return res.status(201).json({
      exito: true,
      mensaje: '¡Análisis de diseño completado exitosamente!',
      analisis_id: nuevoRegistro.id,
      imagen_url: imagenUrl,
      resultado: resultadoIA
    });
  } catch (error) {
    console.error('❌ Error en evaluarDiseno:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al procesar el análisis de diseño: ' + error.message
    });
  }
}

/**
 * Obtiene el historial de análisis realizados por el estudiante
 */
async function getHistorialAnalisis(req, res) {
  try {
    const usuario = req.session.usuario || { id: 2 };
    let registros = [];
    try {
      registros = await AnalisisDiseno.findAll({
        where: { usuario_id: usuario.id },
        order: [['creado_en', 'DESC']],
        limit: 20
      });
    } catch (dbErr) {
      console.warn('⚠️ [analizadorController.getHistorial] DB offline');
    }

    return res.json({
      exito: true,
      total: registros.length,
      analisis: registros
    });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener el historial de análisis.'
    });
  }
}

/**
 * Obtiene un análisis específico por ID
 */
async function getAnalisisById(req, res) {
  try {
    const { id } = req.params;
    const registro = await AnalisisDiseno.findByPk(id);
    if (!registro) {
      return res.status(404).json({ exito: false, mensaje: 'Análisis no encontrado.' });
    }
    return res.json({ exito: true, analisis: registro });
  } catch (error) {
    return res.status(500).json({ exito: false, mensaje: 'Error al recuperar análisis.' });
  }
}

module.exports = {
  evaluarDiseno,
  getHistorialAnalisis,
  getAnalisisById
};
