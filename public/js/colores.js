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

  // 1. Envío de Formulario por Concepto / Brief
  if (formConcepto) {
    formConcepto.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = formConcepto.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;

      const concepto = document.getElementById('conceptoColor').value;
      const publico_objetivo = document.getElementById('publicoColor').value;
      const emocion_estilo = document.getElementById('emocionColor').value;
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ concepto, publico_objetivo, emocion_estilo, cantidad })
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

      const file = fileInput.files[0];
      if (!file) {
        alert('Por favor selecciona una imagen para extraer su paleta.');
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

    resultsContainer.innerHTML = `
      <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
        
        <!-- Encabezado de Paleta -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div class="flex items-center space-x-2 text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">
              <span>${imagenUrl ? 'Paleta Extraída desde Imagen' : 'Paleta Armónica Generada'}</span>
              <span>•</span>
              <span>INFOCAL</span>
            </div>
            <h2 class="text-2xl font-extrabold text-[#002D62]">${resultado.nombre_paleta}</h2>
            <p class="text-xs text-slate-500 mt-1">${resultado.concepto_sintesis}</p>
          </div>
          <span class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
            ${resultado.emocion_asociada || 'Armonía Visual'}
          </span>
        </div>

        ${imagenUrl ? `
          <!-- Imagen de Referencia de la que se extrajo la paleta -->
          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center gap-4">
            <img src="${imagenUrl}" alt="Imagen de referencia" class="w-32 h-24 object-cover rounded-xl border border-slate-200 shadow-sm flex-shrink-0">
            <div class="text-xs text-slate-600">
              <span class="font-bold text-[#002D62] block mb-1">📷 Imagen de Referencia Analizada</span>
              <p>La IA extrajo los ${colores.length} tonos más representativos respetando las proporciones cromáticas y niveles de luminosidad de la fotografía.</p>
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
                  <span class="block text-[11px] font-medium text-slate-600 truncate">${c.nombre}</span>
                  <span class="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
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
            <span>Evaluador de Contraste WCAG 2.1 (AA / AAA)</span>
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

      </div>
    `;
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
      const res = await fetch('/api/colores/historial');
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

      historyContainer.innerHTML = data.paletas.map(item => {
        const colores = item.colores_hex_rgb || [];
        return `
          <div class="p-3.5 hover:bg-slate-50 rounded-2xl transition border border-slate-100 space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2 truncate">
                ${item.imagen_url ? `<img src="${item.imagen_url}" class="w-5 h-5 rounded object-cover border border-slate-200">` : '<span>🎨</span>'}
                <h4 class="text-xs font-bold text-slate-800 truncate">${item.nombre_paleta}</h4>
              </div>
              <span class="text-[10px] text-slate-400 flex-shrink-0">${new Date(item.creado_en).toLocaleDateString('es-BO')}</span>
            </div>
            <div class="flex rounded-lg overflow-hidden h-5 w-full shadow-inner">
              ${colores.map(c => `<div class="flex-1 h-full" style="background-color: ${c.hex};" title="${c.nombre} (${c.hex})"></div>`).join('')}
            </div>
          </div>
        `;
      }).join('');
    } catch (err) {
      console.warn('Error al cargar historial de paletas:', err);
    }
  }

  loadPaletteHistory();
});
