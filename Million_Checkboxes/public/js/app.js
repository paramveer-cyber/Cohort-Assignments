'use strict';

// ── Constants ────────────────────────────────────────────────────────────────
const TOTAL      = 1_000_000;
const CELL       = 20;       // px per cell (width + gap)
const ROW_BUF    = 4;        // extra rows rendered above/below viewport
const PING_MS    = 5_000;
const ACT_MAX    = 5;

// Popcount lookup for fast bit counting
const POPCOUNT = new Uint8Array(256);
for (let i = 1; i < 256; i++) POPCOUNT[i] = POPCOUNT[i >> 1] + (i & 1);

// ── State ────────────────────────────────────────────────────────────────────
let bits       = new Uint8Array(Math.ceil(TOTAL / 8));
let checkedN   = 0;
let user       = null;
let ws         = null;
let cols       = 1;
let totalRows  = 1;
let rendered   = new Map(); // rowIdx -> DOM element
let pingTs     = 0;
let activities = [];

// ── DOM refs ─────────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const checkedEl  = $('checked-count');
const usersEl    = $('user-count');
const pingEl     = $('ping-val');
const connEl     = $('conn-indicator');
const authArea   = $('auth-area');
const progressBar = $('progress-bar');
const loadScreen = $('loading-screen');
const loadFill   = $('loading-fill');
const loadPct    = $('loading-pct');
const gridWrap   = $('grid-wrap');
const scroller   = $('grid-scroller');
const spacer     = $('grid-spacer');
const rowsEl     = $('grid-rows');
const toastRoot  = $('toast-root');
const actFeed    = $('activity-feed');
const badgeWs    = $('badge-ws');
const badgeOidc  = $('badge-oidc');

// ── Bit helpers ───────────────────────────────────────────────────────────────
function getBit(i) {
  return (bits[i >> 3] >> (7 - (i & 7))) & 1;
}

function setBit(i, v) {
  const b = i >> 3;
  const s = 7 - (i & 7);
  if (v) bits[b] |=  (1 << s);
  else   bits[b] &= ~(1 << s);
}

function countBits(arr) {
  let n = 0;
  for (let i = 0; i < arr.length; i++) n += POPCOUNT[arr[i]];
  return n;
}

// ── Stats UI ──────────────────────────────────────────────────────────────────
function updateStats() {
  checkedEl.textContent = checkedN.toLocaleString();
  const pct = (checkedN / TOTAL * 100).toFixed(2);
  progressBar.style.width = pct + '%';
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function toast(msg, type = '') {
  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' ' + type : '');
  el.textContent = msg;
  toastRoot.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 250);
  }, 2800);
}

// ── Activity feed ─────────────────────────────────────────────────────────────
function pushActivity(index, value) {
  const el = document.createElement('span');
  el.className = 'activity-item ' + (value ? 'on' : 'off');
  el.textContent = `#${index.toLocaleString()} ${value ? '▣' : '▢'}`;
  activities.push(el);
  if (activities.length > ACT_MAX) {
    activities.shift().remove();
  }
  actFeed.appendChild(el);
}

// ── Auth UI ───────────────────────────────────────────────────────────────────
function renderAuth() {
  if (user) {
    badgeOidc.dataset.on = 'true';
    authArea.innerHTML = '';
    const chip = document.createElement('div');
    chip.className = 'user-chip';

    if (user.picture) {
      const img = document.createElement('img');
      img.src = user.picture;
      img.className = 'user-avatar';
      img.alt = user.name;
      chip.appendChild(img);
    } else {
      const ph = document.createElement('div');
      ph.className = 'user-avatar-placeholder';
      ph.textContent = (user.name || user.username || '?')[0].toUpperCase();
      chip.appendChild(ph);
    }

    const name = document.createElement('span');
    name.textContent = user.username || user.name;
    chip.appendChild(name);

    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = 'LOGOUT';
    btn.onclick = doLogout;

    authArea.appendChild(chip);
    authArea.appendChild(btn);
  } else {
    badgeOidc.dataset.on = 'false';
    authArea.innerHTML = '';
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.textContent = 'SIGN IN';
    btn.onclick = () => { window.location.href = '/auth/login'; };
    authArea.appendChild(btn);
  }
}

async function doLogout() {
  await fetch('/auth/logout', { method: 'POST' });
  user = null;
  renderAuth();
  toast('Signed out.');
}

async function loadUser() {
  try {
    const r = await fetch('/api/me');
    if (r.ok) user = await r.json();
  } catch {}
  renderAuth();
}

// ── Grid layout ───────────────────────────────────────────────────────────────
function calcLayout() {
  const w = scroller.clientWidth - 24; // subtract padding
  cols = Math.max(1, Math.floor(w / CELL));
  totalRows = Math.ceil(TOTAL / cols);
  spacer.style.height = (totalRows * CELL) + 'px';
}

// ── Virtualised rendering ─────────────────────────────────────────────────────
function getVisibleRange() {
  const scrollTop = scroller.scrollTop;
  const viewH = scroller.clientHeight;
  const start = Math.max(0, Math.floor(scrollTop / CELL) - ROW_BUF);
  const end   = Math.min(totalRows - 1, Math.ceil((scrollTop + viewH) / CELL) + ROW_BUF);
  return { start, end };
}

function renderRow(rowIdx) {
  const el = document.createElement('div');
  el.className = 'grid-row';
  el.style.cssText = `position:absolute;top:${rowIdx * CELL}px;left:0;right:0;height:${CELL}px;`;

  const startIdx = rowIdx * cols;
  const endIdx   = Math.min(TOTAL - 1, startIdx + cols - 1);

  for (let i = startIdx; i <= endIdx; i++) {
    const cell = document.createElement('div');
    cell.className = 'cbx';
    cell.dataset.i = i;
    cell.dataset.v = getBit(i);
    el.appendChild(cell);
  }

  el.addEventListener('click', onCellClick);
  rowsEl.appendChild(el);
  rendered.set(rowIdx, el);
}

function recycleRows({ start, end }) {
  for (const [rowIdx, el] of rendered.entries()) {
    if (rowIdx < start || rowIdx > end) {
      el.remove();
      rendered.delete(rowIdx);
    }
  }
  for (let r = start; r <= end; r++) {
    if (!rendered.has(r)) renderRow(r);
  }
}

function onScroll() {
  recycleRows(getVisibleRange());
}

// ── Cell click ────────────────────────────────────────────────────────────────
function onCellClick(e) {
  const cell = e.target.closest('.cbx');
  if (!cell) return;

  if (!user) {
    toast('Sign in to toggle checkboxes.', 'error');
    return;
  }

  if (!ws || ws.readyState !== WebSocket.OPEN) {
    toast('Not connected — try again shortly.', 'error');
    return;
  }

  const index = parseInt(cell.dataset.i, 10);
  ws.send(JSON.stringify({ type: 'toggle', index }));
}

// ── WebSocket ─────────────────────────────────────────────────────────────────
function setConn(state, label) {
  connEl.dataset.state = state;
  connEl.querySelector('.conn-text').textContent = label;
  badgeWs.dataset.on = state === 'connected' ? 'true' : 'false';
}

function applyUpdate(index, value) {
  const old = getBit(index);
  if (old === value) return;
  setBit(index, value);
  checkedN += value ? 1 : -1;
  updateStats();
  pushActivity(index, value);

  // Update live DOM if visible
  const rowIdx = Math.floor(index / cols);
  const row = rendered.get(rowIdx);
  if (row) {
    const colIdx = index % cols;
    const cell = row.children[colIdx];
    if (cell) cell.dataset.v = value;
  }
}

function connectWS() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  ws = new WebSocket(`${proto}://${location.host}`);
  setConn('connecting', 'CONNECTING');

  ws.onopen = () => {
    setConn('connected', 'LIVE');
    schedulePing();
  };

  ws.onclose = () => {
    setConn('error', 'OFFLINE');
    setTimeout(connectWS, 3000);
  };

  ws.onerror = () => {
    setConn('error', 'ERROR');
  };

  ws.onmessage = (e) => {
    let msg;
    try { msg = JSON.parse(e.data); } catch { return; }

    if (msg.type === 'state') {
      const decoded = atob(msg.data);
      bits = new Uint8Array(decoded.length);
      for (let i = 0; i < decoded.length; i++) bits[i] = decoded.charCodeAt(i);
      checkedN = countBits(bits);
      updateStats();
      showGrid();
    }

    if (msg.type === 'update') {
      applyUpdate(msg.index, msg.value);
    }

    if (msg.type === 'users') {
      usersEl.textContent = msg.count.toLocaleString();
    }

    if (msg.type === 'pong') {
      pingEl.textContent = Date.now() - pingTs;
    }

    if (msg.type === 'error') {
      if (msg.code === 'auth_required') toast('Sign in to toggle checkboxes.', 'error');
      if (msg.code === 'rate_limited')  toast('Slow down — rate limited.', 'error');
    }
  };
}

function schedulePing() {
  setTimeout(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      pingTs = Date.now();
      ws.send(JSON.stringify({ type: 'ping', ts: pingTs }));
      schedulePing();
    }
  }, PING_MS);
}

// ── Show grid after state loaded ───────────────────────────────────────────────
function showGrid() {
  loadScreen.classList.add('hidden');
  gridWrap.classList.remove('hidden');
  calcLayout();
  recycleRows(getVisibleRange());
}

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  // Animate loading bar while waiting for WS
  let fakeProgress = 0;
  const fillInterval = setInterval(() => {
    fakeProgress = Math.min(fakeProgress + Math.random() * 8, 85);
    loadFill.style.width = fakeProgress + '%';
    loadPct.textContent = Math.floor(fakeProgress) + '%';
  }, 120);

  await loadUser();
  connectWS();

  // Once WS sends state, clear fake progress
  const origOnMessage = ws.onmessage;
  const wrapped = (e) => {
    let msg;
    try { msg = JSON.parse(e.data); } catch {}
    if (msg?.type === 'state') {
      clearInterval(fillInterval);
      loadFill.style.width = '100%';
      loadPct.textContent = '100%';
    }
    origOnMessage(e);
  };
  ws.onmessage = wrapped;

  scroller.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    calcLayout();
    rendered.forEach(el => el.remove());
    rendered.clear();
    recycleRows(getVisibleRange());
  });
}

init();
