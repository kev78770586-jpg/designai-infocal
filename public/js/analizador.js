/**
 * Lógica del Módulo 1: Analizador Inteligente de Diseños Gráficos
 * DesignAI - INFOCAL Santa Cruz
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('analizadorForm');
  const fileInput = document.getElementById('imagenDiseno');
  const previewContainer = document.getElementById('imagePreviewContainer');
  const previewImg = document.getElementById('imagePreview');
  const resultsContainer = document.getElementById('resultsContainer');
  const historyContainer = document.getElementById('historyContainer');

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

  // Manejo de envío del formulario
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;

      const file = fileInput.files[0];
      if (!file) {
        alert('Por favor selecciona una imagen para analizar.');
        return;
      }

      const formData = new FormData(form);

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg> Analizando composición con Gemini...
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
    const scoreColor = (score) => {
      const val = parseFloat(score);
      if (val >= 8.5) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      if (val >= 7.0) return 'text-blue-600 bg-blue-50 border-blue-200';
      return 'text-amber-600 bg-amber-50 border-amber-200';
    };

    resultsContainer.innerHTML = `
      <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
        
        <!-- Encabezado de Resultados -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div class="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
              <span>Reporte Pedagógico de Diseño</span>
              <span>•</span>
              <span>INFOCAL</span>
            </div>
            <h2 class="text-2xl font-extrabold text-[#002D62]">Evaluación Multimodal de Diseño</h2>
            <p class="text-xs text-slate-500 mt-1">Análisis integral de principios de composición gráfica</p>
          </div>
          
          <div class="text-right flex items-center space-x-3">
            <div class="px-5 py-3 rounded-2xl border ${scoreColor(resultado.puntaje_general)} text-center">
              <span class="block text-3xl font-black">${resultado.puntaje_general}</span>
              <span class="text-[10px] font-bold uppercase tracking-wider">Calificación General</span>
            </div>
          </div>
        </div>

        <!-- Vista Previa y Diagnóstico -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="md:col-span-1 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-inner">
            <img src="${imagenUrl}" alt="Pieza analizada" class="w-full h-auto max-h-80 object-contain mx-auto">
          </div>
          <div class="md:col-span-2 flex flex-col justify-between">
            <div>
              <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Diagnóstico General</h3>
              <p class="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                ${resultado.diagnostico_general}
              </p>
            </div>
            <!-- Tarjeta Consejo Pedagógico INFOCAL -->
            <div class="mt-4 p-4 rounded-2xl bg-gradient-to-r from-blue-900 to-[#002D62] text-white text-xs">
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
              <span class="text-sm font-extrabold text-[#002D62]">${resultado.puntaje_composicion} / 10</span>
            </div>
            <p class="text-xs text-slate-500 leading-relaxed">${resultado.analisis_composicion}</p>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-slate-600">👁️ Jerarquía y Lectura</span>
              <span class="text-sm font-extrabold text-[#002D62]">${resultado.puntaje_jerarquia} / 10</span>
            </div>
            <p class="text-xs text-slate-500 leading-relaxed">${resultado.analisis_jerarquia}</p>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-slate-600">🎨 Contraste Cromático</span>
              <span class="text-sm font-extrabold text-[#002D62]">${resultado.puntaje_contraste} / 10</span>
            </div>
            <p class="text-xs text-slate-500 leading-relaxed">${resultado.analisis_contraste}</p>
          </div>
        </div>

        <!-- Puntos Fuertes y Mejoras Accionables -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div>
            <h4 class="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <span>✅</span>
              <span>Aciertos y Puntos Fuertes</span>
            </h4>
            <ul class="space-y-2">
              ${(resultado.puntos_fuertes || []).map(p => `
                <li class="flex items-start space-x-2 text-xs text-slate-700 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                  <span class="text-emerald-600 font-bold">•</span>
                  <span>${p}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <div>
            <h4 class="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <span>🛠️</span>
              <span>Recomendaciones de Optimización</span>
            </h4>
            <ul class="space-y-2">
              ${(resultado.recomendaciones_mejora || []).map(r => `
                <li class="flex items-start space-x-2 text-xs text-slate-700 bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
                  <span class="text-blue-600 font-bold">•</span>
                  <span>${r}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>

      </div>
    `;
  }

  // Cargar historial de análisis
  async function loadAnalysisHistory() {
    if (!historyContainer) return;
    try {
      const res = await fetch('/api/analizador/historial');
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
