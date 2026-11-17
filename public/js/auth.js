/**
 * Lógica de Autenticación y Manejo de Sesión (Vanilla JS + Fetch API)
 * DesignAI - INFOCAL Santa Cruz
 */

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const alertContainer = document.getElementById('alertContainer');
  const formTitle = document.getElementById('formTitle');
  const formSubtitle = document.getElementById('formSubtitle');
  const togglePromptText = document.getElementById('togglePromptText');
  const btnToggleAuth = document.getElementById('btnToggleAuth');

  // Modo por defecto: Registro
  let currentMode = 'register';

  // Verificar si la URL especifica explícitamente ?mode=login
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('mode') === 'login') {
    switchMode('login');
  }

  function switchMode(mode) {
    currentMode = mode;
    clearAlert();

    if (mode === 'register') {
      if (registerForm) registerForm.classList.remove('hidden');
      if (loginForm) loginForm.classList.add('hidden');
      if (formTitle) formTitle.textContent = 'Registro de Estudiantes';
      if (formSubtitle) formSubtitle.textContent = 'Crea tu cuenta institucional para comenzar a usar la IA en Diseño Gráfico';
      if (togglePromptText) togglePromptText.textContent = '¿Ya tienes una cuenta registrada?';
      if (btnToggleAuth) btnToggleAuth.textContent = 'Iniciar sesión aquí';
    } else {
      if (registerForm) registerForm.classList.add('hidden');
      if (loginForm) loginForm.classList.remove('hidden');
      if (formTitle) formTitle.textContent = 'Iniciar Sesión';
      if (formSubtitle) formSubtitle.textContent = 'Ingresa con tu correo institucional y contraseña';
      if (togglePromptText) togglePromptText.textContent = '¿Aún no tienes una cuenta?';
      if (btnToggleAuth) btnToggleAuth.textContent = 'Registrarse como estudiante aquí';
    }
  }

  // Alternador entre Registro e Inicio de Sesión
  if (btnToggleAuth) {
    btnToggleAuth.addEventListener('click', () => {
      switchMode(currentMode === 'register' ? 'login' : 'register');
    });
  }

  // Notificaciones dinámicas
  function showAlert(message, type = 'error') {
    if (!alertContainer) return;
    const isError = type === 'error';
    alertContainer.innerHTML = `
      <div class="p-4 rounded-xl flex items-start space-x-3 text-sm animate-fade-in ${
        isError ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
      }">
        <span class="font-bold text-lg leading-none">${isError ? '⚠️' : '✅'}</span>
        <div class="flex-1">${message}</div>
      </div>
    `;
  }

  function clearAlert() {
    if (alertContainer) alertContainer.innerHTML = '';
  }

  // Manejo de Registro (Flujo Principal)
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAlert();
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;

      const nombre_completo = document.getElementById('regNombre').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      const matricula = document.getElementById('regMatricula') ? document.getElementById('regMatricula').value.trim() : null;
      const rol = document.getElementById('regRol') ? document.getElementById('regRol').value : 'estudiante';

      if (!nombre_completo || !email || !password) {
        showAlert('Por favor llena los campos obligatorios (Nombre, Email y Contraseña).');
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg> Creando cuenta en DesignAI...
        `;

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre_completo, matricula, email, password, rol })
        });

        const data = await res.json();

        if (res.ok && data.exito) {
          showAlert('¡Cuenta creada con éxito! Redirigiendo a tu Dashboard...', 'success');
          setTimeout(() => {
            window.location.href = '/dashboard.html';
          }, 900);
        } else {
          showAlert(data.mensaje || 'Error al procesar el registro.');
        }
      } catch (err) {
        showAlert('Error de conexión con el servidor de DesignAI.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }

  // Manejo de Login (Flujo Alterno para Cuentas Existentes)
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAlert();
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;

      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;

      if (!email || !password) {
        showAlert('Por favor ingresa tu correo y contraseña.');
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg> Accediendo a DesignAI...
        `;

        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok && data.exito) {
          showAlert(data.mensaje, 'success');
          setTimeout(() => {
            window.location.href = '/dashboard.html';
          }, 800);
        } else {
          showAlert(data.mensaje || 'Error al iniciar sesión.');
        }
      } catch (err) {
        showAlert('Error de conexión con el servidor de DesignAI.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }
});
