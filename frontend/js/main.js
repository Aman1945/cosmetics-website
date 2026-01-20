import * as THREE from 'three';
import { gsap } from 'gsap';

// API Configuration
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://cosmetics-website-1.onrender.com/api';

let authToken = localStorage.getItem('authToken');

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

    // Check if user is logged in
    if (state.user) {
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) loginBtn.textContent = state.user.name;
    }
});

// Navigation
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
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

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId && targetId.startsWith('#') && targetId.length > 1) {
                e.preventDefault();
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                    if (navMenu) {
                        navMenu.classList.remove('active');
                        mobileToggle.classList.remove('active');
                    }
                }
            }
        });
    });
}

// Search System
function initSearch() {
    const searchBtn = document.getElementById('searchBtn');
    let overlay = document.getElementById('searchOverlay');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'searchOverlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(255,255,255,0.98); z-index: 5000;
            display: none; align-items: center; justify-content: center;
            flex-direction: column; padding: 20px;
        `;
        overlay.innerHTML = `
            <div style="width: 100%; max-width: 600px; position: relative;">
                <input type="text" id="searchInput" placeholder="Search products..." 
                    style="width: 100%; padding: 20px; font-size: 1.5rem; border: none; border-bottom: 2px solid #fc2779; outline: none; background: transparent;">
                <button id="closeSearch" style="position: absolute; right: 0; top: -50px; background: none; border: none; font-size: 2.5rem; cursor: pointer; color: #fc2779;">&times;</button>
            </div>
            <div id="searchResults" style="margin-top: 30px; width: 100%; max-width: 800px; max-height: 60vh; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px;"></div>
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
        const results = state.products.filter(p => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term));

        const resultsBox = document.getElementById('searchResults');
        if (resultsBox) {
            resultsBox.innerHTML = results.map(p => `
                <div onclick="overlay.style.display='none'; document.querySelector('[data-product-id=\\'${p._id}\\']').scrollIntoView({behavior:'smooth'})" style="cursor: pointer; text-align: center; background: #fff; padding: 10px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    <img src="${p.images[0]?.url}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px;">
                    <h4 style="font-size: 0.8rem; margin-top: 5px;">${p.name}</h4>
                    <p style="color: #fc2779; font-weight: bold; font-size: 0.9rem;">₹${p.price}</p>
                </div>
            `).join('');
        }
    });
}

// 3D Hero Animation
function init3DHero() {
    const canvas = document.querySelector('#hero-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    // Create a luxury cosmetic bottle shape
    const bottleGroup = new THREE.Group();

    const bodyGeom = new THREE.CylinderGeometry(0.8, 0.8, 2.5, 32);
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0xfc2779, shininess: 100 });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    bottleGroup.add(body);

    const capGeom = new THREE.CylinderGeometry(0.85, 0.85, 0.6, 32);
    const capMat = new THREE.MeshPhongMaterial({ color: 0xd4af37, shininess: 150 });
    const cap = new THREE.Mesh(capGeom, capMat);
    cap.position.y = 1.5;
    bottleGroup.add(cap);

    scene.add(bottleGroup);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    camera.position.z = 5;

    function animate() {
        requestAnimationFrame(animate);
        bottleGroup.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
}

// Load Products
async function loadProducts(category = 'all') {
    const grid = document.getElementById('productsGrid');
    try {
        let url = `${API_URL}/products?limit=20`;
        if (category !== 'all') url += `&category=${category}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            state.products = data.data.products;
            renderProducts(state.products);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    grid.innerHTML = products.map(product => `
        <div class="product-card" data-product-id="${product._id}">
            <div class="product-image">
                <img src="${product.images[0]?.url || 'https://via.placeholder.com/300'}" alt="${product.name}">
                ${product.isFeatured ? '<span class="product-badge">Featured</span>' : ''}
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-rating">
                    <span class="stars">★★★★★</span>
                    <span class="rating-count">(99+)</span>
                </div>
                <div class="product-footer">
                    <div class="product-price">₹${product.price.toLocaleString()}</div>
                    <button class="add-to-cart-btn" onclick="addToCart('${product._id}')">Add</button>
                </div>
            </div>
        </div>
    `).join('');

    gsap.from('.product-card', { opacity: 0, y: 20, stagger: 0.05, duration: 0.4 });
}

// Filter Logic
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadProducts(btn.dataset.category);
    });
});

// Auth Logic
function initLoginModal() {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            if (state.user) {
                if (confirm('Logout as ' + state.user.name + '?')) {
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    localStorage.removeItem('isAdmin');
                    window.location.reload();
                }
            } else {
                window.location.href = '/auth.html';
            }
        });
    }
}

// Cart Management
function initCart() {
    const cartBtn = document.getElementById('cartBtn');
    const closeCart = document.getElementById('closeCart');
    const cartSidebar = document.getElementById('cartSidebar');
    const modalOverlay = document.getElementById('modalOverlay');

    cartBtn?.addEventListener('click', () => {
        cartSidebar?.classList.add('active');
        modalOverlay?.classList.add('active');
        renderCart();
    });

    closeCart?.addEventListener('click', close);
    modalOverlay?.addEventListener('click', close);

    function close() {
        cartSidebar?.classList.remove('active');
        modalOverlay?.classList.remove('active');
    }
}

window.addToCart = function (productId) {
    const product = state.products.find(p => p._id === productId);
    if (!product) return;

    const existing = state.cart.find(i => i.productId === productId);
    if (existing) existing.quantity++;
    else state.cart.push({ productId: product._id, name: product.name, price: product.price, image: product.images[0]?.url, quantity: 1 });

    localStorage.setItem('cart', JSON.stringify(state.cart));
    updateCartBadge();
    showNotification('Added to cart!');
};

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) badge.textContent = state.cart.reduce((s, i) => s + i.quantity, 0);
}

function renderCart() {
    const itemsDiv = document.getElementById('cartItems');
    const totalSpan = document.getElementById('cartTotal');

    if (!itemsDiv) return;

    if (state.cart.length === 0) {
        itemsDiv.innerHTML = '<p style="text-align:center; padding:20px;">Cart is empty</p>';
        if (totalSpan) totalSpan.textContent = '₹0';
        return;
    }

    itemsDiv.innerHTML = state.cart.map(i => `
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px;">
            <img src="${i.image}" style="width:50px; height:50px; object-fit:cover; border-radius:5px;">
            <div style="flex:1;">
                <h4 style="font-size:0.85rem;">${i.name}</h4>
                <p style="font-size:0.75rem;">₹${i.price} x ${i.quantity}</p>
            </div>
            <button onclick="removeFromCart('${i.productId}')" style="background:none; border:none; color:#fc2779; cursor:pointer;">&times;</button>
        </div>
    `).join('');

    const total = state.cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    if (totalSpan) totalSpan.textContent = `₹${total.toLocaleString()}`;

    // Checkout button
    const footer = document.querySelector('.cart-footer');
    if (footer && !document.getElementById('checkoutBtn')) {
        const btn = document.createElement('button');
        btn.id = 'checkoutBtn';
        btn.className = 'btn btn-primary btn-block';
        btn.style.marginTop = '10px';
        btn.textContent = 'Checkout Now';
        btn.onclick = () => window.location.href = '/checkout.html';
        footer.appendChild(btn);
    }
}

window.removeFromCart = (id) => {
    state.cart = state.cart.filter(i => i.productId !== id);
    localStorage.setItem('cart', JSON.stringify(state.cart));
    updateCartBadge();
    renderCart();
};

// Utilities
function initViewAll() {
    document.getElementById('viewAllBtn')?.addEventListener('click', () => {
        document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    });
}

function initForms() {
    document.getElementById('contactForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('Message sent!');
    });
}

function initScrollAnimations() {
    gsap.from('.hero-content', { opacity: 0, x: -50, duration: 1 });
}

function showNotification(msg) {
    const div = document.createElement('div');
    div.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#fc2779; color:#fff; padding:10px 20px; border-radius:5px; z-index:9000; animation:fadeIn 0.3s;';
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}
