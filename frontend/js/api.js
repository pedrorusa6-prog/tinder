/* =========================================================
   API — centralized fetch wrapper
   ========================================================= */

function getToken() {
  return localStorage.getItem('jwt_token');
}

async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Unexpected error');
  }

  return data;
}

/* ─── Auth ─────────────────────────────────────────────── */
async function apiRegister(payload) {
  return apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
}

async function apiLogin(payload) {
  return apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
}

/* ─── Users ─────────────────────────────────────────────── */
async function apiGetUsers() {
  return apiFetch('/users');
}

/* ─── Messages ───────────────────────────────────────────── */
async function apiGetMyMessages() {
  return apiFetch('/messages/my');
}

async function apiSendMessage(payload) {
  return apiFetch('/messages', { method: 'POST', body: JSON.stringify(payload) });
}
