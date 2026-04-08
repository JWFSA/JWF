const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.code === '23505') {
    return res.status(409).json({ message: 'Registro duplicado' });
  }

  if (err.code === '23503') {
    const detail = err.detail || '';
    const isDelete = detail.includes('still referenced');
    const message = isDelete
      ? 'No se puede eliminar porque tiene registros asociados en otras tablas'
      : 'El registro referenciado no existe';
    return res.status(409).json({ message });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
  });
};

module.exports = errorHandler;
