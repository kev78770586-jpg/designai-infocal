/**
 * Lógica del Módulo 3: Asistente Tipográfico
 * Soporta recomendación teórica y análisis multimodal desde imagen
 * DesignAI - INFOCAL Santa Cruz
 */

document.addEventListener('DOMContentLoaded', () => {
  const formConcepto = document.getElementById('tipografiaForm');
  const formImagen = document.getElementById('tipografiaImagenForm');
  const tabConcepto = document.getElementById('tabModoConcepto');
  const tabImagen = document.getElementById('tabModoImagen');
  const fileInput = document.getElementById('imagenTipografia');
  const previewContainer = document.getElementById('typoImagePreviewContainer');
  const previewImg = document.getElementById('typoImagePreview');
  const resultsContainer = document.getElementById('resultsContainer');
  const historyContainer = document.getElementById('historyContainer');

  // Alternar entre pestañas de modalidad
  if (tabConcepto && tabImagen) {
    tabConcepto.addEventListener('click', () => switchTab('concepto'));
    tabImagen.addEventListener('click', () => switchTab('imagen'));
  }

  function switchTab(mode) {
    if (mode === 'concepto') {
      formConcepto.classList.remove('hidden');
      formImagen.classList.add('hidden');
      tabConcepto.className = 'flex-1 py-3.5 px-4 text-center text-purple-700 border-b-2 border-purple-600 bg-white transition-all flex items-center justify-center space-x-2';
      tabImagen.className = 'flex-1 py-3.5 px-4 text-center text-slate-500 border-b-2 border-transparent hover:text-slate-800 transition-all flex items-center justify-center space-x-2';
    } else {
      formConcepto.classList.add('hidden');
      formImagen.classList.remove('hidden');
      tabImagen.className = 'flex-1 py-3.5 px-4 text-center text-purple-700 border-b-2 border-purple-600 bg-white transition-all flex items-center justify-center space-x-2';
      tabConcepto.className = 'flex-1 py-3.5 px-4 text-center text-slate-500 border-b-2 border-transparent hover:text-slate-800 transition-all flex items-center justify-center space-x-2';
    }
  }

  // Previsualización de imagen seleccionada
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          previewImg.src = event.target.result;
          previewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
      } else {
        previewContainer.classList.add('hidden');
      }
    });
  }

  // 1. Envío de Formulario por Parámetros Teóricos
  if (formConcepto) {
    formConcepto.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = formConcepto.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;

      const tipo_proyecto = document.getElementById('tipoProyecto').value;
      const estilo_deseado = document.getElementById('estiloDeseado').value;
      const jerarquia = document.getElementById('jerarquiaTipografia')?.value || '';
      const densidad = document.getElementById('densidadTipografia')?.value || '';
      const contexto = document.getElementById('contextoTipografia').value;

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg> Emparejando familias tipográficas...
        `;

        showLoading('Calculando armonía y contraste tipográfico...', 'Buscando fuentes complementarias en Google Fonts y definiendo escalas visuales.');

        const res = await fetch('/api/tipografia/recomendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo_proyecto,
            estilo_deseado,
            contexto: [
              contexto,
              jerarquia ? `Jerarquía: ${jerarquia}` : '',
              densidad ? `Densidad: ${densidad}` : ''
            ].filter(Boolean).join('. ')
          })
        });

        const data = await res.json();

        if (res.ok && data.exito) {
          renderTypographyResult(data.resultado);
          loadTypographyHistory();
          resultsContainer.scrollIntoView({ behavior: 'smooth' });
        } else {
          showError(data.mensaje || 'No se pudo obtener la recomendación.');
        }
      } catch (err) {
        showError('Error de conexión con el servidor.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }

  // 2. Envío de Formulario por Imagen (Multimodal)
  if (formImagen) {
    formImagen.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = formImagen.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;

      const file = fileInput.files[0];
      if (!file) {
        alert('Por favor selecciona o arrastra una imagen para analizar su tipografía.');
        return;
      }

      const formData = new FormData(formImagen);

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg> Analizando tipografía con Gemini Multimodal...
        `;

        showLoading('Examinando anatomía tipográfica de la imagen...', 'Identificando estilos de remates, proporciones modulares y emparejando fuentes en Google Fonts.');

        const res = await fetch('/api/tipografia/recomendar-imagen', {
          method: 'POST',
          body: formData
        });

        const data = await res.json();

        if (res.ok && data.exito) {
          renderTypographyResult(data.resultado, data.imagen_url);
          loadTypographyHistory();
          resultsContainer.scrollIntoView({ behavior: 'smooth' });
        } else {
          showError(data.mensaje || 'No se pudo analizar la tipografía de la imagen.');
        }
      } catch (err) {
        showError('Error al contactar con el servidor.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }

  function showLoading(title, desc) {
    resultsContainer.innerHTML = `
      <div class="bg-white p-8 rounded-3xl border border-purple-200 shadow-sm text-center animate-pulse">
        <div class="w-14 h-14 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
          🔤
        </div>
        <h3 class="text-lg font-bold text-[#002D62]">${title}</h3>
        <p class="text-xs text-slate-500 mt-1">${desc}</p>
      </div>
    `;
    resultsContainer.classList.remove('hidden');
  }

  function showError(msg) {
    resultsContainer.innerHTML = `
      <div class="p-6 bg-red-50 text-red-800 rounded-2xl border border-red-200 text-sm">
        <p class="font-bold">Error:</p>
        <p>${msg}</p>
      </div>
    `;
    resultsContainer.classList.remove('hidden');
  }

  function renderTypographyResult(res, imagenUrl = null) {
    const jerarquia = res.reglas_jerarquia || {};
    const links = res.enlaces_google_fonts || [];
    const fechaActual = new Date().toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    // Inyectar dinámicamente Google Fonts en el DOM para previsualización real
    if (res.fuente_titulo) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(res.fuente_titulo)}:wght@400;700;800&family=${encodeURIComponent(res.fuente_cuerpo || 'Inter')}:wght@400;600&display=swap`;
      document.head.appendChild(link);
    }

    resultsContainer.innerHTML = `
      <!-- BARRA DE ACCIÓN: DESCARGA DE FICHA TIPOGRÁFICA EN PDF -->
      <div class="bg-gradient-to-r from-[#002D62] via-purple-800 to-[#7C3AED] p-5 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center space-x-3">
          <span class="text-3xl">🔤</span>
          <div>
            <h3 class="text-base font-extrabold tracking-tight">Ficha Tipográfica Oficial Generada</h3>
            <p class="text-xs text-purple-200">Especificación de fuentes, jerarquía visual y escalado INFOCAL</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button id="btnDescargarTypoPDF" type="button"
            class="flex-1 sm:flex-initial py-2.5 px-4 bg-white hover:bg-purple-50 text-[#002D62] font-black rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2">
            <span>📥</span>
            <span>Descargar PDF Mejorado</span>
          </button>
          <button type="button" onclick="window.print()"
            class="py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1">
            <span>🖨️</span>
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      <!-- CONTENEDOR EXPORTABLE A PDF -->
      <div id="fichaTypoPDF" class="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-6">
        
        <!-- Encabezado Institucional -->
        <div class="border-b-2 border-[#002D62] pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center space-x-4">
            <div class="p-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-[170px]">
              <img src="/images/logo-infocal.png" alt="Logotipo Institucional INFOCAL Santa Cruz" class="h-12 w-auto object-contain">
            </div>
            <div>
              <div class="flex items-center space-x-2 text-[10px] font-extrabold text-purple-700 uppercase tracking-widest">
                <span>INFOCAL Santa Cruz</span>
                <span>•</span>
                <span>Dirección de Arte y Tipografía</span>
              </div>
              <h2 class="text-xl sm:text-2xl font-black text-[#002D62] tracking-tight">${res.fuente_titulo} + ${res.fuente_cuerpo}</h2>
              <p class="text-[11px] text-slate-500">Combinación tipográfica estructurada con reglas de escala y espaciado</p>
            </div>
          </div>
          
          <div class="text-right">
            <span class="inline-block px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
              ${res.categoria_titulo || 'Sans / Serif'}
            </span>
            <span class="block text-[10px] text-slate-400 mt-1">${fechaActual}</span>
          </div>
        </div>

        ${imagenUrl ? `
          <!-- Imagen de Referencia de la que se identificó la tipografía -->
          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center gap-4">
            <img src="${imagenUrl}" alt="Imagen analizada" class="w-36 h-28 object-cover rounded-xl border border-slate-300 shadow-sm flex-shrink-0">
            <div class="text-xs text-slate-600">
              <span class="font-bold text-[#002D62] block mb-1">📷 Imagen de Referencia Tipográfica Analizada</span>
              <p>La IA reconoció los rasgos formales (serifas, peso visual y altura de x) de la pieza y seleccionó "${res.fuente_titulo}" en Google Fonts para títulos y "${res.fuente_cuerpo}" para cuerpo de texto.</p>
            </div>
          </div>
        ` : ''}

        <!-- Muestras de Fuentes Principales -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <span class="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
              Fuente para Títulos
            </span>
            <h3 class="text-2xl font-extrabold text-[#002D62] mt-3 mb-1" style="font-family: '${res.fuente_titulo}', sans-serif;">
              ${res.fuente_titulo}
            </h3>
            <p class="text-xs text-slate-500 mb-3">${res.categoria_titulo || 'Clasificación principal'}</p>
            <div class="p-3 bg-white rounded-xl border border-slate-200/60 text-sm text-slate-800" style="font-family: '${res.fuente_titulo}', sans-serif;">
              "El diseño gráfico no decora: comunica y estructura el pensamiento."
            </div>
          </div>

          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <span class="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
              Fuente para Cuerpo de Texto
            </span>
            <h3 class="text-2xl font-extrabold text-[#002D62] mt-3 mb-1" style="font-family: '${res.fuente_cuerpo}', sans-serif;">
              ${res.fuente_cuerpo}
            </h3>
            <p class="text-xs text-slate-500 mb-3">${res.categoria_cuerpo || 'Clasificación secundaria'}</p>
            <div class="p-3 bg-white rounded-xl border border-slate-200/60 text-xs text-slate-600 leading-relaxed" style="font-family: '${res.fuente_cuerpo}', sans-serif;">
              La legibilidad en bloques continuos depende de un adecuado interletrado, apertura de contraformas y proporción equilibrada con el interlineado.
            </div>
          </div>
        </div>

        <!-- Justificación del Emparejamiento -->
        <div class="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
          <h4 class="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">Fundamento Teórico de la Combinación</h4>
          <p class="text-xs text-slate-700 leading-relaxed">${res.justificacion_combinacion}</p>
        </div>

        <!-- Reglas de Jerarquía Visual -->
        <div>
          <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Guía de Escala y Jerarquía Tipográfica</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Título (H1)</span>
              <p class="text-xs font-extrabold text-[#002D62] mt-1">${jerarquia.titulo_principal || '32px - 48px, Bold'}</p>
            </div>
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Subtítulo (H2)</span>
              <p class="text-xs font-extrabold text-[#002D62] mt-1">${jerarquia.subtitulo || '20px - 24px, SemiBold'}</p>
            </div>
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Cuerpo de Texto</span>
              <p class="text-xs font-extrabold text-[#002D62] mt-1">${jerarquia.cuerpo_texto || '16px, 1.6 line-height'}</p>
            </div>
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Longitud de Línea</span>
              <p class="text-xs font-extrabold text-[#002D62] mt-1">${jerarquia.espaciado_y_lineas || '50 a 75 caracteres'}</p>
            </div>
          </div>
        </div>

        <!-- Enlaces Google Fonts -->
        <div class="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center space-x-2">
            <span class="text-xs font-bold text-slate-600">Descarga e Integración:</span>
            ${links.map(url => `
              <a href="${url}" target="_blank" rel="noopener noreferrer"
                class="inline-flex items-center space-x-1 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-blue-50 text-blue-700 border border-slate-200 transition">
                <span>Google Fonts</span>
                <span>↗</span>
              </a>
            `).join('')}
          </div>
        </div>

        <!-- Consejo Académico -->
        <div class="p-4 rounded-2xl bg-gradient-to-r from-blue-900 to-[#002D62] text-white text-xs">
          <span class="font-bold text-blue-300 uppercase tracking-wider block mb-1">🎓 Buenas Prácticas Tipográficas INFOCAL:</span>
          <p class="leading-relaxed text-blue-100">${res.consejos_diseno}</p>
        </div>

        <!-- Firmas Oficiales para el PDF -->
        <div class="pt-6 border-t border-slate-200 mt-6 grid grid-cols-2 gap-8 text-center">
          <div>
            <div class="border-b border-slate-400 w-3/4 mx-auto mb-2 h-8"></div>
            <p class="text-[11px] font-bold text-[#002D62]">Docente de Tipografía y Editorial</p>
            <p class="text-[10px] text-slate-400">DesignAI - INFOCAL Santa Cruz</p>
          </div>
          <div>
            <div class="border-b border-slate-400 w-3/4 mx-auto mb-2 h-8"></div>
            <p class="text-[11px] font-bold text-[#002D62]">Estudiante / Diseñador Gráfico</p>
            <p class="text-[10px] text-slate-400">Carrera de Diseño Gráfico</p>
          </div>
        </div>

      </div>
    `;

    // Asignar evento al botón de descarga PDF
    const btnTypoPDF = document.getElementById('btnDescargarTypoPDF');
    if (btnTypoPDF) {
      btnTypoPDF.addEventListener('click', () => {
        descargarFichaTypoPDF(res.fuente_titulo);
      });
    }
  }

  // Función para exportar la Ficha Tipográfica a PDF institucional
  function descargarFichaTypoPDF(fuenteTitulo) {
    const elemento = document.getElementById('fichaTypoPDF');
    if (!elemento) return;

    const nombreLimpio = (fuenteTitulo || 'Tipografia').replace(/[^a-zA-Z0-9_-]/g, '_');
    const opt = {
      margin:       [8, 8, 8, 8],
      filename:     `Ficha_Tipografica_INFOCAL_${nombreLimpio}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (window.html2pdf) {
      const btn = document.getElementById('btnDescargarTypoPDF');
      const originalText = btn ? btn.innerHTML : '';
      if (btn) btn.innerHTML = `<span>⏳ Generando PDF...</span>`;
      window.html2pdf().set(opt).from(elemento).save().then(() => {
        if (btn) btn.innerHTML = originalText;
      }).catch(err => {
        console.error('Error al generar PDF tipográfico:', err);
        if (btn) btn.innerHTML = originalText;
        window.print();
      });
    } else {
      window.print();
    }
  }

      </div>
    `;
  }

  async function loadTypographyHistory() {
    if (!historyContainer) return;
    try {
      const res = await fetch('/api/tipografia/historial');
      if (!res.ok) return;
      const data = await res.json();
      if (!data.exito || !data.tipografias || data.tipografias.length === 0) {
        historyContainer.innerHTML = `
          <div class="p-6 text-center text-xs text-slate-400">
            Aún no has solicitado combinaciones tipográficas.
          </div>
        `;
        return;
      }

      historyContainer.innerHTML = data.tipografias.map(item => `
        <div class="p-3.5 hover:bg-slate-50 rounded-2xl transition border border-slate-100">
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center space-x-2 truncate">
              ${item.imagen_url ? `<img src="${item.imagen_url}" class="w-5 h-5 rounded object-cover border border-slate-200">` : '<span>🔤</span>'}
              <span class="text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md truncate">
                ${item.tipo_proyecto}
              </span>
            </div>
            <span class="text-[10px] text-slate-400 flex-shrink-0">${new Date(item.creado_en).toLocaleDateString('es-BO')}</span>
          </div>
          <h4 class="text-xs font-bold text-slate-800">${item.fuente_titulo} + ${item.fuente_cuerpo}</h4>
          <p class="text-[11px] text-slate-500 mt-0.5 truncate">${item.estilo_deseado}</p>
        </div>
      `).join('');
    } catch (err) {
      console.warn('Error al cargar historial tipográfico:', err);
    }
  }

  loadTypographyHistory();
});
