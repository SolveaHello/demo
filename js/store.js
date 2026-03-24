/* ============================================
   THREADCO — Store JS
   ============================================ */

// Product image map (Unsplash, free to use)
const PRODUCT_IMAGES = {
  '1': [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=800&fit=crop'
  ],
  '2': [
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&h=800&fit=crop'
  ],
  '3': [
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop'
  ],
  '4': [
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=600&h=800&fit=crop'
  ],
  '5': [
    'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1618354691229-88d47f285158?w=600&h=800&fit=crop'
  ],
  '6': [
    'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=600&h=800&fit=crop'
  ],
  '7': [
    'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=600&h=800&fit=crop'
  ],
  '8': [
    'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=800&fit=crop'
  ],
  '9': [
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=800&fit=crop'
  ]
};

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

// --- Swap emoji placeholders with real product images ---
function initProductImages() {
  document.querySelectorAll('[data-product-id]').forEach(card => {
    const pid = card.dataset.productId;
    const imgs = PRODUCT_IMAGES[pid];
    if (!imgs || !imgs[0]) return;
    const placeholder = card.querySelector('.product-placeholder');
    if (placeholder) {
      const img = document.createElement('img');
      img.src = imgs[0];
      img.alt = card.dataset.productTitle || '';
      img.loading = 'lazy';
      placeholder.replaceWith(img);
    }
  });
}

// --- Init on DOM ready ---
document.addEventListener('DOMContentLoaded', () => {
  initProductImages();
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
