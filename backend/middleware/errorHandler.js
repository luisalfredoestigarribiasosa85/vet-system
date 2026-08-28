const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.statusCode || 500} - ${err.message} | ${req.method} ${req.originalUrl}`, {
    stack: err.stack,
  });

    const error = {
      message: err.message || 'Error del servidor',
      status: err.statusCode || 500
    };
  
    if (process.env.NODE_ENV === 'development') {
      error.stack = err.stack;
    }
  
    res.status(error.status).json(error);
  };
  
  module.exports = errorHandler;
  