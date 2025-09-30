const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
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
  