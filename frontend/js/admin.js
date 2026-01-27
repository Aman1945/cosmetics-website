// Admin Panel Logic

// API Configuration - Improved for all local environments
const API_URL = (['localhost', '127.0.0.1', '::1'].includes(window.location.hostname) || window.location.hostname.startsWith('192.168.'))
    ? `http://${window.location.hostname}:5000/api`
    : 'https://cosmetics-website-1.onrender.com/api';

console.log('Admin API connected to:', API_URL);

// Admin State
const state = {
    products: [],
    orders: [],
    users: [],
    analytics: {},
    isAuthenticated: false
};

document.addEventListener('DOMContentLoaded', () => {
    // initNavigationProtection(); // Removed as per instruction 4
    checkAuth();
    initLogin();
    initNavigation();
    initProductManagement();
    initOrderManagement();
});

function checkAuth() {
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin === 'true') {
        state.isAuthenticated = true;
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('adminContainer').style.display = 'flex';
        loadDashboardData();
    }
}

function initLogin() {
    const loginForm = document.getElementById('adminLoginForm');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (result.success && result.data.user.role === 'admin') {
                localStorage.setItem('isAdmin', 'true');
                localStorage.setItem('adminToken', result.data.token);
                state.isAuthenticated = true;

                gsap.to('#loginOverlay', {
                    opacity: 0,
                    duration: 0.5,
                    onComplete: () => {
                        document.getElementById('loginOverlay').style.display = 'none';
                        document.getElementById('adminContainer').style.display = 'flex';
                        gsap.from('.admin-container', { opacity: 0, y: 20, duration: 0.5 });
                        loadDashboardData();
                    }
                });
            } else {
                alert(result.message || 'Access Denied: Not an admin!');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Check server connection.');
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('adminToken');
        location.reload();
    });
}

function initNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    const views = document.querySelectorAll('.view-section');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const viewId = item.dataset.view + 'View';
            views.forEach(view => {
                view.style.display = 'none';
                if (view.id === viewId) {
                    view.style.display = 'block';
                    gsap.from(view, { opacity: 0, y: 10, duration: 0.3 });
                }
            });

            if (item.dataset.view === 'products') loadProducts();
            if (item.dataset.view === 'orders') loadOrders();
            if (item.dataset.view === 'users') loadUsers();
            if (item.dataset.view === 'offers') loadOffers();
            if (item.dataset.view === 'dashboard') loadDashboardData();
        });
    });
}

// Data Loading
async function loadDashboardData() {
    // Instant Load: Show previous data if exists
    const cachedStats = JSON.parse(localStorage.getItem('admin_stats_cache'));
    if (cachedStats) {
        updateStatsUI(cachedStats.summary);
        renderRecentOrders(cachedStats.recentOrders);
    } else {
        // Show placeholders
        document.getElementById('recentOrdersTableBody').innerHTML = Array(3).fill(0).map(() => `
            <tr><td colspan="5"><div class="skeleton skeleton-text"></div></td></tr>
        `).join('');
    }

    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_URL}/admin/analytics`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            state.analytics = data.data.summary;
            updateStatsUI(state.analytics);
            renderRecentOrders(data.data.recentOrders || []);
            localStorage.setItem('admin_stats_cache', JSON.stringify(data.data));
            loadProducts();
        } else {
            alert('Failed to load dashboard data: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Analytics error:', error);
        alert('Error loading dashboard data. Please check your connection.');
    }
}

function updateStatsUI(summary) {
    if (!summary) return;
    document.getElementById('totalRevenue').textContent = `₹${(summary.totalRevenue || 0).toLocaleString()}`;
    document.getElementById('activeOrdersCount').textContent = summary.totalOrders || 0;
    document.getElementById('totalUsersCount').textContent = summary.totalUsers || 0;
    document.getElementById('pendingOrdersNote').textContent = `${summary.pendingOrders || 0} pending shipping`;
    document.getElementById('estimatedProfit').textContent = `Est. Profit: ₹${(summary.estimatedProfit || 0).toLocaleString()}`;

    // Total products count is handled in loadProducts
}

function renderRecentOrders(orders) {
    const tbody = document.getElementById('recentOrdersTableBody');
    if (!tbody || !orders) return;
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>#${(order._id || '').slice(-6)}</td>
            <td>${order.shippingAddress?.name || 'Unknown'}</td>
            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>₹${(order.total || 0).toLocaleString()}</td>
        </tr>
    `).join('');
}

async function loadProducts() {
    // Instant Load
    const cached = JSON.parse(localStorage.getItem('admin_products_cache'));
    if (cached) {
        state.products = cached;
        renderProductsTable(cached);
    } else {
        document.getElementById('productsTableBody').innerHTML = Array(5).fill(0).map(() => `
            <tr><td colspan="6"><div class="skeleton skeleton-text"></div></td></tr>
        `).join('');
    }

    try {
        const response = await fetch(`${API_URL}/products?limit=100`);
        const data = await response.json();

        if (data.success) {
            state.products = data.data.products;
            renderProductsTable(state.products);
            localStorage.setItem('admin_products_cache', JSON.stringify(state.products));
            const countElem = document.getElementById('totalProductsCount');
            if (countElem) countElem.textContent = state.products.length;
        } else {
            alert('Failed to load products: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error loading products:', error);
        alert('Error loading products. Please check your connection.');
    }
}

async function loadOrders() {
    // Instant Load
    const cached = JSON.parse(localStorage.getItem('admin_orders_cache'));
    if (cached) {
        state.orders = cached;
        renderOrdersTable(cached);
    }

    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            state.orders = data.data.orders;
            renderOrdersTable(state.orders);
            localStorage.setItem('admin_orders_cache', JSON.stringify(state.orders));
        } else {
            alert('Failed to load orders: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        alert('Error loading orders. Please check your connection.');
    }
}

async function loadUsers() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
            state.users = data.data.users;
            renderUsersTable(state.users);
        } else {
            alert('Failed to load users: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error loading users:', error);
        alert('Error loading users. Please check your connection.');
    }
}

async function loadOffers() {
    try {
        const response = await fetch(`${API_URL}/offers`);
        const data = await response.json();
        if (data.success) {
            state.offers = data.data.offers;
            renderOffersTable(state.offers);
        } else {
            alert('Failed to load offers: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error loading offers:', error);
        alert('Error loading offers. Please check your connection.');
    }
}

// function initNavigationProtection() { // Removed as per instruction 4
//     window.addEventListener('beforeunload', (e) => {
//         if (state.isAuthenticated) {
//             e.preventDefault();
//             e.returnValue = 'Are you sure you want to leave the admin panel?';
//         }
//     });
// }

function renderOffersTable(offers) {
    const tbody = document.getElementById('offersTableBody');
    if (!tbody) return;
    tbody.innerHTML = offers.map(offer => `
        <tr>
            <td style="font-weight: 600;">${offer.title}</td>
            <td><span class="status-badge" style="background: var(--off-white); color: var(--primary);">${offer.badge}</span></td>
            <td>${offer.targetProductId ? offer.targetProductId.name : 'Not Linked'}</td>
            <td><span class="status-badge ${offer.isActive ? 'status-delivered' : 'status-cancelled'}">${offer.isActive ? 'Active' : 'Inactive'}</span></td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="deleteOffer('${offer._id}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

window.openOfferModal = () => {
    document.getElementById('offerForm').reset();
    document.getElementById('offerModalTitle').textContent = 'Add New Offer';
    document.getElementById('offerModal').classList.add('active');
    document.getElementById('modalOverlay').classList.add('active');
};

document.getElementById('offerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const offerData = {
        title: document.getElementById('offerTitle').value,
        subtitle: document.getElementById('offerSubtitle').value,
        badge: document.getElementById('offerBadge').value,
        image: document.getElementById('offerImage').value,
        targetProductId: document.getElementById('offerProductId').value || null,
        isLarge: document.getElementById('offerIsLarge').value === 'true'
    };

    try {
        const res = await fetch(`${API_URL}/offers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}` // Fixed: Use adminToken
            },
            body: JSON.stringify(offerData)
        });
        const data = await res.json();
        if (data.success) {
            closeModal('offerModal');
            loadOffers();
            alert('Offer saved successfully!');
        } else {
            alert(data.message);
        }
    } catch (err) { console.error('Error saving offer:', err); }
});

window.deleteOffer = async (id) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    try {
        const res = await fetch(`${API_URL}/offers/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` } // Fixed: Use adminToken
        });
        const data = await res.json();
        if (data.success) {
            loadOffers();
            alert('Offer deleted');
        }
    } catch (err) { console.error('Error deleting offer:', err); }
};

window.closeModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none'; // Fallback for old style
    }
    document.getElementById('modalOverlay').classList.remove('active');
};

function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    tbody.innerHTML = users.map(user => `
        <tr>
            <td style="font-weight: 600;">${user.name}</td>
            <td>${user.email}</td>
            <td><span class="status-badge" style="background: #eee; color: #333;">${user.role}</span></td>
            <td>
                <span class="status-badge ${user.isActive ? 'status-delivered' : 'status-cancelled'}">
                    ${user.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

function renderProductsTable(products) {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    tbody.innerHTML = products.map(product => `
        <tr>
            <td><img src="${product.images[0]?.url || 'https://via.placeholder.com/50'}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;"></td>
            <td>${product.name}</td>
            <td><span style="text-transform: capitalize;">${product.category}</span></td>
            <td>₹${product.price}</td>
            <td>${product.stock || 50}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editProduct('${product._id}')">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteProduct('${product._id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

function renderOrdersTable(orders) {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>#${(order._id || '').slice(-6)}</td>
            <td>${order.shippingAddress?.name || 'Unknown'}<br><small>${order.shippingAddress?.phone || ''}</small></td>
            <td>${order.items?.length || 0} items</td>
            <td>₹${(order.total || 0).toLocaleString()}</td>
            <td>
                <select onchange="updateOrderStatus('${order._id}', this.value)" class="status-select status-${order.status}">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

// Product Management
function initProductManagement() {
    const modal = document.getElementById('productModal');
    const addBtn = document.getElementById('addProductBtn');
    const closeBtn = document.getElementById('closeProductModal');
    const form = document.getElementById('productForm');

    addBtn?.addEventListener('click', () => openModal());
    closeBtn?.addEventListener('click', () => closeModal('productModal'));

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const productId = document.getElementById('productId').value;
        const productData = {
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            brand: document.getElementById('productBrand').value,
            price: parseFloat(document.getElementById('productPrice').value),
            stock: parseInt(document.getElementById('productStock').value),
            description: document.getElementById('productDescription').value || 'Premium product',
            images: [{ url: document.getElementById('productImage').value, alt: document.getElementById('productName').value }],
            isFeatured: document.getElementById('productFeatured').checked
        };

        await saveProduct(productData, productId);
        closeModal('productModal');
        loadProducts();
    });
}

function initOrderManagement() {
    // For now, order management is handled by direct actions
}

window.updateOrderStatus = async (id, status) => {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_URL}/orders/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        const data = await response.json();
        if (data.success) {
            alert('Order status updated!');
            loadDashboardData();
            loadOrders(); // Refresh order table too
        } else {
            alert('Status update failed: ' + data.message);
        }
    } catch (e) {
        alert('Update failed: Server connection error');
    }
};

async function saveProduct(data, id = null) {
    try {
        const url = id ? `${API_URL}/products/${id}` : `${API_URL}/products`;
        const method = id ? 'PUT' : 'POST';
        const token = localStorage.getItem('adminToken');

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.success) {
            alert('Product saved permanently! ✅');
        } else {
            alert('Error: ' + result.message);
        }
    } catch (e) {
        console.error('Save error:', e);
        alert('Server connection error.');
    }
}

function openModal(product = null) {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('modalTitle');

    if (product) {
        title.textContent = 'Edit Product';
        document.getElementById('productId').value = product._id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productBrand').value = product.brand;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock || 50;
        document.getElementById('productImage').value = product.images[0]?.url || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productFeatured').checked = product.isFeatured;
    } else {
        title.textContent = 'Add New Product';
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        document.getElementById('productImage').value = 'https://via.placeholder.com/300x300/FC2779/FFFFFF?text=New+Product';
    }

    modal.classList.add('active');
    modal.style.display = 'block'; // Fallback for old style
    document.getElementById('modalOverlay').classList.add('active');
}

// Global functions
window.editProduct = (id) => {
    const product = state.products.find(p => p._id === id);
    if (product) openModal(product);
};

window.deleteProduct = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
        const token = localStorage.getItem('adminToken');
        try {
            const response = await fetch(`${API_URL}/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                alert('Product deleted! ✅');
                loadProducts();
            }
        } catch (e) {
            alert('Delete failed');
        }
    }
};
