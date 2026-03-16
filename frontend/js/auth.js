/* =========================================================
   AUTH — login & register logic (main.html)
   ========================================================= */

const loginForm    = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin    = document.getElementById('showLogin');
const loginCard    = document.getElementById('loginCard');
const registerCard = document.getElementById('registerCard');
const loginError   = document.getElementById('loginError');
const registerError = document.getElementById('registerError');

// ── If already logged in, go straight to dashboard ──────
if (localStorage.getItem('jwt_token')) {
  window.location.href = 'dashboard.html';
}

// ── Toggle between forms ─────────────────────────────────
showRegister.addEventListener('click', (e) => {
  e.preventDefault();
  loginCard.classList.add('hidden');
  registerCard.classList.remove('hidden');
});

showLogin.addEventListener('click', (e) => {
  e.preventDefault();
  registerCard.classList.add('hidden');
  loginCard.classList.remove('hidden');
});

// ── Helpers ───────────────────────────────────────────────
function setError(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
}
function clearError(el) {
  el.textContent = '';
  el.classList.add('hidden');
}
function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.textContent = loading ? 'Aguarde...' : btn.dataset.label;
}

// ── Login ─────────────────────────────────────────────────
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError(loginError);
  const btn = loginForm.querySelector('button[type="submit"]');
  setLoading(btn, true);

  try {
    const res = await apiLogin({
      username: loginForm.username.value.trim(),
      password: loginForm.password.value,
    });
    localStorage.setItem('jwt_token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    window.location.href = 'dashboard.html';
  } catch (err) {
    setError(loginError, err.message);
  } finally {
    setLoading(btn, false);
  }
});

// ── Register ─────────────────────────────────────────────
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError(registerError);
  const btn = registerForm.querySelector('button[type="submit"]');
  setLoading(btn, true);

  try {
    const res = await apiRegister({
      username: registerForm.reg_username.value.trim(),
      password: registerForm.reg_password.value,
      data_nasc: registerForm.data_nasc.value,
      curso_id: Number(registerForm.curso_id.value),
    });
    localStorage.setItem('jwt_token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    window.location.href = 'dashboard.html';
  } catch (err) {
    setError(registerError, err.message);
  } finally {
    setLoading(btn, false);
  }
});
