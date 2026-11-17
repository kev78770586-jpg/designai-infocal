/**
 * Lógica del Módulo 2: Generador Inteligente de Paletas de Colores (WCAG)
 * Incluye generación por concepto y extracción multimodal desde imagen
 * DesignAI - INFOCAL Santa Cruz
 */

document.addEventListener('DOMContentLoaded', () => {
  const formConcepto = document.getElementById('coloresForm');
  const formImagen = document.getElementById('coloresImagenForm');
  const tabConcepto = document.getElementById('tabModoConcepto');
  const tabImagen = document.getElementById('tabModoImagen');
  const fileInput = document.getElementById('imagenPaleta');
  const dropZonePaleta = document.getElementById('dropZonePaleta');
  const fileBadgePaleta = document.getElementById('fileSelectedBadgePaleta');
  const fileNameDisplayPaleta = document.getElementById('fileNameDisplayPaleta');
  const fileSizeDisplayPaleta = document.getElementById('fileSizeDisplayPaleta');
  const fileErrorMsgPaleta = document.getElementById('fileErrorMsgPaleta');
  const previewContainer = document.getElementById('paletteImagePreviewContainer');
  const previewImg = document.getElementById('paletteImagePreview');
  const resultsContainer = document.getElementById('resultsContainer');
  const historyContainer = document.getElementById('historyContainer');

  // Alternar entre pestañas de modalidad (Concepto vs Imagen)
  if (tabConcepto && tabImagen) {
    tabConcepto.addEventListener('click', () => switchTab('concepto'));
    tabImagen.addEventListener('click', () => switchTab('imagen'));
  }

  function switchTab(mode) {
    if (mode === 'concepto') {
      formConcepto.classList.remove('hidden');
      formImagen.classList.add('hidden');
      tabConcepto.className = 'flex-1 py-3.5 px-4 text-center text-indigo-700 border-b-2 border-indigo-600 bg-white transition-all flex items-center justify-center space-x-2';
      tabImagen.className = 'flex-1 py-3.5 px-4 text-center text-slate-500 border-b-2 border-transparent hover:text-slate-800 transition-all flex items-center justify-center space-x-2';
    } else {
      formConcepto.classList.add('hidden');
      formImagen.classList.remove('hidden');
      tabImagen.className = 'flex-1 py-3.5 px-4 text-center text-indigo-700 border-b-2 border-indigo-600 bg-white transition-all flex items-center justify-center space-x-2';
      tabConcepto.className = 'flex-1 py-3.5 px-4 text-center text-slate-500 border-b-2 border-transparent hover:text-slate-800 transition-all flex items-center justify-center space-x-2';
    }
  }

  function updatePaletteFileDisplay(file) {
    if (!file) {
      if (previewContainer) previewContainer.classList.add('hidden');
      if (fileBadgePaleta) fileBadgePaleta.classList.add('hidden');
      return;
    }
    if (fileErrorMsgPaleta) fileErrorMsgPaleta.classList.add('hidden');
    if (dropZonePaleta) dropZonePaleta.classList.remove('border-red-400', 'bg-red-50/20');

    if (fileNameDisplayPaleta) fileNameDisplayPaleta.textContent = file.name;
    if (fileSizeDisplayPaleta) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      fileSizeDisplayPaleta.textContent = `${sizeMb} MB`;
    }
    if (fileBadgePaleta) fileBadgePaleta.classList.remove('hidden');

    const reader = new FileReader();
    reader.onload = (event) => {
      if (previewImg) previewImg.src = event.target.result;
      if (previewContainer) previewContainer.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }

  // Previsualización de imagen seleccionada
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      updatePaletteFileDisplay(file);
    });
  }

  // Drag and Drop para Paletas de Color
  if (dropZonePaleta && fileInput) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZonePaleta.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZonePaleta.classList.add('border-indigo-600', 'bg-indigo-100/40');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZonePaleta.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZonePaleta.classList.remove('border-indigo-600', 'bg-indigo-100/40');
      });
    });

    dropZonePaleta.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        fileInput.files = dt.files;
        updatePaletteFileDisplay(dt.files[0]);
      }
    });
  }

  // 1. Envío de Formulario por Concepto / Brief
  if (formConcepto) {
    formConcepto.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = formConcepto.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;

      const concepto = document.getElementById('conceptoColor').value;
      const rubro = document.getElementById('rubroColor')?.value || 'General';
      const publico_objetivo = document.getElementById('publicoColor')?.value || '';
      const emocion_estilo = document.getElementById('emocionColor')?.value || '';
      const armonia = document.getElementById('armoniaColor')?.value || 'Análoga';
      const medio = document.getElementById('medioColor')?.value || 'Digital RGB';
      const cantidad = document.getElementById('cantidadColores').value;

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg> Creando armonía cromática...
        `;

        showLoading('Generando paleta y validando contraste WCAG...', 'Calculando ratios de luminancia y accesibilidad AA/AAA.');

        const res = await fetch('/api/colores/generar', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            concepto: `${concepto} (Sector: ${rubro}, Armonía: ${armonia}, Salida: ${medio})`,
            publico_objetivo,
            emocion_estilo,
            cantidad
          })
        });

        const data = await res.json();

        if (res.ok && data.exito) {
          renderPaletteResult(data.resultado);
          loadPaletteHistory();
          resultsContainer.scrollIntoView({ behavior: 'smooth' });
        } else {
          showError(data.mensaje || 'No se pudo generar la paleta.');
        }
      } catch (err) {
        showError('Error de conexión con el servidor.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }

  // 2. Envío de Formulario por Extracción desde Imagen
  if (formImagen) {
    formImagen.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = formImagen.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;

      const file = fileInput.files && fileInput.files[0];
      if (!file) {
        if (fileErrorMsgPaleta) {
          fileErrorMsgPaleta.textContent = '⚠️ Por favor selecciona o arrastra una imagen para extraer los colores.';
          fileErrorMsgPaleta.classList.remove('hidden');
        }
        if (dropZonePaleta) {
          dropZonePaleta.classList.add('border-red-400', 'bg-red-50/20');
          dropZonePaleta.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      const formData = new FormData(formImagen);

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg> Extrayendo colores con Gemini Multimodal...
        `;

        showLoading('Muestreando tonos de la imagen...', 'Analizando pixeles dominantes, armonía y accesibilidad WCAG.');

        const res = await fetch('/api/colores/extraer-imagen', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        const data = await res.json();

        if (res.ok && data.exito) {
          renderPaletteResult(data.resultado, data.imagen_url);
          loadPaletteHistory();
          resultsContainer.scrollIntoView({ behavior: 'smooth' });
        } else {
          showError(data.mensaje || 'No se pudo extraer la paleta de la imagen.');
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
      <div class="bg-white p-8 rounded-3xl border border-indigo-200 shadow-sm text-center animate-pulse">
        <div class="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
          🌈
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

  function renderPaletteResult(resultado, imagenUrl = null) {
    const colores = resultado.colores || [];
    const wcag = resultado.evaluacion_wcag || [];
    const fechaActual = new Date().toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    resultsContainer.innerHTML = `
      <!-- BARRA DE ACCIÓN: DESCARGA DE FICHA CROMÁTICA EN PDF -->
      <div class="bg-gradient-to-r from-[#002D62] via-indigo-800 to-[#7C3AED] p-5 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center space-x-3">
          <span class="text-3xl">🎨</span>
          <div>
            <h3 class="text-base font-extrabold tracking-tight">Ficha Cromática Oficial Generada</h3>
            <p class="text-xs text-indigo-200">Guía de Color, Roles 60-30-10 y Rúbrica WCAG 2.1 INFOCAL</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button id="btnDescargarColorPDF" type="button"
            class="flex-1 sm:flex-initial py-2.5 px-4 bg-white hover:bg-indigo-50 text-[#002D62] font-black rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2">
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
      <div id="fichaColorPDF" class="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-6">
        
        <!-- Encabezado Institucional -->
        <div class="border-b-2 border-[#002D62] pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center space-x-4">
            <div class="p-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-[170px]">
              <img src="/images/logo-infocal.png" alt="Logotipo Institucional INFOCAL Santa Cruz" class="h-12 w-auto object-contain">
            </div>
            <div>
              <div class="flex items-center space-x-2 text-[10px] font-extrabold text-indigo-700 uppercase tracking-widest">
                <span>INFOCAL Santa Cruz</span>
                <span>•</span>
                <span>Teoría del Color y Accesibilidad</span>
              </div>
              <h2 class="text-xl sm:text-2xl font-black text-[#002D62] tracking-tight">${resultado.nombre_paleta}</h2>
              <p class="text-[11px] text-slate-500">${resultado.concepto_sintesis}</p>
            </div>
          </div>
          
          <div class="text-right">
            <span class="inline-block px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
              ${resultado.emocion_asociada || 'Armonía Visual'}
            </span>
            <span class="block text-[10px] text-slate-400 mt-1">${fechaActual}</span>
          </div>
        </div>

        ${imagenUrl ? `
          <!-- Imagen de Referencia de la que se extrajo la paleta -->
          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center gap-4">
            <img src="${imagenUrl}" alt="Imagen analizada" class="w-36 h-28 object-cover rounded-xl border border-slate-300 shadow-sm flex-shrink-0">
            <div class="text-xs text-slate-600">
              <span class="font-bold text-[#002D62] block mb-1">📷 Imagen de Referencia Multimodal Analizada</span>
              <p>Muestreo tonal con detección de luminancia, colores dominantes y evaluación de legibilidad figura-fondo para estudiantes de diseño gráfico.</p>
            </div>
          </div>
        ` : ''}

        <!-- Muestrario de Colores (Swatches Interactivos) -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Muestras de Color (Haz clic para copiar HEX)</h3>
            <span id="copyToast" class="text-xs font-bold text-emerald-600 transition-opacity opacity-0">¡Copiado!</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            ${colores.map(c => `
              <div onclick="copyHex('${c.hex}')"
                class="group cursor-pointer rounded-2xl border border-slate-200 p-2.5 bg-slate-50 hover:shadow-lg transition-all transform hover:-translate-y-1">
                <div class="w-full h-24 rounded-xl shadow-inner relative flex items-end p-2" style="background-color: ${c.hex};">
                  <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Copiar
                  </span>
                </div>
                <div class="mt-2 text-center">
                  <span class="block text-xs font-extrabold text-slate-800 font-mono">${c.hex}</span>
                  <span class="block text-[10px] text-slate-500 font-mono">${c.rgb}</span>
                  <span class="block text-[11px] font-medium text-slate-700 truncate mt-0.5">${c.nombre}</span>
                  <span class="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    ${c.rol}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Evaluación de Accesibilidad WCAG 2.1 -->
        <div class="pt-4 border-t border-slate-100">
          <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
            <span>👁️</span>
            <span>Matriz de Contraste WCAG 2.1 (AA / AAA)</span>
          </h3>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden">
              <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th class="p-3">Combinación Evaluada</th>
                  <th class="p-3 text-center">Ratio Contraste</th>
                  <th class="p-3 text-center">Nivel AA (≥4.5:1)</th>
                  <th class="p-3 text-center">Nivel AAA (≥7.0:1)</th>
                  <th class="p-3">Orientación de Diseño</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${wcag.map(w => `
                  <tr class="hover:bg-slate-50/60 transition">
                    <td class="p-3 font-semibold text-slate-800">${w.par_colores}</td>
                    <td class="p-3 text-center font-mono font-bold text-indigo-700">${w.ratio_contraste}</td>
                    <td class="p-3 text-center">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${w.nivel_aa ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">
                        ${w.nivel_aa ? 'PASA (AA)' : 'NO PASA'}
                      </span>
                    </td>
                    <td class="p-3 text-center">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${w.nivel_aaa ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                        ${w.nivel_aaa ? 'PASA (AAA)' : 'NO PASA'}
                      </span>
                    </td>
                    <td class="p-3 text-slate-600">${w.recomendacion}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Consejos de Aplicación Práctica -->
        <div class="p-4 rounded-2xl bg-gradient-to-r from-blue-900 to-[#002D62] text-white text-xs">
          <span class="font-bold text-blue-300 uppercase tracking-wider block mb-1">📐 Consejos para Estudiantes de Diseño:</span>
          <p class="leading-relaxed text-blue-100">${resultado.consejos_aplicacion}</p>
        </div>

        <!-- Pie de Página Institucional con Firmas Oficiales para el PDF -->
        <div class="pt-6 border-t border-slate-200 mt-6 grid grid-cols-2 gap-8 text-center">
          <div>
            <div class="border-b border-slate-400 w-3/4 mx-auto mb-2 h-8"></div>
            <p class="text-[11px] font-bold text-[#002D62]">Docente de Color y Composición</p>
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
    const btnColorPDF = document.getElementById('btnDescargarColorPDF');
    if (btnColorPDF) {
      btnColorPDF.addEventListener('click', () => {
        descargarFichaColorPDF(resultado.nombre_paleta);
      });
    }
  }

  // Función para exportar la Ficha Cromática a PDF institucional
  function descargarFichaColorPDF(nombrePaleta) {
    const elemento = document.getElementById('fichaColorPDF');
    if (!elemento) return;

    const nombreLimpio = (nombrePaleta || 'Paleta_Cromatica').replace(/[^a-zA-Z0-9_-]/g, '_');
    const opt = {
      margin:       [8, 8, 8, 8],
      filename:     `Ficha_Cromatica_INFOCAL_${nombreLimpio}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (window.html2pdf) {
      const btn = document.getElementById('btnDescargarColorPDF');
      const originalText = btn ? btn.innerHTML : '';
      if (btn) btn.innerHTML = `<span>⏳ Generando PDF...</span>`;
      window.html2pdf().set(opt).from(elemento).save().then(() => {
        if (btn) btn.innerHTML = originalText;
      }).catch(err => {
        console.error('Error al generar PDF de paleta:', err);
        if (btn) btn.innerHTML = originalText;
        window.print();
      });
    } else {
      window.print();
    }
  }

  // Función global para copiar HEX
  window.copyHex = function(hex) {
    navigator.clipboard.writeText(hex).then(() => {
      const toast = document.getElementById('copyToast');
      if (toast) {
        toast.textContent = `¡Copiado ${hex}!`;
        toast.classList.remove('opacity-0');
        setTimeout(() => toast.classList.add('opacity-0'), 1500);
      }
    });
  };

  // Cargar historial de paletas
  async function loadPaletteHistory() {
    if (!historyContainer) return;
    try {
      const res = await fetch('/api/colores/historial', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      if (!data.exito || !data.paletas || data.paletas.length === 0) {
        historyContainer.innerHTML = `
          <div class="p-6 text-center text-xs text-slate-400">
            Aún no has generado paletas. Crea tu primera combinación arriba.
          </div>
        `;
        return;
      }

      window.cachedPaletteHistory = data.paletas;

      historyContainer.innerHTML = data.paletas.map((item, idx) => {
        const colores = item.colores_hex_rgb || [];
        return `
          <div onclick="verPaletaHistorial(${idx})" class="p-3.5 hover:bg-indigo-50/70 rounded-2xl transition border border-slate-100 hover:border-indigo-300 space-y-2 cursor-pointer group shadow-sm">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2 truncate">
                ${item.imagen_url ? `<img src="${item.imagen_url}" class="w-6 h-6 rounded object-cover border border-slate-200">` : '<span>🎨</span>'}
                <h4 class="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">${item.nombre_paleta}</h4>
              </div>
              <span class="text-[10px] text-slate-400 flex-shrink-0">${new Date(item.creado_en).toLocaleDateString('es-BO')}</span>
            </div>
            <div class="flex rounded-lg overflow-hidden h-5 w-full shadow-inner border border-slate-200/50">
              ${colores.map(c => `<div class="flex-1 h-full" style="background-color: ${c.hex};" title="${c.nombre} (${c.hex})"></div>`).join('')}
            </div>
            <div class="text-right">
              <span class="text-[9px] text-indigo-600 font-bold opacity-80 group-hover:underline">Ver Ficha y PDF</span>
            </div>
          </div>
        `;
      }).join('');
    } catch (err) {
      console.warn('Error al cargar historial de paletas:', err);
    }
  }

  window.verPaletaHistorial = function(idx) {
    if (window.cachedPaletteHistory && window.cachedPaletteHistory[idx]) {
      const item = window.cachedPaletteHistory[idx];
      const resultado = item.resultado_json || {
        nombre_paleta: item.nombre_paleta,
        concepto_sintesis: item.concepto,
        emocion_asociada: item.emocion_estilo,
        colores: item.colores_hex_rgb,
        evaluacion_wcag: item.evaluacion_wcag,
        consejos_aplicacion: item.consejos_aplicacion
      };
      renderPaletteResult(resultado, item.imagen_url);
      if (resultsContainer) {
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  loadPaletteHistory();
});
