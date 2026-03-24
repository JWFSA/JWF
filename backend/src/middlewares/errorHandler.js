const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.code === '23505') {
    return res.status(409).json({ message: 'Registro duplicado' });
  }

  if (err.code === '23503') {
    return res.status(409).json({ message: 'Violación de clave foránea' });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
  });
};

module.exports = errorHandler;
