/* ════════════════════════════════════════
   PET SHOP GOOFRY — js/app.js
   Carrito · Menú · Favoritos · Animaciones
   ════════════════════════════════════════ */

const WA_NUMBER = '51993888729'; // ← Cambia por el número real

/* ── CARRITO (sessionStorage) ── */
function getCart() { return JSON.parse(sessionStorage.getItem('goofry_cart') || '[]'); }
function saveCart(c) { sessionStorage.setItem('goofry_cart', JSON.stringify(c)); }

/* ── FAVORITOS (localStorage) ── */
function getFavs() { return JSON.parse(localStorage.getItem('goofry_favs') || '[]'); }
function saveFavs(f) { localStorage.setItem('goofry_favs', JSON.stringify(f)); }

/* ════════════════════════════════════════
   MENÚ HAMBURGUESA FLOTANTE
   ════════════════════════════════════════ */
let menuOpen = false;

function toggleMenu() {
  menuOpen = !menuOpen;
  document.getElementById('fab-btn').classList.toggle('open', menuOpen);
  document.getElementById('menu-overlay').classList.toggle('show', menuOpen);
  const items = document.querySelectorAll('.rad-item');
  items.forEach((item, i) => {
    const delay = menuOpen ? i * 40 : (items.length - 1 - i) * 30;
    setTimeout(() => item.classList.toggle('show', menuOpen), delay);
  });
}

function closeMenu() {
  if (!menuOpen) return;
  menuOpen = false;
  document.getElementById('fab-btn').classList.remove('open');
  document.getElementById('menu-overlay').classList.remove('show');
  document.querySelectorAll('.rad-item').forEach(i => i.classList.remove('show'));
}

/* ════════════════════════════════════════
   CARRITO
   ════════════════════════════════════════ */
function openCart() {
  renderCartItems();
  document.getElementById('cart-overlay').classList.add('show');
  document.getElementById('cart-panel').classList.add('show');
}

function closeCart() {
  document.getElementById('cart-overlay').classList.remove('show');
  document.getElementById('cart-panel').classList.remove('show');
}

function addToCart(btn, name, price, emoji) {
  const cart = getCart();
  const existing = cart.find(i => i.name === name);
  if (existing) { existing.qty++; } else { cart.push({ name, price, emoji, qty: 1 }); }
  saveCart(cart);
  updateBadges();
  renderCartItems();
  btn.textContent = '✓';
  btn.style.background = '#276749';
  setTimeout(() => { btn.textContent = '+'; btn.style.background = ''; }, 1300);
}

function changeQty(idx, delta) {
  const cart = getCart();
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart(cart);
  updateBadges();
  renderCartItems();
}

function renderCartItems() {
  const cart = getCart();
  const itemsEl = document.getElementById('cart-items');
  const footEl  = document.getElementById('cart-foot');
  if (!itemsEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = `<div class="cart-empty"><div class="cart-empty-ico">🛒</div><p>Tu carrito está vacío</p></div>`;
    footEl.style.display = 'none';
    return;
  }

  footEl.style.display = 'block';
  itemsEl.innerHTML = cart.map((item, idx) => `
    <div class="ci">
      <div class="ci-img">${item.emoji}</div>
      <div class="ci-info">
        <div class="ci-nm">${item.name}</div>
        <div class="ci-price">S/ ${(item.price * item.qty).toFixed(2)}</div>
      </div>
      <div class="ci-qty">
        <button class="qty-btn" onclick="changeQty(${idx},-1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${idx},1)">+</button>
      </div>
    </div>`).join('');

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('cart-total-val').textContent = 'S/ ' + total.toFixed(2);
}

function updateBadges() {
  const total = getCart().reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.bdg').forEach(b => {
    b.textContent = total;
    b.classList.toggle('visible', total > 0);
  });
}

function orderWhatsApp() {
  const cart = getCart();
  if (!cart.length) return;
  const lines = cart.map(i => `• ${i.name} x${i.qty} = S/ ${(i.price*i.qty).toFixed(2)}`).join('\n');
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const msg = encodeURIComponent(`🐾 *Pedido - PET SHOP GOOFRY*\n\n${lines}\n\n*Total: S/ ${total.toFixed(2)}*\n\n¡Hola! Quisiera confirmar este pedido. Gracias 😊`);
  window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
}

function bookWhatsApp() {
  const msg = encodeURIComponent('🐾 ¡Hola PET SHOP GOOFRY! Me gustaría reservar una cita para mi mascota. ¿Qué horarios tienen disponibles?');
  window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
}

/* ════════════════════════════════════════
   FAVORITOS
   ════════════════════════════════════════ */
function toggleFav(btn, name, price, emoji, cat) {
  const favs = getFavs();
  const idx = favs.findIndex(f => f.name === name);
  if (idx > -1) {
    favs.splice(idx, 1);
    btn.textContent = '🤍';
    btn.classList.remove('loved');
  } else {
    favs.push({ name, price, emoji, cat });
    btn.textContent = '❤️';
    btn.classList.add('loved');
  }
  saveFavs(favs);
}

function syncFavButtons() {
  const favs = getFavs();
  document.querySelectorAll('.fav-btn[data-name]').forEach(btn => {
    if (favs.find(f => f.name === btn.dataset.name)) {
      btn.textContent = '❤️';
      btn.classList.add('loved');
    }
  });
}

/* ════════════════════════════════════════
   PÁGINA FAVORITOS
   ════════════════════════════════════════ */
function renderFavoritosPage() {
  const grid  = document.getElementById('fav-grid');
  const empty = document.getElementById('fav-empty');
  if (!grid || !empty) return;
  const favs = getFavs();
  if (!favs.length) { grid.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  grid.innerHTML = favs.map(f => `
    <div class="pgc">
      <div class="pgc-img">${f.emoji}</div>
      <div class="pgc-body">
        <div class="pgc-cat">${f.cat}</div>
        <div class="pgc-nm">${f.name}</div>
        <div class="pgc-foot">
          <span class="pgc-price">S/ ${f.price.toFixed(2)}</span>
          <button class="add-btn" onclick="addToCart(this,'${f.name.replace(/'/g,"\\'")}',${f.price},'${f.emoji}')">+</button>
        </div>
      </div>
    </div>`).join('');
}

/* ════════════════════════════════════════
   TIENDA — FILTROS
   ════════════════════════════════════════ */
function filterByTab(btn, cat) {
  document.querySelectorAll('.ftab').forEach(t => t.classList.remove('on'));
  btn.classList.add('on');
  document.querySelectorAll('#prod-grid .pgc').forEach(c => {
    c.style.display = (cat === 'todos' || c.dataset.cat === cat) ? '' : 'none';
  });
}

function filterBySearch(q) {
  q = q.toLowerCase();
  document.querySelectorAll('#prod-grid .pgc').forEach(c => {
    const nm = c.querySelector('.pgc-nm').textContent.toLowerCase();
    c.style.display = nm.includes(q) ? '' : 'none';
  });
}

/* ════════════════════════════════════════
   HERO — CHIP SELECTOR
   ════════════════════════════════════════ */
function chipSelect(el) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on');
}

/* ════════════════════════════════════════
   SCROLL ANIMATIONS
   ════════════════════════════════════════ */
function initAnimations() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.anim').forEach(el => obs.observe(el));
}

/* ════════════════════════════════════════
   INYECTAR COMPONENTES COMPARTIDOS
   (menú radial + cart panel + overlays)
   ════════════════════════════════════════ */
function injectShared() {
  /* Detectar página actual para marcar en el menú */
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const active = { 'index.html':'#1C4532', 'tienda.html':'#DDA838', 'servicios.html':'#276749', 'favoritos.html':'#E8704A', 'perfil.html':'#2B6CB0' };
  const links = [
    { label:'Perfil',    href:'perfil.html',    bg:'#2B6CB0', ico:'👤' },
    { label:'Favoritos', href:'favoritos.html',  bg:'#E8704A', ico:'❤️' },
    { label:'Servicios', href:'servicios.html',  bg:'#276749', ico:'🩺' },
    { label:'Tienda',    href:'tienda.html',     bg:'#DDA838', ico:'🛍' },
    { label:'Inicio',    href:'index.html',      bg:'#1C4532', ico:'🏠' },
  ];

  const radItems = links.map(l => {
    const outline = l.href === page ? 'outline:3px solid #E8704A;outline-offset:2px;' : '';
    return `<div class="rad-item">
      <span class="rad-label">${l.label}</span>
      <a href="${l.href}" class="rad-btn" style="background:${l.bg};${outline}" onclick="closeMenu()">${l.ico}</a>
    </div>`;
  }).join('');

  document.body.insertAdjacentHTML('beforeend', `
    <!-- Menu overlay -->
    <div class="menu-overlay" id="menu-overlay" onclick="closeMenu()"></div>

    <!-- FAB -->
    <div class="fab-wrap">
      <div class="rad-menu" id="rad-menu">${radItems}</div>
      <button class="fab" id="fab-btn" onclick="toggleMenu()">
        <div class="ham"><span></span><span></span><span></span></div>
      </button>
    </div>

    <!-- Cart overlay -->
    <div class="cart-overlay" id="cart-overlay" onclick="closeCart()"></div>

    <!-- Cart panel -->
    <div class="cart-panel" id="cart-panel">
      <div class="cart-handle"></div>
      <div class="cart-head">
        <h3>Mi carrito 🛒</h3>
        <button class="cart-close" onclick="closeCart()">✕</button>
      </div>
      <div class="cart-items" id="cart-items">
        <div class="cart-empty"><div class="cart-empty-ico">🛒</div><p>Tu carrito está vacío</p></div>
      </div>
      <div class="cart-foot" id="cart-foot" style="display:none">
        <div class="cart-total">
          <span class="ct-lbl">Total del pedido</span>
          <span class="ct-val" id="cart-total-val">S/ 0.00</span>
        </div>
        <button class="wa-btn" onclick="orderWhatsApp()">💬 Pedir por WhatsApp</button>
      </div>
    </div>
  `);
}

/* ════════════════════════════════════════
   INIT — se ejecuta al cargar cada página
   ════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  injectShared();
  updateBadges();
  renderCartItems();
  syncFavButtons();
  initAnimations();
  if (document.getElementById('fav-grid')) renderFavoritosPage();
});
