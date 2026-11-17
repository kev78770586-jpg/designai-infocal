/**
 * Lógica del Dashboard Principal (Vanilla JS + Fetch API)
 * DesignAI - INFOCAL Santa Cruz
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Verificar Sesión Activa
  await checkSession();

  // 2. Cargar Estadísticas del Dashboard
  await loadDashboardStats();

  // 3. Inicializar Menú Móvil
  setupMobileMenu();

  // 4. Inicializar Botón de Cerrar Sesión
  setupLogout();

  // 5. Inicializar Botón Maestro del Taller Creativo (4 Módulos)
  setupSuiteToggle();
});

let currentUser = null;

async function checkSession() {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    const data = await res.json();

    if (!res.ok || !data.autenticado) {
      window.location.href = '/login.html';
      return;
    }

    currentUser = data.usuario;
    updateUserInterface(currentUser);
  } catch (err) {
    console.error('Error al verificar sesión:', err);
    window.location.href = '/login.html';
  }
}

function updateUserInterface(user) {
  // Nombres y Perfil
  const elUserName = document.getElementById('userName');
  const elUserEmail = document.getElementById('userEmail');
  const elUserRole = document.getElementById('userRole');
  const elUserMatricula = document.getElementById('userMatricula');
  const elUserGreeting = document.getElementById('userGreeting');

  if (elUserName) elUserName.textContent = user.nombre_completo;
  if (elUserEmail) elUserEmail.textContent = user.email;
  if (elUserRole) {
    elUserRole.textContent = user.rol.toUpperCase();
    if (user.rol === 'administrador') {
      elUserRole.className = 'px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-100 text-purple-800 border border-purple-200';
    } else {
      elUserRole.className = 'px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-200';
    }
  }
  if (elUserMatricula) elUserMatricula.textContent = user.matricula || 'DG-REGULAR';
  if (elUserGreeting) elUserGreeting.textContent = `¡Hola, ${user.nombre_completo.split(' ')[0]}!`;
}

async function loadDashboardStats() {
  try {
    const res = await fetch('/api/dashboard/stats', { credentials: 'include' });
    if (!res.ok) return;

    const data = await res.json();
    if (!data.exito) return;

    const stats = data.estadisticas;

    // Actualizar Contadores Numéricos
    animateValue('statAnalisis', stats.total_analisis || 0);
    animateValue('statPaletas', stats.total_paletas || 0);
    animateValue('statTipografias', stats.total_tipografias || 0);
    animateValue('statUiux', stats.total_uiux || 0);
    
    const elPromedio = document.getElementById('statPromedio');
    if (elPromedio) {
      elPromedio.textContent = `${stats.promedio_calificacion || '8.5'} / 10`;
    }

    // Renderizar Actividad Reciente
    renderRecentActivity(data.actividades_recientes || []);

    // Renderizar Tip Pedagógico
    if (data.tip_pedagogico) {
      const tipTitle = document.getElementById('tipTitle');
      const tipContent = document.getElementById('tipContent');
      if (tipTitle) tipTitle.textContent = data.tip_pedagogico.titulo;
      if (tipContent) tipContent.textContent = data.tip_pedagogico.contenido;
    }
  } catch (err) {
    console.error('Error al cargar estadísticas:', err);
  }
}

function animateValue(id, endValue) {
  const obj = document.getElementById(id);
  if (!obj) return;
  let startValue = 0;
  const duration = 600;
  const stepTime = 30;
  const steps = duration / stepTime;
  const increment = endValue / steps;

  if (endValue === 0) {
    obj.textContent = '0';
    return;
  }

  const timer = setInterval(() => {
    startValue += increment;
    if (startValue >= endValue) {
      clearInterval(timer);
      obj.textContent = endValue;
    } else {
      obj.textContent = Math.ceil(startValue);
    }
  }, stepTime);
}

function renderRecentActivity(actividades) {
  const container = document.getElementById('recentActivityContainer');
  if (!container) return;

  if (actividades.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center text-slate-400 text-sm">
        No hay actividades recientes registradas aún. ¡Comienza analizando un diseño!
      </div>
    `;
    return;
  }

  const iconosModulo = {
    analizador: { icon: '🎨', bg: 'bg-blue-100 text-blue-700' },
    colores: { icon: '🌈', bg: 'bg-indigo-100 text-indigo-700' },
    tipografia: { icon: '🔤', bg: 'bg-purple-100 text-purple-700' },
    ideas: { icon: '💡', bg: 'bg-amber-100 text-amber-700' },
    ui_ux: { icon: '📱', bg: 'bg-emerald-100 text-emerald-700' },
    autenticacion: { icon: '🔐', bg: 'bg-slate-100 text-slate-700' }
  };

  container.innerHTML = actividades.map(item => {
    const moduloInfo = iconosModulo[item.modulo] || { icon: '📌', bg: 'bg-slate-100 text-slate-700' };
    const fecha = new Date(item.creado_en).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div class="flex items-start space-x-3 p-3.5 hover:bg-slate-50 rounded-xl transition border-b border-slate-100 last:border-0">
        <div class="w-10 h-10 rounded-xl ${moduloInfo.bg} flex items-center justify-center font-bold text-lg flex-shrink-0">
          ${moduloInfo.icon}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-bold text-slate-800 truncate">
            ${item.descripcion || item.accion}
          </p>
          <div class="flex items-center space-x-2 mt-0.5">
            <span class="text-[10px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              ${item.modulo}
            </span>
            <span class="text-[11px] text-slate-400">
              ${fecha}
            </span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function setupMobileMenu() {
  const btnToggle = document.getElementById('mobileMenuToggle');
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');

  if (btnToggle && sidebar && backdrop) {
    btnToggle.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
      backdrop.classList.toggle('hidden');
    });

    backdrop.addEventListener('click', () => {
      sidebar.classList.add('-translate-x-full');
      backdrop.classList.add('hidden');
    });
  }
}

function setupLogout() {
  const btnLogout = document.getElementById('btnLogout');
  const btnLogoutMobile = document.getElementById('btnLogoutMobile');

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      window.location.href = '/login.html';
    } catch (err) {
      window.location.href = '/login.html';
    }
  };

  if (btnLogout) btnLogout.addEventListener('click', handleLogout);
  if (btnLogoutMobile) btnLogoutMobile.addEventListener('click', handleLogout);
}

function setupSuiteToggle() {
  const btnToggle = document.getElementById('btnToggleSuite');
  const container = document.getElementById('suiteModulesContainer');
  const chevron = document.getElementById('suiteChevron');
  const btnText = document.getElementById('suiteBtnText');

  if (btnToggle && container) {
    btnToggle.addEventListener('click', () => {
      const isHidden = container.classList.contains('hidden');
      if (isHidden) {
        container.classList.remove('hidden');
        if (chevron) chevron.classList.add('rotate-180');
        if (btnText) btnText.textContent = 'Ocultar Taller (4 Módulos)';
      } else {
        container.classList.add('hidden');
        if (chevron) chevron.classList.remove('rotate-180');
        if (btnText) btnText.textContent = 'Abrir Taller Creativo (Ver 4 Módulos)';
      }
    });
  }
}
