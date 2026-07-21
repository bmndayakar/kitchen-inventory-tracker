const API_URL = 'api/items.php';

const CATEGORY_NAMES = {
  grains: 'Rice, Flour & Grains',
  oils: 'Oils & Fats',
  'salt-sugar': 'Salt, Sugar & Sweeteners',
  pulses: 'Pulses',
  spices: 'Spices & Masalas',
  sauces: 'Sauces & Condiments',
  'dry-fruits': 'Dry Fruits, Nuts & Seeds',
  cooking: 'Cooking Ingredients',
  'ready-to-serve': 'Ready-to-Serve',
  packaging: 'Packaging',
  other: 'Other'
};

let items = [];
let activeFilter = 'all';
let lowStockOnly = false;
let searchQuery = '';

const listEl = document.getElementById('items-list');
const addForm = document.getElementById('add-form');
const formSection = document.getElementById('add-form-section');
const toggleBtn = document.getElementById('toggle-add');

function formatDate(d) {
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTimestamp(ts) {
  if (!ts) return '';
  const d = new Date(ts + ' UTC');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' }) + ', ' +
         d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
}

document.getElementById('header-date').textContent = formatDate(new Date());

toggleBtn.addEventListener('click', () => {
  formSection.classList.toggle('collapsed');
  toggleBtn.classList.toggle('open');
});

async function loadItems() {
  const res = await fetch(API_URL);
  items = await res.json();
  renderDashboard();
  render();
}

function renderDashboard() {
  const total = items.length;
  const outOfStock = items.filter(i => parseFloat(i.quantity) === 0).length;
  const lowStock = items.filter(i => isLowStock(i) && parseFloat(i.quantity) > 0).length;
  const inStock = total - outOfStock - lowStock;

  const stockValue = items.reduce((sum, i) => {
    const up = parseFloat(i.unit_price);
    if (up > 0) sum += parseFloat(i.quantity) * up;
    return sum;
  }, 0);
  console.log('Stock value:', stockValue, 'Items with price:', items.filter(i => parseFloat(i.unit_price) > 0).map(i => i.name + ': ' + i.unit_price));

  animateNumber('stat-total', total);
  animateNumber('stat-in-stock', inStock);
  animateNumber('stat-low', lowStock);
  animateNumber('stat-out', outOfStock);
  document.getElementById('stat-value').textContent = '₹' + Math.round(stockValue).toLocaleString('en-IN');

  if (items.length > 0) {
    const latest = items.reduce((a, b) => (a.updated_at > b.updated_at) ? a : b);
    document.getElementById('last-updated').textContent = 'Last updated ' + formatTimestamp(latest.updated_at);
  }
}

function animateNumber(id, target) {
  const el = document.getElementById(id);
  const current = parseInt(el.textContent) || 0;
  if (current === target) { el.textContent = target; return; }
  const step = target > current ? 1 : -1;
  let val = current;
  const interval = setInterval(() => {
    val += step;
    el.textContent = val;
    if (val === target) clearInterval(interval);
  }, 30);
}

function isExpiringSoon(dateStr) {
  if (!dateStr) return false;
  return (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24) <= 3;
}

function isLowStock(item) {
  return parseFloat(item.quantity) <= parseFloat(item.low_stock_threshold);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function render() {
  let filtered = items.filter(i => activeFilter === 'all' || i.category === activeFilter);
  if (lowStockOnly) filtered = filtered.filter(i => isLowStock(i));
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(i => i.name.toLowerCase().includes(q));
  }

  if (filtered.length === 0) {
    listEl.innerHTML = '<div class="empty-msg">No items found.</div>';
    return;
  }

  const grouped = {};
  filtered.forEach(item => {
    const cat = item.category || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  let html = '';
  let idx = 0;
  for (const cat of Object.keys(CATEGORY_NAMES)) {
    if (!grouped[cat]) continue;
    html += `<div class="group-header"><span>${escapeHtml(CATEGORY_NAMES[cat] || cat)}</span><button class="cat-add-btn" onclick="openQuickAdd('${cat}')" title="Add item to ${escapeHtml(CATEGORY_NAMES[cat])}">+</button></div>`;
    html += '<div class="tile-grid">';
    grouped[cat].forEach(item => {
      html += renderItem(item, idx);
      idx++;
    });
    html += '</div>';
  }

  listEl.innerHTML = html;
}

function renderItem(item, idx) {
  const qty = parseFloat(item.quantity);
  const low = isLowStock(item);
  const out = qty === 0;
  const expiring = isExpiringSoon(item.expiry_date);
  const cls = out ? 'out' : low ? 'low' : expiring ? 'expiring' : '';

  return `
    <div class="tile ${cls}" style="animation-delay:${(idx || 0) * 0.04}s" onclick="openHistory(${item.id})" role="button">
      <div class="tile-top">
        <span class="tile-name">${escapeHtml(item.name)}</span>
        <button class="tile-edit" onclick="event.stopPropagation();openEdit(${item.id})" title="Edit"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></button>
      </div>
      <div class="tile-qty">
        <span class="tile-qty-value">${item.quantity}</span>
        <span class="tile-qty-unit">${escapeHtml(item.unit)}</span>
      </div>
      <div class="tile-badges">
        ${out ? '<span class="badge out">Out of stock</span>' : ''}
        ${!out && low ? '<span class="badge low">Low stock</span>' : ''}
        ${expiring ? '<span class="badge expiring">Expiring soon</span>' : ''}
      </div>
      ${item.unit_price ? '<div class="tile-price">₹' + parseFloat(item.unit_price).toFixed(2) + '/' + escapeHtml(item.unit) + ' · Value: ₹' + (parseFloat(item.quantity) * parseFloat(item.unit_price)).toFixed(2) + '</div>' : ''}
      ${item.expiry_date ? '<div class="tile-expiry">Exp ' + item.expiry_date + '</div>' : ''}
      <div class="tile-actions">
        <button class="btn-consume" onclick="event.stopPropagation();openStockModal(${item.id},'consumed')" title="Use / Consume">−</button>
        <button class="btn-refill" onclick="event.stopPropagation();openStockModal(${item.id},'added')" title="Add / Refill">+</button>
      </div>
      <div class="tile-updated">${formatTimestamp(item.updated_at)}</div>
    </div>
  `;
}

addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    name: document.getElementById('name').value,
    category: document.getElementById('category').value,
    quantity: parseFloat(document.getElementById('quantity').value),
    unit: document.getElementById('unit').value,
    low_stock_threshold: parseFloat(document.getElementById('low_stock_threshold').value),
    expiry_date: document.getElementById('expiry_date').value
  };
  await fetch(API_URL, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
  addForm.reset();
  document.getElementById('quantity').value = 1;
  document.getElementById('unit').value = 'pcs';
  document.getElementById('low_stock_threshold').value = 1;
  formSection.classList.add('collapsed');
  toggleBtn.classList.remove('open');
  loadItems();
});

const TXN_URL = 'api/transactions.php';

async function deleteItem(id) {
  if (!confirm('Remove this item?')) return;
  await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
  loadItems();
}

const stockModal = document.getElementById('stock-modal');
const stockForm = document.getElementById('stock-form');

function openStockModal(id, type) {
  const item = items.find(i => i.id == id);
  if (!item) return;
  document.getElementById('stock-item-id').value = id;
  document.getElementById('stock-type').value = type;
  document.getElementById('stock-qty').value = '';
  document.getElementById('stock-price').value = '';
  document.getElementById('stock-note').value = '';
  if (type === 'consumed') {
    document.getElementById('stock-modal-title').textContent = 'Use: ' + item.name;
    document.getElementById('stock-qty-label').textContent = 'How much was used? (' + item.unit + ')';
    document.getElementById('stock-submit-btn').textContent = 'Record Usage';
    document.getElementById('stock-submit-btn').className = 'btn-primary btn-danger';
    document.getElementById('stock-price-label').textContent = 'Cost (optional, ₹)';
  } else {
    document.getElementById('stock-modal-title').textContent = 'Refill: ' + item.name;
    document.getElementById('stock-qty-label').textContent = 'How much to add? (' + item.unit + ')';
    document.getElementById('stock-submit-btn').textContent = 'Record Refill';
    document.getElementById('stock-submit-btn').className = 'btn-primary btn-success';
    document.getElementById('stock-price-label').textContent = 'Price paid (optional, ₹)';
  }
  stockModal.classList.add('open');
  setTimeout(() => document.getElementById('stock-qty').focus(), 100);
}

function closeStockModal() {
  stockModal.classList.remove('open');
}

document.getElementById('stock-modal-close').addEventListener('click', closeStockModal);
stockModal.addEventListener('click', (e) => { if (e.target === stockModal) closeStockModal(); });

stockForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const type = document.getElementById('stock-type').value;
  const confirmMsg = type === 'consumed' ? 'Are you sure you want to record this usage?' : 'Are you sure you want to record this refill?';
  if (!confirm(confirmMsg)) return;
  const priceVal = document.getElementById('stock-price').value;
  const payload = {
    item_id: parseInt(document.getElementById('stock-item-id').value),
    type: document.getElementById('stock-type').value,
    quantity: parseFloat(document.getElementById('stock-qty').value),
    price: priceVal ? parseFloat(priceVal) : null,
    note: document.getElementById('stock-note').value
  };
  await fetch(TXN_URL, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
  closeStockModal();
  loadItems();
});

document.querySelectorAll('.chip').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    render();
  });
});

document.getElementById('low-stock-only').addEventListener('change', (e) => {
  lowStockOnly = e.target.checked;
  render();
});

document.getElementById('search').addEventListener('input', (e) => {
  searchQuery = e.target.value;
  render();
});

const modal = document.getElementById('quick-add-modal');
const modalForm = document.getElementById('quick-add-form');

function openQuickAdd(cat) {
  document.getElementById('modal-category').value = cat;
  document.getElementById('modal-title').textContent = 'Add to ' + (CATEGORY_NAMES[cat] || cat);
  document.getElementById('modal-name').value = '';
  document.getElementById('modal-qty').value = 1;
  document.getElementById('modal-unit').value = 'kg';
  modal.classList.add('open');
  setTimeout(() => document.getElementById('modal-name').focus(), 100);
}

function closeModal() {
  modal.classList.remove('open');
}

document.getElementById('modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

modalForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    name: document.getElementById('modal-name').value,
    category: document.getElementById('modal-category').value,
    quantity: parseFloat(document.getElementById('modal-qty').value),
    unit: document.getElementById('modal-unit').value,
    low_stock_threshold: 1,
    expiry_date: ''
  };
  await fetch(API_URL, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
  closeModal();
  loadItems();
});

// View tabs
const logDateInput = document.getElementById('log-date');
if (logDateInput) {
  const now = new Date();
  const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  logDateInput.value = istDate.getFullYear() + '-' + String(istDate.getMonth() + 1).padStart(2, '0') + '-' + String(istDate.getDate()).padStart(2, '0');
}

document.querySelectorAll('.view-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    console.log('Tab clicked:', tab.dataset.view);
    document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const view = tab.dataset.view;
    document.getElementById('items-list').classList.toggle('hidden', view !== 'inventory');
    document.getElementById('controls').classList.toggle('hidden', view !== 'inventory');
    document.getElementById('log-view').classList.toggle('hidden', view !== 'log');
    if (view === 'log') loadLog();
  });
});

if (logDateInput) logDateInput.addEventListener('change', loadLog);

async function loadLog() {
  const date = logDateInput.value;
  console.log('Loading log for:', date);
  const res = await fetch(TXN_URL + '?date=' + date);
  const txns = await res.json();
  const logList = document.getElementById('log-list');

  if (txns.length === 0) {
    logList.innerHTML = '<div class="empty-msg">No activity on this date.</div>';
    return;
  }

  const grouped = {};
  txns.forEach(t => {
    const key = t.item_name;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  });

  logList.innerHTML = Object.keys(grouped).map(name => {
    const entries = grouped[name];
    const count = entries.length;
    return `
      <div class="log-group">
        <button class="log-group-header" onclick="this.parentElement.classList.toggle('open')">
          <span class="log-group-title">${escapeHtml(name)}</span>
          <span class="log-group-count">${count}</span>
          <svg class="log-group-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="log-group-entries">
        ${entries.map(t => {
          const isConsumed = t.type === 'consumed';
          return `
            <div class="log-entry ${isConsumed ? 'consumed' : 'added'}">
              <div class="log-icon">${isConsumed ? '📤' : '📥'}</div>
              <div class="log-body">
                <div class="log-detail">${isConsumed ? 'Used' : 'Added'} <strong>${t.quantity} ${escapeHtml(t.unit)}</strong>${t.price ? ' — ₹' + parseFloat(t.price).toFixed(2) : ''}${t.note ? ' — ' + escapeHtml(t.note) : ''}</div>
                <div class="log-time">${formatTimestamp(t.created_at)}</div>
              </div>
            </div>
          `;
        }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');

function openEdit(id) {
  const item = items.find(i => i.id == id);
  if (!item) return;
  document.getElementById('edit-id').value = item.id;
  document.getElementById('edit-name').value = item.name;
  document.getElementById('edit-unit').value = item.unit;
  editModal.classList.add('open');
  setTimeout(() => document.getElementById('edit-name').focus(), 100);
}

function closeEditModal() {
  editModal.classList.remove('open');
}

document.getElementById('edit-modal-close').addEventListener('click', closeEditModal);
editModal.addEventListener('click', (e) => { if (e.target === editModal) closeEditModal(); });

editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('edit-id').value;
  const item = items.find(i => i.id == id);
  if (!item) return;
  await fetch(API_URL, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      ...item,
      name: document.getElementById('edit-name').value,
      unit: document.getElementById('edit-unit').value
    })
  });
  closeEditModal();
  loadItems();
});

// History modal
const historyModal = document.getElementById('history-modal');

function closeHistoryModal() {
  historyModal.classList.remove('open');
}

document.getElementById('history-modal-close').addEventListener('click', closeHistoryModal);
historyModal.addEventListener('click', (e) => { if (e.target === historyModal) closeHistoryModal(); });

async function openHistory(id) {
  const item = items.find(i => i.id == id);
  if (!item) return;
  document.getElementById('history-modal-title').textContent = item.name + ' — History';
  historyModal.classList.add('open');

  const res = await fetch(TXN_URL + '?item_id=' + id);
  const txns = await res.json();

  const canvas = document.getElementById('history-chart');
  const emptyMsg = document.getElementById('history-empty');

  if (txns.length === 0) {
    canvas.classList.add('hidden');
    emptyMsg.classList.remove('hidden');
    return;
  }
  canvas.classList.remove('hidden');
  emptyMsg.classList.add('hidden');

  const daily = {};
  txns.forEach(t => {
    const d = t.created_at.split(' ')[0];
    if (!daily[d]) daily[d] = { consumed: 0, added: 0 };
    daily[d][t.type] += parseFloat(t.quantity);
  });

  const dates = Object.keys(daily).sort();
  const last14 = dates.slice(-14);
  drawChart(canvas, last14, last14.map(d => daily[d]), item.unit);
}

function drawChart(canvas, labels, data, unit) {
  const dpr = window.devicePixelRatio || 1;
  const wrap = canvas.parentElement;
  const minWidth = Math.max(wrap.clientWidth - 16, labels.length * 52);
  canvas.style.width = minWidth + 'px';
  canvas.width = minWidth * dpr;
  canvas.height = 220 * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const W = minWidth;
  const H = 220;

  ctx.clearRect(0, 0, W, H);

  const padLeft = 40;
  const padRight = 12;
  const padTop = 12;
  const padBottom = 40;
  const chartW = W - padLeft - padRight;
  const chartH = H - padTop - padBottom;

  const maxVal = Math.max(1, ...data.map(d => Math.max(d.consumed, d.added)));
  const nBars = labels.length;
  const groupW = chartW / nBars;
  const barW = Math.min(groupW * 0.35, 22);
  const gap = 3;

  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
  const steps = 4;
  for (let i = 0; i <= steps; i++) {
    const val = (maxVal / steps) * i;
    const y = padTop + chartH - (chartH * (val / maxVal));
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(W - padRight, y);
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(val % 1 === 0 ? val : val.toFixed(1), padLeft - 6, y);
  }

  labels.forEach((label, i) => {
    const cx = padLeft + groupW * i + groupW / 2;
    const consumed = data[i].consumed;
    const added = data[i].added;

    const cH = (consumed / maxVal) * chartH;
    const cX = cx - barW - gap / 2;
    const cY = padTop + chartH - cH;
    ctx.fillStyle = '#ef4444';
    roundedRect(ctx, cX, cY, barW, cH, 3);

    const aH = (added / maxVal) * chartH;
    const aX = cx + gap / 2;
    const aY = padTop + chartH - aH;
    ctx.fillStyle = '#22c55e';
    roundedRect(ctx, aX, aY, barW, aH, 3);

    ctx.font = '600 9px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    if (consumed > 0) {
      ctx.fillStyle = '#ef4444';
      ctx.fillText(consumed % 1 === 0 ? consumed : consumed.toFixed(1), cX + barW / 2, cY - 5);
    }
    if (added > 0) {
      ctx.fillStyle = '#16a34a';
      ctx.fillText(added % 1 === 0 ? added : added.toFixed(1), aX + barW / 2, aY - 5);
    }

    ctx.fillStyle = '#64748b';
    ctx.font = '500 10px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    const parts = label.split('-');
    ctx.fillText(parseInt(parts[2]) + '/' + parseInt(parts[1]), cx, padTop + chartH + 16);
  });

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 9px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(unit, padLeft, padTop - 2);
}

function roundedRect(ctx, x, y, w, h, r) {
  if (h < 1) return;
  r = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

loadItems();
