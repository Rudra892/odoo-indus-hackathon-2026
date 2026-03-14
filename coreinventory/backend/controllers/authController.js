const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email, role: user.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ success: false, message: 'Email ID already exists' });

    const user = new User({ name, email, password, role });
    await user.save();
    
    const token = generateToken(user);
    res.status(201).json({ 
      success: true, 
      token, 
      user: { id: user._id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({ 
      success: true, 
      token, 
      user: { id: user._id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const otpData = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`OTP for ${email}: ${otpData}`);

    await OTP.updateMany({ email }, { used: true });

    const otp = new OTP({
      email,
      otp: otpData,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });
    await otp.save();

    // Send Email via Gmail SMTP
    const smtpUser = (process.env.EMAIL_USER || '').trim();
    const smtpPass = (process.env.EMAIL_PASS || '').trim();

    if (smtpUser && smtpPass) {
      console.log(`Attempting SMTP send from: ${smtpUser} to: ${email}`);
      
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      const mailOptions = {
        from: `"CoreInventory" <${smtpUser}>`,
        to: email,
        subject: 'CoreInventory - Password Reset OTP',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <div style="background: #4f46e5; padding: 24px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 22px;">CoreInventory</h1>
            </div>
            <div style="padding: 32px;">
              <h2 style="color: #1f2937; margin-top: 0;">Password Reset</h2>
              <p style="color: #4b5563;">Use this 6-digit code to reset your password. It expires in 10 minutes.</p>
              <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0;">
                <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #4f46e5;">${otpData}</span>
              </div>
              <p style="color: #9ca3af; font-size: 13px;">If you didn't request this, ignore this email.</p>
            </div>
          </div>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('✅ OTP email sent successfully to', email);
        return res.json({ success: true, message: 'OTP sent to your email' });
      } catch (mailError) {
        console.error('❌ SMTP Error:', mailError.message);
        return res.status(500).json({ success: false, message: 'Failed to send OTP email. Please try again.' });
      }
    } else {
      console.warn('⚠️ SMTP not configured (EMAIL_USER or EMAIL_PASS missing)');
      return res.status(500).json({ success: false, message: 'Email service not configured' });
    }
  } catch (err) {
    console.error('forgotPassword error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await OTP.findOne({ email, otp, used: false, expiresAt: { $gt: Date.now() } });
    if (!otpRecord) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    otpRecord.used = true;
    await otpRecord.save();

    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ success: true, message: 'OTP verified', resetToken });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (!decoded.email) return res.status(400).json({ success: false, message: 'Invalid token' });

    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
