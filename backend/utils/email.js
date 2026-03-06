const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("WARNING: EMAIL_USER or EMAIL_PASS not set in .env. Email not sent.");
            console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
            return true;
        }

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const data = await transporter.sendMail({
            from: `"Level Up Matching" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });

        console.log('Email sent:', data);
        return data;
    } catch (error) {
        console.error('Email sending error:', error);
        return null; // Don't crash the server on failed email
    }
};

module.exports.sendPasswordResetEmail = async (to, resetUrl) => {
    return sendEmail({
        to,
        subject: 'Reset your GameLevelUp password',
        html: `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px">
  <div style="background:#1e40af;padding:16px 24px;border-radius:8px 8px 0 0">
    <h2 style="color:#fff;margin:0;font-size:20px">&#127918; GameLevelUp</h2>
  </div>
  <div style="border:2px solid #e5e7eb;border-top:none;padding:28px;border-radius:0 0 8px 8px">
    <h3 style="margin-top:0;color:#111827">Password Reset Request</h3>
    <p style="color:#6b7280;font-size:14px">You requested a password reset. Click below to set a new password. This link expires in <strong>1 hour</strong>.</p>
    <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:6px;margin:16px 0">Reset Password &rarr;</a>
    <p style="color:#9ca3af;font-size:12px;margin-top:24px">If you didn't request this, ignore this email.<br><a href="${resetUrl}" style="color:#9ca3af">${resetUrl}</a></p>
  </div>
</div>`,
    });
};

module.exports.sendVerificationEmail = async (to, verifyUrl) => {
    return sendEmail({
        to,
        subject: 'Verify your GameLevelUp Email Address',
        html: `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px">
  <div style="background:#10b981;padding:16px 24px;border-radius:8px 8px 0 0">
    <h2 style="color:#fff;margin:0;font-size:20px">&#128231; Welcome to GameLevelUp!</h2>
  </div>
  <div style="border:2px solid #e5e7eb;border-top:none;padding:28px;border-radius:0 0 8px 8px">
    <h3 style="margin-top:0;color:#111827">Verify your account</h3>
    <p style="color:#6b7280;font-size:14px">Almost there! We just need to verify your email address before you can access all features.</p>
    <a href="${verifyUrl}" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:6px;margin:16px 0">Verify Email &rarr;</a>
    <p style="color:#9ca3af;font-size:12px;margin-top:24px">If you didn't create an account, you can safely ignore this email.</p>
  </div>
</div>`,
    });
};

module.exports.sendSecurityAlert = async (to, action) => {
    return sendEmail({
        to,
        subject: `Security Alert: Your ${action} was updated`,
        html: `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px">
  <div style="background:#ef4444;padding:16px 24px;border-radius:8px 8px 0 0">
    <h2 style="color:#fff;margin:0;font-size:20px">&#128737; Security Alert</h2>
  </div>
  <div style="border:2px solid #e5e7eb;border-top:none;padding:28px;border-radius:0 0 8px 8px">
    <h3 style="margin-top:0;color:#111827">Account Update</h3>
    <p style="color:#6b7280;font-size:14px">We're letting you know that the <strong>${action}</strong> on your account was just updated.</p>
    <p style="color:#6b7280;font-size:14px">If you authorized this change, no further action is required.</p>
    <p style="color:#ef4444;font-size:12px;font-weight:bold;margin-top:24px">If you DID NOT authorize this update, please contact support and reset your password immediately.</p>
  </div>
</div>`,
    });
};

module.exports.sendEmail = sendEmail;
