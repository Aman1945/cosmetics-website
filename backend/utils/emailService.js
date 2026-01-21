const nodemailer = require('nodemailer');

// Create transporter for Gmail or Ethereal
const createTransporter = () => {
    const isEthereal = process.env.EMAIL_USER && process.env.EMAIL_USER.includes('ethereal.email');

    if (isEthereal) {
        // Ethereal for testing
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    } else {
        // Gmail for production - explicit settings
        return nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }
};

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, name) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"AS³Cosmetic" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your Email - OTP Code',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background-color: #f5f5f5;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 40px auto;
                            background-color: #ffffff;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            padding: 30px;
                            text-align: center;
                            color: white;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 28px;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .otp-box {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            font-size: 36px;
                            font-weight: bold;
                            text-align: center;
                            padding: 20px;
                            border-radius: 8px;
                            letter-spacing: 8px;
                            margin: 30px 0;
                        }
                        .message {
                            color: #333;
                            font-size: 16px;
                            line-height: 1.6;
                            margin: 20px 0;
                        }
                        .warning {
                            background-color: #fff3cd;
                            border-left: 4px solid #ffc107;
                            padding: 15px;
                            margin: 20px 0;
                            color: #856404;
                        }
                        .footer {
                            background-color: #f8f9fa;
                            padding: 20px;
                            text-align: center;
                            color: #6c757d;
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🌟 AS³Cosmetic</h1>
                        </div>
                        <div class="content">
                            <p class="message">Hi <strong>${name}</strong>,</p>
                            <p class="message">Thank you for registering with AS³Cosmetic! Please use the following OTP to verify your email address:</p>
                            
                            <div class="otp-box">
                                ${otp}
                            </div>
                            
                            <p class="message">This OTP is valid for <strong>10 minutes</strong>.</p>
                            
                            <div class="warning">
                                <strong>⚠️ Security Note:</strong> Never share this OTP with anyone. AS³Cosmetic team will never ask for your OTP.
                            </div>
                            
                            <p class="message">If you didn't request this verification, please ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>© 2026 AS³Cosmetic. All rights reserved.</p>
                            <p>Premium Beauty Products | Trusted Worldwide</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('OTP Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Failed to send OTP email');
    }
};

// Send welcome email after verification
const sendWelcomeEmail = async (email, name) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"AS³Cosmetic" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to AS³Cosmetic! 🎉',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background-color: #f5f5f5;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 40px auto;
                            background-color: #ffffff;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            padding: 40px;
                            text-align: center;
                            color: white;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .button {
                            display: inline-block;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 15px 40px;
                            text-decoration: none;
                            border-radius: 5px;
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Welcome to AS³Cosmetic!</h1>
                        </div>
                        <div class="content">
                            <h2>Hi ${name}! 👋</h2>
                            <p>Your email has been successfully verified!</p>
                            <p>We're thrilled to have you join the AS³Cosmetic family. Get ready to discover premium beauty products that will make you shine! ✨</p>
                            <center>
                                <a href="${process.env.FRONTEND_URL}" class="button">Start Shopping</a>
                            </center>
                            <p>Happy shopping!</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Welcome email sent to:', email);
    } catch (error) {
        console.error('Error sending welcome email:', error);
        // Don't throw error for welcome email failure
    }
};

module.exports = {
    generateOTP,
    sendOTPEmail,
    sendWelcomeEmail
};
