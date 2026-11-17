/**
 * Controlador del Módulo 3: Asistente Tipográfico
 * DesignAI - INFOCAL Santa Cruz
 */
const { AsistenteTipografico, HistorialActividad } = require('../models');
const aiService = require('../services/aiService');
const memoryHistory = require('../services/memoryHistory');

/**
 * Recomienda combinaciones tipográficas y jerarquías visuales
 */
async function recomendarTipografia(req, res) {
  try {
    const usuario = req.session.usuario || { id: 2 };
    const { tipo_proyecto, estilo_deseado, contexto, proyecto_id } = req.body;

    if (!tipo_proyecto || !estilo_deseado) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Por favor especifica el tipo de proyecto y el estilo tipográfico deseado.'
      });
    }

    // 1. Invocar Gemini
    const resultadoIA = await aiService.recomendarTipografia({
      tipoProyecto: tipo_proyecto.trim(),
      estiloDeseado: estilo_deseado.trim(),
      contexto: contexto || ''
    });

    // 2. Persistir en MySQL
    let nuevoRegistro = null;
    try {
      nuevoRegistro = await AsistenteTipografico.create({
        usuario_id: usuario.id,
        proyecto_id: proyecto_id ? parseInt(proyecto_id, 10) : null,
        tipo_proyecto: tipo_proyecto.trim(),
        estilo_deseado: estilo_deseado.trim(),
        fuente_titulo: resultadoIA.fuente_titulo,
        fuente_cuerpo: resultadoIA.fuente_cuerpo,
        fuente_acento: resultadoIA.fuente_acento || null,
        justificacion_combinacion: resultadoIA.justificacion_combinacion,
        reglas_jerarquia: resultadoIA.reglas_jerarquia,
        enlaces_google_fonts: resultadoIA.enlaces_google_fonts,
        resultado_json: resultadoIA
      });

      // Registrar actividad
      await HistorialActividad.create({
        usuario_id: usuario.id,
        modulo: 'tipografia',
        accion: 'combinacion_recomendada',
        descripcion: `Emparejamiento para ${tipo_proyecto}: ${resultadoIA.fuente_titulo} + ${resultadoIA.fuente_cuerpo}`,
        referencia_id: nuevoRegistro.id,
        metadatos: { titulo: resultadoIA.fuente_titulo, cuerpo: resultadoIA.fuente_cuerpo }
      }).catch(() => {});
    } catch (dbErr) {
      console.warn('⚠️ [tipografiaController] DB en contingencia offline:', dbErr.message);
      nuevoRegistro = {
        id: Date.now(),
        usuario_id: usuario.id,
        fuente_titulo: resultadoIA.fuente_titulo,
        fuente_cuerpo: resultadoIA.fuente_cuerpo,
        resultado_json: resultadoIA,
        creado_en: new Date()
      };
    }

    memoryHistory.addTipografia({
      id: nuevoRegistro.id,
      usuario_id: usuario.id,
      tipo_proyecto: tipo_proyecto.trim(),
      estilo_deseado: estilo_deseado.trim(),
      fuente_titulo: resultadoIA.fuente_titulo,
      fuente_cuerpo: resultadoIA.fuente_cuerpo,
      resultado_json: resultadoIA,
      creado_en: nuevoRegistro.creado_en || new Date()
    });

    return res.status(201).json({
      exito: true,
      mensaje: '¡Combinación tipográfica recomendada exitosamente!',
      tipografia_id: nuevoRegistro.id,
      resultado: resultadoIA
    });
  } catch (error) {
    console.error('❌ Error en recomendarTipografia:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al procesar recomendación tipográfica: ' + error.message
    });
  }
}

/**
 * Recomienda combinaciones tipográficas analizando la imagen subida por el estudiante
 */
async function recomendarTipografiaImagen(req, res) {
  try {
    const usuario = req.session.usuario || { id: 2 };
    const { tipo_proyecto, estilo_deseado, contexto, proyecto_id } = req.body;

    if (!req.file) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Por favor sube o arrastra una imagen (afiche, revista, logo, etc.) para analizar su tipografía.'
      });
    }

    const imagePath = req.file.path;
    const mimeType = req.file.mimetype;
    const imagenUrl = `/uploads/${req.file.filename}`;

    // 1. Invocar Gemini Multimodal
    const resultadoIA = await aiService.recomendarTipografiaDesdeImagen({
      imagePath,
      mimeType,
      tipoProyecto: tipo_proyecto || 'Editorial / Publicitario',
      estiloDeseado: estilo_deseado || 'Armónico con la imagen de referencia',
      contexto: contexto || ''
    });

    // 2. Persistir en MySQL
    let nuevoRegistro = null;
    try {
      nuevoRegistro = await AsistenteTipografico.create({
        usuario_id: usuario.id,
        proyecto_id: proyecto_id ? parseInt(proyecto_id, 10) : null,
        tipo_proyecto: (tipo_proyecto || 'Análisis Tipográfico de Imagen').trim(),
        estilo_deseado: (estilo_deseado || 'Inspirado en imagen').trim(),
        imagen_url: imagenUrl,
        fuente_titulo: resultadoIA.fuente_titulo,
        fuente_cuerpo: resultadoIA.fuente_cuerpo,
        fuente_acento: resultadoIA.fuente_acento || null,
        justificacion_combinacion: resultadoIA.justificacion_combinacion,
        reglas_jerarquia: resultadoIA.reglas_jerarquia,
        enlaces_google_fonts: resultadoIA.enlaces_google_fonts,
        resultado_json: resultadoIA
      });

      // Registrar actividad
      await HistorialActividad.create({
        usuario_id: usuario.id,
        modulo: 'tipografia',
        accion: 'tipografia_desde_imagen',
        descripcion: `Análisis tipográfico de imagen: ${resultadoIA.fuente_titulo} + ${resultadoIA.fuente_cuerpo}`,
        referencia_id: nuevoRegistro.id,
        metadatos: { titulo: resultadoIA.fuente_titulo, cuerpo: resultadoIA.fuente_cuerpo, imagen_url: imagenUrl }
      }).catch(() => {});
    } catch (dbErr) {
      console.warn('⚠️ [tipografiaController.recomendarTipografiaImagen] Contingencia offline DB:', dbErr.message);
      nuevoRegistro = {
        id: Date.now(),
        usuario_id: usuario.id,
        fuente_titulo: resultadoIA.fuente_titulo,
        fuente_cuerpo: resultadoIA.fuente_cuerpo,
        imagen_url: imagenUrl,
        resultado_json: resultadoIA,
        creado_en: new Date()
      };
    }

    memoryHistory.addTipografia({
      id: nuevoRegistro.id,
      usuario_id: usuario.id,
      tipo_proyecto: req.body.tipo_proyecto || 'Editorial / Imagen',
      estilo_deseado: req.body.estilo_deseado || 'Emparejamiento visual',
      fuente_titulo: resultadoIA.fuente_titulo,
      fuente_cuerpo: resultadoIA.fuente_cuerpo,
      imagen_url: imagenUrl,
      resultado_json: resultadoIA,
      creado_en: nuevoRegistro.creado_en || new Date()
    });

    return res.status(201).json({
      exito: true,
      mensaje: '¡Tipografía identificada y combinaciones recomendadas con éxito!',
      tipografia_id: nuevoRegistro.id,
      imagen_url: imagenUrl,
      resultado: resultadoIA
    });
  } catch (error) {
    console.error('❌ Error en recomendarTipografiaImagen:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al analizar la tipografía de la imagen: ' + error.message
    });
  }
}

/**
 * Obtener historial de consultas tipográficas
 */
async function getHistorialTipografia(req, res) {
  try {
    const usuario = req.session.usuario || { id: 2 };
    let registros = [];
    try {
      registros = await AsistenteTipografico.findAll({
        where: { usuario_id: usuario.id },
        order: [['creado_en', 'DESC']],
        limit: 20
      });
      if (registros.length === 0) {
        registros = await AsistenteTipografico.findAll({
          order: [['creado_en', 'DESC']],
          limit: 20
        });
      }
    } catch (dbErr) {
      console.warn('⚠️ [tipografiaController.getHistorial] DB offline');
    }

    if (registros.length === 0) {
      registros = memoryHistory.getTipografias(usuario.id);
    }

    return res.json({
      exito: true,
      total: registros.length,
      tipografias: registros
    });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener el historial tipográfico.'
    });
  }
}

module.exports = {
  recomendarTipografia,
  recomendarTipografiaImagen,
  getHistorialTipografia
};
