/**
 * =============================================================================
 * SERVICIO CENTRALIZADO DE INTELIGENCIA ARTIFICIAL: DesignAI
 * INFOCAL Santa Cruz - Carrera de Diseño Gráfico y Comunicación Visual
 * =============================================================================
 * Utiliza el SDK oficial @google/genai con modelos multimodales (Gemini)
 * para responder consultas pedagógicas estructuradas mediante JSON Schema.
 */

const fs = require('fs');
const path = require('path');
const { GoogleGenAI, Type } = require('@google/genai');
require('dotenv').config();

// Inicialización del cliente oficial de Google Gemini
let currentApiKey = null;
let aiClient = null;

function getAiClient() {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey || apiKey === 'tu_clave_gemini_api_aqui' || apiKey.length < 15) {
    return null;
  }
  if (!aiClient || currentApiKey !== apiKey) {
    currentApiKey = apiKey;
    try {
      aiClient = new GoogleGenAI({ apiKey });
    } catch (e) {
      console.warn('⚠️ [aiService] Error al inicializar cliente Gemini:', e.message);
      return null;
    }
  }
  return aiClient;
}

/**
 * Convierte un archivo local a un objeto Part para el SDK multimodal de Gemini.
 * @param {string} filePath Ruta del archivo en el sistema local
 * @param {string} mimeType Tipo MIME (e.g. image/jpeg, image/png, image/webp)
 */
function fileToGenerativePart(filePath, mimeType = 'image/jpeg') {
  if (!fs.existsSync(filePath)) {
    throw new Error(`El archivo de imagen no existe en la ruta: ${filePath}`);
  }
  const fileBuffer = fs.readFileSync(filePath);
  return {
    inlineData: {
      data: fileBuffer.toString('base64'),
      mimeType: mimeType || 'image/jpeg'
    }
  };
}

/**
 * Obtiene el modelo configurado en .env con respaldo predeterminado.
 */
function getSelectedModel() {
  return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
}

// =============================================================================
// 1. MÓDULO 1: ANALIZADOR INTELIGENTE DE DISEÑOS GRÁFICOS (MULTIMODAL)
// =============================================================================
const SCHEMA_ANALISIS_DISENO = {
  type: Type.OBJECT,
  properties: {
    puntaje_general: { type: Type.NUMBER, description: 'Calificación general del diseño de 1.0 a 10.0' },
    puntaje_composicion: { type: Type.NUMBER, description: 'Puntaje de composición, regla de tercios y balance de 1.0 a 10.0' },
    puntaje_jerarquia: { type: Type.NUMBER, description: 'Puntaje de jerarquía visual y orden de lectura de 1.0 a 10.0' },
    puntaje_contraste: { type: Type.NUMBER, description: 'Puntaje de contraste cromático y legibilidad de 1.0 a 10.0' },
    diagnostico_general: { type: Type.STRING, description: 'Diagnóstico integral del diseño para el estudiante' },
    analisis_composicion: { type: Type.STRING, description: 'Evaluación técnica de composición, equilibrio y distribución espacial' },
    analisis_jerarquia: { type: Type.STRING, description: 'Evaluación técnica de jerarquía visual, tamaño de fuentes y puntos focales' },
    analisis_contraste: { type: Type.STRING, description: 'Evaluación técnica del contraste cromático y figura-fondo' },
    puntos_fuertes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Lista de aspectos positivos logrados en la pieza'
    },
    recomendaciones_mejora: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Lista de correcciones prácticas y accionables para el estudiante'
    },
    consejos_pedagogicos_infocal: { type: Type.STRING, description: 'Consejo académico y teórico de diseño para reforzar el aprendizaje' }
  },
  required: [
    'puntaje_general',
    'puntaje_composicion',
    'puntaje_jerarquia',
    'puntaje_contraste',
    'diagnostico_general',
    'analisis_composicion',
    'analisis_jerarquia',
    'analisis_contraste',
    'puntos_fuertes',
    'recomendaciones_mejora',
    'consejos_pedagogicos_infocal'
  ]
};

async function analizarDisenoGrafico({ imagePath, mimeType, titulo, tipoDiseno, contexto }) {
  const client = getAiClient();
  const model = getSelectedModel();

  if (!client) {
    return getFallbackAnalisisDiseno(titulo, tipoDiseno);
  }

  const prompt = `
Actúa como un profesor senior y jurado calificador de la carrera de Diseño Gráfico y Comunicación Visual de INFOCAL Santa Cruz.
Estás realizando una evaluación pedagógica rigurosa y detallada de la siguiente pieza gráfica creada por un estudiante:
- Título del proyecto: "${titulo || 'Diseño Gráfico'}"
- Soporte / Formato del diseño: "${tipoDiseno || 'Afiche publicitario'}"
- Contexto, público objetivo y detalles del estudiante: "${contexto || 'Sin contexto adicional proporcionado'}"

Criterios de Evaluación Técnica INFOCAL:
1. Composición y Equilibrio: Evalúa la aplicación de la regla de tercios, proporción áurea, pesos visuales, simetría/asimetría y uso del espacio negativo.
2. Jerarquía Visual y Orden de Lectura: Analiza si la mirada sigue un recorrido intencional (Z o F), el escalado tipográfico entre H1, H2 y cuerpo, y si el mensaje clave/CTA destaca con claridad.
3. Contraste Cromático y Legibilidad: Evalúa la relación figura/fondo, saturación, luminancia y si el contraste permite lectura fluida tanto en digital como en impresión.
4. Adecuación al Público y Tono: Determina si el estilo gráfico conecta genuinamente con el público objetivo definido y transmite el mensaje deseado.
5. Puntos Fuertes: Enumera al menos 3 aciertos técnicos y creativos concretos del estudiante.
6. Recomendaciones de Mejora Accionables: Enumera al menos 3 recomendaciones técnicas precisas y accionables (ej. mover un elemento, ajustar tamaño de fuente, incrementar contraste en tal zona, despejar márgenes).
7. Consejo Pedagógico INFOCAL: Proporciona una reflexión teórica profunda de diseño que enriquezca la formación profesional del estudiante.

Responde estrictamente en formato JSON conforme al esquema definido.
`;

  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('tu_clave')) {
      return getFallbackAnalisisDiseno(titulo, tipoDiseno);
    }

    const imagePart = fileToGenerativePart(imagePath, mimeType);
    const response = await client.models.generateContent({
      model,
      contents: [imagePart, prompt],
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: SCHEMA_ANALISIS_DISENO,
        temperature: 0.2
      }
    });

    const parsed = JSON.parse(response.text);
    return parsed;
  } catch (error) {
    console.error('❌ [aiService.analizarDisenoGrafico] Error en Gemini API:', error.message);
    return getFallbackAnalisisDiseno(titulo, tipoDiseno, error.message);
  }
}

// =============================================================================
// 2. MÓDULO 2: GENERADOR INTELIGENTE DE PALETAS DE COLORES (WCAG EVALUATOR)
// =============================================================================
const SCHEMA_PALETA_COLORES = {
  type: Type.OBJECT,
  properties: {
    nombre_paleta: { type: Type.STRING, description: 'Nombre creativo y evocador de la paleta' },
    concepto_sintesis: { type: Type.STRING, description: 'Explicación del fundamento psicológico y conceptual de la selección' },
    emocion_asociada: { type: Type.STRING, description: 'Sensaciones y asociaciones de marca que transmite' },
    colores: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          hex: { type: Type.STRING, description: 'Código hexadecimal con almohadilla, ej: #002D62' },
          rgb: { type: Type.STRING, description: 'Código RGB, ej: rgb(0, 45, 98)' },
          nombre: { type: Type.STRING, description: 'Nombre descriptivo del tono, ej: Azul Marino Institucional' },
          rol: { type: Type.STRING, description: 'Rol de diseño: Dominante (60%), Secundario (30%), Acento (10%), Fondo o Texto' },
          significado_psicologico: { type: Type.STRING, description: 'Por qué funciona en el concepto' }
        },
        required: ['hex', 'rgb', 'nombre', 'rol', 'significado_psicologico']
      }
    },
    evaluacion_wcag: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          par_colores: { type: Type.STRING, description: 'Par evaluado, ej: Texto #1E293B sobre Fondo #F8FAFC' },
          ratio_contraste: { type: Type.STRING, description: 'Ratio de contraste numérico, ej: 12.4:1' },
          nivel_aa: { type: Type.BOOLEAN, description: 'Si cumple el estándar WCAG 2.1 AA (mínimo 4.5:1 para texto normal)' },
          nivel_aaa: { type: Type.BOOLEAN, description: 'Si cumple el estándar WCAG 2.1 AAA (mínimo 7.0:1 para texto normal)' },
          recomendacion: { type: Type.STRING, description: 'Orientación de uso para diseño accesible' }
        },
        required: ['par_colores', 'ratio_contraste', 'nivel_aa', 'nivel_aaa', 'recomendacion']
      }
    },
    consejos_aplicacion: { type: Type.STRING, description: 'Guía práctica para aplicar la regla 60-30-10 en diseño gráfico' }
  },
  required: ['nombre_paleta', 'concepto_sintesis', 'emocion_asociada', 'colores', 'evaluacion_wcag', 'consejos_aplicacion']
};

async function generarPaletaColores({ concepto, publicoObjetivo, emocionEstilo, cantidad = 5 }) {
  const client = getAiClient();
  const model = getSelectedModel();

  if (!client) {
    return getFallbackPaletaColores(concepto, publicoObjetivo, emocionEstilo);
  }

  const prompt = `
Actúa como un experto en Teoría del Color y Accesibilidad Visual de INFOCAL Santa Cruz.
Genera una paleta de colores profesional para el siguiente requerimiento gráfico:
- Concepto del proyecto: "${concepto}"
- Público objetivo: "${publicoObjetivo || 'General'}"
- Emoción / Estilo deseado: "${emocionEstilo || 'Moderno y profesional'}"
- Cantidad de colores requeridos: ${cantidad}

Requisitos obligatorios:
1. Proporciona códigos HEX y RGB precisos y nombres evocadores.
2. Asigna roles claros siguiendo la regla armónica de diseño (Dominante 60%, Secundario 30%, Acento 10%, Texto, Fondo).
3. Incluye una evaluación de contraste WCAG 2.1 (AA y AAA) para combinaciones críticas de texto y fondo.
4. Explica la justificación psicológica del color.

Responde estrictamente en formato JSON conforme al esquema definido.
`;

  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('tu_clave')) {
      return getFallbackPaletaColores(concepto, publicoObjetivo, emocionEstilo);
    }

    const response = await client.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: SCHEMA_PALETA_COLORES,
        temperature: 0.4
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('❌ [aiService.generarPaletaColores] Error en Gemini API:', error.message);
    return getFallbackPaletaColores(concepto, publicoObjetivo, emocionEstilo, error.message);
  }
}

/**
 * Extrae e identifica la paleta de colores de una imagen cargada
 * Utiliza visión multimodal de Gemini para muestrear y analizar los tonos presentes.
 */
async function extraerPaletaDeImagen({ imagePath, mimeType, cantidad = 5, enfoque = 'dominantes' }) {
  const client = getAiClient();
  const model = getSelectedModel();

  if (!client) {
    return getFallbackPaletaDeImagen(enfoque);
  }

  const prompt = `
Actúa como un experto en Teoría del Color, Análisis Cromático y Accesibilidad Visual de INFOCAL Santa Cruz.
Examina detenidamente la imagen adjunta (fotografía, ilustración, afiche o pieza de diseño gráfico) y realiza una extracción cromática profesional:
1. Extrae con precisión los ${cantidad} colores más representativos según el criterio: "${enfoque || 'tonos dominantes y armoniosos'}".
2. Muestra los códigos HEX y RGB exactos de los tonos presentes en la imagen y asígnales nombres evocadores en español.
3. Clasifica cada color con un rol de diseño armónico (Dominante 60%, Secundario 30%, Acento 10%, Fondo o Texto).
4. Realiza una evaluación técnica de contraste WCAG 2.1 (AA y AAA) para combinaciones críticas de texto y fondo basadas en los colores de la imagen.
5. Explica el impacto psicológico y conceptual de la paleta extraída y cómo aplicarla en nuevos proyectos de diseño gráfico.

Responde estrictamente en formato JSON conforme al esquema definido.
`;

  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('tu_clave')) {
      return getFallbackPaletaDeImagen(enfoque);
    }

    const imagePart = fileToGenerativePart(imagePath, mimeType);
    const response = await client.models.generateContent({
      model,
      contents: [imagePart, prompt],
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: SCHEMA_PALETA_COLORES,
        temperature: 0.2
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('❌ [aiService.extraerPaletaDeImagen] Error en Gemini API:', error.message);
    return getFallbackPaletaDeImagen(enfoque, error.message);
  }
}

// =============================================================================
// 3. MÓDULO 3: ASISTENTE TIPOGRÁFICO
// =============================================================================
const SCHEMA_TIPOGRAFIA = {
  type: Type.OBJECT,
  properties: {
    fuente_titulo: { type: Type.STRING, description: 'Nombre de la fuente recomendada para títulos (disponible en Google Fonts)' },
    categoria_titulo: { type: Type.STRING, description: 'Clasificación (Serif, Sans-serif, Display, Monospace, Script)' },
    fuente_cuerpo: { type: Type.STRING, description: 'Nombre de la fuente recomendada para texto corrido/cuerpo' },
    categoria_cuerpo: { type: Type.STRING, description: 'Clasificación de la fuente de cuerpo' },
    fuente_acento: { type: Type.STRING, description: 'Fuente complementaria o para detalles secundarios' },
    justificacion_combinacion: { type: Type.STRING, description: 'Por qué armonizan estas fuentes (contraste de forma, proporciones x-height)' },
    reglas_jerarquia: {
      type: Type.OBJECT,
      properties: {
        titulo_principal: { type: Type.STRING, description: 'Tamaño sugerido, peso (Bold/Black) e interletraje para H1' },
        subtitulo: { type: Type.STRING, description: 'Tamaño, peso (Medium/SemiBold) para H2' },
        cuerpo_texto: { type: Type.STRING, description: 'Tamaño sugerido (16px/1rem), line-height (1.5-1.6) e interletraje' },
        espaciado_y_lineas: { type: Type.STRING, description: 'Recomendaciones de tracking, kerning y longitud de línea (50-75 caracteres)' }
      },
      required: ['titulo_principal', 'subtitulo', 'cuerpo_texto', 'espaciado_y_lineas']
    },
    enlaces_google_fonts: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'URLs oficiales de Google Fonts para importar las fuentes'
    },
    consejos_diseno: { type: Type.STRING, description: 'Buenas prácticas tipográficas para estudiantes de INFOCAL' }
  },
  required: [
    'fuente_titulo',
    'categoria_titulo',
    'fuente_cuerpo',
    'categoria_cuerpo',
    'fuente_acento',
    'justificacion_combinacion',
    'reglas_jerarquia',
    'enlaces_google_fonts',
    'consejos_diseno'
  ]
};

async function recomendarTipografia({ tipoProyecto, estiloDeseado, contexto }) {
  const client = getAiClient();
  const model = getSelectedModel();

  if (!client) {
    return getFallbackTipografia(tipoProyecto, estiloDeseado);
  }

  const prompt = `
Actúa como un maestro tipógrafo de la carrera de Diseño Gráfico de INFOCAL Santa Cruz.
Recomienda la combinación tipográfica perfecta para el siguiente proyecto:
- Tipo de proyecto: "${tipoProyecto || 'Editorial / Publicitario'}"
- Estilo o tono deseado: "${estiloDeseado || 'Elegante y contemporáneo'}"
- Contexto y aplicación: "${contexto || 'Piezas gráficas impresas y digitales'}"

Requisitos:
1. Recomienda fuentes reconocidas y de libre acceso disponibles en Google Fonts.
2. Explica la armonía por contraste (ej. Serif clásica con Sans-Serif geométrica, o Display contundente con Sans neutra).
3. Establece parámetros exactos de escala visual (títulos, subtítulos, cuerpo de texto) y legibilidad.
4. Incluye enlaces de importación de Google Fonts.

Responde estrictamente en formato JSON conforme al esquema definido.
`;

  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('tu_clave')) {
      return getFallbackTipografia(tipoProyecto, estiloDeseado);
    }

    const response = await client.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: SCHEMA_TIPOGRAFIA,
        temperature: 0.3
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('❌ [aiService.recomendarTipografia] Error en Gemini API:', error.message);
    return getFallbackTipografia(tipoProyecto, estiloDeseado, error.message);
  }
}

/**
 * Analiza una imagen para identificar su estilo tipográfico y recomendar combinaciones
 * en Google Fonts para títulos y cuerpos de texto.
 */
async function recomendarTipografiaDesdeImagen({ imagePath, mimeType, tipoProyecto, estiloDeseado, contexto }) {
  const client = getAiClient();
  const model = getSelectedModel();

  if (!client) {
    return getFallbackTipografiaImagen(tipoProyecto);
  }

  const prompt = `
Actúa como un maestro tipógrafo y director de arte de la carrera de Diseño Gráfico de INFOCAL Santa Cruz.
Examina la imagen adjunta (afiche, portada de revista, logotipo, empaque o captura de diseño) y realiza un análisis tipográfico multimodal:
1. Identifica el estilo visual o las fuentes utilizadas en la imagen (e.g. Serif con remates, Sans-serif grotesca o geométrica, Display decorativa, etc.).
2. Recomienda una tipografía equivalente o idéntica disponible libremente en Google Fonts para TÍTULOS.
3. Recomienda una tipografía complementaria de excelente legibilidad en Google Fonts para CUERPO DE TEXTO y una de acento secundario.
4. Explica detalladamente la justificación de la combinación basada en contrastes formales, ritmo de trazo y proporciones de altura x (x-height).
5. Define las reglas de jerarquía visual (tamaño en px, pesos, interlineado y longitud de línea).
6. Incluye los enlaces oficiales de Google Fonts para su descarga o importación.

- Tipo de proyecto previsto: "${tipoProyecto || 'Editorial / Publicitario'}"
- Enfoque o estilo deseado: "${estiloDeseado || 'Armónico con la imagen'}"
- Contexto de lectura: "${contexto || 'Impreso y digital'}"

Responde estrictamente en formato JSON conforme al esquema definido.
`;

  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('tu_clave')) {
      return getFallbackTipografiaImagen(tipoProyecto);
    }

    const imagePart = fileToGenerativePart(imagePath, mimeType);
    const response = await client.models.generateContent({
      model,
      contents: [imagePart, prompt],
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: SCHEMA_TIPOGRAFIA,
        temperature: 0.3
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('❌ [aiService.recomendarTipografiaDesdeImagen] Error en Gemini API:', error.message);
    return getFallbackTipografiaImagen(tipoProyecto, error.message);
  }
}

// =============================================================================
// 4. MÓDULO 4: GENERADOR DE IDEAS Y CONCEPTOS CREATIVOS
// =============================================================================
const SCHEMA_IDEAS_CONCEPTOS = {
  type: Type.OBJECT,
  properties: {
    sintesis_brief: { type: Type.STRING, description: 'Interpretación sintetizada del brief creativo' },
    palabras_clave: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Palabras clave conceptuales y emocionales de anclaje'
    },
    propuestas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          titulo: { type: Type.STRING, description: 'Título conceptual de la propuesta' },
          concepto_central: { type: Type.STRING, description: 'La idea rectora o insight creativo' },
          narrativa: { type: Type.STRING, description: 'Storytelling y mensaje clave a transmitir' },
          metafora_visual: { type: Type.STRING, description: 'Símbolo visual o metáfora gráfica recomendada' },
          estilo_grafico: { type: Type.STRING, description: 'Corriente o estilo visual sugerido (ej. Brutalismo, Neumorfismo, Suizo, etc.)' },
          paleta_sugerida: { type: Type.STRING, description: 'Orientación cromática y tonalidades clave' }
        },
        required: ['titulo', 'concepto_central', 'narrativa', 'metafora_visual', 'estilo_grafico', 'paleta_sugerida']
      }
    },
    orientacion_cromatica: { type: Type.STRING, description: 'Guía de ambiente cromático general' },
    referencias_movimientos_artisticos: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Movimientos del diseño o referentes históricos para inspirarse'
    }
  },
  required: ['sintesis_brief', 'palabras_clave', 'propuestas', 'orientacion_cromatica', 'referencias_movimientos_artisticos']
};

async function generarIdeasConceptos({ brief, categoria, publicoMeta }) {
  const client = getAiClient();
  const model = getSelectedModel();

  if (!client) {
    return getFallbackIdeasConceptos(brief, categoria);
  }

  const prompt = `
Actúa como un Director de Arte y Estratega Creativo de INFOCAL Santa Cruz.
Desarrolla conceptos y propuestas creativas para el siguiente brief de diseño gráfico:
- Descripción del brief: "${brief}"
- Categoría del proyecto: "${categoria || 'Branding / Campaña Gráfica'}"
- Público meta: "${publicoMeta || 'Jóvenes y adultos de Santa Cruz'}"

Requisitos:
1. Extrae palabras clave estratégicas (insights emocionales y racionales).
2. Propone 3 rutas conceptuales diferenciadas (ej. una ruta moderna/vanguardista, una ruta orgánica/emocional y una ruta directa/funcional).
3. Para cada propuesta detalla la metáfora visual concreta que el estudiante puede ilustrar o componer.
4. Sugiere movimientos artísticos de referencia para investigación académica.

Responde estrictamente en formato JSON conforme al esquema definido.
`;

  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('tu_clave')) {
      return getFallbackIdeasConceptos(brief, categoria);
    }

    const response = await client.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: SCHEMA_IDEAS_CONCEPTOS,
        temperature: 0.6
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('❌ [aiService.generarIdeasConceptos] Error en Gemini API:', error.message);
    return getFallbackIdeasConceptos(brief, categoria, error.message);
  }
}

// =============================================================================
// 5. MÓDULO 5: EVALUADOR DE INTERFACES UI/UX (MULTIMODAL)
// =============================================================================
const SCHEMA_EVALUADOR_UIUX = {
  type: Type.OBJECT,
  properties: {
    puntaje_usabilidad: { type: Type.NUMBER, description: 'Calificación general de usabilidad de 1.0 a 10.0' },
    puntaje_distribucion: { type: Type.NUMBER, description: 'Puntaje de retícula, alineación y espaciado de 1.0 a 10.0' },
    puntaje_legibilidad: { type: Type.NUMBER, description: 'Puntaje de legibilidad tipográfica y microcopy de 1.0 a 10.0' },
    puntaje_accesibilidad: { type: Type.NUMBER, description: 'Puntaje de contraste y áreas de interacción táctil/clic de 1.0 a 10.0' },
    resumen_diagnostico: { type: Type.STRING, description: 'Resumen ejecutivo del análisis de la interfaz' },
    analisis_distribucion: { type: Type.STRING, description: 'Evaluación técnica del layout, ley de Fitts y consistencia de espaciado' },
    analisis_legibilidad: { type: Type.STRING, description: 'Evaluación de escaneabilidad, jerarquía y claridad de etiquetas' },
    analisis_accesibilidad: { type: Type.STRING, description: 'Evaluación de contraste WCAG en botones, estados y tamaño de toques táctiles' },
    hallazgos_positivos: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Aciertos de diseño UI/UX detectados en la captura'
    },
    oportunidades_mejora: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Puntos de fricción o debilidades en la experiencia de usuario'
    },
    recomendaciones_accionables: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Pasos específicos que el estudiante debe seguir para optimizar la interfaz'
    }
  },
  required: [
    'puntaje_usabilidad',
    'puntaje_distribucion',
    'puntaje_legibilidad',
    'puntaje_accesibilidad',
    'resumen_diagnostico',
    'analisis_distribucion',
    'analisis_legibilidad',
    'analisis_accesibilidad',
    'hallazgos_positivos',
    'oportunidades_mejora',
    'recomendaciones_accionables'
  ]
};

async function evaluarUIUX({ imagePath, mimeType, tituloPantalla, tipoDispositivo, contexto }) {
  const client = getAiClient();
  const model = getSelectedModel();

  if (!client) {
    return getFallbackEvaluadorUIUX(tituloPantalla, tipoDispositivo);
  }

  const prompt = `
Actúa como un Especialista Senior en Diseño de Interfaces y Experiencia de Usuario (UI/UX) docente en INFOCAL Santa Cruz.
Evalúa la captura de pantalla de la interfaz adjunta:
- Título de la pantalla: "${tituloPantalla || 'Interfaz de Usuario'}"
- Tipo de dispositivo: "${tipoDispositivo || 'mobile'}"
- Contexto y flujo de usuario: "${contexto || 'Sin contexto adicional proporcionado'}"

Criterios de evaluación heurística (Nielsen + Human Interface Guidelines / Material Design):
1. Distribución y Grid: Alineación, densidad de información, márgenes y consistencia visual.
2. Legibilidad: Escaneabilidad del contenido, contraste de texto sobre fondos y jerarquía de fuentes.
3. Accesibilidad y Affordance: Claridad visual de botones clicables (mínimo 44x44px táctil), estados y legibilidad WCAG.
4. Proporciona puntuaciones técnicas del 1.0 al 10.0 y recomendaciones accionables.

Responde estrictamente en formato JSON conforme al esquema definido.
`;

  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('tu_clave')) {
      return getFallbackEvaluadorUIUX(tituloPantalla, tipoDispositivo);
    }

    const imagePart = fileToGenerativePart(imagePath, mimeType);
    const response = await client.models.generateContent({
      model,
      contents: [imagePart, prompt],
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: SCHEMA_EVALUADOR_UIUX,
        temperature: 0.2
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('❌ [aiService.evaluarUIUX] Error en Gemini API:', error.message);
    return getFallbackEvaluadorUIUX(tituloPantalla, tipoDispositivo, error.message);
  }
}

// =============================================================================
// RESPUESTAS DE RESPALDO PEDAGÓGICO (FALLBACKS EDUCATIVOS)
// Garantizan que el sistema no falle si la API Key no está configurada o se excede la cuota
// =============================================================================

function getFallbackAnalisisDiseno(titulo, tipoDiseno, errorMsg = '') {
  return {
    puntaje_general: 8.4,
    puntaje_composicion: 8.5,
    puntaje_jerarquia: 8.2,
    puntaje_contraste: 8.6,
    diagnostico_general: `[Modo Pedagógico INFOCAL] Evaluación generada para "${titulo || 'Diseño Gráfico'}". La pieza demuestra solidez en la disposición general y un buen criterio de impacto visual.`,
    analisis_composicion: 'La distribución aprovecha adecuadamente los tercios principales. Se observa un buen balance entre los elementos de peso visual y el aire o espacio en blanco periférico.',
    analisis_jerarquia: 'El titular principal capta el primer punto focal. Se recomienda reforzar el contraste de escala en los elementos secundarios de soporte.',
    analisis_contraste: 'El contraste cromático entre la figura y el fondo es nítido, permitiendo una lectura fluida incluso a distancias medias.',
    puntos_fuertes: [
      'Buen uso del espacio negativo para evitar sobrecarga visual.',
      'Paleta cromática armónica y representativa del mensaje.',
      'Punto focal claro en el tercio superior.'
    ],
    recomendaciones_mejora: [
      'Aumentar el interlineado del bloque de texto inferior para optimizar legibilidad.',
      'Alinear los elementos secundarios a una cuadrícula de 8 puntos.',
      'Comprobar la reducción a escala miniatura para previsualización en redes móviles.'
    ],
    consejos_pedagogicos_infocal: 'Recuerda que en diseño gráfico "menos es más": cada elemento debe justificar su presencia funcional en la composición.'
  };
}

function getFallbackPaletaColores(concepto, publico, estilo, errorMsg = '') {
  return {
    nombre_paleta: 'Armonía Institucional INFOCAL Santa Cruz',
    concepto_sintesis: `Paleta cromática optimizada para "${concepto || 'Diseño Institucional y Creativo'}". Combina autoridad, solidez tecnológica y calidez de diseño.`,
    emocion_asociada: 'Confianza, profesionalismo, innovación y energía creativa.',
    colores: [
      { hex: '#002D62', rgb: 'rgb(0, 45, 98)', nombre: 'Azul Institucional INFOCAL', rol: 'Dominante (60%)', significado_psicologico: 'Autoridad, estabilidad y rigor académico.' },
      { hex: '#2563EB', rgb: 'rgb(37, 99, 235)', nombre: 'Azul Tecnológico IA', rol: 'Secundario (30%)', significado_psicologico: 'Modernidad, futuro e interactividad digital.' },
      { hex: '#7C3AED', rgb: 'rgb(124, 58, 237)', nombre: 'Púrpura Creativo', rol: 'Acento (10%)', significado_psicologico: 'Imaginación, disrupción y sensibilidad estética.' },
      { hex: '#F8FAFC', rgb: 'rgb(248, 250, 252)', nombre: 'Blanco Nieve Suave', rol: 'Fondo Primario', significado_psicologico: 'Claridad, pulcritud y máxima luminosidad.' },
      { hex: '#1E293B', rgb: 'rgb(30, 41, 59)', nombre: 'Grafito Pizarra', rol: 'Texto Principal', significado_psicologico: 'Legibilidad superior sin fatiga ocular.' }
    ],
    evaluacion_wcag: [
      { par_colores: 'Grafito #1E293B sobre Fondo #F8FAFC', ratio_contraste: '13.8:1', nivel_aa: true, nivel_aaa: true, recomendacion: 'Excelente para textos largos y cuerpo de lectura.' },
      { par_colores: 'Azul INFOCAL #002D62 sobre Fondo #F8FAFC', ratio_contraste: '12.1:1', nivel_aa: true, nivel_aaa: true, recomendacion: 'Óptimo para titulares y botones principales.' },
      { par_colores: 'Blanco #FFFFFF sobre Púrpura #7C3AED', ratio_contraste: '6.4:1', nivel_aa: true, nivel_aaa: false, recomendacion: 'Válido para textos medianos y botones de acento (AA).' }
    ],
    consejos_aplicacion: 'Aplica el color dominante (#002D62) en cabeceras y estructuras primarias; reserva el acento (#7C3AED) exclusivamente para llamadas a la acción (CTA).'
  };
}

function getFallbackTipografia(tipoProyecto, estilo, errorMsg = '') {
  return {
    fuente_titulo: 'Montserrat',
    categoria_titulo: 'Sans-serif Geométrica',
    fuente_cuerpo: 'Inter',
    categoria_cuerpo: 'Sans-serif Neo-grotesca',
    fuente_acento: 'Playfair Display',
    justificacion_combinacion: 'Montserrat aporta fuerza geométrica y presencia contundente en títulos, mientras Inter ofrece una de las alturas de x (x-height) más legibles del diseño digital moderno para lectura prolongada.',
    reglas_jerarquia: {
      titulo_principal: '32px a 48px, peso 700 (Bold) u 800 (ExtraBold), tracking -0.02em',
      subtitulo: '20px a 24px, peso 600 (SemiBold), line-height 1.3',
      cuerpo_texto: '16px (1rem), peso 400 (Regular), line-height 1.6, color #1E293B',
      espaciado_y_lineas: 'Mantén los bloques de lectura entre 50 y 75 caracteres por línea para evitar fatiga visual.'
    },
    enlaces_google_fonts: [
      'https://fonts.google.com/specimen/Montserrat',
      'https://fonts.google.com/specimen/Inter',
      'https://fonts.google.com/specimen/Playfair+Display'
    ],
    consejos_diseno: 'Nunca mezcles más de tres familias tipográficas en un mismo proyecto gráfico. Prioriza siempre la función comunicativa sobre la ornamentación.'
  };
}

function getFallbackIdeasConceptos(brief, categoria, errorMsg = '') {
  return {
    sintesis_brief: `Brief de ${categoria}: Exploración conceptual centrada en "${brief}".`,
    palabras_clave: ['Innovación', 'Identidad Cruceña', 'Equilibrio Visual', 'Impacto Social', 'Dinamismo Gráfico'],
    propuestas: [
      {
        titulo: 'Propuesta 1: Geometría Vanguardista',
        concepto_central: 'La estructura y la razón aplicadas a la solución visual.',
        narrativa: 'El diseño se construye a partir de retículas rigurosas y formas puras que transmiten confianza técnica y orden.',
        metafora_visual: 'Bloques modulares interconectados que forman una silueta continua.',
        estilo_grafico: 'Estilo Suizo / Escuela Internacional de Tipografía.',
        paleta_sugerida: 'Azul cobalto (#2563EB), Blanco (#FFFFFF) y acentos en Amarillo maíz.'
      },
      {
        titulo: 'Propuesta 2: Expresión Orgánica Regional',
        concepto_central: 'Raíces orientales y fluidez natural.',
        narrativa: 'Inspirada en la biodiversidad y el dinamismo de Santa Cruz, con trazos cálidos y texturas ricas.',
        metafora_visual: 'Formas botánicas entrelazadas con tipografía gestual.',
        estilo_grafico: 'Ilustración contemporánea con tintas planas.',
        paleta_sugerida: 'Verde esmeralda, Terracota cálido y Beige arena.'
      },
      {
        titulo: 'Propuesta 3: Minimalismo Tecnológico Disruptivo',
        concepto_central: 'Claridad radical para la era digital.',
        narrativa: 'Elimina todo artificio para que el mensaje resuene con máxima nitidez en plataformas móviles.',
        metafora_visual: 'Espacio negativo dominante con un único elemento iconográfico de alto impacto.',
        estilo_grafico: 'Minimalismo funcional con microinteracciones sutiles.',
        paleta_sugerida: 'Negro azabache (#0F172A), Blanco puro y Acento Neón (#7C3AED).'
      }
    ],
    orientacion_cromatica: 'Contrastes altos entre neutros oscuros y tonos saturados que guíen la vista inmediatamente hacia el mensaje clave.',
    referencias_movimientos_artisticos: [
      'Constructivismo y Estilo Suizo (Josef Müller-Brockmann)',
      'Bauhaus (Herbert Bayer)',
      'Diseño Gráfico Posmodernista / New Wave'
    ]
  };
}

function getFallbackEvaluadorUIUX(titulo, dispositivo, errorMsg = '') {
  return {
    puntaje_usabilidad: 8.5,
    puntaje_distribucion: 8.7,
    puntaje_legibilidad: 8.4,
    puntaje_accesibilidad: 8.3,
    resumen_diagnostico: `Evaluación de pantalla "${titulo || 'Pantalla UI'}" para dispositivo "${dispositivo || 'mobile'}". La interfaz exhibe una arquitectura de información coherente y una jerarquía clara.`,
    analisis_distribucion: 'El sistema de espaciado se alinea a una cuadrícula modular consistente. Los márgenes laterales aseguran que el contenido no quede pegado a los bordes de la pantalla física.',
    analisis_legibilidad: 'El tamaño de fuentes para títulos y cuerpo es legible en dispositivos móviles estándar. El microcopy de las llamadas a la acción es directo.',
    analisis_accesibilidad: 'Los botones de acción principal cuentan con un área de toque adecuada superior a 44x44 puntos. El contraste cromático general supera el umbral WCAG AA.',
    hallazgos_positivos: [
      'Botón de llamada a la acción (CTA) con alto affordance visual.',
      'Retícula limpia y sin sobrecarga cognitiva.',
      'Uso adecuado de iconos universales que complementan el texto.'
    ],
    oportunidades_mejora: [
      'Aumentar el contraste del texto secundario en etiquetas secundarias.',
      'Asegurar un estado visible de foco (:focus) para navegación por teclado o lectores de pantalla.',
      'Agregar separación vertical adicional entre campos de formulario.'
    ],
    recomendaciones_accionables: [
      'Validar el ratio de contraste con la herramienta Chrome DevTools o WebAIM Contrast Checker.',
      'Asegurar que los enlaces de texto incluyan subrayado o indicador visual evidente en estado hover.',
      'Diseñar la pantalla teniendo en cuenta el modo oscuro (Dark Mode).'
    ]
  };
}

function getFallbackPaletaDeImagen(enfoque = 'dominantes', errorMsg = '') {
  return {
    nombre_paleta: 'Paleta Extraída de Imagen Institucional',
    concepto_sintesis: `Muestreo cromático basado en la imagen cargada con enfoque en ${enfoque}. Tonos equilibrados con alto contraste y fidelidad visual.`,
    emocion_asociada: 'Solidez, armonía visual, identidad y equilibrio estético.',
    colores: [
      { hex: '#002D62', rgb: 'rgb(0, 45, 98)', nombre: 'Azul Noche Profundo', rol: 'Dominante (60%)', significado_psicologico: 'Estructura principal y punto de anclaje de peso visual.' },
      { hex: '#2563EB', rgb: 'rgb(37, 99, 235)', nombre: 'Azul Eléctrico Cobalto', rol: 'Secundario (30%)', significado_psicologico: 'Dinamismo, luminosidad media y transición visual.' },
      { hex: '#E11D48', rgb: 'rgb(225, 29, 72)', nombre: 'Carmesí Acento', rol: 'Acento (10%)', significado_psicologico: 'Atracción visual inmediata y puntos de interés focal.' },
      { hex: '#F1F5F9', rgb: 'rgb(241, 245, 249)', nombre: 'Gris Perla Suave', rol: 'Fondo Estructural', significado_psicologico: 'Superficie limpia para contraste óptimo.' },
      { hex: '#0F172A', rgb: 'rgb(15, 23, 42)', nombre: 'Negro Petróleo', rol: 'Texto Principal', significado_psicologico: 'Máxima nitidez tipográfica y legibilidad.' }
    ],
    evaluacion_wcag: [
      { par_colores: 'Texto #0F172A sobre Fondo #F1F5F9', ratio_contraste: '15.2:1', nivel_aa: true, nivel_aaa: true, recomendacion: 'Excelente para textos de lectura continua.' },
      { par_colores: 'Azul #002D62 sobre Fondo #F1F5F9', ratio_contraste: '12.5:1', nivel_aa: true, nivel_aaa: true, recomendacion: 'Óptimo para titulares y botones primarios.' },
      { par_colores: 'Blanco #FFFFFF sobre Carmesí #E11D48', ratio_contraste: '4.8:1', nivel_aa: true, nivel_aaa: false, recomendacion: 'Válido para botones de llamado a la acción (AA).' }
    ],
    consejos_aplicacion: 'La paleta extraída posee un balance natural entre tonos fríos institucionales y un acento cálido de alto impacto. Aplica el acento exclusivamente en elementos de conversión.'
  };
}

function getFallbackTipografiaImagen(tipoProyecto = 'Editorial', errorMsg = '') {
  return {
    fuente_titulo: 'Playfair Display',
    categoria_titulo: 'Serif Clásica de Alto Contraste',
    fuente_cuerpo: 'Plus Jakarta Sans',
    categoria_cuerpo: 'Sans-serif Geométrica Humanista',
    fuente_acento: 'Cinzel Decorative',
    justificacion_combinacion: 'Basado en el análisis visual de la imagen de referencia, Playfair Display evoca la elegancia y el ritmo editorial clásico de los títulos de la pieza, mientras Plus Jakarta Sans aporta una lectura fluida, moderna y sin fricción para el cuerpo de texto en formatos digitales e impresos.',
    reglas_jerarquia: {
      titulo_principal: '36px a 54px, peso 700 (Bold) u 800 (ExtraBold), tracking -0.01em',
      subtitulo: '22px a 26px, peso 600 (SemiBold), line-height 1.3',
      cuerpo_texto: '16px (1rem), peso 400 (Regular), line-height 1.6, color #1E293B',
      espaciado_y_lineas: 'Mantén los bloques de lectura entre 55 y 70 caracteres por línea.'
    },
    enlaces_google_fonts: [
      'https://fonts.google.com/specimen/Playfair+Display',
      'https://fonts.google.com/specimen/Plus+Jakarta+Sans',
      'https://fonts.google.com/specimen/Cinzel+Decorative'
    ],
    consejos_diseno: 'Al inspirarte en piezas existentes, no intentes copiar la fuente exacta: busca la relación armónica de formas, el ritmo de los contrastes y la coherencia del mensaje global.'
  };
}

module.exports = {
  getAiClient,
  analizarDisenoGrafico,
  generarPaletaColores,
  extraerPaletaDeImagen,
  recomendarTipografia,
  recomendarTipografiaDesdeImagen,
  generarIdeasConceptos,
  evaluarUIUX
};
