/**
 * Controlador del Módulo 4: Generador de Ideas y Conceptos Creativos
 * DesignAI - INFOCAL Santa Cruz
 */
const { IdeaConcepto, HistorialActividad } = require('../models');
const aiService = require('../services/aiService');

/**
 * Genera propuestas conceptuales a partir de un brief creativo
 */
async function generarIdeas(req, res) {
  try {
    const usuario = req.session.usuario || { id: 2 };
    const { brief, categoria, publico_meta, proyecto_id } = req.body;

    if (!brief || brief.trim() === '') {
      return res.status(400).json({
        exito: false,
        mensaje: 'Por favor ingresa la descripción o brief del proyecto para desarrollar ideas.'
      });
    }

    // 1. Invocar Gemini
    const resultadoIA = await aiService.generarIdeasConceptos({
      brief: brief.trim(),
      categoria: categoria || 'Branding / Campaña Gráfica',
      publicoMeta: publico_meta || 'Audiencia general'
    });

    // 2. Persistir en MySQL
    let nuevoRegistro = null;
    try {
      nuevoRegistro = await IdeaConcepto.create({
        usuario_id: usuario.id,
        proyecto_id: proyecto_id ? parseInt(proyecto_id, 10) : null,
        prompt_idea: brief.trim(),
        categoria: categoria || 'Branding / Campaña Gráfica',
        publico_meta: publico_meta || null,
        palabras_clave: resultadoIA.palabras_clave,
        propuestas_conceptuales: resultadoIA.propuestas,
        orientacion_cromatica: resultadoIA.orientacion_cromatica,
        estilo_visual_sugerido: (resultadoIA.propuestas && resultadoIA.propuestas[0]) ? resultadoIA.propuestas[0].estilo_grafico : null,
        resultado_json: resultadoIA
      });

      // Registrar en historial
      await HistorialActividad.create({
        usuario_id: usuario.id,
        modulo: 'ideas',
        accion: 'ideas_generadas',
        descripcion: `Brainstorming para: "${(brief.substring(0, 45))}..." (${resultadoIA.propuestas.length} propuestas)`,
        referencia_id: nuevoRegistro.id,
        metadatos: { palabras_clave: resultadoIA.palabras_clave }
      }).catch(() => {});
    } catch (dbErr) {
      console.warn('⚠️ [ideasController] Contingencia offline DB:', dbErr.message);
      nuevoRegistro = {
        id: Date.now(),
        usuario_id: usuario.id,
        prompt_idea: brief,
        resultado_json: resultadoIA,
        creado_en: new Date()
      };
    }

    return res.status(201).json({
      exito: true,
      mensaje: '¡Propuestas conceptuales generadas exitosamente!',
      idea_id: nuevoRegistro.id,
      resultado: resultadoIA
    });
  } catch (error) {
    console.error('❌ Error en generarIdeas:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al generar propuestas creativas: ' + error.message
    });
  }
}

/**
 * Obtener historial de ideas generadas
 */
async function getHistorialIdeas(req, res) {
  try {
    const usuario = req.session.usuario || { id: 2 };
    let registros = [];
    try {
      registros = await IdeaConcepto.findAll({
        where: { usuario_id: usuario.id },
        order: [['creado_en', 'DESC']],
        limit: 20
      });
    } catch (dbErr) {
      console.warn('⚠️ [ideasController.getHistorial] DB offline');
    }

    return res.json({
      exito: true,
      total: registros.length,
      ideas: registros
    });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener el historial de ideas.'
    });
  }
}

module.exports = {
  generarIdeas,
  getHistorialIdeas
};
