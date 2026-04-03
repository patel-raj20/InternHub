export function getWelcomeEmailTemplate(firstName: string, email: string, rawPass: string, actionLink: string) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: 'Inter', -apple-system, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 40px; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 40px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }
      .logo { font-size: 24px; font-weight: 900; color: #2563eb; letter-spacing: -1px; margin-bottom: 30px; }
      h1 { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 20px; }
      p { font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
      .credentials-box { background: #f1f5f9; border-radius: 12px; padding: 24px; margin: 30px 0; border: 1px solid #e2e8f0; }
      .cred-item { margin-bottom: 15px; }
      .cred-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; display: block; margin-bottom: 5px; }
      .cred-value { font-size: 16px; font-weight: 600; color: #0f172a; font-family: monospace; }
      .btn { display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; font-weight: 600; padding: 14px 28px; border-radius: 12px; font-size: 16px; }
      .btn:hover { background: #1d4ed8; }
      .footer { margin-top: 40px; font-size: 14px; color: #94a3b8; text-align: center; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">InternHub</div>
      <h1>Welcome aboard, ${firstName}!</h1>
      <p>Your workspace access has been successfully provisioned. We are excited to have you join our organization.</p>
      <p>Below are your secure login credentials to access the InternHub portal:</p>
      
      <div class="credentials-box">
        <div class="cred-item">
          <span class="cred-label">Email Address</span>
          <span class="cred-value">${email}</span>
        </div>
        <div class="cred-item" style="margin-bottom: 0;">
          <span class="cred-label">Temporary Password</span>
          <span class="cred-value">${rawPass}</span>
        </div>
      </div>
      
      <p>Please log in and update your password immediately using the link below:</p>
      
      <div style="text-align: center; margin: 35px 0;">
        <a href="${actionLink}" class="btn">Log In To Portal</a>
      </div>
      
      <p>If you have any issues accessing your account, please contact your Department Administrator.</p>
      
      <div class="footer">
        © ${new Date().getFullYear()} InternHub. Secure Automated Provisioning.
      </div>
    </div>
  </body>
  </html>
  `;
}

export function getOTPResetEmailTemplate(firstName: string, otpCode: string) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: 'Inter', -apple-system, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 40px; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 40px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border-top: 6px solid #2563eb; }
      h1 { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 20px; }
      p { font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
      .otp-box { background: #eff6ff; display: inline-block; padding: 20px 40px; border-radius: 16px; margin: 30px 0; border: 2px dashed #bfdbfe; }
      .otp-code { font-size: 42px; font-weight: 900; color: #1d4ed8; letter-spacing: 12px; margin-right: -12px; }
      .footer { margin-top: 40px; font-size: 14px; color: #94a3b8; text-align: center; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Password Reset Request</h1>
      <p>Hi ${firstName},</p>
      <p>We received a request to reset the password for your InternHub account. Please use the verification code below to securely set a new password.</p>
      
      <div style="text-align: center;">  
        <div class="otp-box">
          <div class="otp-code">${otpCode}</div>
        </div>
      </div>
      
      <p style="text-align: center; font-size: 14px; color: #64748b;">
        <strong>Note:</strong> This code is valid for exactly 15 minutes.
      </p>
      
      <p>If you didn't request a password reset, you can safely ignore this email. Your account remains secure.</p>
      
      <div class="footer">
        © ${new Date().getFullYear()} InternHub Security.
      </div>
    </div>
  </body>
  </html>
  `;
}
