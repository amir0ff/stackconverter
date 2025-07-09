// backend/middleware/errorHandler.js
const allowedOrigins = ['https://amiroff.me', 'http://localhost:3000'];

function errorHandler(err, req, res, next) {
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
}

module.exports = { errorHandler }; 