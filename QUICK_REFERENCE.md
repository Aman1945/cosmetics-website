# 📧 Email OTP - Quick Reference Card

## 🎯 What Changed?
- ❌ **REMOVED**: Phone number OTP system
- ✅ **ADDED**: Email-based OTP verification
- ✅ **ADDED**: Beautiful OTP verification page
- ✅ **ADDED**: Email templates (OTP + Welcome)

---

## 🚀 Gmail Setup (5 Minutes)

### 1️⃣ Enable 2FA on Gmail
🔗 https://myaccount.google.com/security

### 2️⃣ Create App Password
🔗 https://myaccount.google.com/apppasswords
- App: **Mail**
- Device: **Other (LuxeGlow)**
- Copy 16-char password (e.g., `abcd efgh ijkl mnop`)

### 3️⃣ Update .env File
```env
EMAIL_USER=youremail@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
```

---

## 📱 User Flow

### Registration:
```
1. Enter: Name, Email, Password
2. Click: "Create Account & Send OTP"
3. Check Gmail → Copy 6-digit OTP
4. Enter OTP in verification page
5. Click: "Verify Email"
6. ✅ Account verified → Auto login
```

### Login:
```
1. Enter: Email, Password
2. If not verified → Error message
3. If verified → Login success ✅
```

---

## 🔗 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Send OTP to email |
| `/api/auth/verify-otp` | POST | Verify OTP code |
| `/api/auth/resend-otp` | POST | Resend new OTP |
| `/api/auth/login` | POST | Login (verified only) |

---

## 📁 New Files

1. ✅ `backend/utils/emailService.js`
2. ✅ `frontend/verify-otp.html`
3. ✅ `backend/GMAIL_OTP_SETUP.md`
4. ✅ `IMPLEMENTATION_SUMMARY.md`

---

## 🧪 Test Commands

### Start Server:
```bash
cd backend
npm start
```

### Test API:
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@gmail.com","password":"test123"}'

# Verify OTP
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","otp":"123456"}'
```

---

## ⚙️ Configuration

### Frontend API URL:

**Development:**
```javascript
const API_URL = 'http://localhost:5000/api';
```

**Production:**
```javascript
const API_URL = 'https://your-backend.com/api';
```

📍 Update in: `frontend/auth.html` and `frontend/verify-otp.html`

---

## ✨ Features

- ✅ OTP expires in 10 minutes
- ✅ Auto-focus OTP input boxes
- ✅ Live countdown timer
- ✅ Resend OTP button
- ✅ Beautiful email templates
- ✅ Welcome email after verification
- ✅ Mobile responsive design

---

## 🐛 Quick Fixes

### Email not sending?
```
✓ Check EMAIL_USER in .env
✓ Check EMAIL_PASSWORD in .env
✓ Enable 2FA on Gmail
✓ Regenerate App Password
✓ Check spam folder
```

### OTP expired?
```
✓ Click "Resend OTP" button
✓ Check email for new OTP
```

---

## 📞 Support

For detailed documentation:
- `GMAIL_OTP_SETUP.md` - Gmail setup guide
- `IMPLEMENTATION_SUMMARY.md` - Full documentation

---

**Status:** ✅ Ready to Use  
**Version:** 1.0  
**Last Updated:** 2026-01-21
