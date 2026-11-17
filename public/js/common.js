/**
 * Funcionalidad Común de Navegación y Sesión
 * DesignAI - INFOCAL Santa Cruz
 */

document.addEventListener('DOMContentLoaded', async () => {
  await checkGlobalSession();
  initMobileMenu();
  initLogout();
});

let currentGlobalUser = null;

async function checkGlobalSession() {
  try {
    const res = await fetch('/api/auth/me');
    const data = await res.json();

    if (!res.ok || !data.autenticado) {
      window.location.href = '/login.html';
      return;
    }

    currentGlobalUser = data.usuario;
    updateGlobalUI(currentGlobalUser);
  } catch (err) {
    console.error('Error al verificar sesión:', err);
    window.location.href = '/login.html';
  }
}

function updateGlobalUI(user) {
  const elName = document.getElementById('userName');
  const elEmail = document.getElementById('userEmail');
  const elRole = document.getElementById('userRole');
  const elMatricula = document.getElementById('userMatricula');

  if (elName) elName.textContent = user.nombre_completo;
  if (elEmail) elEmail.textContent = user.email;
  if (elRole) {
    elRole.textContent = user.rol.toUpperCase();
    if (user.rol === 'administrador') {
      elRole.className = 'px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200';
    } else {
      elRole.className = 'px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200';
    }
  }
  if (elMatricula) elMatricula.textContent = user.matricula || 'DG-REGULAR';
}

function initMobileMenu() {
  const toggle = document.getElementById('mobileMenuToggle');
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');

  if (toggle && sidebar && backdrop) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
      backdrop.classList.toggle('hidden');
    });

    backdrop.addEventListener('click', () => {
      sidebar.classList.add('-translate-x-full');
      backdrop.classList.add('hidden');
    });
  }
}

function initLogout() {
  const btnLogout = document.getElementById('btnLogout');
  const btnLogoutMobile = document.getElementById('btnLogoutMobile');

  const doLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login.html';
    } catch {
      window.location.href = '/login.html';
    }
  };

  if (btnLogout) btnLogout.addEventListener('click', doLogout);
  if (btnLogoutMobile) btnLogoutMobile.addEventListener('click', doLogout);
}
