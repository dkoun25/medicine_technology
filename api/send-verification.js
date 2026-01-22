// Simple API endpoint for sending email verification codes
// Can be deployed to Vercel, Netlify, or run locally

const nodemailer = require('nodemailer');

// CORS helper
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

module.exports = async (req, res) => {
  setCorsHeaders(res);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Create transporter with Gmail SMTP
    // Note: For Gmail, you need to use "App Password" not regular password
    // Go to: https://myaccount.google.com/apppasswords
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASSWORD, // Your Gmail App Password
      },
    });

    // Email content
    const mailOptions = {
      from: `"Nhà thuốc - Xác minh tài khoản" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Mã xác minh tài khoản - Nhà thuốc',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #137fec 0%, #0f5bb5 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
            .code-box { background: #f3f4f6; border: 2px dashed #137fec; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
            .code { font-size: 32px; font-weight: bold; color: #137fec; letter-spacing: 8px; font-family: 'Courier New', monospace; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 Xác minh tài khoản</h1>
            </div>
            <div class="content">
              <p>Xin chào,</p>
              <p>Bạn đang đăng ký tài khoản quản lý nhà thuốc. Vui lòng sử dụng mã xác minh bên dưới để hoàn tất đăng ký:</p>
              
              <div class="code-box">
                <div class="code">${code}</div>
              </div>

              <p>Mã này có hiệu lực trong <strong>10 phút</strong>.</p>

              <div class="warning">
                <strong>⚠️ Lưu ý:</strong> Nếu bạn không yêu cầu đăng ký tài khoản, vui lòng bỏ qua email này.
              </div>

              <p>Trân trọng,<br><strong>Đội ngũ hỗ trợ Nhà thuốc</strong></p>
            </div>
            <div class="footer">
              <p>Email này được gửi tự động. Vui lòng không trả lời.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Mã xác minh tài khoản của bạn là: ${code}\n\nMã có hiệu lực trong 10 phút.\n\nNếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này.`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ 
      success: true, 
      message: 'Verification code sent successfully' 
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ 
      error: 'Failed to send email',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
