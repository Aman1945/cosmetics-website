# Deployment Guide - Deploy Karne Ka Tarika

## Step 1: MongoDB Atlas Setup (Free Database)

1. **MongoDB Atlas Account Banao**
   - Visit: https://www.mongodb.com/cloud/atlas/register
   - Sign up with Google ya email
   - Free M0 cluster select karo

2. **Database Connection String Lo**
   - "Connect" button click karo
   - "Connect your application" select karo
   - Connection string copy karo
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/cosmetics-db`

## Step 2: GitHub Repository Banao

1. **GitHub Account** (agar nahi hai to banao): https://github.com/signup
2. **New Repository Create Karo**
   - Repository name: `cosmetics-website`
   - Public rakhna
   - Initialize without README (already hai)

3. **Code Upload Karo**
   ```bash
   # Terminal mein ye commands run karo
   cd "c:\Users\Dell\Desktop\aman webiste"
   git init
   git add .
   git commit -m "Initial commit - Premium cosmetics website"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/cosmetics-website.git
   git push -u origin main
   ```

## Step 3: Backend Deploy Karo (Render)

1. **Render Account Banao**
   - Visit: https://dashboard.render.com/register
   - Sign up with GitHub

2. **Backend Deploy Karo**
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Settings:
     - **Name**: `cosmetics-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free

3. **Environment Variables Add Karo**
   - `MONGODB_URI` = (MongoDB Atlas ka connection string)
   - `JWT_SECRET` = `luxeglow-secret-key-2026`
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = (baad mein update karenge)

4. **Deploy Click Karo**
   - Wait 5-10 minutes
   - Backend URL milega: `https://cosmetics-backend-xxxx.onrender.com`

## Step 4: Frontend Deploy Karo (Render)

1. **Frontend Deploy Karo**
   - Click "New +" → "Static Site"
   - Same GitHub repository select karo
   - Settings:
     - **Name**: `cosmetics-frontend`
     - **Root Directory**: `frontend`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`

2. **Deploy Click Karo**
   - Frontend URL milega: `https://cosmetics-frontend-xxxx.onrender.com`

## Step 5: API URL Update Karo

1. **Frontend Code Mein Backend URL Update Karo**
   - File: `frontend/js/main.js`
   - Line 4 change karo:
   ```javascript
   const API_URL = 'https://cosmetics-backend-xxxx.onrender.com/api';
   ```
   - Replace `xxxx` with your actual backend URL

2. **Backend Mein Frontend URL Update Karo**
   - Render dashboard mein backend service open karo
   - Environment variables mein `FRONTEND_URL` update karo
   - Value: `https://cosmetics-frontend-xxxx.onrender.com`

3. **Changes Push Karo**
   ```bash
   git add .
   git commit -m "Updated API URLs for production"
   git push
   ```

## Step 6: Database Seed Karo (Optional)

Backend deploy hone ke baad, sample products add karne ke liye:

1. Render dashboard mein backend service open karo
2. "Shell" tab mein jao
3. Ye command run karo:
   ```bash
   node seed.js
   ```

## ✅ Done! Website Live Hai

**Frontend URL**: `https://cosmetics-frontend-xxxx.onrender.com`
**Backend API**: `https://cosmetics-backend-xxxx.onrender.com`

Is URL ko apne friends ko bhej do! 🎉

## Important Notes

⚠️ **Free Tier Limitations:**
- Backend 15 minutes inactivity ke baad sleep mode mein chala jata hai
- First request slow ho sakti hai (30 seconds)
- Monthly 750 hours free (enough for testing)

💡 **Tips:**
- Backend URL ko frontend code mein sahi se update karna mat bhoolna
- MongoDB Atlas mein IP whitelist mein `0.0.0.0/0` add karo (all IPs allow)
- Agar koi error aaye to Render logs check karo

## Troubleshooting

**Backend nahi chal raha:**
- Render logs check karo
- MongoDB connection string sahi hai?
- Environment variables sahi set hain?

**Frontend backend se connect nahi ho raha:**
- `frontend/js/main.js` mein API_URL sahi hai?
- Backend CORS settings check karo
- Browser console mein errors dekho

**Need Help?**
- Render documentation: https://render.com/docs
- MongoDB Atlas docs: https://docs.atlas.mongodb.com/

---

## Quick Deploy Commands

```bash
# Git setup
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_URL
git push -u origin main

# Update karne ke liye
git add .
git commit -m "Updated changes"
git push
```

Render automatically detect karega aur redeploy karega! 🚀
