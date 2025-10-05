// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para proteger rutas (verificar token JWT)
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Obtener el token del header
      token = req.headers.authorization.split(' ')[1];

      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Obtener el usuario del token
      req.user = await User.findByPk(decoded.id);

      if (!req.user) {
        return res.status(401).json({ message: 'Usuario no encontrado' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Token no válido' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Acceso denegado, token requerido' });
  }
};

// Middleware para verificar roles (opcional)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Usuario no autorizado' });
    }
    next();
  };
};

module.exports = { protect, authorize };