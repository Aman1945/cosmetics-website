const API_URL = ['localhost', '127.0.0.1', '', '::1'].includes(window.location.hostname)
    ? 'http://localhost:5000/api'
    : 'https://cosmetics-website-1.onrender.com/api';

let state = {
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    user: JSON.parse(localStorage.getItem('user')) || null,
    address: null,
    paymentMethod: 'cod',
    currentStep: 2
};

document.addEventListener('DOMContentLoaded', () => {
    if (state.cart.length === 0) {
        document.getElementById('checkoutLayout').style.display = 'none';
        document.getElementById('emptyCheckout').style.display = 'block';
        return;
    }

    checkAuth();
    updatePriceSummary();
    renderStep3Items();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
        window.location.href = '/auth.html?redirect=checkout';
        return;
    }

    state.user = user;
    document.getElementById('userDisplay').textContent = `${user.name} (${user.email})`;

    // Auto-fill address if user has it
    if (user.address) {
        document.getElementById('fullName').value = user.name;
        document.getElementById('address').value = user.address;
        // Other fields might be missing in simplified user model
    }
}

window.toggleStep = (stepNumber) => {
    // Only allow toggling if previous steps are completed (dummy check for now)
    if (stepNumber > state.currentStep) return;

    for (let i = 2; i <= 4; i++) {
        const content = document.getElementById(`content${i}`);
        const summary = document.getElementById(`addressSummary`); // Special case for address section

        if (i === stepNumber) {
            content.style.display = 'block';
        } else {
            content.style.display = 'none';
        }
    }
};

window.saveAddressAndContinue = () => {
    const name = document.getElementById('fullName').value;
    const phone = document.getElementById('phoneNumber').value;
    const pincode = document.getElementById('pincode').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const stateVal = document.getElementById('state').value;

    if (!name || !phone || !pincode || !address || !city || !stateVal) {
        alert('Please fill all required fields');
        return;
    }

    state.address = { name, phone, pincode, address, city, state: stateVal };

    // Update UI Summary for Step 2
    document.getElementById('content2').style.display = 'none';
    const summary = document.getElementById('addressSummary');
    summary.style.display = 'block';
    document.getElementById('addressText').innerHTML = `
        <strong>${name}</strong><br>
        ${address}, ${city}, ${stateVal} - ${pincode}<br>
        Phone: ${phone}
    `;

    state.currentStep = 3;
    window.toggleStep(3);
};

window.goToPayment = () => {
    state.currentStep = 4;
    window.toggleStep(4);
};

window.selectPayMethod = (element, method) => {
    document.querySelectorAll('.payment-option-v2').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    state.paymentMethod = method;
};

function updatePriceSummary() {
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const tax = Math.round(subtotal * 0.18);
    const delivery = subtotal > 999 ? 0 : 50;
    const total = subtotal + tax + delivery;

    document.getElementById('itemCount').textContent = state.cart.length;
    document.getElementById('subtotal').textContent = `₹${subtotal.toLocaleString()}`;
    document.getElementById('tax').textContent = `₹${tax.toLocaleString()}`;
    document.getElementById('deliveryCharge').textContent = delivery === 0 ? 'FREE' : `₹${delivery}`;
    document.getElementById('totalAmount').textContent = `₹${total.toLocaleString()}`;
    document.getElementById('savings').textContent = (subtotal * 0.1).toFixed(0); // Dummy savings
}

function renderStep3Items() {
    const container = document.getElementById('checkoutItemsList');
    container.innerHTML = state.cart.map(item => `
        <div class="checkout-item">
            <img src="${item.image || 'https://via.placeholder.com/80'}" alt="${item.name}">
            <div class="item-info">
                <h4>${item.name}</h4>
                <div style="color: #878787; font-size: 0.85rem; margin-bottom: 5px;">Qty: ${item.quantity || 1}</div>
                <div class="item-price">₹${(item.price * (item.quantity || 1)).toLocaleString()}</div>
            </div>
        </div>
    `).join('');
}

window.confirmOrder = async () => {
    const btn = document.getElementById('confirmOrderBtn');
    btn.disabled = true;
    btn.textContent = 'Processing...';

    const orderData = {
        items: state.cart.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1,
            image: item.image
        })),
        shippingAddress: state.address,
        paymentMethod: state.paymentMethod,
        total: state.cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0) + 50 // roughly
    };

    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();

        if (data.success) {
            // Success!
            localStorage.removeItem('cart'); // Clear cart
            document.getElementById('finalOrderId').textContent = `#${data.data.order._id.slice(-8).toUpperCase()}`;
            document.getElementById('successOverlay').style.display = 'flex';
        } else {
            alert(data.message || 'Order failed. Please try again.');
            btn.disabled = false;
            btn.textContent = 'Confirm Order';
        }
    } catch (error) {
        console.error('Order error:', error);
        alert('Server error. Order could not be placed.');
        btn.disabled = false;
        btn.textContent = 'Confirm Order';
    }
};
