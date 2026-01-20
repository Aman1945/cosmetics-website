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
    user: null,
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
            e.preventDefault();
            const targetId = link.getAttribute('href');
            if (targetId === '#' || !targetId) return;
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
        });
    });
}
function initSearch() {
    const searchBtn = document.getElementById('searchBtn');

    // Create Search Overlay if not exists
    if (!document.getElementById('searchOverlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'searchOverlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(255,255,255,0.95); z-index: 2500;
            display: none; align-items: center; justify-content: center;
            flex-direction: column;
        `;
        overlay.innerHTML = `
            <div style="position: relative; width: 80%; max-width: 600px;">
                <input type="text" id="searchInput" placeholder="Search for products..." 
                    style="width: 100%; padding: 20px; font-size: 1.5rem; border: none; border-bottom: 2px solid var(--primary); background: transparent; outline: none;">
                <button id="closeSearch" style="position: absolute; right: 0; top: -40px; background: none; border: none; font-size: 2rem; cursor: pointer;">&times;</button>
            </div>
            <div id="searchResults" style="margin-top: 2rem; width: 80%; max-width: 800px; max-height: 60vh; overflow-y: auto;"></div>
        `;
        document.body.appendChild(overlay);

        // Event Listeners for Search
        const searchInput = document.getElementById('searchInput');
        const closeSearch = document.getElementById('closeSearch');
        const searchResults = document.getElementById('searchResults');

        searchBtn?.addEventListener('click', () => {
            overlay.style.display = 'flex';
            searchInput.focus();
            gsap.from(overlay, { opacity: 0, duration: 0.3 });
        });

        closeSearch?.addEventListener('click', () => {
            overlay.style.display = 'none';
        });

        // Live Search Logic
        searchInput?.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (query.length < 2) {
                searchResults.innerHTML = '';
                return;
            }

            const filtered = state.products.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query)
            );

            if (filtered.length === 0) {
                searchResults.innerHTML = '<p style="text-align: center; color: var(--gray);">No products found.</p>';
                return;
            }

            searchResults.innerHTML = `
                <div class="products-grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
                    ${filtered.map(product => `
                        <div class="product-card" onclick="window.location.hash = 'products'; document.getElementById('searchOverlay').style.display='none';">
                           <div class="product-image" style="height: 200px;">
                                <img src="${product.images[0]?.url || 'https://via.placeholder.com/300'}" alt="${product.name}">
                           </div>
                           <div class="product-info">
                                <h5>${product.name}</h5>
                                <div class="product-price">₹${product.price}</div>
                           </div>
                        </div>
                    `).join('')}
                </div>
            `;
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') overlay.style.display = 'none';
        });
    }
}

// 3D Hero Animation with Three.js
function init3DHero() {
    const canvas = document.getElementById('hero3DCanvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create cosmetic bottle geometry
    const bottleGroup = new THREE.Group();

    // Bottle body
    const bottleGeometry = new THREE.CylinderGeometry(0.5, 0.6, 2, 32);
    const bottleMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xff6ba9,
        metalness: 0.2,
        roughness: 0.1,
        transparent: true,
        opacity: 0.9,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
    });
    const bottle = new THREE.Mesh(bottleGeometry, bottleMaterial);
    bottleGroup.add(bottle);

    // Bottle cap
    const capGeometry = new THREE.CylinderGeometry(0.55, 0.55, 0.3, 32);
    const capMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffd700,
        metalness: 0.9,
        roughness: 0.1
    });
    const cap = new THREE.Mesh(capGeometry, capMaterial);
    cap.position.y = 1.15;
    bottleGroup.add(cap);

    // Add particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        color: 0x00d9ff,
        size: 0.02,
        transparent: true,
        opacity: 0.6
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    scene.add(bottleGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xe94b8c, 2);
    pointLight1.position.set(2, 2, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x6c5ce7, 2);
    pointLight2.position.set(-2, -2, 2);
    scene.add(pointLight2);

    camera.position.z = 5;

    // Animation
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    function animate() {
        requestAnimationFrame(animate);

        // Rotate bottle
        bottleGroup.rotation.y += 0.005;
        bottleGroup.rotation.x = mouseY * 0.3;
        bottleGroup.rotation.y += mouseX * 0.01;

        // Animate particles
        particles.rotation.y += 0.001;

        renderer.render(scene, camera);
    }

    animate();

    // Handle resize
    window.addEventListener('resize', () => {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
}

// Load Products from API
async function loadProducts(category = 'all') {
    try {
        let url = `${API_URL}/products?limit=12`;
        if (category !== 'all') {
            url += `&category=${category}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            state.products = data.data.products;
            renderProducts(state.products);
        }
    } catch (error) {
        console.error('Error loading products:', error);
        // Load sample products if API fails
        loadSampleProducts();
    }
}

// Load Sample Products (fallback)
function loadSampleProducts() {
    const sampleProducts = [
        {
            _id: '1',
            name: 'Velvet Matte Lipstick',
            category: 'lipstick',
            brand: 'LuxeGlow',
            price: 1299,
            rating: { average: 4.8, count: 245 },
            images: [{ url: 'https://via.placeholder.com/300x300/E94B8C/FFFFFF?text=Lipstick', alt: 'Lipstick' }],
            stock: 50,
            isFeatured: true
        },
        {
            _id: '2',
            name: 'Radiant Foundation',
            category: 'foundation',
            brand: 'LuxeGlow',
            price: 2499,
            rating: { average: 4.9, count: 189 },
            images: [{ url: 'https://via.placeholder.com/300x300/6C5CE7/FFFFFF?text=Foundation', alt: 'Foundation' }],
            stock: 30,
            isFeatured: true
        },
        {
            _id: '3',
            name: 'Shimmer Eyeshadow Palette',
            category: 'eyeshadow',
            brand: 'LuxeGlow',
            price: 1899,
            rating: { average: 4.7, count: 312 },
            images: [{ url: 'https://via.placeholder.com/300x300/00D9FF/FFFFFF?text=Eyeshadow', alt: 'Eyeshadow' }],
            stock: 45,
            isFeatured: true
        },
        {
            _id: '4',
            name: 'Volume Mascara',
            category: 'mascara',
            brand: 'LuxeGlow',
            price: 999,
            rating: { average: 4.6, count: 156 },
            images: [{ url: 'https://via.placeholder.com/300x300/FFD700/000000?text=Mascara', alt: 'Mascara' }],
            stock: 60,
            isFeatured: false
        },
        {
            _id: '5',
            name: 'Hydrating Serum',
            category: 'skincare',
            brand: 'LuxeGlow',
            price: 3499,
            rating: { average: 4.9, count: 423 },
            images: [{ url: 'https://via.placeholder.com/300x300/E94B8C/FFFFFF?text=Serum', alt: 'Serum' }],
            stock: 25,
            isFeatured: true
        },
        {
            _id: '6',
            name: 'Luxury Perfume',
            category: 'fragrance',
            brand: 'LuxeGlow',
            price: 5999,
            rating: { average: 5.0, count: 89 },
            images: [{ url: 'https://via.placeholder.com/300x300/6C5CE7/FFFFFF?text=Perfume', alt: 'Perfume' }],
            stock: 15,
            isFeatured: true
        }
    ];

    state.products = sampleProducts;
    renderProducts(sampleProducts);
}

// Render Products
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
          <span class="stars">${'★'.repeat(Math.round(product.rating.average))}${'☆'.repeat(5 - Math.round(product.rating.average))}</span>
          <span class="rating-count">(${product.rating.count})</span>
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

    // Animate cards
    gsap.from('.product-card', {
        opacity: 0,
        y: 50,
        stagger: 0.1,
        duration: 0.6,
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

    // Show notification
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

    if (!cartItems) return;

    if (state.cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartTotal.textContent = '₹0.00';
        return;
    }

    const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    cartItems.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
      <div style="flex: 1;">
        <h4 style="margin-bottom: 0.25rem;">${item.name}</h4>
        <p style="color: var(--gray); margin: 0;">₹${item.price.toLocaleString()} × ${item.quantity}</p>
      </div>
      <button onclick="removeFromCart('${item.productId}')" style="color: var(--primary); background: none; border: none; cursor: pointer; font-size: 1.5rem;">&times;</button>
    </div>
  `).join('');

    cartTotal.textContent = `₹${total.toLocaleString()}`;
}

window.removeFromCart = function (productId) {
    state.cart = state.cart.filter(item => item.productId !== productId);
    localStorage.setItem('cart', JSON.stringify(state.cart));
    updateCartBadge();
    renderCart();
};

// Forms
function initForms() {
    const contactForm = document.getElementById('contactForm');

    contactForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        showNotification('Message sent successfully!');
        contactForm.reset();
    });
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.6s ease';
        observer.observe(section);
    });
}

// Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: var(--gradient-primary);
    color: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    z-index: 3000;
    animation: slideIn 0.3s ease;
  `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Load sample products on init
// View All Button Logic
function initViewAll() {
    const viewAllBtn = document.getElementById('viewAllBtn');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            const productsSection = document.getElementById('products');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth' });
                // Activate 'All' filter
                const allBtn = document.querySelector('.filter-btn[data-category="all"]');
                if (allBtn) allBtn.click();
            }
        });
    }
}

// Login Modal Logic
function initLoginModal() {
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeBtn = document.getElementById('closeLoginModal');
    const overlay = document.getElementById('modalOverlay');

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            if (loginModal) {
                loginModal.style.display = 'flex';
                loginModal.classList.add('active');
                if (overlay) overlay.classList.add('active');
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (loginModal) loginModal.style.display = 'none';
            if (overlay) overlay.classList.remove('active');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            if (loginModal) loginModal.style.display = 'none';
            overlay.classList.remove('active');
        });
    }

    const form = document.getElementById('userLoginForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            showNotification('Successfully logged in! (Demo)');
            if (loginModal) loginModal.style.display = 'none';
            if (overlay) overlay.classList.remove('active');
            if (loginBtn) loginBtn.textContent = 'My Account';
        });
    }

    // Social & Sign Up Buttons
    const googleBtn = document.getElementById('googleLoginBtn');
    const phoneBtn = document.getElementById('phoneLoginBtn');
    const signUpBtn = document.getElementById('signUpBtn');

    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            showNotification('Connecting to Google... (Demo)');
            setTimeout(() => {
                showNotification('Logged in with Google!');
                if (loginModal) loginModal.style.display = 'none';
                if (overlay) overlay.classList.remove('active');
                if (loginBtn) loginBtn.textContent = 'Account (G)';
            }, 1000);
        });
    }

    if (phoneBtn) {
        phoneBtn.addEventListener('click', () => {
            const phone = prompt('Enter your phone number:');
            if (phone) {
                showNotification('OTP sent to ' + phone);
                if (loginModal) loginModal.style.display = 'none';
                if (overlay) overlay.classList.remove('active');
                if (loginBtn) loginBtn.textContent = 'Account (P)';
            }
        });
    }

    if (signUpBtn) {
        signUpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showNotification('Redirecting to Sign Up page... (Demo)');
        });
    }
}

// Load sample products on init
loadSampleProducts();
