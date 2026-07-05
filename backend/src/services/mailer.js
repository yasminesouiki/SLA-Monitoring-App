const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendOTPEmail(toEmail, code) {
  await transporter.sendMail({
    from: `"DXC Tunisia Web Portal" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: '🔐 Admin Access — Security Code',
    html: `
      <div style="font-family:Segoe UI,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:10px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h2 style="color:#5f259f;margin:0;">DXC Tunisia Web Portal</h2>
          <p style="color:#6b7280;margin:4px 0 0;">Admin Security Verification</p>
        </div>
        <p style="color:#374151;">A login attempt was made on the admin panel. Use the code below to complete access:</p>
        <div style="text-align:center;margin:28px 0;">
          <span style="font-size:36px;font-weight:800;letter-spacing:10px;color:#1e2233;background:#f3f4f6;padding:16px 28px;border-radius:8px;">${code}</span>
        </div>
        <p style="color:#6b7280;font-size:13px;">This code expires in <strong>5 minutes</strong>. If you did not request this, ignore this email.</p>
      </div>
    `,
  });
}

module.exports = { sendOTPEmail };
