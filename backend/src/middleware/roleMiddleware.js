const { forbidden } = require('../utils/responseHandler');

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return forbidden(res, 'Sin informacion de rol');
    }
    if (!allowedRoles.includes(req.user.role)) {
      return forbidden(res, 'Tu rol no tiene permisos para esta accion');
    }
    next();
  };
};

module.exports = roleMiddleware;
