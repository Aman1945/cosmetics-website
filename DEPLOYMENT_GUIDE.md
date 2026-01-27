# 🚀 RENDER DEPLOYMENT GUIDE

If your features are not working on the live site, it is 99% due to missing Environment Variables or Admin User not existing.

## 1️⃣ Environment Variables (Crucial!)

Go to your Render Dashboard -> Select your Backend Service -> **Environment** tab.
Add these variables:

| Key | Value | Description |
|-----|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://...` | Your *Live* MongoDB Atlas Connection String |
| `JWT_SECRET` | `some_super_secret_key` | Any long random string |
| `EMAIL_USER` | `your_email@gmail.com` | Email for sending OTPs |
| `EMAIL_PASS` | `xxxx xxxx xxxx xxxx` | App Password (Not generic password) |
| `PORT` | `5000` | (Optional, usually auto-detected) |

---

## 2️⃣ Admin User Setup (Production)

Your local admin user DOES NOT exist on the live database automatically. You must create it.

**How to create Admin on Live Site:**
1. Open your live website login page (e.g., `https://your-site.onrender.com/auth.html`)
2. Login with these EXACT credentials:
   - **Email:** `admin@as3cosmetic.com`
   - **Password:** `admin123`
3. Our backend code has a special check: if you try to login with these specific credentials and the user doesn't exist, it will **AUTO-CREATE** the admin user for you.
4. If it fails the first time, try one more time correctly.

---

## 3️⃣ Check API Connection

To verify if your Frontend talks to Backend:
1. Open your live website.
2. Right-click -> **Inspect** -> **Network** tab.
3. Refresh the page.
4. Try to Login.
5. Watch the network request.
   - If it is Red (Failed), click it.
   - Look at the "Headers" -> "Request URL".
   - It MUST start with `https://...onrender.com/api/...`.
   - If it starts with `http://localhost...` or `file://...`, then the Frontend update didn't work (clear cache!).

---

## 4️⃣ Redeploy

We updated `main.js` to fix the API URL issue. You must:
1. Push the code to GitHub (Agent already did this).
2. Go to Render Dashboard.
3. Click **Manual Deploy** -> **Deploy latest commit** for both Frontend (if static) and Backend.

