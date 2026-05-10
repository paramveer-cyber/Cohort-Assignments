'use strict';

const SEND_EVERY = 10_000;
const STALE_AFTER = 40_000;

const connPill = document.getElementById('conn-pill');
const connText = document.getElementById('conn-text');
const authArea = document.getElementById('auth-area');
const onlineCount = document.getElementById('user-count');
const nextTick = document.getElementById('next-update');
const locationBar = document.getElementById('location-bar');
const statusText = document.getElementById('location-status');
const shareBtn = document.getElementById('btn-share');
const stopBtn = document.getElementById('btn-stop');
const sidebarList = document.getElementById('user-list');
const toastRoot = document.getElementById('toast-root');

let me = null;
let socket = null;
let sharing = false;
let geoWatchId = null;
let sendInterval = null;
let tickInterval = null;
let tickSecsLeft = 0;
let currentPos = null;

const knownUsers = new Map();
const mapMarkers = new Map();

const map = L.map('map', { zoomControl: true }).setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap',
  maxZoom: 19,
}).addTo(map);

function buildIcon(username, picture, isMe) {
  const letter = (username || '?')[0].toUpperCase();
  const cls = isMe ? 'marker-avatar self' : 'marker-avatar';
  const face = picture ? `<img src="${picture}" alt="${letter}" />` : letter;
  const html = `<div class="marker-pin"><div class="${cls}">${face}</div><div class="marker-label">${username || 'user'}</div></div>`;
  return L.divIcon({ html, className: '', iconSize: [60, 56], iconAnchor: [30, 56] });
}

function placeOrMoveMarker(userId, data) {
  const isMe = me && userId === me.sub;
  const icon = buildIcon(data.username, data.picture, isMe);

  if (mapMarkers.has(userId)) {
    const m = mapMarkers.get(userId);
    m.setLatLng([data.lat, data.lng]);
    m.setIcon(icon);
  } else {
    const m = L.marker([data.lat, data.lng], { icon }).addTo(map);
    mapMarkers.set(userId, m);
  }
}

function isOnline(updatedAt) {
  return (Date.now() - updatedAt) < STALE_AFTER;
}

function rebuildSidebar() {
  sidebarList.innerHTML = '';
  let onlineNow = 0;

  const sorted = [...knownUsers.entries()].sort((a, b) => b[1].updatedAt - a[1].updatedAt);

  for (const [userId, data] of sorted) {
    const online = isOnline(data.updatedAt);
    if (online) onlineNow++;

    const isMe = me && userId === me.sub;
    const letter = (data.username || '?')[0].toUpperCase();
    const secsAgo = Math.round((Date.now() - data.updatedAt) / 1000);
    const when = secsAgo < 5 ? 'just now' : `${secsAgo}s ago`;

    const row = document.createElement('div');
    row.className = 'user-row';
    row.dataset.online = online;
    row.innerHTML = `
      <div class="user-row-avatar">
        ${data.picture ? `<img src="${data.picture}" alt="${letter}" />` : letter}
      </div>
      <div class="user-row-info">
        <div class="user-row-name">${data.username || 'user'}${isMe ? ' (you)' : ''}</div>
        <div class="user-row-time">${when}</div>
      </div>
      <div class="user-row-dot" data-online="${online}"></div>`;

    row.onclick = () => map.flyTo([data.lat, data.lng], 14, { duration: 1 });
    sidebarList.appendChild(row);
  }

  onlineCount.textContent = onlineNow;
}

setInterval(rebuildSidebar, 5000);

function toast(msg, type='') {
  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' ' + type : '');
  el.textContent = msg;
  toastRoot.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 250);
  }, 2800);
}

function renderAuthArea() {
  authArea.innerHTML = '';

  if (me) {
    const letter = (me.name || me.username || '?')[0].toUpperCase();

    const chip = document.createElement('div');
    chip.className = 'user-chip';
    chip.innerHTML = `
      <div class="avatar">${me.picture ? `<img src="${me.picture}" alt="${letter}" />` : letter}</div>
      <span>${me.username || me.name}</span>`;

    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = 'LOGOUT';
    btn.onclick = async () => {
      stopSharing();
      if (socket) socket.emit('user:leave');
      await fetch('/auth/logout', { method: 'POST' });
      location.reload();
    };

    authArea.appendChild(chip);
    authArea.appendChild(btn);
    locationBar.classList.remove('hidden');
  } else {
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.textContent = 'SIGN IN';
    btn.onclick = () => window.location.href = '/auth/login';
    authArea.appendChild(btn);
  }
}

function sendPosition() {
  if (!currentPos || !socket) return;
  socket.emit('location:send', { lat: currentPos.lat, lng: currentPos.lng });
}

function startTick() {
  tickSecsLeft = SEND_EVERY / 1000;
  clearInterval(tickInterval);
  tickInterval = setInterval(() => {
    tickSecsLeft = Math.max(0, tickSecsLeft - 1);
    nextTick.textContent = tickSecsLeft + 's';
  }, 1000);
}

function startSharing() {
  if (!navigator.geolocation) {
    toast('Geolocation not supported on this browser', 'error');
    return;
  }

  sharing = true;
  shareBtn.classList.add('hidden');
  stopBtn.classList.remove('hidden');
  statusText.textContent = 'Getting your location...';

  geoWatchId = navigator.geolocation.watchPosition(
    (pos) => {
      currentPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      statusText.textContent = `${currentPos.lat.toFixed(5)}, ${currentPos.lng.toFixed(5)}`;
    },
    () => {
      toast('Location access was denied', 'error');
      stopSharing();
    },
    { enableHighAccuracy: true, maximumAge: 5000 }
  );

  sendPosition();
  startTick();
  sendInterval = setInterval(() => {
    sendPosition();
    startTick();
  }, SEND_EVERY);
}

function stopSharing() {
  sharing = false;

  if (geoWatchId !== null) {
    navigator.geolocation.clearWatch(geoWatchId);
    geoWatchId = null;
  }

  clearInterval(sendInterval);
  clearInterval(tickInterval);
  sendInterval = null;
  currentPos = null;
  tickSecsLeft = 0;

  nextTick.textContent = '—';
  stopBtn.classList.add('hidden');
  shareBtn.classList.remove('hidden');
  statusText.textContent = 'Not sharing.';
}

shareBtn.onclick = startSharing;
stopBtn.onclick = stopSharing;

function setConnState(state, label) {
  connPill.dataset.state = state;
  connText.textContent = label;
}

function connectSocket() {
  socket = io({ transports: ['websocket'] });

  socket.on('connect', () => setConnState('on', 'LIVE'));
  socket.on('disconnect', () => setConnState('err', 'OFFLINE'));
  socket.on('connect_error', () => setConnState('err', 'ERROR'));

  socket.on('error', (data) => {
    if (data?.code === 'auth_required') toast('Please sign in to share your location', 'error');
  });

  socket.on('location:snapshot', (users) => {
    for (const u of users) {
      knownUsers.set(u.userId, u);
      placeOrMoveMarker(u.userId, u);
    }
    rebuildSidebar();
  });

  socket.on('location:update', (data) => {
    knownUsers.set(data.userId, data);
    placeOrMoveMarker(data.userId, data);
    rebuildSidebar();

    if (me && data.userId === me.sub) {
      map.panTo([data.lat, data.lng], { animate: true });
    }
  });

  socket.on('user:left', ({ userId }) => {
    knownUsers.delete(userId);
    const m = mapMarkers.get(userId);
    if (m) {
      m.remove();
      mapMarkers.delete(userId);
    }
    rebuildSidebar();
  });
}

async function init() {
  try {
    const res = await fetch('/api/me');
    if (res.ok) me = await res.json();
  } catch {}

  renderAuthArea();
  connectSocket();
}

init();