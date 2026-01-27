const LIVE_API = 'https://cosmetics-website-1.onrender.com/api';
const API_URL = (['localhost', '127.0.0.1', '::1'].includes(window.location.hostname) || window.location.hostname.startsWith('192.168.'))
    ? `http://${window.location.hostname || 'localhost'}:5000/api`
    : (window.location.protocol === 'file:' ? LIVE_API : '/api');

let state = {
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    user: JSON.parse(localStorage.getItem('user')) || null
};

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    loadRecommendations();
    updateBadge();
});

function renderCart() {
    const container = document.getElementById('cartList');
    if (state.cart.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <p style="font-size: 1.2rem; color: #888;">Your cart is empty</p>
                <a href="./index.html#products" class="btn btn-primary" style="margin-top: 20px; display: inline-block;">Start Shopping</a>
            </div>
        `;
        updateSummary(0);
        return;
    }

    container.innerHTML = state.cart.map((item, index) => `
        <div class="cart-item-row">
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>Premium Quality</p>
                <span class="remove-item" onclick="removeItem(${index})">🗑 Remove from cart</span>
            </div>
            <div class="qty-control">
                <button class="qty-btn" onclick="updateQty(${index}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
            </div>
            <div style="font-weight: 700; font-size: 1.1rem;">₹${(item.price * item.quantity).toLocaleString()}</div>
        </div>
    `).join('');

    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    updateSummary(subtotal);
}

function updateSummary(subtotal) {
    const tax = Math.round(subtotal * 0.18); // 18% GST simulate
    const total = subtotal + tax;

    document.getElementById('subtotal').textContent = `₹${subtotal.toLocaleString()}`;
    document.getElementById('tax').textContent = `₹${tax.toLocaleString()}`;
    document.getElementById('totalAmount').textContent = `₹${total.toLocaleString()}`;
}

window.removeItem = (index) => {
    state.cart.splice(index, 1);
    saveCart();
    renderCart();
};

window.updateQty = (index, change) => {
    state.cart[index].quantity += change;
    if (state.cart[index].quantity < 1) state.cart[index].quantity = 1;
    saveCart();
    renderCart();
};

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(state.cart));
    updateBadge();
}

function updateBadge() {
    const total = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartBadge').textContent = total;
}

async function loadRecommendations() {
    try {
        // --- SMART ALGORITHM ---
        const interests = JSON.parse(localStorage.getItem('interests')) || {};
        const cartCategories = [...new Set(state.cart.map(i => i.category || ''))].filter(Boolean);

        // Find most interested category
        let bestCategory = Object.keys(interests).reduce((a, b) => interests[a] > interests[b] ? a : b, null);

        // If nothing in interests, try cart categories
        if (!bestCategory && cartCategories.length > 0) {
            bestCategory = cartCategories[0];
        }

        let url = `${API_URL}/products?limit=4`;
        if (bestCategory) {
            url += `&category=${bestCategory}`;
            console.log('🤖 Algorithm recommending category:', bestCategory);
        } else {
            url += `&isFeatured=true`;
            console.log('🤖 Fallback: Recommending featured products');
        }

        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
            const container = document.getElementById('recommendGrid');
            if (data.data.products.length === 0) {
                // Final fallback if category fetch returns empty
                return fetch(`${API_URL}/products?limit=4&isFeatured=true`)
                    .then(r => r.json())
                    .then(d => renderRecommendUI(d.data.products));
            }
            renderRecommendUI(data.data.products);
        }
    } catch (e) {
        console.error('Recommendations failed:', e);
    }
}

function renderRecommendUI(products) {
    document.getElementById('recommendGrid').innerHTML = products.map(p => `
        <div class="recommend-card" onclick="window.location.href='./product.html?id=${p._id}'" style="cursor: pointer;">
            <img src="${p.images[0]?.url}" alt="${p.name}">
            <h4>${p.name}</h4>
            <p class="price">₹${p.price.toLocaleString()}</p>
            <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); quickAdd('${p._id}', '${p.name}', ${p.price}, '${p.images[0]?.url}')">
                + Add also
            </button>
        </div>
    `).join('');
}

window.quickAdd = (id, name, price, image) => {
    const existing = state.cart.find(item => item.productId === id);
    if (existing) {
        existing.quantity++;
    } else {
        state.cart.push({ productId: id, name, price, image, quantity: 1 });
    }
    saveCart();
    renderCart();
};
