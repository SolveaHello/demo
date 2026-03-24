/* ============================================
   THREADCO — Store JS
   ============================================ */

// --- Cart State ---
const cart = {
  items: JSON.parse(localStorage.getItem('tc_cart') || '[]'),
  save() { localStorage.setItem('tc_cart', JSON.stringify(this.items)); },
  add(product) {
    const existing = this.items.find(i => i.id === product.id && i.size === product.size && i.color === product.color);
    if (existing) {
      existing.qty += product.qty || 1;
    } else {
      this.items.push({ ...product, qty: product.qty || 1 });
    }
    this.save();
    renderCart();
    updateCartCount();
    showToast(`"${product.title}" added to cart`);
    openCart();
  },
  remove(id, size, color) {
    this.items = this.items.filter(i => !(i.id === id && i.size === size && i.color === color));
    this.save();
    renderCart();
    updateCartCount();
  },
  updateQty(id, size, color, delta) {
    const item = this.items.find(i => i.id === id && i.size === size && i.color === color);
    if (item) {
      item.qty = Math.max(1, item.qty + delta);
      this.save();
      renderCart();
    }
  },
  total() {
    return this.items.reduce((sum, i) => sum + (i.price * i.qty), 0);
  },
  count() {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  }
};

// --- Cart UI ---
function openCart() {
  document.querySelector('.cart-overlay').classList.add('open');
  document.querySelector('.cart-drawer').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.querySelector('.cart-overlay').classList.remove('open');
  document.querySelector('.cart-drawer').classList.remove('open');
  document.body.style.overflow = '';
}

function updateCartCount() {
  const count = cart.count();
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.classList.toggle('visible', count > 0);
  });
}

function renderCart() {
  const body = document.querySelector('.cart-body');
  const subtotalEl = document.querySelector('.cart-subtotal .cart-total-val');
  if (!body) return;
  if (cart.items.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        <p>Your cart is empty</p>
      </div>`;
    if (subtotalEl) subtotalEl.textContent = '$0.00';
    return;
  }
  body.innerHTML = cart.items.map((item, idx) => `
    <div class="cart-item">
      <div class="cart-item-img">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-title">${item.title}</div>
        <div class="cart-item-variant">${item.color} / ${item.size}</div>
        <div class="cart-item-actions">
          <div class="qty-control">
            <button class="qty-btn" onclick="cart.updateQty('${item.id}','${item.size}','${item.color}',-1);renderCart()">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="cart.updateQty('${item.id}','${item.size}','${item.color}',1);renderCart()">+</button>
          </div>
          <button class="cart-item-remove" onclick="cart.remove('${item.id}','${item.size}','${item.color}')">Remove</button>
          <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
        </div>
      </div>
    </div>`).join('');
  if (subtotalEl) subtotalEl.textContent = `$${cart.total().toFixed(2)}`;
}

// --- Toast ---
function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> ${msg}`;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 3000);
}

// --- Mobile Menu ---
function openMobileMenu() {
  document.querySelector('.mobile-nav')?.classList.add('open');
  document.querySelector('.cart-overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMobileMenu() {
  document.querySelector('.mobile-nav')?.classList.remove('open');
  document.querySelector('.cart-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

// --- Quick Add (from collection/home) ---
function quickAdd(id, title, price, emoji) {
  cart.add({ id, title, price, emoji, size: 'M', color: 'Black' });
}

// --- Wishlist toggle ---
function toggleWishlist(btn) {
  btn.classList.toggle('active');
  const txt = btn.classList.contains('active') ? 'Added to wishlist' : 'Removed from wishlist';
  showToast(txt);
}

// --- Init on DOM ready ---
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  renderCart();

  // Cart open/close
  document.querySelectorAll('[data-cart-open]').forEach(el => el.addEventListener('click', openCart));
  document.querySelector('.cart-overlay')?.addEventListener('click', (e) => {
    if (!e.target.closest('.cart-drawer') && !e.target.closest('.mobile-nav')) {
      closeCart();
      closeMobileMenu();
    }
  });
  document.querySelector('.cart-close')?.addEventListener('click', closeCart);

  // Newsletter form
  document.querySelector('.newsletter-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    showToast('You\'re subscribed! Check your inbox.');
    input.value = '';
  });
});
