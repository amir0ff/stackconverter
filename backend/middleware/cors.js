// backend/middleware/cors.js
const allowedOrigins = ['https://amiroff.me', 'http://localhost:3000'];

function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }
  next();
}

module.exports = { corsMiddleware }; 