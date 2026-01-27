// API Configuration with LIVE FALLBACK
const LIVE_API = 'https://cosmetics-website-1.onrender.com/api';
let API_URL = LIVE_API; // Default to Live to be safe

// Check if we are running locally
const isLocal = ['localhost', '127.0.0.1', '::1', ''].includes(window.location.hostname) || window.location.hostname.startsWith('192.168.');

if (isLocal) {
    API_URL = `http://${window.location.hostname || 'localhost'}:5000/api`;
}

// Global state
const state = {
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    user: JSON.parse(localStorage.getItem('user')) || null,
    products: [],
    currentCategory: 'all',
    searchQuery: ''
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initNavigationProtection();
    initNavigation();
    initSearch();
    initCart();
    initFilters();
    initLoginModal();
    init3DHero();
    loadOffers();
    loadProducts();
    initViewAll();
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
                <input type="text" id="searchInput" placeholder="Search Professional Beauty..." 
                    style="width: 100%; padding: 20px; font-size: 1.5rem; border: none; border-bottom: 2px solid var(--secondary); outline: none; background: transparent;">
                <button id="closeSearch" style="position: absolute; right: 0; top: -50px; background: none; border: none; font-size: 2.5rem; cursor: pointer; color: var(--primary);">&times;</button>
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

async function loadOffers() {
    try {
        const response = await fetch(`${API_URL}/offers`);
        const data = await response.json();
        if (data.success) {
            renderOffers(data.data.offers);
        }
    } catch (error) { console.error('Error loading offers:', error); }
}

function renderOffers(offers) {
    const grid = document.getElementById('offersGrid');
    if (!grid) return;

    if (offers.length === 0) {
        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No current offers.</p>';
        return;
    }

    grid.innerHTML = offers.map(offer => `
        <div class="offer-card ${offer.isLarge ? 'offer-large' : ''}">
            <div class="offer-content">
                <span class="offer-badge">${offer.badge}</span>
                <h3 style="${offer.isLarge ? '' : 'font-size: 1.5rem;'}">${offer.title}</h3>
                <p>${offer.subtitle}</p>
                ${offer.targetProductId ? `
                    <div class="stock-info" style="margin-bottom: 15px; color: var(--secondary); font-weight: 600;">
                        Only ${offer.targetProductId.stock} pieces left!
                    </div>
                ` : ''}
                <button class="btn ${offer.isLarge ? 'btn-primary' : 'btn-secondary'}" 
                    onclick="${offer.targetProductId ? `window.location.href='/product.html?id=${offer.targetProductId._id}'` : ''}">
                    ${offer.isLarge ? 'Shop Now' : 'Explore'}
                </button>
            </div>
            ${offer.isLarge ? `
                <div class="offer-visual">
                    <div class="offer-circle" style="background: url('${offer.image}') no-repeat center/cover;"></div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

async function loadProducts(category = 'all', limit = 12) {
    state.currentCategory = category;

    // Instant Load: Show cached products for this category
    const cacheKey = `cached_products_${category}_${limit}`;
    const cached = JSON.parse(localStorage.getItem(cacheKey));
    if (cached && cached.length > 0) {
        renderProducts(cached);
    } else {
        renderSkeletons();
    }

    try {
        let url = `${API_URL}/products?limit=${limit}`;
        if (category !== 'all') url += `&category=${category}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            state.products = data.data.products;
            renderProducts(state.products);
            localStorage.setItem(cacheKey, JSON.stringify(state.products));

            // Add Info Bar
            const grid = document.getElementById('productsGrid');
            const total = data.data.pagination?.total || state.products.length;
            const existingInfo = document.getElementById('productResultsInfo');
            if (existingInfo) existingInfo.remove();

            const info = document.createElement('div');
            info.id = 'productResultsInfo';
            info.style.cssText = 'grid-column: 1/-1; text-align: left; margin-bottom: 20px; font-weight: 500; border-bottom: 1px solid #eee; padding-bottom: 10px; color: #1a1a1a;';
            info.innerHTML = `Showing <b>${state.products.length}</b> of <b>${total}</b> products in <b>${category.toUpperCase()}</b>`;
            grid.parentElement.insertBefore(info, grid);
        }
    } catch (error) {
        console.error('API Error:', error);
    }
}

function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update UI
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Reload data
            const category = btn.dataset.category;
            loadProducts(category);
        });
    });
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 50px; color: var(--gray);">No products found in this category.</div>';
        grid.style.opacity = '1';
        return;
    }

    grid.innerHTML = products.map(product => `
        <div class="product-card" data-category="${product.category}">
            <div class="product-image-container" onclick="window.location.href='/product.html?id=${product._id}'" style="cursor: pointer;">
                <img src="${product.images[0]?.url || 'https://via.placeholder.com/300'}" 
                     alt="${product.name}" 
                     class="product-image" 
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/300?text=Product+Image'">
                ${product.isFeatured ? '<span class="featured-badge">Featured</span>' : ''}
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name" onclick="window.location.href='/product.html?id=${product._id}'" style="cursor: pointer;">${product.name}</h3>
                <div class="product-rating" style="margin-bottom: 8px; display: flex; align-items: center; gap: 5px;">
                    <span style="color: #ffc107;">★</span>
                    <span style="font-weight: 600; font-size: 0.85rem;">${product.rating?.average || '0.0'}</span>
                    <span style="color: #888; font-size: 0.8rem;">(${product.rating?.count || 0})</span>
                </div>
                <div style="font-size: 0.8rem; color: ${product.stock < 20 ? '#d32f2f' : '#666'}; margin-bottom: 10px;">
                    ${product.stock < 20 ? '⚠️ Low Stock: ' : 'Stock: '} <b>${product.stock}</b> units
                </div>
                <div class="product-footer">
                    <div class="product-price">₹${product.price.toLocaleString()}</div>
                    <button class="btn btn-primary btn-sm" onclick="addToCart('${product._id}')">
                        Add to Bag
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    setTimeout(() => {
        grid.style.opacity = '1';
        grid.style.transition = 'opacity 0.3s ease-in';
    }, 10);
}

function renderSkeletons() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.innerHTML = Array(8).fill(0).map(() => `
        <div class="product-card skeleton-card">
            <div class="skeleton skeleton-img"></div>
            <div class="product-info">
                <div class="skeleton skeleton-text" style="width: 30%"></div>
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text" style="width: 40%"></div>
                <div class="product-footer" style="gap: 10px">
                    <div class="skeleton skeleton-text" style="width: 50%"></div>
                    <div class="skeleton skeleton-btn"></div>
                </div>
            </div>
        </div>
    `).join('');
}

function isFavorite(id) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    return favorites.includes(id);
}

window.toggleFavorite = function (id) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (favorites.includes(id)) {
        favorites = favorites.filter(fid => fid !== id);
        showNotification('Removed from favorites');
    } else {
        favorites.push(id);
        showNotification('❤️ Added to favorites!');
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    loadProducts(state.currentCategory);
};

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
            window.location.href = './profile.html';
        } else {
            window.location.href = './auth.html';
        }
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
            <button onclick="removeFromCart('${i.productId}')" style="background:none; border:none; color:var(--primary); cursor:pointer; font-size:1.2rem;">&times;</button>
        </div>
    `).join('');
    const total = state.cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    if (totalSpan) totalSpan.textContent = `₹${total.toLocaleString()}`;
}

window.removeFromCart = (id) => {
    state.cart = state.cart.filter(i => i.productId !== id);
    localStorage.setItem('cart', JSON.stringify(state.cart));
    updateCartBadge();
    renderCart();
};

function init3DHero() {
    const canvas = document.querySelector('#hero3DCanvas');
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
    div.style.cssText = 'position:fixed; bottom:30px; right:30px; background:var(--primary); color:#fff; padding:15px 25px; border-radius:10px; z-index:99999; box-shadow:var(--shadow-lg); border-left: 5px solid var(--secondary); animation:slideUp 0.3s;';
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => { div.style.opacity = '0'; setTimeout(() => div.remove(), 500); }, 2500);
}

function initViewAll() {
    document.getElementById('viewAllBtn')?.addEventListener('click', () => {
        loadProducts('all', 500); // Load all products
        document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    });
}
function initNavigationProtection() {
    window.addEventListener('beforeunload', (e) => {
        if (state.user || state.cart.length > 0) {
            // Standard browser confirmation
            e.preventDefault();
            e.returnValue = '';
        }
    });

    // Optional: Intercept internal link clicks if needed, 
    // but beforeunload handles the most critical 'browser exit' cases.
}

function initForms() { }
function initScrollAnimations() { }
