/**
 * Lógica del Módulo 5: Evaluador de Interfaces UI/UX
 * DesignAI - INFOCAL Santa Cruz
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('uiuxForm');
  const fileInput = document.getElementById('imagenInterfaz');
  const previewContainer = document.getElementById('imagePreviewContainer');
  const previewImg = document.getElementById('imagePreview');
  const resultsContainer = document.getElementById('resultsContainer');
  const historyContainer = document.getElementById('historyContainer');

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

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;

      const file = fileInput.files[0];
      if (!file) {
        alert('Por favor selecciona una captura de pantalla de la interfaz para evaluar.');
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
    const scoreBadge = (score) => {
      const val = parseFloat(score);
      if (val >= 8.5) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      if (val >= 7.0) return 'text-blue-700 bg-blue-50 border-blue-200';
      return 'text-amber-700 bg-amber-50 border-amber-200';
    };

    resultsContainer.innerHTML = `
      <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
        
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div class="flex items-center space-x-2 text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">
              <span>Auditoría de Usabilidad y Experiencia de Usuario</span>
              <span>•</span>
              <span>INFOCAL</span>
            </div>
            <h2 class="text-2xl font-extrabold text-[#002D62]">Reporte Heurístico UI/UX</h2>
            <p class="text-xs text-slate-500 mt-1">Evaluación de interacción digital, affordance y accesibilidad</p>
          </div>
          
          <div class="px-5 py-3 rounded-2xl border ${scoreBadge(resultado.puntaje_usabilidad)} text-center">
            <span class="block text-3xl font-black">${resultado.puntaje_usabilidad}</span>
            <span class="text-[10px] font-bold uppercase tracking-wider">Usabilidad General</span>
          </div>
        </div>

        <!-- Vista Previa y Resumen -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="md:col-span-1 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-inner flex items-center justify-center p-2">
            <img src="${imagenUrl}" alt="Captura UI" class="max-h-80 w-auto object-contain rounded-xl">
          </div>
          <div class="md:col-span-2 flex flex-col justify-between">
            <div>
              <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Resumen Diagnóstico</h3>
              <p class="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                ${resultado.resumen_diagnostico}
              </p>
            </div>
            
            <div class="grid grid-cols-3 gap-3 mt-4">
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
            <p class="text-xs text-slate-500 leading-relaxed">${resultado.analisis_distribucion}</p>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span class="text-xs font-bold text-slate-700 block mb-1">👁️ Escaneabilidad y Textos</span>
            <p class="text-xs text-slate-500 leading-relaxed">${resultado.analisis_legibilidad}</p>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span class="text-xs font-bold text-slate-700 block mb-1">👆 Toques y Affordance</span>
            <p class="text-xs text-slate-500 leading-relaxed">${resultado.analisis_accesibilidad}</p>
          </div>
        </div>

        <!-- Hallazgos y Acciones -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div>
            <h4 class="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3">✅ Aciertos de Usabilidad Detectados</h4>
            <ul class="space-y-2">
              ${(resultado.hallazgos_positivos || []).map(h => `
                <li class="flex items-start space-x-2 text-xs text-slate-700 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                  <span class="text-emerald-600 font-bold">•</span>
                  <span>${h}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <div>
            <h4 class="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3">🛠️ Recomendaciones Accionables</h4>
            <ul class="space-y-2">
              ${(resultado.recomendaciones_accionables || []).map(r => `
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

  async function loadUIUXHistory() {
    if (!historyContainer) return;
    try {
      const res = await fetch('/api/uiux/historial');
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
