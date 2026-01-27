import { gsap } from 'gsap';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://cosmetics-website-1.onrender.com/api';

// Admin State
const state = {
    products: [],
    orders: [],
    users: [],
    analytics: {},
    isAuthenticated: false
};

document.addEventListener('DOMContentLoaded', () => {
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
            if (item.dataset.view === 'dashboard') loadDashboardData();
        });
    });
}

// Data Loading
async function loadDashboardData() {
    try {
        const response = await fetch(`${API_URL}/admin/analytics`);
        const data = await response.json();

        if (data.success) {
            state.analytics = data.data.summary;
            document.getElementById('totalRevenue').textContent = `₹${state.analytics.totalRevenue.toLocaleString()}`;
            document.getElementById('activeOrdersCount').textContent = state.analytics.totalOrders;
            document.getElementById('totalProductsCount').textContent = 'Loading...';
            document.getElementById('totalUsersCount').textContent = state.analytics.totalUsers;
            document.getElementById('pendingOrdersNote').textContent = `${state.analytics.pendingOrders} pending shipping`;
            document.getElementById('estimatedProfit').textContent = `Est. Profit: ₹${state.analytics.estimatedProfit.toLocaleString()}`;

            renderRecentOrders(data.data.recentOrders);
            loadProducts(); // Update product count
        }
    } catch (error) {
        console.error('Analytics error:', error);
    }
}

function renderRecentOrders(orders) {
    const tbody = document.getElementById('recentOrdersTableBody');
    if (!tbody) return;
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>#${order._id.slice(-6)}</td>
            <td>${order.shippingAddress.name}</td>
            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>₹${order.total.toLocaleString()}</td>
        </tr>
    `).join('');
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products?limit=100`);
        const data = await response.json();

        if (data.success) {
            state.products = data.data.products;
            renderProductsTable(state.products);
            const countElem = document.getElementById('totalProductsCount');
            if (countElem) countElem.textContent = state.products.length;
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

async function loadOrders() {
    try {
        const response = await fetch(`${API_URL}/orders`);
        const data = await response.json();

        if (data.success) {
            state.orders = data.data.orders;
            renderOrdersTable(state.orders);
        }
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/admin/users`);
        const data = await response.json();

        if (data.success) {
            state.users = data.data.users;
            renderUsersTable(state.users);
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

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
            <td>#${order._id.slice(-6)}</td>
            <td>${order.shippingAddress.name}<br><small>${order.shippingAddress.phone}</small></td>
            <td>${order.items.length} items</td>
            <td>₹${order.total.toLocaleString()}</td>
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
    closeBtn?.addEventListener('click', () => modal.style.display = 'none');

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
        modal.style.display = 'none';
        loadProducts();
    });
}

function initOrderManagement() {
    // For now, order management is handled by direct actions
}

window.updateOrderStatus = async (id, status) => {
    try {
        const response = await fetch(`${API_URL}/orders/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        const data = await response.json();
        if (data.success) {
            alert('Order status updated!');
            loadDashboardData();
        }
    } catch (e) {
        alert('Update failed');
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

    modal.style.display = 'block';
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
