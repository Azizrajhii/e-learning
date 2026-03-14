const jwt = require('jsonwebtoken');

const unauthorizedError = (message) => {
  const err = new Error(message);
  err.status = 401;
  err.statusCode = 401;
  return err;
};

const getUserId = async (req) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw unauthorizedError('Access denied. No token provided.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    throw unauthorizedError('Invalid or expired token.');
  }
};

module.exports = { getUserId };