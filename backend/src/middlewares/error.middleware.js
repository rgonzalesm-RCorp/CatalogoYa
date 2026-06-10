const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || error.status || 500;
  let message = error.message || 'Internal server error.';

  if (error.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = error.errors?.[0]?.message || 'Unique constraint violation.';
  }

  if (error.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = error.errors?.[0]?.message || 'Validation error.';
  }

  if (error.type === 'entity.too.large') {
    statusCode = 413;
    message = 'La solicitud es demasiado grande. Reduce el tamano del logo o banner, o aumenta API_BODY_LIMIT.';
  }

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = { errorHandler };
