/**
 * Suite de Pruebas Automatizadas y Verificación del Sistema
 * DesignAI - INFOCAL Santa Cruz
 */
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function runSystemTests() {
  console.log('================================================================');
  console.log('🧪 INICIANDO SUITE DE PRUEBAS DE INTEGRACIÓN: DesignAI');
  console.log('   Carrera de Diseño Gráfico - INFOCAL Santa Cruz');
  console.log('================================================================\n');

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition, testName, details = '') {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ [PASS] ${testName}`);
    } else {
      console.error(`  ❌ [FAIL] ${testName} ${details ? '(' + details + ')' : ''}`);
    }
  }

  // ---------------------------------------------------------------------------
  // TEST 1: Verificación de Archivos y Recursos Críticos
  // ---------------------------------------------------------------------------
  console.log('📦 1. Verificación de Integridad de Archivos del Proyecto:');
  const requiredFiles = [
    'package.json',
    '.env.example',
    'config/database.js',
    'config/multer.js',
    'database/schema.sql',
    'database/migrate.js',
    'models/index.js',
    'services/aiService.js',
    'server.js',
    'public/login.html',
    'public/dashboard.html',
    'public/analizador.html',
    'public/colores.html',
    'public/tipografia.html',
    'public/ideas.html',
    'public/uiux.html',
    'public/acerca-de.html',
    'public/images/logo-infocal.png'
  ];

  requiredFiles.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    assert(fs.existsSync(fullPath), `Archivo existente: ${file}`);
  });

  // ---------------------------------------------------------------------------
  // TEST 2: Cumplimiento de Identidad Visual Institucional INFOCAL Santa Cruz
  // ---------------------------------------------------------------------------
  console.log('\n🎨 2. Verificación de Identidad Institucional y Accesibilidad:');
  const viewsToCheck = [
    'public/login.html',
    'public/dashboard.html',
    'public/analizador.html',
    'public/colores.html',
    'public/tipografia.html',
    'public/ideas.html',
    'public/uiux.html',
    'public/acerca-de.html'
  ];

  viewsToCheck.forEach(viewPath => {
    const content = fs.readFileSync(path.join(__dirname, '..', viewPath), 'utf8');
    const hasAltTag = content.includes('alt="Logotipo Institucional INFOCAL Santa Cruz"');
    const hasBlueColor = content.includes('#002D62');
    assert(hasAltTag && hasBlueColor, `Identidad institucional e imagen con etiqueta de accesibilidad en: ${viewPath}`);
  });

  // ---------------------------------------------------------------------------
  // TEST 3: Criptografía y Seguridad con bcrypt
  // ---------------------------------------------------------------------------
  console.log('\n🔐 3. Verificación de Autenticación y Cifrado:');
  const passwordPrueba = 'Infocal2026!';
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(passwordPrueba, salt);
  assert(bcrypt.compareSync(passwordPrueba, hash), 'Cifrado y verificación de contraseñas con bcryptjs');
  assert(!bcrypt.compareSync('PasswordIncorrecto', hash), 'Rechazo seguro de contraseñas erróneas');

  // ---------------------------------------------------------------------------
  // TEST 4: Modelos Relacionales y Sequelize
  // ---------------------------------------------------------------------------
  console.log('\n🗄️  4. Verificación de Modelos Relacionales y Capa ORM:');
  try {
    const models = require('../models');
    const requiredModels = [
      'Usuario',
      'Proyecto',
      'AnalisisDiseno',
      'PaletaColor',
      'AsistenteTipografico',
      'IdeaConcepto',
      'EvaluadorUIUX',
      'HistorialActividad'
    ];
    requiredModels.forEach(modelName => {
      assert(Boolean(models[modelName]), `Modelo ORM cargado: ${modelName}`);
    });
  } catch (err) {
    assert(false, 'Carga de modelos Sequelize', err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 5: Motor de Inteligencia Artificial (aiService) y Esquemas JSON
  // ---------------------------------------------------------------------------
  console.log('\n🤖 5. Verificación de Módulos de Inteligencia Artificial (aiService):');
  const aiService = require('../services/aiService');

  // Módulo 2: Paletas de Colores (Generación por Concepto)
  try {
    const resPaleta = await aiService.generarPaletaColores({ concepto: 'Diseño Gráfico Infantil' });
    assert(
      resPaleta && Array.isArray(resPaleta.colores) && resPaleta.colores.length > 0 && Array.isArray(resPaleta.evaluacion_wcag),
      'Módulo 2: Generador de Paletas y Evaluador de Contraste WCAG'
    );
  } catch (err) {
    assert(false, 'Módulo 2 (Paletas)', err.message);
  }

  // Módulo 2B: Extracción Multimodal de Paleta desde Imagen
  try {
    const resPaletaImg = await aiService.extraerPaletaDeImagen({ enfoque: 'dominantes' });
    assert(
      resPaletaImg && Array.isArray(resPaletaImg.colores) && resPaletaImg.colores.length > 0 && Array.isArray(resPaletaImg.evaluacion_wcag),
      'Módulo 2B: Extracción Multimodal de Paleta desde Imagen'
    );
  } catch (err) {
    assert(false, 'Módulo 2B (Extracción desde Imagen)', err.message);
  }

  // Módulo 3: Asistente Tipográfico
  try {
    const resTipo = await aiService.recomendarTipografia({ tipoProyecto: 'Revista Cultural', estiloDeseado: 'Elegante' });
    assert(
      resTipo && resTipo.fuente_titulo && resTipo.fuente_cuerpo && resTipo.reglas_jerarquia,
      'Módulo 3: Asistente Tipográfico y Jerarquía Visual'
    );
  } catch (err) {
    assert(false, 'Módulo 3 (Tipografía)', err.message);
  }

  // Módulo 3B: Asistente Tipográfico desde Imagen
  try {
    const resTipoImg = await aiService.recomendarTipografiaDesdeImagen({ tipoProyecto: 'Cartelería' });
    assert(
      resTipoImg && resTipoImg.fuente_titulo && resTipoImg.fuente_cuerpo && resTipoImg.reglas_jerarquia,
      'Módulo 3B: Asistente Tipográfico Multimodal desde Imagen'
    );
  } catch (err) {
    assert(false, 'Módulo 3B (Tipografía desde Imagen)', err.message);
  }

  // Módulo 4: Ideas y Conceptos Creativos
  try {
    const resIdeas = await aiService.generarIdeasConceptos({ brief: 'Afiche para cuidado del agua', categoria: 'Social' });
    assert(
      resIdeas && Array.isArray(resIdeas.propuestas) && resIdeas.propuestas.length >= 3 && Array.isArray(resIdeas.palabras_clave),
      'Módulo 4: Generador de 3 Rutas Conceptuales y Metáforas Visuales'
    );
  } catch (err) {
    assert(false, 'Módulo 4 (Ideas Creativas)', err.message);
  }

  // Módulo 1: Analizador de Diseños (Estructura de respuesta)
  try {
    const resAnalisis = await aiService.analizarDisenoGrafico({ titulo: 'Afiche Concierto', tipoDiseno: 'afiche' });
    assert(
      resAnalisis && resAnalisis.puntaje_general !== undefined && Array.isArray(resAnalisis.puntos_fuertes),
      'Módulo 1: Analizador de Diseños Gráficos (Estructura de Reporte)'
    );
  } catch (err) {
    assert(false, 'Módulo 1 (Analizador)', err.message);
  }

  // Módulo 5: Evaluador UI/UX (Estructura de respuesta)
  try {
    const resUIUX = await aiService.evaluarUIUX({ tituloPantalla: 'Login Screen', tipoDispositivo: 'mobile' });
    assert(
      resUIUX && resUIUX.puntaje_usabilidad !== undefined && Array.isArray(resUIUX.recomendaciones_accionables),
      'Módulo 5: Evaluador Heurístico UI/UX'
    );
  } catch (err) {
    assert(false, 'Módulo 5 (UI/UX)', err.message);
  }

  // ---------------------------------------------------------------------------
  // RESULTADO FINAL
  // ---------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`📊 RESULTADO DE LA SUITE: ${passedTests} de ${totalTests} pruebas superadas (${Math.round((passedTests/totalTests)*100)}%).`);
  if (passedTests === totalTests) {
    console.log('🎉 ¡TODAS LAS PRUEBAS FUERON SUPERADAS EXITOSAMENTE!');
  } else {
    console.warn('⚠️ Se detectaron algunas discrepancias a revisar.');
  }
  console.log('================================================================\n');
}

runSystemTests().catch(err => {
  console.error('Error fatal durante la ejecución de las pruebas:', err);
  process.exit(1);
});
