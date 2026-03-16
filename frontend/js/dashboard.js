/* =========================================================
   DASHBOARD — messages & compose logic
   ========================================================= */

// ── Auth guard ────────────────────────────────────────────
const token = localStorage.getItem('jwt_token');
if (!token) {
  window.location.href = 'main.html';
}

const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

// ── DOM refs ──────────────────────────────────────────────
const usernameDisplay  = document.getElementById('usernameDisplay');
const logoutBtn        = document.getElementById('logoutBtn');
const messagesList     = document.getElementById('messagesList');
const messagesCount    = document.getElementById('messagesCount');
const refreshBtn       = document.getElementById('refreshBtn');
const recipientSelect  = document.getElementById('recipientSelect');
const messageContent   = document.getElementById('messageContent');
const charCount        = document.getElementById('charCount');
const composeForm      = document.getElementById('composeForm');
const sendError        = document.getElementById('sendError');
const sendSuccess      = document.getElementById('sendSuccess');
const sendBtn          = document.getElementById('sendBtn');

// ── Init ──────────────────────────────────────────────────
usernameDisplay.textContent = currentUser.username || 'Usuário';

async function init() {
  await Promise.all([loadMessages(), loadUsers()]);
}

// ── Load messages received ────────────────────────────────
async function loadMessages() {
  messagesList.innerHTML = '<li class="loading-item">Carregando mensagens...</li>';
  try {
    const res = await apiGetMyMessages();
    renderMessages(res.data);
  } catch (err) {
    messagesList.innerHTML = `<li class="error-item">Erro ao carregar mensagens: ${err.message}</li>`;
  }
}

function renderMessages(messages) {
  messagesCount.textContent = messages.length;

  if (messages.length === 0) {
    messagesList.innerHTML = `
      <li class="empty-item">
        <span class="empty-icon">📭</span>
        <p>Nenhuma mensagem ainda.<br>Aguarde alguém te enviar um recado!</p>
      </li>`;
    return;
  }

  messagesList.innerHTML = messages.map((msg) => {
    const date = new Date(msg.createdAt);
    const formatted = date.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    return `
      <li class="message-card">
        <div class="message-header">
          <span class="message-sender">
            <span class="avatar">${msg.sender.username.charAt(0).toUpperCase()}</span>
            ${escapeHtml(msg.sender.username)}
          </span>
          <span class="message-date">${formatted}</span>
        </div>
        <p class="message-body">${escapeHtml(msg.content)}</p>
      </li>`;
  }).join('');
}

// ── Load users for dropdown ───────────────────────────────
async function loadUsers() {
  try {
    const res = await apiGetUsers();
    const others = res.data.filter((u) => u.id !== currentUser.id);

    recipientSelect.innerHTML = '<option value="" disabled selected>Selecione um estudante...</option>';
    others.forEach((u) => {
      const opt = document.createElement('option');
      opt.value = u.id;
      opt.textContent = u.username;
      recipientSelect.appendChild(opt);
    });
  } catch (err) {
    recipientSelect.innerHTML = '<option disabled>Erro ao carregar usuários</option>';
  }
}

// ── Character counter ─────────────────────────────────────
messageContent.addEventListener('input', () => {
  const len = messageContent.value.length;
  charCount.textContent = `${len}/1000`;
  charCount.classList.toggle('warn', len > 900);
});

// ── Send message ─────────────────────────────────────────
composeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlerts();

  const receiver_id = Number(recipientSelect.value);
  const content = messageContent.value.trim();

  if (!receiver_id) return showError(sendError, 'Selecione um destinatário.');
  if (!content)     return showError(sendError, 'Escreva uma mensagem antes de enviar.');

  setLoading(sendBtn, true, 'Enviando...');
  try {
    await apiSendMessage({ receiver_id, content });
    showAlert(sendSuccess, '✅ Recado enviado com sucesso!');
    composeForm.reset();
    charCount.textContent = '0/1000';
  } catch (err) {
    showError(sendError, err.message);
  } finally {
    setLoading(sendBtn, false, 'Enviar Recado');
  }
});

// ── Refresh button ────────────────────────────────────────
refreshBtn.addEventListener('click', loadMessages);

// ── Logout ────────────────────────────────────────────────
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('user');
  window.location.href = 'main.html';
});

// ── Utilities ─────────────────────────────────────────────
function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
function showError(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
}
function showAlert(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 4000);
}
function clearAlerts() {
  sendError.classList.add('hidden');
  sendSuccess.classList.add('hidden');
}
function setLoading(btn, loading, label) {
  btn.disabled = loading;
  btn.textContent = label;
}

// ── Boot ──────────────────────────────────────────────────
init();
