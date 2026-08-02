// ===== NAVBAR SCROLL STATE =====
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive:true });

// ===== MOBILE MENU (simple toggle of nav-links display) =====
const burger = document.getElementById("burger");
const navLinks = document.querySelector(".nav-links");

burger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});
document.querySelectorAll(".nav-links a").forEach(link => {

    link.addEventListener("click", function(e) {

        const href = this.getAttribute("href");

        // Smooth scroll only for sections on the same page
        if (href.startsWith("#")) {

            e.preventDefault();

            const target = document.querySelector(href);

            if (target) {
                target.scrollIntoView({
                    behavior: "smooth"
                });
            }

        }

        // Close mobile menu
        document.querySelector(".nav-links").classList.remove("active");

    });

});

// ===== STARFIELD CANVAS =====
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let stars = [];
function resizeCanvas(){
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  const count = Math.floor((canvas.width * canvas.height) / 9000);
  stars = Array.from({length: count}, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.4 + 0.3,
    a: Math.random(),
    speed: Math.random() * 0.015 + 0.004
  }));
}
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function drawStars(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  stars.forEach(s => {
    s.a += s.speed;
    const op = (Math.sin(s.a) + 1) / 2 * 0.8 + 0.15;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(169,196,255,${op})`;
    ctx.fill();
  });
  if(!reduceMotion) requestAnimationFrame(drawStars);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
drawStars();

// ===== SCROLL REVEAL =====
const revealTargets = document.querySelectorAll('.reveal, .cat-card, .product-card, .why-item');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting){
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
revealTargets.forEach(el => io.observe(el));

// ===== TESTIMONIAL SLIDER =====
const slides = document.querySelectorAll('.test-slide');
const dotsWrap = document.getElementById('testDots');
let current = 0;
slides.forEach((_, i) => {
  const dot = document.createElement('button');
  if (i === 0) dot.classList.add('active');
  dot.addEventListener('click', () => showSlide(i));
  dotsWrap.appendChild(dot);
});
function showSlide(i){
  slides[current].classList.remove('active');
  dotsWrap.children[current].classList.remove('active');
  current = i;
  slides[current].classList.add('active');
  dotsWrap.children[current].classList.add('active');
}
setInterval(() => { showSlide((current + 1) % slides.length); }, 5000);

// ================= FIREBASE =================
import { db, isFirebaseConfigured } from './firebase-config.js';
import {
  collection, onSnapshot, doc, setDoc, getDoc, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const USE_FIREBASE = isFirebaseConfigured;
if (!USE_FIREBASE){
  console.warn('Sitara: Firebase is not configured yet (see firebase-config.js). Running on local demo data — products won\'t sync from the admin panel until you connect Firebase.');
}

// ================= PRODUCT DATA =================
const ICONS = {
  fridge: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="11" y="4" width="26" height="40" rx="3"/><line x1="11" y1="20" x2="37" y2="20"/><line x1="17" y1="10" x2="17" y2="15"/><line x1="17" y1="26" x2="17" y2="31"/></svg>',
  oven: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="6" y="8" width="36" height="32" rx="3"/><rect x="11" y="14" width="26" height="18" rx="1.5"/><circle cx="14" cy="36" r="1.5" fill="currentColor" stroke="none"/><circle cx="20" cy="36" r="1.5" fill="currentColor" stroke="none"/></svg>',
  microwave: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="5" y="10" width="38" height="26" rx="3"/><rect x="10" y="14" width="22" height="18" rx="1.5"/><circle cx="37" cy="18" r="2" fill="currentColor" stroke="none"/><line x1="34" y1="26" x2="40" y2="26"/></svg>',
fan: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="24" cy="24" r="3"/><path d="M24 7c5 0 8 5 5 10l-2 4"/><path d="M41 24c0 5-5 8-10 5l-4-2"/><path d="M24 41c-5 0-8-5-5-10l2-4"/><path d="M7 24c0-5 5-8 10-5l4 2"/></svg>',
ac: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="4" y="12" width="40" height="16" rx="3"/><line x1="10" y1="28" x2="8" y2="34"/><line x1="38" y1="28" x2="40" y2="34"/><line x1="14" y1="20" x2="34" y2="20"/></svg>',
  iron: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M10 14 h20 a8 8 0 0 1 8 8 v0 a8 8 0 0 1 -8 8 H16 l-6 8 v-24 Z"/><line x1="16" y1="20" x2="30" y2="20"/></svg>',
  default: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="8" y="8" width="32" height="32" rx="4"/><path d="M8 30 18 20l8 8 6-6 8 8"/></svg>'
};
// Demo catalog — used until you connect Firebase (or seed products from the admin panel).
const FALLBACK_PRODUCTS = [
  { id:'ref-12', cat:'Refrigerators', name:'Frost-Free Refrigerator 12 CFT', specs:['12 CFT','Frost-Free','2-Door'], price:54900, old:68000, save:19, icon:'fridge' },
  { id:'ovn-60', cat:'Ovens', name:'Built-in Baking Oven 60L', specs:['60L','Rotisserie','Digital'], price:25500, old:32000, save:20, icon:'oven' },
  { id:'mwv-25', cat:'Microwaves', name:'Digital Microwave Oven 25L', specs:['25L','Grill','Touch Panel'], price:16800, old:21000, save:20, icon:'microwave' },
{
  id:'fan-001',
  cat:'Fans',
  name:'Ceiling Fan 56"',
  specs:['56 Inch','Copper Motor','Energy Efficient'],
  price:6200,
  old:8500,
  save:27,
  icon:'fan',
},
  { id:'ac-15', cat:'Air Conditioners', name:'Split Inverter AC 1.5 Ton', specs:['1.5 Ton','Inverter','DC Motor'], price:118000, old:145000, save:19, icon:'ac' },
  { id:'irn-cer', cat:'Irons', name:'Ceramic Steam Iron', specs:['Ceramic Plate','Steam Burst'], price:2100, old:3200, save:34, icon:'iron' }
];
let LIVE_PRODUCTS = FALLBACK_PRODUCTS;
let currentFilter = 'All';
let currentSearch = "";

function pkr(n){
  return 'Rs ' + Number(n || 0).toLocaleString('en-PK');
}

// ================= RENDER PRODUCTS =================
const productGrid = document.getElementById('productGrid');
function productCard(p){
  const save = p.save ?? (p.old ? Math.round(100 - (p.price/p.old)*100) : 0);
  const images = Array.isArray(p.images) && p.images.length
    ? p.images
    : (p.image ? [p.image] : []);

  const gallery = images.length
    ? `<div class="product-gallery" data-gallery="${p.id}">
        <img src="${images[0]}" class="product-image gallery-main-image" alt="${p.name}">
        ${images.length > 1 ? `
          <button class="product-gallery-btn prev" type="button" data-gallery-prev="${p.id}" aria-label="Previous photo">‹</button>
          <button class="product-gallery-btn next" type="button" data-gallery-next="${p.id}" aria-label="Next photo">›</button>
          <div class="product-gallery-dots">
            ${images.map((_,i)=>`<button class="product-gallery-dot ${i===0?'active':''}" type="button" data-gallery-dot="${p.id}" data-gallery-index="${i}" aria-label="Photo ${i+1}"></button>`).join('')}
          </div>
        ` : ''}
      </div>`
    : (ICONS[p.icon] || ICONS.default);

  const colors = Array.isArray(p.colors) ? p.colors : [];

  return `<div class="product-card">
    <div class="product-media">
      <span class="badge-moq">MOQ: 1 pc</span>${save ? `<span class="badge-save">Save ${save}%</span>` : ''}
      ${gallery}
    </div>
    <div class="product-body">
      <div class="cat-label">${p.cat}</div>
      <h3>${p.name}</h3>
      <div class="specs">${(p.specs||[]).map(s => `<span>${s}</span>`).join('')}</div>
      <div class="price-block">
        <div>${p.old ? `<span class="old">${pkr(p.old)}</span>` : ''}<span class="new">${pkr(p.price)}</span></div>
      </div>
      ${colors.length ? `
        <div class="product-colors">
          <div>Color</div>
          <div class="product-color-swatches">
${colors.map((c,i)=>`
  <button
    type="button"
    class="product-color ${i === 0 ? 'active' : ''}"
    style="--swatch:${c.hex};"
    data-color-product="${p.id}"
    data-color-index="${i}"
    aria-label="${c.name}"
    title="${c.name}">
  </button>
`).join('')}
          </div>
          <div class="product-color-label" id="color-label-${p.id}">${colors[0].name}</div>
        </div>
      ` : ''}
      <div class="qty-row" style="margin-top:16px;">
        <span class="moq-note">Qty</span>
        <div class="qty-stepper">
          <button type="button" onclick="stepQty('${p.id}',-1)">−</button>
          <input type="number" id="qty-${p.id}" value="1" min="1" inputmode="numeric">
          <button type="button" onclick="stepQty('${p.id}',1)">+</button>
        </div>
      </div>
      <button class="add-cart-btn" id="add-${p.id}" onclick="addToCart('${p.id}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5v14"/></svg>
        <span>Add to Cart</span>
      </button>
    </div>
  </div>`;
}

function renderProducts(filter){

  currentFilter = filter || currentFilter;

  let list = (currentFilter === 'All')
      ? LIVE_PRODUCTS
      : LIVE_PRODUCTS.filter(p => p.cat === currentFilter);

  if(currentSearch){

    list = list.filter(p =>

      p.name.toLowerCase().includes(currentSearch) ||

      p.cat.toLowerCase().includes(currentSearch) ||

      (p.specs || []).join(" ").toLowerCase().includes(currentSearch)

    );

  }

  productGrid.innerHTML = list.length

    ? list.map(productCard).join('')

    : `<p style="color:var(--text-muted); grid-column:1/-1; text-align:center; padding:40px 0;">No products found.</p>`;

  productGrid.querySelectorAll('.product-card').forEach(el => io.observe(el));

  // Product photo galleries
  productGrid.querySelectorAll('[data-gallery]').forEach(gallery => {
    const id = gallery.dataset.gallery;
    const product = LIVE_PRODUCTS.find(x => x.id === id);
    const images = Array.isArray(product?.images) && product.images.length
      ? product.images
      : (product?.image ? [product.image] : []);
    let index = 0;
    const img = gallery.querySelector('.gallery-main-image');

    function setImage(i){
      if (!images.length || !img) return;
      index = (i + images.length) % images.length;
      img.src = images[index];
      gallery.querySelectorAll('[data-gallery-dot]').forEach(dot => {
        dot.classList.toggle('active', Number(dot.dataset.galleryIndex) === index);
      });
    }

    gallery.querySelector('[data-gallery-prev]')?.addEventListener('click', () => setImage(index - 1));
    gallery.querySelector('[data-gallery-next]')?.addEventListener('click', () => setImage(index + 1));
    gallery.querySelectorAll('[data-gallery-dot]').forEach(dot => {
      dot.addEventListener('click', () => setImage(Number(dot.dataset.galleryIndex)));
    });
  });

  // Product color swatches
  productGrid.querySelectorAll('[data-color-product]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.colorProduct;
      const label = document.getElementById('color-label-' + id);
      productGrid.querySelectorAll(`[data-color-product="${id}"]`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (label) label.textContent = btn.dataset.colorName;
    });
  });

}
function stepQty(id, delta){
  const input = document.getElementById('qty-' + id);
  const val = Math.max(1, (parseInt(input.value) || 1) + delta);
  input.value = val;
}
window.stepQty = stepQty;
window.addToCart = (id) => addToCart(id);

// Live product feed from Firestore, falling back to demo data
if (USE_FIREBASE){
  try {
    onSnapshot(query(collection(db, 'products'), orderBy('name')), (snap) => {
      LIVE_PRODUCTS = snap.empty ? FALLBACK_PRODUCTS : snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderProducts(currentFilter);
    }, (err) => {
      console.warn('Sitara: could not load products from Firestore, showing demo catalog.', err);
      LIVE_PRODUCTS = FALLBACK_PRODUCTS;
      renderProducts(currentFilter);
    });
  } catch(e){ renderProducts('All'); }
} else {
  renderProducts('All');
}

// filter chips
document.getElementById('filterRow').addEventListener('click', (e) => {
  const chip = e.target.closest('.filter-chip');
  if (!chip) return;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  renderProducts(chip.dataset.filter);
});
// category tiles jump + filter
document.querySelectorAll('#catGrid .cat-card').forEach(card => {
  card.addEventListener('click', () => {
    const label = card.querySelector('h3').textContent.trim();
    const chip = [...document.querySelectorAll('.filter-chip')].find(c => c.dataset.filter === label);
    if (chip) chip.click();
  });
});

// ================= CART (localStorage — device-local, no Firebase needed) =================
let cart = {}; // { productId: qty }
function cartCount(){ return Object.values(cart).reduce((a,b) => a + b, 0); }
function findProduct(id){ return LIVE_PRODUCTS.find(x => x.id === id) || FALLBACK_PRODUCTS.find(x => x.id === id); }
function cartTotal(){ return Object.entries(cart).reduce((sum,[id,qty]) => { const p = findProduct(id); return sum + (p ? p.price * qty : 0); }, 0); }

function saveCart(){
  try { localStorage.setItem('sitara-cart', JSON.stringify(cart)); } catch(e){ /* best effort */ }
}
function loadCart(){
  try { cart = JSON.parse(localStorage.getItem('sitara-cart') || '{}'); } catch(e){ cart = {}; }
  renderCart();
}

const cartItemsEl = document.getElementById('cartItems');
const cartFootEl = document.getElementById('cartFoot');
const cartBadge = document.getElementById('cartBadge');
const cartSubtotalEl = document.getElementById('cartSubtotal');

function renderCart(){
  cartBadge.textContent = cartCount();
  cartBadge.classList.add('pulse');
  setTimeout(() => cartBadge.classList.remove('pulse'), 400);

  const entries = Object.entries(cart);
  if (entries.length === 0){
    cartItemsEl.innerHTML = `<div class="cart-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="21" r="1.4"/><circle cx="19" cy="21" r="1.4"/><path d="M2.5 3h2.4l2.6 12.6a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21.5 7H6"/></svg>
      <p>Your cart is empty.</p></div>`;
    cartFootEl.style.display = 'none';
    return;
  }
  cartFootEl.style.display = 'block';
  cartItemsEl.innerHTML = entries.map(([id, qty]) => {
    const p = findProduct(id);
    if (!p) return '';
    return `<div class="cart-line">
<div class="ci-icon">
  ${
    p.image
      ? `<img src="${p.image}" class="cart-image" alt="${p.name}">`
      : (ICONS[p.icon] || ICONS.default)
  }
</div>
<div class="ci-info">
        <h4>${p.name}</h4>
        <div class="ci-price">${pkr(p.price)} × ${qty} = <b style="color:var(--accent-bright)">${pkr(p.price*qty)}</b></div>
        <div class="qty-stepper" style="margin-top:8px; width:fit-content;">
          <button type="button" onclick="changeCartQty('${id}',-1)">−</button>
          <input type="text" readonly value="${qty}">
          <button type="button" onclick="changeCartQty('${id}',1)">+</button>
        </div>
      </div>
      <button class="ci-remove" onclick="removeFromCart('${id}')">Remove</button>
    </div>`;
  }).join('');
  cartSubtotalEl.textContent = pkr(cartTotal());
}
function changeCartQty(id, delta){
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart(); renderCart();
}
function removeFromCart(id){ delete cart[id]; saveCart(); renderCart(); }
window.changeCartQty = changeCartQty;
window.removeFromCart = removeFromCart;

function addToCart(id){
  const qtyInput = document.getElementById('qty-' + id);
  const qty = Math.max(1, parseInt(qtyInput.value) || 1);
  cart[id] = (cart[id] || 0) + qty;
  saveCart(); renderCart(); openCart();
  const btn = document.getElementById('add-' + id);
  if (btn){
    const original = btn.innerHTML;
    btn.classList.add('added');
    btn.innerHTML = '<span>Added ✓</span>';
    setTimeout(() => { btn.classList.remove('added'); btn.innerHTML = original; }, 1200);
  }
}

// ================= CART / MODAL OPEN-CLOSE =================
const overlay = document.getElementById('overlay');
const cartDrawer = document.getElementById('cartDrawer');
const checkoutModal = document.getElementById('checkoutModal');

function openCart(){ cartDrawer.classList.add('open'); overlay.classList.add('open'); }
function closeCart(){ cartDrawer.classList.remove('open'); if (!checkoutModal.classList.contains('open')) overlay.classList.remove('open'); }
function openCheckout(){
  if (cartCount() === 0) return;
  renderCheckoutForm();
  cartDrawer.classList.remove('open');
  checkoutModal.classList.add('open');
  overlay.classList.add('open');
}
function closeCheckout(){ checkoutModal.classList.remove('open'); overlay.classList.remove('open'); }
window.closeCheckout = closeCheckout;

document.getElementById('cartBtn').addEventListener('click', () => cartDrawer.classList.contains('open') ? closeCart() : openCart());
document.getElementById('cartCloseBtn').addEventListener('click', closeCart);
document.getElementById('checkoutBtn').addEventListener('click', openCheckout);
document.getElementById('modalCloseBtn').addEventListener('click', closeCheckout);
overlay.addEventListener('click', () => { closeCart(); closeCheckout(); });

// ================= CHECKOUT: RENDER FORM (rebuilt every time the modal opens) =================
function renderCheckoutForm(){
  document.getElementById('checkoutTitle').textContent = 'Checkout';
  const rows = Object.entries(cart).map(([id, qty]) => {
    const p = findProduct(id);
    return `<div class="os-line"><span>${p.name} × ${qty}</span><span>${pkr(p.price*qty)}</span></div>`;
  }).join('');
  document.getElementById('checkoutBody').innerHTML = `
    <div class="order-summary">${rows}<div class="os-total"><span>Total</span><span>${pkr(cartTotal())}</span></div></div>
    <form id="checkoutForm">
      <div class="field"><label>Full Name</label><input type="text" id="custName" required></div>
      <div class="field-row">
        <div class="field"><label>Phone Number</label><input type="tel" id="custPhone" required></div>
        <div class="field"><label>City</label><input type="text" id="custCity" value="Lahore" required></div>
      </div>
      <div class="field"><label>Delivery Address</label><textarea id="custAddress" rows="3" required></textarea></div>
      <div class="field"><label>Notes (optional)</label><input type="text" id="custNotes" placeholder="e.g. call before delivery"></div>
      <div class="form-error" id="checkoutError"></div>
      <button type="submit" class="btn" style="width:100%;"><span class="facet"></span><span>Place Order — Cash on Delivery</span></button>
    </form>`;
  document.getElementById('checkoutForm').addEventListener('submit', handleCheckoutSubmit);
}

// ================= CHECKOUT SUBMIT =================
async function handleCheckoutSubmit(e){
  e.preventDefault();
  const form = e.target;
  const checkoutError = document.getElementById('checkoutError');
  checkoutError.textContent = '';
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const city = document.getElementById('custCity').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  const notes = document.getElementById('custNotes').value.trim();
  if (!name || !phone || !city || !address){
    checkoutError.textContent = 'Please fill in all required fields.';
    return;
  }
  const submitBtn = form.querySelector('button[type=submit]');
  submitBtn.disabled = true;
  const lastSpan = submitBtn.querySelector('span:last-child');
  if (lastSpan) lastSpan.textContent = 'Placing order…';

  const id = 'STE-' + Date.now().toString(36).toUpperCase().slice(-5) + Math.random().toString(36).slice(2,4).toUpperCase();
  const order = {
    id,
    items: Object.entries(cart).map(([pid, qty]) => { const p = findProduct(pid); return { name: p.name, qty, price: p.price }; }),
    total: cartTotal(),
    customer: { name, phone, city, address, notes },
    status: 'confirmed',
    createdAt: Date.now()
  };

  try {
    if (USE_FIREBASE){
      await setDoc(doc(db, 'orders', id), order);
    } else {
      localStorage.setItem('order:' + id, JSON.stringify(order));
    }
    // Remember this order on this device for the "recent orders" shortcut
    let ids = [];
    try { ids = JSON.parse(localStorage.getItem('sitara-recent-orders') || '[]'); } catch(e){ ids = []; }
    ids.unshift(id);
    ids = ids.slice(0, 10);
    localStorage.setItem('sitara-recent-orders', JSON.stringify(ids));

    cart = {};
    saveCart(); renderCart();
    showConfirmation(order);
    loadRecentChips();
  } catch(err){
    console.error(err);
    checkoutError.textContent = "Couldn't place the order — please try again, or WhatsApp us the details.";
    submitBtn.disabled = false;
    if (lastSpan) lastSpan.textContent = 'Place Order — Cash on Delivery';
  }
}

function showConfirmation(order){
  document.getElementById('checkoutTitle').textContent = 'Order Confirmed';
  document.getElementById('checkoutBody').innerHTML = `
    <div class="confirm-view">
      <div class="check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg></div>
      <p style="color:var(--text-muted); font-size:14px;">Thanks, ${order.customer.name.split(' ')[0]} — your order is confirmed. Save this ID to track it anytime:</p>
      <div class="order-id-box">${order.id}</div>
      <p style="color:var(--text-muted); font-size:13px; margin-bottom:20px;">Total: <b style="color:var(--accent-bright)">${pkr(order.total)}</b> · Cash on Delivery · ${order.customer.city}</p>
      <a class="btn" style="width:100%;" href="#track" onclick="closeCheckout(); document.getElementById('trackInput').value='${order.id}'; trackOrder('${order.id}');"><span class="facet"></span><span>Track This Order</span></a>
    </div>`;
}

// ================= ORDER TRACKING =================
const trackInput = document.getElementById('trackInput');
const trackResult = document.getElementById('trackResult');
const recentChips = document.getElementById('recentChips');
const STATUS_LABELS = { confirmed:'Order Confirmed', preparing:'Preparing', shipped:'Shipped', delivered:'Delivered' };
const STATUS_ORDER = ['confirmed','preparing','shipped','delivered'];
let trackUnsub = null;

function trackOrder(rawId){
  const id = (rawId || trackInput.value).trim().toUpperCase();
  if (!id){ trackResult.innerHTML = `<p class="track-error">Enter an Order ID to track.</p>`; return; }
  trackInput.value = id;
  trackResult.innerHTML = `<p class="track-loading">Looking up your order…</p>`;
  if (trackUnsub) { trackUnsub(); trackUnsub = null; }

  if (USE_FIREBASE){
    trackUnsub = onSnapshot(doc(db, 'orders', id), (snap) => {
      if (!snap.exists()){
        trackResult.innerHTML = `<p class="track-error">We couldn't find an order with that ID. Double-check it, or WhatsApp us for help.</p>`;
        return;
      }
      renderTrackResult(snap.data());
    }, () => {
      trackResult.innerHTML = `<p class="track-error">We couldn't find an order with that ID. Double-check it, or WhatsApp us for help.</p>`;
    });
  } else {
    try {
      const raw = localStorage.getItem('order:' + id);
      if (!raw) throw new Error('not found');
      renderTrackResult(JSON.parse(raw));
    } catch(e){
      trackResult.innerHTML = `<p class="track-error">We couldn't find an order with that ID. Double-check it, or WhatsApp us for help.</p>`;
    }
  }
}
window.trackOrder = trackOrder;

function renderTrackResult(order){
  const stepIdx = Math.max(0, STATUS_ORDER.indexOf(order.status || 'confirmed'));
  const steps = STATUS_ORDER.map((key, i) => `
    <div class="t-step ${i < stepIdx ? 'done' : ''} ${i === stepIdx ? 'current' : ''}">
      <div class="t-line"></div>
      <div class="t-dot">${i < stepIdx ? '✓' : i+1}</div>
      <span>${STATUS_LABELS[key]}</span>
    </div>`).join('');
  const items = (order.items||[]).map(it => `<div class="track-item-row"><span>${it.name} × ${it.qty}</span><b>${pkr(it.price*it.qty)}</b></div>`).join('');
  const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '';
  trackResult.innerHTML = `
    <div class="track-order-meta"><span>Order <b style="color:var(--text)">${order.id}</b></span><span>${(order.customer&&order.customer.city)||''} ${dateStr ? '· '+dateStr : ''}</span></div>
    <div class="tracker">${steps}</div>
    <div class="track-items">${items}
      <div class="track-total-row"><span>Total</span><span>${pkr(order.total)}</span></div>
    </div>`;
}
document.getElementById('trackBtn').addEventListener('click', () => trackOrder());
trackInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') trackOrder(); });

function loadRecentChips(){
  try {
    const ids = JSON.parse(localStorage.getItem('sitara-recent-orders') || '[]');
    recentChips.innerHTML = ids.length
      ? 'Your recent orders: ' + ids.map(id => `<button type="button" onclick="trackOrder('${id}')">${id}</button>`).join('')
      : '';
  } catch(e){ recentChips.innerHTML = ''; }
}

// ================= INIT =================
loadCart();
loadRecentChips();
const productSearch = document.getElementById("productSearch");

if(productSearch){

    productSearch.addEventListener("input", function(){

        currentSearch = this.value.trim().toLowerCase();

        renderProducts(currentFilter);

    });


    productSearch.addEventListener("keydown", function(e){

        if(e.key === "Enter"){

            document.getElementById("products").scrollIntoView({
                behavior:"smooth"
            });

        }

    });

}
// Change product image when a color is selected
document.addEventListener("click", (e) => {
  const colorButton = e.target.closest(".product-color");

  if (!colorButton) return;

  const productId = colorButton.dataset.colorProduct;
  const colorIndex = Number(colorButton.dataset.colorIndex);

  const product = LIVE_PRODUCTS.find(
    p => String(p.id) === String(productId)
  );

  if (!product) {
    console.error("Product not found:", productId);
    return;
  }

  const colors = Array.isArray(product.colors)
    ? product.colors
    : [];

  const selectedColor = colors[colorIndex];

  if (!selectedColor) {
    console.error("Color not found:", colorIndex);
    return;
  }

  // Active button
  document
    .querySelectorAll(
      `.product-color[data-color-product="${productId}"]`
    )
    .forEach(btn => btn.classList.remove("active"));

  colorButton.classList.add("active");

  // Color name
  const label = document.getElementById(
    `color-label-${productId}`
  );

  if (label) {
    label.textContent = selectedColor.name;
  }

  // Find image
  const imageIndex = Number(selectedColor.imageIndex);

  const images = Array.isArray(product.images)
    ? product.images
    : (product.image ? [product.image] : []);

  if (
    Number.isInteger(imageIndex) &&
    images[imageIndex]
  ) {
    const card = colorButton.closest(".product-card");

    const mainImage = card?.querySelector(
      ".gallery-main-image"
    );

    if (mainImage) {
      mainImage.src = images[imageIndex];

      // Reset gallery buttons/dots to selected image
      const gallery = mainImage.closest(".product-gallery");

      if (gallery) {
        gallery.dataset.currentIndex = imageIndex;

        gallery
          .querySelectorAll(".product-gallery-dot")
          .forEach((dot, i) => {
            dot.classList.toggle(
              "active",
              i === imageIndex
            );
          });
      }
    }
  } else {
    console.warn(
      "This color does not have a valid imageIndex:",
      selectedColor
    );
  }
});
