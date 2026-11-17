/**
 * Lógica del Módulo 1: Analizador Inteligente de Diseños Gráficos
 * DesignAI - INFOCAL Santa Cruz
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('analizadorForm');
  const fileInput = document.getElementById('imagenDiseno');
  const dropZone = document.getElementById('dropZoneAnalizador');
  const fileBadge = document.getElementById('fileSelectedBadge');
  const fileNameDisplay = document.getElementById('fileNameDisplay');
  const fileSizeDisplay = document.getElementById('fileSizeDisplay');
  const fileErrorMsg = document.getElementById('fileErrorMsg');
  const previewContainer = document.getElementById('imagePreviewContainer');
  const previewImg = document.getElementById('imagePreview');
  const resultsContainer = document.getElementById('resultsContainer');
  const historyContainer = document.getElementById('historyContainer');

  function updateFileDisplay(file) {
    if (!file) {
      if (fileBadge) fileBadge.classList.add('hidden');
      if (previewContainer) previewContainer.classList.add('hidden');
      return;
    }
    if (fileErrorMsg) {
      fileErrorMsg.classList.add('hidden');
      fileErrorMsg.textContent = '';
    }
    if (dropZone) dropZone.classList.remove('border-red-400', 'bg-red-50/20');

    // Nombre y tamaño legible
    if (fileNameDisplay) fileNameDisplay.textContent = file.name;
    if (fileSizeDisplay) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      fileSizeDisplay.textContent = `${sizeMb} MB`;
    }
    if (fileBadge) fileBadge.classList.remove('hidden');

    // Previsualización instantánea
    const reader = new FileReader();
    reader.onload = (event) => {
      previewImg.src = event.target.result;
      previewContainer.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }

  // Previsualización y actualización cuando el usuario selecciona archivo
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      updateFileDisplay(file);
    });
  }

  // Soporte completo de Arrastrar y Soltar (Drag & Drop)
  if (dropZone && fileInput) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('border-blue-600', 'bg-blue-100/40');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('border-blue-600', 'bg-blue-100/40');
      });
    });

    dropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        fileInput.files = dt.files;
        updateFileDisplay(dt.files[0]);
      }
    });
  }

  // Manejo de envío del formulario
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;

      const file = fileInput.files && fileInput.files[0];
      if (!file) {
        if (fileErrorMsg) {
          fileErrorMsg.textContent = '⚠️ Por favor selecciona o arrastra una imagen para que la IA pueda evaluarla.';
          fileErrorMsg.classList.remove('hidden');
        }
        if (dropZone) {
          dropZone.classList.add('border-red-400', 'bg-red-50/20');
          dropZone.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      const formData = new FormData(form);

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline-block" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg> Analizando composición con IA...
        `;

        resultsContainer.innerHTML = `
          <div class="bg-white p-8 rounded-3xl border border-blue-200 shadow-sm text-center animate-pulse">
            <div class="w-14 h-14 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
              🎨
            </div>
            <h3 class="text-lg font-bold text-[#002D62]">Evaluando pieza gráfica...</h3>
            <p class="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              La IA está examinando la regla de tercios, la escala visual, el recorrido de lectura y el contraste cromático.
            </p>
          </div>
        `;
        resultsContainer.classList.remove('hidden');

        const res = await fetch('/api/analizador/evaluar', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        const data = await res.json();

        if (res.ok && data.exito) {
          renderAnalysisResult(data.resultado, data.imagen_url);
          loadAnalysisHistory();
          resultsContainer.scrollIntoView({ behavior: 'smooth' });
        } else {
          resultsContainer.innerHTML = `
            <div class="p-6 bg-red-50 text-red-800 rounded-2xl border border-red-200 text-sm">
              <p class="font-bold">Error en la evaluación:</p>
              <p>${data.mensaje || 'No se pudo completar el análisis.'}</p>
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

  function renderAnalysisResult(resultado, imagenUrl) {
    const tituloPieza = document.getElementById('tituloDiseno')?.value || 'Diseño Gráfico';
    const tipoPieza = document.getElementById('tipoDiseno')?.value || 'Afiche / Cartel';
    const publico = document.getElementById('publicoObjetivo')?.value || 'General';
    const tono = document.getElementById('tonoEstilo')?.value || 'Moderno y Dinámico';
    const mensaje = document.getElementById('mensajeClave')?.value || 'Mensaje visual del proyecto';
    const fechaActual = new Date().toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const scoreColor = (score) => {
      const val = parseFloat(score);
      if (val >= 8.5) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      if (val >= 7.0) return 'text-blue-600 bg-blue-50 border-blue-200';
      return 'text-amber-600 bg-amber-50 border-amber-200';
    };

    resultsContainer.innerHTML = `
      <!-- BARRA DE ACCIONES SUPERIOR: DESCARGAR PDF INSTITUCIONAL -->
      <div class="bg-gradient-to-r from-[#002D62] via-blue-800 to-[#7C3AED] p-5 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center space-x-3">
          <span class="text-3xl">📄</span>
          <div>
            <h3 class="text-base font-extrabold tracking-tight">Ficha Técnica Oficial Generada</h3>
            <p class="text-xs text-blue-200">Reporte pedagógico de evaluación y optimización gráfica INFOCAL</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button id="btnDescargarPDF" type="button"
            class="flex-1 sm:flex-initial py-2.5 px-4 bg-white hover:bg-blue-50 text-[#002D62] font-black rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2">
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

      <!-- CONTENEDOR DE LA FICHA TÉCNICA (OBJETO DE EXPORTACIÓN A PDF E IMPRESIÓN) -->
      <div id="fichaTecnicaPDF" class="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-6">
        
        <!-- Encabezado Institucional del Reporte Oficial -->
        <div class="border-b-2 border-[#002D62] pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center space-x-4">
            <div class="p-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-[170px]">
              <img src="/images/logo-infocal.png" alt="Logotipo Institucional INFOCAL Santa Cruz" class="h-12 w-auto object-contain">
            </div>
            <div>
              <div class="flex items-center space-x-2 text-[10px] font-extrabold text-blue-700 uppercase tracking-widest">
                <span>INFOCAL Santa Cruz</span>
                <span>•</span>
                <span>Carrera de Diseño Gráfico</span>
              </div>
              <h2 class="text-xl sm:text-2xl font-black text-[#002D62] tracking-tight">Ficha Técnica de Optimización</h2>
              <p class="text-[11px] text-slate-500">Evaluación académica de composición, jerarquía y accesibilidad cromática</p>
            </div>
          </div>
          
          <div class="text-right flex items-center space-x-3 self-end sm:self-auto">
            <div class="px-5 py-3 rounded-2xl border ${scoreColor(resultado.puntaje_general)} text-center">
              <span class="block text-3xl font-black">${resultado.puntaje_general}</span>
              <span class="text-[9px] font-extrabold uppercase tracking-wider">Puntaje / 10</span>
            </div>
          </div>
        </div>

        <!-- Ficha de Datos Técnicos del Proyecto -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
          <div>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Proyecto</span>
            <span class="font-extrabold text-[#002D62] truncate block">${tituloPieza}</span>
          </div>
          <div>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Soporte</span>
            <span class="font-semibold text-slate-700 capitalize truncate block">${tipoPieza}</span>
          </div>
          <div>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Público Meta</span>
            <span class="font-semibold text-slate-700 truncate block">${publico}</span>
          </div>
          <div>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fecha Emisión</span>
            <span class="font-semibold text-slate-700 truncate block">${fechaActual}</span>
          </div>
        </div>

        <!-- Vista de la Imagen Analizada y Diagnóstico General -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div class="md:col-span-1 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-50 p-2 shadow-inner text-center">
            <img src="${imagenUrl}" alt="Pieza analizada" class="w-full h-auto max-h-80 object-contain mx-auto rounded-xl">
            <span class="inline-block mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pieza Gráfica Evaluada</span>
          </div>
          <div class="md:col-span-2 space-y-4">
            <div>
              <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <span>🔍</span>
                <span>Diagnóstico General del Jurado Calificador</span>
              </h3>
              <p class="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                ${resultado.diagnostico_general}
              </p>
            </div>
            <!-- Tarjeta Consejo Pedagógico INFOCAL -->
            <div class="p-4 rounded-2xl bg-gradient-to-r from-blue-950 to-[#002D62] text-white text-xs">
              <span class="font-bold text-blue-300 uppercase tracking-wider block mb-1">🎓 Recomendación Docente INFOCAL:</span>
              <p class="leading-relaxed text-blue-100">${resultado.consejos_pedagogicos_infocal}</p>
            </div>
          </div>
        </div>

        <!-- Puntajes por Criterio Técnico -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-slate-600">📐 Composición y Espacio</span>
              <span class="text-xs font-extrabold px-2 py-0.5 rounded bg-blue-100 text-[#002D62]">${resultado.puntaje_composicion} / 10</span>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">${resultado.analisis_composicion}</p>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-slate-600">👁️ Jerarquía y Lectura</span>
              <span class="text-xs font-extrabold px-2 py-0.5 rounded bg-blue-100 text-[#002D62]">${resultado.puntaje_jerarquia} / 10</span>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">${resultado.analisis_jerarquia}</p>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-slate-600">🎨 Contraste Cromático</span>
              <span class="text-xs font-extrabold px-2 py-0.5 rounded bg-blue-100 text-[#002D62]">${resultado.puntaje_contraste} / 10</span>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">${resultado.analisis_contraste}</p>
          </div>
        </div>

        <!-- Puntos Fuertes y Mejoras Accionables -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div>
            <h4 class="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <span>✅</span>
              <span>Aciertos y Puntos Fuertes</span>
            </h4>
            <ul class="space-y-2">
              ${(resultado.puntos_fuertes || []).map(p => `
                <li class="flex items-start space-x-2 text-xs text-slate-700 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/60">
                  <span class="text-emerald-600 font-bold">•</span>
                  <span>${p}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <div>
            <h4 class="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <span>🛠️</span>
              <span>Plan de Optimización y Mejoras Accionables</span>
            </h4>
            <ul class="space-y-2">
              ${(resultado.recomendaciones_mejora || []).map(r => `
                <li class="flex items-start space-x-2 text-xs text-slate-700 bg-blue-50/70 p-2.5 rounded-xl border border-blue-200/60">
                  <span class="text-blue-600 font-bold">•</span>
                  <span>${r}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>

        <!-- Pie de Página Institucional con Firmas Oficiales para el PDF -->
        <div class="pt-8 border-t border-slate-200 mt-6 grid grid-cols-2 gap-8 text-center">
          <div>
            <div class="border-b border-slate-400 w-3/4 mx-auto mb-2 h-10"></div>
            <p class="text-[11px] font-bold text-[#002D62]">Jurado Evaluador / Docente de Diseño</p>
            <p class="text-[10px] text-slate-400">DesignAI - INFOCAL Santa Cruz</p>
          </div>
          <div>
            <div class="border-b border-slate-400 w-3/4 mx-auto mb-2 h-10"></div>
            <p class="text-[11px] font-bold text-[#002D62]">Estudiante / Diseñador Gráfico</p>
            <p class="text-[10px] text-slate-400">Carrera de Diseño Gráfico y Comunicación</p>
          </div>
        </div>

      </div>
    `;

    // Asignar evento al botón de descarga PDF
    const btnPDF = document.getElementById('btnDescargarPDF');
    if (btnPDF) {
      btnPDF.addEventListener('click', () => {
        descargarFichaPDF(tituloPieza);
      });
    }
  }

  // Función para exportar la Ficha Técnica a PDF institucional
  function descargarFichaPDF(titulo) {
    const elemento = document.getElementById('fichaTecnicaPDF');
    if (!elemento) return;

    const nombreLimpio = (titulo || 'Diseno').replace(/[^a-zA-Z0-9_-]/g, '_');
    const opt = {
      margin:       [8, 8, 8, 8],
      filename:     `Ficha_Tecnica_INFOCAL_${nombreLimpio}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (window.html2pdf) {
      const btn = document.getElementById('btnDescargarPDF');
      const originalText = btn ? btn.innerHTML : '';
      if (btn) btn.innerHTML = `<span>⏳ Generando PDF institucional...</span>`;
      window.html2pdf().set(opt).from(elemento).save().then(() => {
        if (btn) btn.innerHTML = originalText;
      }).catch(err => {
        console.error('Error al generar PDF con html2pdf:', err);
        if (btn) btn.innerHTML = originalText;
        window.print();
      });
    } else {
      window.print();
    }
  }

  // Cargar historial de análisis
  async function loadAnalysisHistory() {
    if (!historyContainer) return;
    try {
      const res = await fetch('/api/analizador/historial', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      if (!data.exito || !data.analisis || data.analisis.length === 0) {
        historyContainer.innerHTML = `
          <div class="p-6 text-center text-xs text-slate-400">
            Aún no has evaluado diseños. Sube tu primer archivo arriba.
          </div>
        `;
        return;
      }

      historyContainer.innerHTML = data.analisis.map(item => `
        <div class="flex items-center space-x-4 p-3 hover:bg-slate-50 rounded-2xl transition border border-slate-100">
          <img src="${item.imagen_url}" alt="${item.titulo_diseno}" class="w-14 h-14 object-cover rounded-xl border border-slate-200">
          <div class="flex-1 min-w-0">
            <h4 class="text-xs font-bold text-slate-800 truncate">${item.titulo_diseno}</h4>
            <p class="text-[11px] text-slate-400 uppercase tracking-wider">${item.tipo_diseno}</p>
            <span class="text-[10px] text-slate-400">${new Date(item.creado_en).toLocaleDateString('es-BO')}</span>
          </div>
          <div class="text-right">
            <span class="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
              ${item.puntaje_general || '8.0'}
            </span>
          </div>
        </div>
      `).join('');
    } catch (err) {
      console.warn('Error al cargar historial de análisis:', err);
    }
  }

  loadAnalysisHistory();
});
