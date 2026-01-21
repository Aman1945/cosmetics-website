# Gmail OTP Setup Guide

## ✨ Email-based OTP System Successfully Implemented!

### 🔧 What Changed:
1. ✅ **Phone number removed** - No longer required
2. ✅ **Email OTP added** - Users receive OTP via email
3. ✅ **Email verification required** - Users must verify before login
4. ✅ **Beautiful email templates** - Professional OTP & welcome emails

---

## 📧 Gmail Setup Instructions

### Step 1: Enable 2-Factor Authentication
1. Go to Google Account: https://myaccount.google.com/security
2. Click on **"2-Step Verification"**
3. Follow the steps to enable it

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select **"Mail"** and **"Other (Custom name)"**
3. Enter name: `LuxeGlow OTP System`
4. Click **Generate**
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update .env File
Open `backend/.env` and update:
```env
EMAIL_USER=your-actual-gmail@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop    # 16-char app password (no spaces)
```

### Step 4: For Testing (Optional - Less Secure)
If you want to use regular Gmail password for testing:
1. Go to: https://myaccount.google.com/lesssecureapps
2. Turn ON "Allow less secure apps"
3. Use your regular Gmail password

⚠️ **Production**: Always use App Password, not regular password!

---

## 🚀 API Endpoints

### 1. Register User (Sends OTP)
```
POST /api/auth/register
Body: {
  "name": "Aman Kumar",
  "email": "user@example.com",
  "password": "password123"
}

Response: {
  "success": true,
  "message": "Registration successful! Please check your email for OTP verification.",
  "data": {
    "email": "user@example.com",
    "userId": "..."
  }
}
```

### 2. Verify OTP
```
POST /api/auth/verify-otp
Body: {
  "email": "user@example.com",
  "otp": "123456"
}

Response: {
  "success": true,
  "message": "Email verified successfully! Welcome to LuxeGlow! 🎉",
  "data": {
    "user": { ... },
    "token": "jwt-token-here"
  }
}
```

### 3. Resend OTP
```
POST /api/auth/resend-otp
Body: {
  "email": "user@example.com"
}

Response: {
  "success": true,
  "message": "OTP resent successfully! Please check your email."
}
```

### 4. Login (Requires Verified Email)
```
POST /api/auth/login
Body: {
  "email": "user@example.com",
  "password": "password123"
}

Response: {
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "jwt-token-here"
  }
}
```

---

## 🎨 Email Templates

### OTP Email
- Beautiful gradient design
- 6-digit OTP code
- Expires in 10 minutes
- Security warning included

### Welcome Email
- Sent after successful verification
- Includes link to start shopping
- Professional branding

---

## 🧪 Testing

1. **Start the server:**
   ```bash
   cd backend
   npm start
   ```

2. **Test Registration:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@gmail.com","password":"test123"}'
   ```

3. **Check your email** for the OTP

4. **Verify OTP:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/verify-otp \
     -H "Content-Type: application/json" \
     -d '{"email":"test@gmail.com","otp":"123456"}'
   ```

---

## 📝 Important Notes

1. ✅ OTP expires in **10 minutes**
2. ✅ Users can request new OTP using `/resend-otp`
3. ✅ Phone number is now **optional**
4. ✅ Email verification is **mandatory** for login
5. ✅ Admin account is auto-verified

---

## 🔒 Security Features

- ✅ OTP stored securely in database
- ✅ Time-based expiration
- ✅ One-time use only
- ✅ Automatic cleanup after verification
- ✅ Rate limiting recommended (add later)

---

## 🐛 Troubleshooting

### Email not sending?
1. Check Gmail credentials in .env
2. Verify App Password is correct (no spaces)
3. Check 2FA is enabled
4. Check spam folder

### "Invalid credentials" error?
- Make sure you're using App Password, not regular password
- Regenerate App Password if needed

### OTP expired?
- Use `/resend-otp` endpoint to get a new OTP

---

## 📦 Dependencies Used
- `nodemailer` - Already installed ✅
- No new packages needed!

Happy coding! 🚀
