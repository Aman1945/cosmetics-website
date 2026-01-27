# 🔐 AS³Cosmetic - All Login Credentials

## 🎯 Admin Login
**URL:** http://localhost:8000/admin.html

**Credentials:**
- **Email:** admin@as3cosmetic.com
- **Password:** admin123

**Access:**
- Full dashboard access
- Manage products
- View/update orders
- View users
- Manage offers

---

## 👤 Test User Accounts

### User 1 - Aman
- **Email:** aman@example.com
- **Password:** password123
- **Role:** Customer

### User 2 - Priya
- **Email:** priya@example.com
- **Password:** password123
- **Role:** Customer

### User 3 - Rahul
- **Email:** rahul@example.com
- **Password:** password123
- **Role:** Customer

### User 4 - Sneha
- **Email:** sneha@example.com
- **Password:** password123
- **Role:** Customer

### User 5 - Vikram
- **Email:** vikram@example.com
- **Password:** password123
- **Role:** Customer

---

## 🚀 How to Use

### 1. Admin Dashboard
```
1. Go to: http://localhost:8000/admin.html
2. Login with admin credentials
3. View dashboard, products, orders, users
```

### 2. Customer Login
```
1. Go to: http://localhost:8000/auth.html
2. Login with any test user
3. Browse products, add to cart, checkout
```

### 3. Create New Account
```
1. Go to: http://localhost:8000/auth.html
2. Click "Create Account" tab
3. Fill in details
4. You'll receive OTP via email (if configured)
```

---

## 📦 Create Fake Orders

To populate the dashboard with test data:

```bash
cd backend
node create-fake-orders.js
```

This will create:
- ✅ 20 fake orders
- ✅ Random products in each order
- ✅ Different statuses (pending, processing, shipped, delivered, cancelled)
- ✅ Random dates in last 30 days
- ✅ Realistic revenue data

---

## 🔧 Troubleshooting

### Dashboard Not Showing Data?
1. Make sure backend is running: `npm start` in backend folder
2. Run fake orders script: `node create-fake-orders.js`
3. Clear browser cache (Ctrl+Shift+Delete)
4. Refresh admin page

### Can't Login?
1. Check if backend is running on port 5000
2. Check MongoDB connection in backend terminal
3. Try clearing localStorage: Open DevTools (F12) → Console → Type: `localStorage.clear()`

### Orders Not Showing?
1. Run: `node create-fake-orders.js` in backend folder
2. Refresh admin dashboard
3. Click on "Orders" tab in sidebar

---

## 📊 What You'll See in Dashboard

After running fake orders script:

- **Total Revenue:** ₹50,000 - ₹2,00,000 (random)
- **Total Orders:** 20+
- **Total Users:** 100+ (from seed data)
- **Total Products:** 500 (from seed data)
- **Recent Orders:** Last 5 orders
- **Order Statuses:** Mix of pending, processing, shipped, delivered, cancelled

---

## 🎨 Features You Can Test

### Admin Panel:
- ✅ View dashboard analytics
- ✅ Manage products (add, edit, delete)
- ✅ View and update order status
- ✅ View all users
- ✅ Manage offers

### Customer Side:
- ✅ Browse products
- ✅ Add to cart
- ✅ Checkout
- ✅ View profile
- ✅ Track orders

---

## 🔑 Quick Access URLs

- **Homepage:** http://localhost:8000/index.html
- **Login/Register:** http://localhost:8000/auth.html
- **Admin Dashboard:** http://localhost:8000/admin.html
- **Cart:** http://localhost:8000/cart.html
- **Profile:** http://localhost:8000/profile.html

---

**Note:** All test users have the same password: `password123`

**Admin Password:** `admin123`

---

**Created:** 2026-01-27
**Project:** AS³Cosmetic E-commerce Platform
