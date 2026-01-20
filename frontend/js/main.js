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
        if (loginBtn) loginBtn.textContent = 'My Account';
    }
});

// Navigation
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
    }

    // Smooth scroll and auto-close mobile menu
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId.startsWith('#') && targetId.length > 1) {
                e.preventDefault();
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');

                    if (navMenu.classList.contains('active')) {
                        navMenu.classList.remove('active');
                        mobileToggle.classList.remove('active');
                    }
                }
            }
        });
    });
}

function initSearch() {
    // ... search logic (omitted for brevity, keep existing) ...
}

// Load Products from API
async function loadProducts(category = 'all') {
    const grid = document.getElementById('productsGrid');
    if (grid) grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem;">Loading products...</div>';

    try {
        let url = `${API_URL}/products?limit=20`;
        if (category !== 'all') url += `&category=${category}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            state.products = data.data.products;
            renderProducts(state.products);
        } else {
            if (grid) grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem;">No products found in database.</div>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        if (grid) grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem;">Unable to connect to server.</div>';
    }
}

// Render Products
function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem;">No products found.</div>';
        return;
    }

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
          <button class="add-to-cart-btn" onclick="addToCart('${product._id}')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');

    gsap.from('.product-card', {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.5,
        ease: 'power2.out'
    });
}

// Filter Products
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.dataset.category;
        state.currentCategory = category;
        loadProducts(category);
    });
});

// Cart Functions
function initCart() {
    const cartBtn = document.getElementById('cartBtn');
    const closeCart = document.getElementById('closeCart');
    const cartSidebar = document.getElementById('cartSidebar');
    const modalOverlay = document.getElementById('modalOverlay');

    cartBtn?.addEventListener('click', () => {
        cartSidebar.classList.add('active');
        modalOverlay.classList.add('active');
        renderCart();
    });

    closeCart?.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
        modalOverlay.classList.remove('active');
    });

    modalOverlay?.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
        modalOverlay.classList.remove('active');
    });
}

window.addToCart = function (productId) {
    const product = state.products.find(p => p._id === productId);
    if (!product) return;

    const existingItem = state.cart.find(item => item.productId === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        state.cart.push({
            productId: product._id,
            name: product.name,
            price: product.price,
            image: product.images[0]?.url,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(state.cart));
    updateCartBadge();
    renderCart();
    showNotification('Product added to cart!');
};

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
        const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalItems;
    }
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartFooter = document.querySelector('.cart-footer');

    if (!cartItems) return;

    if (state.cart.length === 0) {
        cartItems.innerHTML = '<div style="text-align:center; padding: 2rem; opacity: 0.5;">Your cart is empty</div>';
        if (cartTotal) cartTotal.textContent = '₹0';
        return;
    }

    const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    cartItems.innerHTML = state.cart.map(item => `
    <div class="cart-item" style="display:flex; gap:15px; margin-bottom:15px; padding-bottom:15px; border-bottom:1px solid #eee;">
      <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
      <div style="flex: 1;">
        <h4 style="font-size: 0.9rem; margin-bottom: 4px;">${item.name}</h4>
        <p style="font-size: 0.8rem; color: #666;">₹${item.price.toLocaleString()} × ${item.quantity}</p>
      </div>
      <button onclick="removeFromCart('${item.productId}')" style="background:none; border:none; color:#fc2779; cursor:pointer; font-size:1.2rem;">&times;</button>
    </div>
  `).join('');

    if (cartTotal) cartTotal.textContent = `₹${total.toLocaleString()}`;

    // Add Checkout Button if not already there
    if (!document.getElementById('checkoutBtn') && cartFooter) {
        const checkBtn = document.createElement('button');
        checkBtn.id = 'checkoutBtn';
        checkBtn.className = 'btn btn-primary btn-block';
        checkBtn.style.marginTop = '15px';
        checkBtn.textContent = 'Checkout Now';
        checkBtn.onclick = () => window.location.href = '/checkout.html';
        cartFooter.appendChild(checkBtn);
    }
}

window.removeFromCart = function (productId) {
    state.cart = state.cart.filter(item => item.productId !== productId);
    localStorage.setItem('cart', JSON.stringify(state.cart));
    updateCartBadge();
    renderCart();
};

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #fc2779; color: white;
        padding: 12px 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 5000; animation: slideIn 0.3s forwards;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ... Rest of the functions (3D Hero, etc.) ...
