import * as THREE from 'three';
import { gsap } from 'gsap';

// API Configuration - Using direct Render URL
const API_URL = 'https://cosmetics-website-1.onrender.com/api';

// State Management
const state = {
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    user: JSON.parse(localStorage.getItem('user')) || null,
    products: [],
    currentCategory: 'all',
    searchQuery: ''
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSearch();
    initViewAll();
    initLoginModal();
    init3DHero();
    loadProducts();
    initCart();
    initForms();
    initScrollAnimations();
    updateCartBadge();

    if (state.user) {
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) loginBtn.textContent = state.user.name;
    }
});

function initNavigation() {
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');

    window.addEventListener('scroll', () => {
        if (navbar) {
            if (window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        }
    });

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
    }
}

function initSearch() {
    const searchBtn = document.getElementById('searchBtn');
    let overlay = document.getElementById('searchOverlay');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'searchOverlay';
        overlay.className = 'search-overlay-fixed';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(255,255,255,0.98); z-index: 9999;
            display: none; align-items: center; justify-content: center;
            flex-direction: column; padding: 20px;
        `;
        overlay.innerHTML = `
            <div style="width: 100%; max-width: 600px; position: relative;">
                <input type="text" id="searchInput" placeholder="What are you looking for?" 
                    style="width: 100%; padding: 20px; font-size: 1.5rem; border: none; border-bottom: 2px solid #fc2779; outline: none; background: transparent;">
                <button id="closeSearch" style="position: absolute; right: 0; top: -50px; background: none; border: none; font-size: 2.5rem; cursor: pointer; color: #fc2779;">&times;</button>
            </div>
            <div id="searchResults" style="margin-top: 30px; width: 100%; max-width: 800px; max-height: 60vh; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 15px;"></div>
        `;
        document.body.appendChild(overlay);
    }

    searchBtn?.addEventListener('click', () => {
        overlay.style.display = 'flex';
        document.getElementById('searchInput').focus();
    });

    document.getElementById('closeSearch')?.addEventListener('click', () => {
        overlay.style.display = 'none';
    });

    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const results = term.length > 0 ? state.products.filter(p => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term)) : [];

        const resultsBox = document.getElementById('searchResults');
        if (resultsBox) {
            resultsBox.innerHTML = results.map(p => `
                <div class="search-result-item" data-id="${p._id}" style="cursor: pointer; text-align: center; background: #fff; padding: 15px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: 0.3s;">
                    <img src="${p.images[0]?.url}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px;">
                    <h4 style="font-size: 0.9rem; margin-top: 10px; color: #1a1a2e;">${p.name}</h4>
                    <p style="color: #fc2779; font-weight: bold;">₹${p.price.toLocaleString()}</p>
                </div>
            `).join('');

            // Add click listeners to results
            document.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const id = item.dataset.id;
                    overlay.style.display = 'none';
                    const target = document.querySelector(`[data-product-id="${id}"]`);
                    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                });
            });
        }
    });
}

async function loadProducts(category = 'all') {
    try {
        let url = `${API_URL}/products`;
        if (category !== 'all') url += `?category=${category}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.success) {
            state.products = data.data.products;
            renderProducts(state.products);
        }
    } catch (error) { console.error('API Error:', error); }
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.innerHTML = products.map(product => `
        <div class="product-card" data-product-id="${product._id}">
            <div class="product-image">
                <img src="${product.images[0]?.url}" alt="${product.name}">
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-footer">
                    <div class="product-price">₹${product.price.toLocaleString()}</div>
                    <button class="add-to-cart-btn" onclick="addToCart('${product._id}')">Add</button>
                </div>
            </div>
        </div>
    `).join('');
    gsap.from('.product-card', { opacity: 0, y: 30, stagger: 0.1, duration: 0.5 });
}

window.addToCart = function (productId) {
    const product = state.products.find(p => p._id === productId);
    if (!product) return;
    const existing = state.cart.find(i => i.productId === productId);
    if (existing) existing.quantity++;
    else state.cart.push({ productId: product._id, name: product.name, price: product.price, image: product.images[0]?.url, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(state.cart));
    updateCartBadge();
    showNotification('Added to Bag! ✨');
};

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) badge.textContent = state.cart.reduce((s, i) => s + i.quantity, 0);
}

function initLoginModal() {
    document.getElementById('loginBtn')?.addEventListener('click', () => {
        if (state.user) {
            if (confirm(`Hello ${state.user.name}, wish to Logout?`)) {
                localStorage.clear();
                window.location.reload();
            }
        } else { window.location.href = '/auth.html'; }
    });
}

function initCart() {
    const cartBtn = document.getElementById('cartBtn');
    cartBtn?.addEventListener('click', () => {
        document.getElementById('cartSidebar')?.classList.add('active');
        document.getElementById('modalOverlay')?.classList.add('active');
        renderCart();
    });
    document.getElementById('closeCart')?.addEventListener('click', closeCart);
    document.getElementById('modalOverlay')?.addEventListener('click', closeCart);
}

function closeCart() {
    document.getElementById('cartSidebar')?.classList.remove('active');
    document.getElementById('modalOverlay')?.classList.remove('active');
}

function renderCart() {
    const itemsDiv = document.getElementById('cartItems');
    const totalSpan = document.getElementById('cartTotal');
    if (!itemsDiv) return;
    if (state.cart.length === 0) {
        itemsDiv.innerHTML = '<p style="text-align:center; padding:30px; opacity:0.5;">Your bag is empty.</p>';
        if (totalSpan) totalSpan.textContent = '₹0';
        return;
    }
    itemsDiv.innerHTML = state.cart.map(i => `
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:15px;">
            <img src="${i.image}" style="width:60px; height:60px; object-fit:cover; border-radius:8px;">
            <div style="flex:1;">
                <h4 style="font-size:0.9rem;">${i.name}</h4>
                <p style="font-size:0.8rem; color:#666;">₹${i.price} x ${i.quantity}</p>
            </div>
            <button onclick="removeFromCart('${i.productId}')" style="background:none; border:none; color:#fc2779; cursor:pointer; font-size:1.2rem;">&times;</button>
        </div>
    `).join('');
    const total = state.cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    if (totalSpan) totalSpan.textContent = `₹${total.toLocaleString()}`;

    if (!document.getElementById('checkoutBtn')) {
        const btn = document.createElement('button');
        btn.id = 'checkoutBtn';
        btn.className = 'btn btn-primary btn-block';
        btn.style.marginTop = '20px';
        btn.textContent = 'Proceed to Checkout';
        btn.onclick = () => window.location.href = '/checkout.html';
        document.querySelector('.cart-footer')?.appendChild(btn);
    }
}

window.removeFromCart = (id) => {
    state.cart = state.cart.filter(i => i.productId !== id);
    localStorage.setItem('cart', JSON.stringify(state.cart));
    updateCartBadge();
    renderCart();
};

function init3DHero() {
    const canvas = document.querySelector('#hero-canvas');
    if (!canvas) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    const geometry = new THREE.CylinderGeometry(0.7, 0.7, 2.2, 32);
    const material = new THREE.MeshPhongMaterial({ color: 0xfc2779, shininess: 100 });
    const bottle = new THREE.Mesh(geometry, material);
    scene.add(bottle);
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    camera.position.z = 4;
    function animate() { requestAnimationFrame(animate); bottle.rotation.y += 0.01; renderer.render(scene, camera); }
    animate();
}

function showNotification(msg) {
    const div = document.createElement('div');
    div.style.cssText = 'position:fixed; bottom:30px; right:30px; background:#fc2779; color:#fff; padding:15px 25px; border-radius:10px; z-index:99999; box-shadow:0 5px 20px rgba(0,0,0,0.1); animation:slideUp 0.3s;';
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => { div.style.opacity = '0'; setTimeout(() => div.remove(), 500); }, 2500);
}

function initViewAll() { document.getElementById('viewAllBtn')?.addEventListener('click', () => { document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }); }
function initForms() { }
function initScrollAnimations() { }
