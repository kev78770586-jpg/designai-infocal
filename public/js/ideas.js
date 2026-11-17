/**
 * Lógica del Módulo 4: Generador de Ideas y Conceptos Creativos
 * DesignAI - INFOCAL Santa Cruz
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('ideasForm');
  const resultsContainer = document.getElementById('resultsContainer');
  const historyContainer = document.getElementById('historyContainer');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;

      const brief = document.getElementById('briefIdea').value;
      const categoria = document.getElementById('categoriaIdea').value;
      const publico_meta = document.getElementById('publicoIdea').value;

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg> Desarrollando rutas conceptuales...
        `;

        resultsContainer.innerHTML = `
          <div class="bg-white p-8 rounded-3xl border border-amber-200 shadow-sm text-center animate-pulse">
            <div class="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
              💡
            </div>
            <h3 class="text-lg font-bold text-[#002D62]">Creando propuestas y metáforas visuales...</h3>
            <p class="text-xs text-slate-500 mt-1">Sintetizando insights, estilos gráficos y corrientes de diseño.</p>
          </div>
        `;
        resultsContainer.classList.remove('hidden');

        const res = await fetch('/api/ideas/generar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brief, categoria, publico_meta })
        });

        const data = await res.json();

        if (res.ok && data.exito) {
          renderIdeasResult(data.resultado);
          loadIdeasHistory();
          resultsContainer.scrollIntoView({ behavior: 'smooth' });
        } else {
          resultsContainer.innerHTML = `
            <div class="p-6 bg-red-50 text-red-800 rounded-2xl border border-red-200 text-sm">
              <p class="font-bold">Error:</p>
              <p>${data.mensaje || 'No se pudieron generar las ideas.'}</p>
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

  function renderIdeasResult(res) {
    const palabras = res.palabras_clave || [];
    const propuestas = res.propuestas || [];
    const referentes = res.referencias_movimientos_artisticos || [];

    resultsContainer.innerHTML = `
      <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
        
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div class="flex items-center space-x-2 text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">
              <span>Propuestas Creativas</span>
              <span>•</span>
              <span>INFOCAL</span>
            </div>
            <h2 class="text-2xl font-extrabold text-[#002D62]">Dirección de Arte y Conceptos</h2>
            <p class="text-xs text-slate-500 mt-1">${res.sintesis_brief}</p>
          </div>
        </div>

        <!-- Palabras Clave Estratégicas -->
        <div>
          <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Palabras Clave e Insights Nucleares</h3>
          <div class="flex flex-wrap gap-2">
            ${palabras.map(p => `
              <span class="px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                #${p}
              </span>
            `).join('')}
          </div>
        </div>

        <!-- 3 Rutas Conceptuales -->
        <div class="space-y-4 pt-2">
          <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">3 Rutas Conceptuales Diferenciadas</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            ${propuestas.map((prop, idx) => `
              <div class="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:shadow-lg transition-all flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#002D62] text-white">
                      Ruta 0${idx + 1}
                    </span>
                    <span class="text-[11px] font-bold text-amber-700">${prop.estilo_grafico}</span>
                  </div>
                  <h4 class="text-base font-extrabold text-[#002D62] mb-1">${prop.titulo}</h4>
                  <p class="text-xs font-semibold text-slate-700 mb-2 italic">"${prop.concepto_central}"</p>
                  <p class="text-xs text-slate-600 leading-relaxed mb-4">${prop.narrativa}</p>
                </div>

                <div class="space-y-2 pt-3 border-t border-slate-200 text-xs">
                  <div class="bg-white p-2.5 rounded-xl border border-slate-100">
                    <span class="font-bold text-[#002D62] block mb-0.5">👁️ Metáfora Visual:</span>
                    <span class="text-slate-600">${prop.metafora_visual}</span>
                  </div>
                  <div class="bg-white p-2.5 rounded-xl border border-slate-100">
                    <span class="font-bold text-purple-700 block mb-0.5">🎨 Paleta Sugerida:</span>
                    <span class="text-slate-600">${prop.paleta_sugerida}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Referencias Artísticas y Ambientación Cromática -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div class="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
            <h4 class="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">Ambiente Cromático Sugerido</h4>
            <p class="text-xs text-slate-700 leading-relaxed">${res.orientacion_cromatica}</p>
          </div>

          <div class="p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
            <h4 class="text-xs font-bold text-purple-900 uppercase tracking-wider mb-2">Referentes para Investigación</h4>
            <ul class="text-xs text-slate-700 space-y-1">
              ${referentes.map(r => `<li>• ${r}</li>`).join('')}
            </ul>
          </div>
        </div>

      </div>
    `;
  }

  async function loadIdeasHistory() {
    if (!historyContainer) return;
    try {
      const res = await fetch('/api/ideas/historial');
      if (!res.ok) return;
      const data = await res.json();
      if (!data.exito || !data.ideas || data.ideas.length === 0) {
        historyContainer.innerHTML = `
          <div class="p-6 text-center text-xs text-slate-400">
            Aún no has generado conceptos.
          </div>
        `;
        return;
      }

      historyContainer.innerHTML = data.ideas.map(item => `
        <div class="p-3.5 hover:bg-slate-50 rounded-2xl transition border border-slate-100">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              ${item.categoria}
            </span>
            <span class="text-[10px] text-slate-400">${new Date(item.creado_en).toLocaleDateString('es-BO')}</span>
          </div>
          <p class="text-xs font-bold text-slate-800 line-clamp-2">${item.prompt_idea}</p>
        </div>
      `).join('');
    } catch (err) {
      console.warn('Error al cargar historial de ideas:', err);
    }
  }

  loadIdeasHistory();
});
