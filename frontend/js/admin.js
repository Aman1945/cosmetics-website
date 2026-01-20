import { gsap } from 'gsap';

const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://cosmetics-website-1.onrender.com/api';

// Admin State
const state = {
    products: [],
    isAuthenticated: false
};

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initLogin();
    initNavigation();
    initProductManagement();
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

            if (item.dataset.view === 'products') {
                loadProducts();
            }
        });
    });
}

// Data Loading
async function loadDashboardData() {
    loadProducts();
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products?limit=100`);
        const data = await response.json();

        if (data.success) {
            state.products = data.data.products;
            renderProductsTable(state.products);
            document.getElementById('totalProductsCount').textContent = state.products.length;
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function renderProductsTable(products) {
    const tbody = document.getElementById('productsTableBody');
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

// REAL Save function calling the API with Auth Token
async function saveProduct(data, id = null) {
    try {
        const url = id ? `${API_URL}/products/${id}` : `${API_URL}/products`;
        const method = id ? 'PUT' : 'POST';
        const token = localStorage.getItem('adminToken');

        if (!token) {
            alert('Your session has expired. Please login again.');
            localStorage.removeItem('isAdmin');
            location.reload();
            return;
        }

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
            alert('Product saved permanently to Database! ✅');
        } else {
            alert('Error: ' + result.message);
        }
    } catch (e) {
        console.error('Save error:', e);
        alert('Server connection error. Data not saved.');
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

// Make functions global for HTML onclick attributes
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
                alert('Product deleted permanently! ✅');
                loadProducts();
            } else {
                alert('Error: ' + result.message);
            }
        } catch (e) {
            alert('Delete failed. Check connection.');
        }
    }
};
