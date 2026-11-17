/**
 * Controlador del Módulo 2: Generador Inteligente de Paletas de Colores
 * DesignAI - INFOCAL Santa Cruz
 */
const { PaletaColor, HistorialActividad } = require('../models');
const aiService = require('../services/aiService');

/**
 * Genera una paleta de colores y evalúa ratios de contraste WCAG
 */
async function generarPaleta(req, res) {
  try {
    const usuario = req.session.usuario || { id: 2 };
    const { concepto, publico_objetivo, emocion_estilo, cantidad, proyecto_id } = req.body;

    if (!concepto || concepto.trim() === '') {
      return res.status(400).json({
        exito: false,
        mensaje: 'Por favor ingresa un concepto o brief cromático para generar la paleta.'
      });
    }

    // 1. Invocar Gemini
    const resultadoIA = await aiService.generarPaletaColores({
      concepto: concepto.trim(),
      publicoObjetivo: publico_objetivo || '',
      emocionEstilo: emocion_estilo || 'Armónico y profesional',
      cantidad: parseInt(cantidad, 10) || 5
    });

    // 2. Persistir en MySQL
    let nuevaPaleta = null;
    try {
      nuevaPaleta = await PaletaColor.create({
        usuario_id: usuario.id,
        proyecto_id: proyecto_id ? parseInt(proyecto_id, 10) : null,
        nombre_paleta: resultadoIA.nombre_paleta || 'Paleta Cromática Personalizada',
        concepto: concepto.trim(),
        publico_objetivo: publico_objetivo || null,
        emocion_estilo: emocion_estilo || null,
        colores_hex_rgb: resultadoIA.colores,
        evaluacion_wcag: resultadoIA.evaluacion_wcag,
        consejos_aplicacion: resultadoIA.consejos_aplicacion
      });

      // Registrar actividad
      await HistorialActividad.create({
        usuario_id: usuario.id,
        modulo: 'colores',
        accion: 'paleta_creada',
        descripcion: `Generación de paleta: "${resultadoIA.nombre_paleta}" con validación WCAG`,
        referencia_id: nuevaPaleta.id,
        metadatos: { colores: (resultadoIA.colores || []).map(c => c.hex) }
      }).catch(() => {});
    } catch (dbErr) {
      console.warn('⚠️ [coloresController] Persistencia en contingencia offline:', dbErr.message);
      nuevaPaleta = {
        id: Date.now(),
        usuario_id: usuario.id,
        nombre_paleta: resultadoIA.nombre_paleta,
        colores_hex_rgb: resultadoIA.colores,
        evaluacion_wcag: resultadoIA.evaluacion_wcag,
        consejos_aplicacion: resultadoIA.consejos_aplicacion,
        creado_en: new Date()
      };
    }

    return res.status(201).json({
      exito: true,
      mensaje: '¡Paleta de colores generada y evaluada con éxito!',
      paleta_id: nuevaPaleta.id,
      resultado: resultadoIA
    });
  } catch (error) {
    console.error('❌ Error en generarPaleta:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al generar la paleta de colores: ' + error.message
    });
  }
}

/**
 * Extrae una paleta armónica a partir de una imagen subida por el estudiante
 */
async function extraerPaletaImagen(req, res) {
  try {
    const usuario = req.session.usuario || { id: 2 };
    const { cantidad, enfoque, proyecto_id } = req.body;

    if (!req.file) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Por favor selecciona o arrastra una imagen (JPG, PNG o WEBP) para extraer su paleta de colores.'
      });
    }

    const imagePath = req.file.path;
    const mimeType = req.file.mimetype;
    const imagenUrl = `/uploads/${req.file.filename}`;

    // 1. Invocar Gemini Multimodal
    const resultadoIA = await aiService.extraerPaletaDeImagen({
      imagePath,
      mimeType,
      cantidad: parseInt(cantidad, 10) || 5,
      enfoque: enfoque || 'dominantes'
    });

    // 2. Persistir en MySQL
    let nuevaPaleta = null;
    try {
      nuevaPaleta = await PaletaColor.create({
        usuario_id: usuario.id,
        proyecto_id: proyecto_id ? parseInt(proyecto_id, 10) : null,
        nombre_paleta: resultadoIA.nombre_paleta || 'Paleta Extraída de Imagen',
        concepto: `Extracción cromática visual (${enfoque || 'tonos dominantes'})`,
        publico_objetivo: 'Referencia visual para proyecto gráfico',
        emocion_estilo: resultadoIA.emocion_asociada || 'Extracción visual',
        imagen_url: imagenUrl,
        colores_hex_rgb: resultadoIA.colores,
        evaluacion_wcag: resultadoIA.evaluacion_wcag,
        consejos_aplicacion: resultadoIA.consejos_aplicacion
      });

      // Registrar actividad
      await HistorialActividad.create({
        usuario_id: usuario.id,
        modulo: 'colores',
        accion: 'extraccion_paleta_imagen',
        descripcion: `Extracción de paleta desde imagen: "${resultadoIA.nombre_paleta}"`,
        referencia_id: nuevaPaleta.id,
        metadatos: { colores: (resultadoIA.colores || []).map(c => c.hex), imagen_url: imagenUrl }
      }).catch(() => {});
    } catch (dbErr) {
      console.warn('⚠️ [coloresController.extraerPaletaImagen] Contingencia offline DB:', dbErr.message);
      nuevaPaleta = {
        id: Date.now(),
        usuario_id: usuario.id,
        nombre_paleta: resultadoIA.nombre_paleta,
        imagen_url: imagenUrl,
        colores_hex_rgb: resultadoIA.colores,
        evaluacion_wcag: resultadoIA.evaluacion_wcag,
        consejos_aplicacion: resultadoIA.consejos_aplicacion,
        creado_en: new Date()
      };
    }

    return res.status(201).json({
      exito: true,
      mensaje: '¡Paleta de colores extraída y evaluada exitosamente!',
      paleta_id: nuevaPaleta.id,
      imagen_url: imagenUrl,
      resultado: resultadoIA
    });
  } catch (error) {
    console.error('❌ Error en extraerPaletaImagen:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al extraer la paleta de la imagen: ' + error.message
    });
  }
}

/**
 * Obtener historial de paletas creadas por el estudiante
 */
async function getHistorialPaletas(req, res) {
  try {
    const usuario = req.session.usuario || { id: 2 };
    let registros = [];
    try {
      registros = await PaletaColor.findAll({
        where: { usuario_id: usuario.id },
        order: [['creado_en', 'DESC']],
        limit: 20
      });
    } catch (dbErr) {
      console.warn('⚠️ [coloresController.getHistorial] DB offline');
    }

    return res.json({
      exito: true,
      total: registros.length,
      paletas: registros
    });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener el historial de paletas.'
    });
  }
}

module.exports = {
  generarPaleta,
  extraerPaletaImagen,
  getHistorialPaletas
};
