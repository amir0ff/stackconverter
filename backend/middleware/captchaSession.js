const { verifyCaptcha } = require('../utils/gemini');

// 15 minutes in milliseconds
const CAPTCHA_SESSION_DURATION = 15 * 60 * 1000;

module.exports = async function captchaSession(req, res, next) {
  // Check for session cookie
  const cookie = req.cookies && req.cookies.captcha_verified;
  const now = Date.now();
  if (cookie) {
    // Cookie format: timestamp (set on verification)
    const timestamp = parseInt(cookie, 10);
    if (!isNaN(timestamp) && now - timestamp < CAPTCHA_SESSION_DURATION) {
      // Session is valid
      return next();
    }
  }

  // If no valid session, require CAPTCHA
  const captchaToken = (req.body && req.body.captchaToken) || req.headers['x-captcha-token'];
  if (process.env.NODE_ENV === 'production') {
    const valid = await verifyCaptcha(captchaToken);
    if (!valid) {
      return res.status(403).json({ error: 'Failed CAPTCHA verification.' });
    }
    // Set session cookie (timestamp)
    res.cookie('captcha_verified', String(now), {
      httpOnly: true,
      sameSite: 'lax', // Use 'lax' for same-site, 'none' for cross-site with HTTPS
      maxAge: CAPTCHA_SESSION_DURATION,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }
  next();
}; 