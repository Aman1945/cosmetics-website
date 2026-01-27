# How to Run Your Website Locally

## Quick Start Guide

### 1. Start the Backend Server

Open a terminal in the backend folder and run:

```bash
cd "c:\Users\Dell\Desktop\aman webiste\backend"
npm start
```

**You should see:**
```
🚀 Server on 5000
✅ MongoDB Atlas Connected!
```

---

### 2. Open the Frontend

You have two options:

#### Option A: Direct File Opening (Simplest)
1. Navigate to: `c:\Users\Dell\Desktop\aman webiste\frontend`
2. Double-click `index.html` to open in your browser
3. The website will automatically connect to your local backend at `localhost:5000`

#### Option B: Using Live Server (Better)
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"
4. Website will open at `http://127.0.0.1:5500`

---

## Testing the Features

### ✅ Navigation (No More Annoying Dialogs!)
- Click on any product → Should navigate smoothly
- Click cart button → Opens cart page directly
- Click on product images → No confirmation dialog

### ✅ Premium Auth Page
- Go to: `http://localhost:5500/auth.html` or open `auth.html` directly
- **Features:**
  - **Back to Home button** in top-left corner (white button with ← arrow)
  - Dark gradient background with floating animations
  - Premium glassmorphic card
  - Smooth tab switching between Login/Register
  - Gradient buttons with shine effects

### ✅ Cart Page
- Add products to cart
- Click cart icon
- See premium design with:
  - Gradient backgrounds
  - Dark summary box
  - Smooth animations
  - Premium footer

---

## Pages to Test

1. **Homepage**: `index.html`
   - Products loading from backend
   - Offers section
   - Smooth navigation

2. **Auth Page**: `auth.html`
   - **Back button in top-left** ✅
   - Login form
   - Register form
   - Premium design

3. **Cart Page**: `cart.html`
   - Premium design
   - Recommendations
   - Full footer

4. **Product Page**: `product.html?id=<product_id>`
   - Product details
   - Reviews
   - Recommendations

---

## Troubleshooting

### If products don't load:
1. Make sure backend is running (`npm start` in backend folder)
2. Check console for errors (F12 in browser)
3. Backend should be on port 5000

### If you see "Leave site?" dialog:
- This is now fixed! You shouldn't see it anymore
- If you still see it, clear browser cache (Ctrl+Shift+Delete)

### If auth page looks plain:
- Make sure you're opening the updated `auth.html`
- Clear browser cache
- Check if CSS is loading (F12 → Network tab)

---

## What's Fixed:

✅ Navigation dialogs removed
✅ Cart page premium design
✅ Auth page stunning redesign
✅ Back to Home button on auth page
✅ Footer consistency
✅ Backend running properly

---

## Quick Test Checklist:

- [ ] Backend running on port 5000
- [ ] Homepage loads products
- [ ] Click product → No dialog, smooth navigation
- [ ] Click cart → No dialog, opens cart
- [ ] Auth page has back button (top-left)
- [ ] Auth page looks premium (dark background, gradients)
- [ ] Cart page looks premium (gradients, dark summary)
- [ ] Footer shows on all pages

---

**Everything is ready to use! Just start the backend and open the frontend.** 🚀
