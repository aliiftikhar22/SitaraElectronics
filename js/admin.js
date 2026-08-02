import { db, auth, isFirebaseConfigured } from './firebase-config.js';
import {
  collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import {
  signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const ICONS = {
  fridge: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="11" y="4" width="26" height="40" rx="3"/><line x1="11" y1="20" x2="37" y2="20"/></svg>',
  oven: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="8" width="36" height="32" rx="3"/><rect x="11" y="14" width="26" height="18" rx="1.5"/></svg>',
  microwave: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="10" width="38" height="26" rx="3"/><rect x="10" y="14" width="22" height="18" rx="1.5"/></svg>',
  heater: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="12" width="30" height="24" rx="4"/></svg>',
  ac: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="12" width="40" height="16" rx="3"/></svg>',
  iron: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 14 h20 a8 8 0 0 1 8 8 v0 a8 8 0 0 1 -8 8 H16 l-6 8 v-24 Z"/></svg>',
  default: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="8" width="32" height="32" rx="4"/></svg>'
};
const FALLBACK_PRODUCTS = [
  { name:'Frost-Free Refrigerator 12 CFT', cat:'Refrigerators', specs:['12 CFT','Frost-Free','2-Door'], price:54900, old:68000, icon:'fridge' },
  { name:'Built-in Baking Oven 60L', cat:'Ovens', specs:['60L','Rotisserie','Digital'], price:25500, old:32000, icon:'oven' },
  { name:'Digital Microwave Oven 25L', cat:'Microwaves', specs:['25L','Grill','Touch Panel'], price:16800, old:21000, icon:'microwave' },
  { name:'Room Heater 2000W', cat:'Heaters', specs:['2000W','Tip-over Safety','Fan Type'], price:6200, old:8500, icon:'heater' },
  { name:'Split Inverter AC 1.5 Ton', cat:'Air Conditioners', specs:['1.5 Ton','Inverter','DC Motor'], price:118000, old:145000, icon:'ac' },
  { name:'Ceramic Steam Iron', cat:'Irons', specs:['Ceramic Plate','Steam Burst'], price:2100, old:3200, icon:'iron' }
];
function pkr(n){ return 'Rs ' + Number(n||0).toLocaleString('en-PK'); }

const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');
const fbNotice = document.getElementById('fbNotice');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
// Product image + color editor state
const pfImage = document.getElementById("pfImageFile");
const pfImagePreviewGrid = document.getElementById("pfImagePreviewGrid");
const pfColorName = document.getElementById("pfColorName");
const pfColorHex = document.getElementById("pfColorHex");
const pfAddColor = document.getElementById("pfAddColor");
const pfColorsList = document.getElementById("pfColorsList");

let productImages = [];
let productColors = [];
// Automatically set the color picker from the color name
const COLOR_MAP = {
  black: "#000000",
  white: "#ffffff",
  "off white": "#f5f5f5",
  silver: "#c0c0c0",
  grey: "#808080",
  gray: "#808080",
  red: "#ff0000",
  blue: "#0000ff",
  green: "#008000",
  yellow: "#ffff00",
  orange: "#ffa500",
  pink: "#ffc0cb",
  purple: "#800080",
  brown: "#8b4513",
  gold: "#ffd700",
  beige: "#f5f5dc",
  cream: "#fffdd0",
  maroon: "#800000",
  navy: "#000080",
  teal: "#008080"
};

pfColorName.addEventListener("input", () => {
  const name = pfColorName.value.trim().toLowerCase();

  if (COLOR_MAP[name]) {
    pfColorHex.value = COLOR_MAP[name];
  }
});

function compressImage(file, maxSize = 900, quality = 0.72){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderImagePreviews(){
  if (!pfImagePreviewGrid) return;
  pfImagePreviewGrid.innerHTML = productImages.map((src, i) => `
    <div class="admin-image-item">
      <img src="${src}" alt="Product photo ${i + 1}">
      <button type="button" class="image-remove" data-remove-image="${i}" aria-label="Remove photo">×</button>
      ${i === 0 ? '<span class="main-label">Main</span>' : ''}
    </div>
  `).join('');
  pfImagePreviewGrid.querySelectorAll('[data-remove-image]').forEach(btn => {
    btn.addEventListener('click', () => {
      productImages.splice(Number(btn.dataset.removeImage), 1);
      renderImagePreviews();
    });
  });
}

if (pfImage) {
  pfImage.addEventListener('change', async function(){
    const files = Array.from(this.files || []);
    if (!files.length) return;
    try {
      const converted = await Promise.all(files.map(file => compressImage(file)));
      productImages.push(...converted);
      renderImagePreviews();
      this.value = '';
    } catch (err) {
      console.error('Image processing failed:', err);
      productFormError.textContent = 'One or more images could not be processed.';
    }
  });
}

function renderColorList(){
  if (!pfColorsList) return;
  pfColorsList.innerHTML = productColors.map((c, i) => `
    <div class="admin-color-chip">
      <span class="swatch" style="background:${c.hex}"></span>
      <span>${c.name}</span>
      <span>${c.hex}</span>
      <button type="button" data-remove-color="${i}" aria-label="Remove color">×</button>
    </div>
  `).join('');
  pfColorsList.querySelectorAll('[data-remove-color]').forEach(btn => {
    btn.addEventListener('click', () => {
      productColors.splice(Number(btn.dataset.removeColor), 1);
      renderColorList();
    });
  });
}

if (pfAddColor) {
  pfAddColor.addEventListener('click', () => {
    const name = pfColorName.value.trim();
    const hex = pfColorHex.value || '#ffffff';
    if (!name) return;
    productColors.push({ name, hex });
    pfColorName.value = '';
    renderColorList();
  });
}

if (!isFirebaseConfigured){
  fbNotice.textContent = 'Firebase is not connected yet — paste your project config into firebase-config.js, then reload this page.';
  loginBtn.disabled = true;
} else {
  loginBtn.addEventListener('click', async () => {
    loginError.textContent = '';
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!email || !password){ loginError.textContent = 'Enter your admin email and password.'; return; }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch(e){
      loginError.textContent = 'Login failed — check your email and password.';
    }
  });
  onAuthStateChanged(auth, (user) => {
    if (user){
      loginScreen.style.display = 'none';
      dashboard.style.display = 'block';
      document.getElementById('adminEmail').textContent = user.email;
      startDashboard();
    } else {
      loginScreen.style.display = 'flex';
      dashboard.style.display = 'none';
    }
  });
}
document.getElementById('logoutBtn').addEventListener('click', () => signOut(auth));

// ================= TABS =================
document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.admin-panel-section').forEach(s => s.style.display = 'none');
    document.getElementById('tab-' + tab.dataset.tab).style.display = 'block';
  });
});

let dashboardStarted = false;
function startDashboard(){
  if (dashboardStarted) return;
  dashboardStarted = true;
  watchProducts();
  watchOrders();
}

// ================= PRODUCTS =================
const productsBody = document.getElementById('productsTableBody');
const productsEmpty = document.getElementById('productsEmpty');
let currentProducts = [];

function watchProducts(){
  onSnapshot(query(collection(db, 'products'), orderBy('name')), (snap) => {
    currentProducts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderProductsTable();
  }, (err) => console.error('products watch error', err));
}
function renderProductsTable(){
  productsEmpty.style.display = currentProducts.length ? 'none' : 'block';
  productsBody.innerHTML = currentProducts.map(p => `
    <tr>
      <td><div class="p-thumb">${ICONS[p.icon] || ICONS.default}</div></td>
      <td class="p-name">${p.name}</td>
      <td>${p.cat}</td>
      <td>${pkr(p.price)}</td>
      <td>${p.old ? pkr(p.old) : '—'}</td>
      <td>${(p.specs||[]).map(s => `<span class="spec-tag">${s}</span>`).join('')}</td>
      <td>
        <div class="row-actions">
          <button class="row-btn" title="Edit" data-edit="${p.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg></button>
          <button class="row-btn danger" title="Delete" data-del="${p.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg></button>
        </div>
      </td>
    </tr>`).join('');
  productsBody.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => openProductModal(btn.dataset.edit)));
  productsBody.querySelectorAll('[data-del]').forEach(btn => btn.addEventListener('click', () => deleteProduct(btn.dataset.del)));
}
async function deleteProduct(id){
  if (!confirm('Delete this product? This cannot be undone.')) return;
  try { await deleteDoc(doc(db, 'products', id)); } catch(e){ alert('Could not delete product.'); }
}

// Product modal
const pOverlay = document.getElementById('pOverlay');
const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');
const productFormError = document.getElementById('productFormError');

function openProductModal(id){
  productFormError.textContent = '';
  const editing = !!id;
  document.getElementById('productModalTitle').textContent = editing ? 'Edit Product' : 'Add Product';
  document.getElementById('pfSubmitLabel').textContent = editing ? 'Save Changes' : 'Save Product';
  document.getElementById('pfId').value = id || '';
  const p = editing ? currentProducts.find(x => x.id === id) : null;
  document.getElementById('pfName').value = p ? p.name : '';
  document.getElementById('pfCategory').value = p ? p.cat : 'Refrigerators';
  document.getElementById('pfIcon').value = p ? p.icon : 'fridge';
  document.getElementById('pfPrice').value = p ? p.price : '';
  document.getElementById('pfOld').value = p && p.old ? p.old : '';
  document.getElementById('pfSpecs').value = p ? (p.specs||[]).join(', ') : '';
  productImages = p ? (Array.isArray(p.images) && p.images.length ? [...p.images] : (p.image ? [p.image] : [])) : [];
  productColors = p && Array.isArray(p.colors) ? [...p.colors] : [];
  renderImagePreviews();
  renderColorList();
  productModal.classList.add('open');
  pOverlay.classList.add('open');
}
function closeProductModal(){ productModal.classList.remove('open'); pOverlay.classList.remove('open'); }
document.getElementById('addProductBtn').addEventListener('click', () => openProductModal(null));
document.getElementById('productModalClose').addEventListener('click', closeProductModal);
pOverlay.addEventListener('click', closeProductModal);

productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  productFormError.textContent = '';
  const id = document.getElementById('pfId').value;
  const name = document.getElementById('pfName').value.trim();
  const cat = document.getElementById('pfCategory').value;
  const icon = document.getElementById('pfIcon').value;
  const price = parseFloat(document.getElementById('pfPrice').value);
  const oldVal = document.getElementById('pfOld').value;
  const old = oldVal ? parseFloat(oldVal) : null;
  const specs = document.getElementById('pfSpecs').value.split(',').map(s => s.trim()).filter(Boolean);
  if (!name || isNaN(price)){ productFormError.textContent = 'Name and wholesale price are required.'; return; }
  const save = old && old > price ? Math.round(100 - (price/old)*100) : 0;
  const data = {
    name,
    cat,
    icon,
    image: productImages[0] || '',
    images: productImages,
    colors: productColors,
    price,
    old,
    specs,
    save
  };
  try {
    if (id){ await updateDoc(doc(db, 'products', id), data); }
    else { await addDoc(collection(db, 'products'), data); }
    closeProductModal();
  } catch(e){
    productFormError.textContent = 'Could not save product — please try again.';
  }
});

document.getElementById('seedBtn').addEventListener('click', async () => {
  if (currentProducts.length > 0){
    if (!confirm('You already have products. Add the 6 demo products anyway?')) return;
  }
  try {
    for (const p of FALLBACK_PRODUCTS){
      const save = p.old ? Math.round(100 - (p.price/p.old)*100) : 0;
      await addDoc(collection(db, 'products'), { ...p, save });
    }
  } catch(e){ alert('Could not seed products.'); }
});

// ================= ORDERS =================
const ordersBody = document.getElementById('ordersTableBody');
const ordersEmpty = document.getElementById('ordersEmpty');

function watchOrders(){
  onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snap) => {
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    ordersEmpty.style.display = orders.length ? 'none' : 'block';
    ordersBody.innerHTML = orders.map(o => `
      <tr>
        <td style="font-family:var(--mono); color:var(--text);">${o.id}</td>
        <td>${(o.customer && o.customer.name) || '—'}<br><span style="font-size:11.5px; color:var(--text-faint);">${(o.customer && o.customer.phone) || ''}</span></td>
        <td>${(o.customer && o.customer.city) || '—'}</td>
        <td>${pkr(o.total)}</td>
        <td>${o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}</td>
        <td>
          <select class="status-select ${o.status||'confirmed'}" data-status="${o.id}">
            <option value="confirmed" ${o.status==='confirmed'?'selected':''}>Order Confirmed</option>
            <option value="preparing" ${o.status==='preparing'?'selected':''}>Preparing</option>
            <option value="shipped" ${o.status==='shipped'?'selected':''}>Shipped</option>
            <option value="delivered" ${o.status==='delivered'?'selected':''}>Delivered</option>
          </select>
        </td>
        <td>
          <button class="row-btn danger" title="Delete" data-delorder="${o.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg></button>
        </td>
      </tr>`).join('');
    ordersBody.querySelectorAll('[data-status]').forEach(sel => {
      sel.addEventListener('change', async () => {
        sel.className = 'status-select ' + sel.value;
        try { await updateDoc(doc(db, 'orders', sel.dataset.status), { status: sel.value }); }
        catch(e){ alert('Could not update status.'); }
      });
    });
    ordersBody.querySelectorAll('[data-delorder]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this order? This cannot be undone.')) return;
        try { await deleteDoc(doc(db, 'orders', btn.dataset.delorder)); }
        catch(e){ alert('Could not delete order.'); }
      });
    });
  }, (err) => console.error('orders watch error', err));
}
