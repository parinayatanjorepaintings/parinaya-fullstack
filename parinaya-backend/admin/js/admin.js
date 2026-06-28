/* ── API helper ──────────────────────────────────────────────────────────── */
const API = {
  base: '/api',

  token() {
    return localStorage.getItem('admin_token');
  },

  headers(extra = {}) {
    const h = { 'Content-Type': 'application/json', ...extra };
    const t = this.token();
    if (t) h['Authorization'] = `Bearer ${t}`;
    return h;
  },

  async req(method, path, body) {
    const opts = { method, headers: this.headers(), credentials: 'include' };
    if (body !== undefined) opts.body = JSON.stringify(body);
    const res = await fetch(this.base + path, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  },

  get:    (p)    => API.req('GET',    p),
  post:   (p, b) => API.req('POST',   p, b),
  put:    (p, b) => API.req('PUT',    p, b),
  delete: (p)    => API.req('DELETE', p),

  async upload(path, formData) {
    const headers = {};
    const t = this.token();
    if (t) headers['Authorization'] = `Bearer ${t}`;
    const res = await fetch(this.base + path, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  },
};

/* ── Toast notifications ─────────────────────────────────────────────────── */
function toast(msg, type = 'info', duration = 3000) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = `${type} show`;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), duration);
}

/* ── Auth guard ─────────────────────────────────────────────────────────── */
async function requireAuth() {
  const token = localStorage.getItem('admin_token');
  if (!token) { window.location.href = '/admin/login'; return false; }
  try {
    const me = await API.get('/auth/me');
    const el = document.getElementById('admin-email');
    if (el) el.textContent = me.email;
    return me;
  } catch {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
    return false;
  }
}

/* ── Logout ─────────────────────────────────────────────────────────────── */
async function logout() {
  await API.post('/auth/logout').catch(() => {});
  localStorage.removeItem('admin_token');
  window.location.href = '/admin/login';
}

/* ── Format helpers ──────────────────────────────────────────────────────── */
function fmtPrice(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

function escHtml(str = '') {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── Confirmation modal ─────────────────────────────────────────────────── */
function confirm(msg) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <h3>Confirm</h3>
        <p style="color:var(--ink-mid)">${escHtml(msg)}</p>
        <div class="modal-actions">
          <button class="btn btn-outline" id="cfm-cancel">Cancel</button>
          <button class="btn btn-danger"  id="cfm-ok">Delete</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    document.getElementById('cfm-cancel').onclick = () => { overlay.remove(); resolve(false); };
    document.getElementById('cfm-ok').onclick    = () => { overlay.remove(); resolve(true);  };
  });
}

/* ── Sidebar nav highlight ──────────────────────────────────────────────── */
function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-item').forEach(el => {
    const href = el.getAttribute('href') || '';
    // exact match or starts-with for sub-pages
    const active = href === path || (href.length > 1 && path.startsWith(href));
    el.classList.toggle('active', active);
  });
}

document.addEventListener('DOMContentLoaded', setActiveNav);
