/**
 * Lógica del Módulo 5: Evaluador de Interfaces UI/UX
 * DesignAI - INFOCAL Santa Cruz
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('uiuxForm');
  const fileInput = document.getElementById('imagenInterfaz');
  const dropZoneUIUX = document.getElementById('dropZoneUIUX');
  const fileBadgeUIUX = document.getElementById('fileSelectedBadgeUIUX');
  const fileNameDisplayUIUX = document.getElementById('fileNameDisplayUIUX');
  const fileSizeDisplayUIUX = document.getElementById('fileSizeDisplayUIUX');
  const fileErrorMsgUIUX = document.getElementById('fileErrorMsgUIUX');
  const previewContainer = document.getElementById('imagePreviewContainer');
  const previewImg = document.getElementById('imagePreview');
  const resultsContainer = document.getElementById('resultsContainer');
  const historyContainer = document.getElementById('historyContainer');

  function updateUIUXFileDisplay(file) {
    if (!file) {
      if (previewContainer) previewContainer.classList.add('hidden');
      if (fileBadgeUIUX) fileBadgeUIUX.classList.add('hidden');
      return;
    }
    if (fileErrorMsgUIUX) fileErrorMsgUIUX.classList.add('hidden');
    if (dropZoneUIUX) dropZoneUIUX.classList.remove('border-red-400', 'bg-red-50/20');

    if (fileNameDisplayUIUX) fileNameDisplayUIUX.textContent = file.name;
    if (fileSizeDisplayUIUX) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      fileSizeDisplayUIUX.textContent = `${sizeMb} MB`;
    }
    if (fileBadgeUIUX) fileBadgeUIUX.classList.remove('hidden');

    const reader = new FileReader();
    reader.onload = (event) => {
      if (previewImg) previewImg.src = event.target.result;
      if (previewContainer) previewContainer.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      updateUIUXFileDisplay(file);
    });
  }

  // Drag and Drop para UI/UX
  if (dropZoneUIUX && fileInput) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZoneUIUX.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZoneUIUX.classList.add('border-emerald-600', 'bg-emerald-100/40');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZoneUIUX.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZoneUIUX.classList.remove('border-emerald-600', 'bg-emerald-100/40');
      });
    });

    dropZoneUIUX.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        fileInput.files = dt.files;
        updateUIUXFileDisplay(dt.files[0]);
      }
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;

      const file = fileInput.files && fileInput.files[0];
      if (!file) {
        if (fileErrorMsgUIUX) {
          fileErrorMsgUIUX.textContent = '⚠️ Por favor selecciona o arrastra una captura de interfaz para auditar.';
          fileErrorMsgUIUX.classList.remove('hidden');
        }
        if (dropZoneUIUX) {
          dropZoneUIUX.classList.add('border-red-400', 'bg-red-50/20');
          dropZoneUIUX.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      const formData = new FormData(form);

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg> Realizando auditoría heurística UI/UX...
        `;

        resultsContainer.innerHTML = `
          <div class="bg-white p-8 rounded-3xl border border-emerald-200 shadow-sm text-center animate-pulse">
            <div class="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
              📱
            </div>
            <h3 class="text-lg font-bold text-[#002D62]">Evaluando heurísticas de usabilidad con Gemini...</h3>
            <p class="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Analizando retícula, legibilidad de microcopy, áreas de toque y affordance de elementos interactivos.
            </p>
          </div>
        `;
        resultsContainer.classList.remove('hidden');

        const res = await fetch('/api/uiux/evaluar', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        const data = await res.json();

        if (res.ok && data.exito) {
          renderUIUXResult(data.resultado, data.imagen_url);
          loadUIUXHistory();
          resultsContainer.scrollIntoView({ behavior: 'smooth' });
        } else {
          resultsContainer.innerHTML = `
            <div class="p-6 bg-red-50 text-red-800 rounded-2xl border border-red-200 text-sm">
              <p class="font-bold">Error en la evaluación:</p>
              <p>${data.mensaje || 'No se pudo completar la evaluación.'}</p>
            </div>
          `;
        }
      } catch (err) {
        resultsContainer.innerHTML = `
          <div class="p-6 bg-red-50 text-red-800 rounded-2xl border border-red-200 text-sm">
            Error de conexión con el servidor.
          </div>
        `;
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }

  function renderUIUXResult(resultado, imagenUrl) {
    const tituloPantalla = document.getElementById('tituloPantalla')?.value || 'Pantalla UI';
    const tipoDispositivo = document.getElementById('tipoDispositivo')?.value || 'mobile';
    const tarea = document.getElementById('tareaPrincipal')?.value || 'Interacción del usuario';
    const fechaActual = new Date().toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const scoreBadge = (score) => {
      const val = parseFloat(score);
      if (val >= 8.5) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      if (val >= 7.0) return 'text-blue-700 bg-blue-50 border-blue-200';
      return 'text-amber-700 bg-amber-50 border-amber-200';
    };

    resultsContainer.innerHTML = `
      <!-- BARRA DE ACCIÓN: DESCARGA DE AUDITORÍA UI/UX EN PDF -->
      <div class="bg-gradient-to-r from-[#002D62] via-emerald-800 to-[#2563EB] p-5 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center space-x-3">
          <span class="text-3xl">📱</span>
          <div>
            <h3 class="text-base font-extrabold tracking-tight">Auditoría UI/UX Oficial Generada</h3>
            <p class="text-xs text-emerald-200">Reporte heurístico de usabilidad, accesibilidad y layout INFOCAL</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button id="btnDescargarUIUXPDF" type="button"
            class="flex-1 sm:flex-initial py-2.5 px-4 bg-white hover:bg-emerald-50 text-[#002D62] font-black rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2">
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
      <div id="fichaUIUXPDF" class="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-6">
        
        <!-- Encabezado Institucional -->
        <div class="border-b-2 border-[#002D62] pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center space-x-4">
            <div class="p-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-[170px]">
              <img src="/images/logo-infocal.png" alt="Logotipo Institucional INFOCAL Santa Cruz" class="h-12 w-auto object-contain">
            </div>
            <div>
              <div class="flex items-center space-x-2 text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest">
                <span>INFOCAL Santa Cruz</span>
                <span>•</span>
                <span>Diseño de Interfaces y Experiencia (UI/UX)</span>
              </div>
              <h2 class="text-xl sm:text-2xl font-black text-[#002D62] tracking-tight">Auditoría Heurística de Interfaz</h2>
              <p class="text-[11px] text-slate-500">Evaluación técnica de affordance, jerarquía interactiva y WCAG</p>
            </div>
          </div>
          
          <div class="text-right flex items-center space-x-3 self-end sm:self-auto">
            <div class="px-5 py-3 rounded-2xl border ${scoreBadge(resultado.puntaje_usabilidad)} text-center">
              <span class="block text-3xl font-black">${resultado.puntaje_usabilidad}</span>
              <span class="text-[9px] font-extrabold uppercase tracking-wider">Usabilidad / 10</span>
            </div>
          </div>
        </div>

        <!-- Ficha de Datos de la Pantalla -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
          <div>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pantalla</span>
            <span class="font-extrabold text-[#002D62] truncate block">${tituloPantalla}</span>
          </div>
          <div>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dispositivo</span>
            <span class="font-semibold text-slate-700 capitalize truncate block">${tipoDispositivo}</span>
          </div>
          <div>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tarea Clave</span>
            <span class="font-semibold text-slate-700 truncate block">${tarea}</span>
          </div>
          <div>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fecha Emisión</span>
            <span class="font-semibold text-slate-700 truncate block">${fechaActual}</span>
          </div>
        </div>

        <!-- Vista Previa de Captura y Diagnóstico Heurístico -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div class="md:col-span-1 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-50 p-2 shadow-inner text-center">
            <img src="${imagenUrl}" alt="Captura de interfaz" class="max-h-80 w-auto object-contain mx-auto rounded-xl">
            <span class="inline-block mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Interfaz Auditada</span>
          </div>
          <div class="md:col-span-2 space-y-4">
            <div>
              <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <span>🔍</span>
                <span>Diagnóstico de Usabilidad y Arquitectura Visual</span>
              </h3>
              <p class="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                ${resultado.resumen_diagnostico}
              </p>
            </div>
            
            <div class="grid grid-cols-3 gap-3">
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span class="text-[10px] font-bold text-slate-500 block uppercase">Distribución</span>
                <span class="text-base font-extrabold text-[#002D62]">${resultado.puntaje_distribucion} / 10</span>
              </div>
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span class="text-[10px] font-bold text-slate-500 block uppercase">Legibilidad</span>
                <span class="text-base font-extrabold text-[#002D62]">${resultado.puntaje_legibilidad} / 10</span>
              </div>
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span class="text-[10px] font-bold text-slate-500 block uppercase">Accesibilidad</span>
                <span class="text-base font-extrabold text-[#002D62]">${resultado.puntaje_accesibilidad} / 10</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Criterios Heurísticos Técnicos -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span class="text-xs font-bold text-slate-700 block mb-1">📐 Retícula y Layout</span>
            <p class="text-xs text-slate-600 leading-relaxed">${resultado.analisis_distribucion}</p>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span class="text-xs font-bold text-slate-700 block mb-1">👁️ Escaneabilidad y Microcopy</span>
            <p class="text-xs text-slate-600 leading-relaxed">${resultado.analisis_legibilidad}</p>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span class="text-xs font-bold text-slate-700 block mb-1">👆 Zonas de Toque y Affordance</span>
            <p class="text-xs text-slate-600 leading-relaxed">${resultado.analisis_accesibilidad}</p>
          </div>
        </div>

        <!-- Hallazgos y Acciones -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div>
            <h4 class="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <span>✅</span>
              <span>Aciertos Heurísticos Detectados</span>
            </h4>
            <ul class="space-y-2">
              ${(resultado.hallazgos_positivos || []).map(h => `
                <li class="flex items-start space-x-2 text-xs text-slate-700 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/60">
                  <span class="text-emerald-600 font-bold">•</span>
                  <span>${h}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <div>
            <h4 class="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <span>🛠️</span>
              <span>Recomendaciones Accionables de Optimización</span>
            </h4>
            <ul class="space-y-2">
              ${(resultado.recomendaciones_accionables || []).map(r => `
                <li class="flex items-start space-x-2 text-xs text-slate-700 bg-blue-50/70 p-2.5 rounded-xl border border-blue-200/60">
                  <span class="text-blue-600 font-bold">•</span>
                  <span>${r}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>

        <!-- Firmas Oficiales para el PDF -->
        <div class="pt-6 border-t border-slate-200 mt-6 grid grid-cols-2 gap-8 text-center">
          <div>
            <div class="border-b border-slate-400 w-3/4 mx-auto mb-2 h-8"></div>
            <p class="text-[11px] font-bold text-[#002D62]">Auditor UI/UX / Jurado INFOCAL</p>
            <p class="text-[10px] text-slate-400">DesignAI - INFOCAL Santa Cruz</p>
          </div>
          <div>
            <div class="border-b border-slate-400 w-3/4 mx-auto mb-2 h-8"></div>
            <p class="text-[11px] font-bold text-[#002D62]">Estudiante / Diseñador UI/UX</p>
            <p class="text-[10px] text-slate-400">Carrera de Diseño Gráfico</p>
          </div>
        </div>

      </div>
    `;

    // Asignar evento al botón de descarga PDF
    const btnUIUXPDF = document.getElementById('btnDescargarUIUXPDF');
    if (btnUIUXPDF) {
      btnUIUXPDF.addEventListener('click', () => {
        descargarFichaUIUXPDF(tituloPantalla);
      });
    }
  }

  // Función para exportar Ficha UI/UX a PDF institucional
  function descargarFichaUIUXPDF(tituloPantalla) {
    const elemento = document.getElementById('fichaUIUXPDF');
    if (!elemento) return;

    const nombreLimpio = (tituloPantalla || 'UI_UX').replace(/[^a-zA-Z0-9_-]/g, '_');
    const opt = {
      margin:       [8, 8, 8, 8],
      filename:     `Ficha_UIUX_INFOCAL_${nombreLimpio}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (window.html2pdf) {
      const btn = document.getElementById('btnDescargarUIUXPDF');
      const originalText = btn ? btn.innerHTML : '';
      if (btn) btn.innerHTML = `<span>⏳ Generando Auditoría PDF...</span>`;
      window.html2pdf().set(opt).from(elemento).save().then(() => {
        if (btn) btn.innerHTML = originalText;
      }).catch(err => {
        console.error('Error al generar PDF UI/UX:', err);
        if (btn) btn.innerHTML = originalText;
        window.print();
      });
    } else {
      window.print();
    }
  }

  async function loadUIUXHistory() {
    if (!historyContainer) return;
    try {
      const res = await fetch('/api/uiux/historial', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      if (!data.exito || !data.evaluaciones || data.evaluaciones.length === 0) {
        historyContainer.innerHTML = `
          <div class="p-6 text-center text-xs text-slate-400">
            Aún no has evaluado pantallas UI/UX.
          </div>
        `;
        return;
      }

      historyContainer.innerHTML = data.evaluaciones.map(item => `
        <div class="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-2xl transition border border-slate-100">
          <img src="${item.imagen_url}" alt="${item.titulo_pantalla}" class="w-12 h-12 object-cover rounded-xl border border-slate-200">
          <div class="flex-1 min-w-0">
            <h4 class="text-xs font-bold text-slate-800 truncate">${item.titulo_pantalla}</h4>
            <span class="text-[10px] text-slate-400 uppercase tracking-wider">${item.tipo_dispositivo}</span>
          </div>
          <span class="px-2 py-0.5 rounded-lg text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
            ${item.puntaje_usabilidad || '8.5'}
          </span>
        </div>
      `).join('');
    } catch (err) {
      console.warn('Error al cargar historial UI/UX:', err);
    }
  }

  loadUIUXHistory();
});
