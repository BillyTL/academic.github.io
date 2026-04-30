const jwt = require('jsonwebtoken');
const { unauthorized } = require('../utils/responseHandler');

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return unauthorized(res, 'Token no proporcionado');

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return unauthorized(res, 'Token invalido o expirado');
  }
};

module.exports = authMiddleware;
