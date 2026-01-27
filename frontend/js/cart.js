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
        const res = await fetch(`${API_URL}/products?limit=4&isFeatured=true`);
        const data = await res.json();
        if (data.success) {
            document.getElementById('recommendGrid').innerHTML = data.data.products.map(p => `
                <div class="recommend-card">
                    <img src="${p.images[0]?.url}" alt="${p.name}">
                    <h4>${p.name}</h4>
                    <p class="price">₹${p.price.toLocaleString()}</p>
                    <button class="btn btn-sm btn-primary" onclick="quickAdd('${p._id}', '${p.name}', ${p.price}, '${p.images[0]?.url}')">
                        + Add also
                    </button>
                </div>
            `).join('');
        }
    } catch (e) {
        console.error('Recommendations failed:', e);
    }
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
