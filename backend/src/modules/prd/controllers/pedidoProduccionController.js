const s = require('../services/pedidoProduccionService');

const getAll = async (req, res, next) => {
  try {
    res.json(await s.getAll({
      all: req.query.all === 'true', page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20, search: req.query.search || '',
      sortField: req.query.sortField || '', sortDir: req.query.sortDir || 'asc',
    }));
  } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
  try { res.json(await s.getById(Number(req.params.id))); } catch (e) { next(e); }
};

const crearDesdePedido = async (req, res, next) => {
  try {
    if (!req.body.pedido_clave) return res.status(400).json({ message: 'El pedido es requerido' });
    const login = req.user?.login || 'SISTEMA';
    res.status(201).json(await s.crearDesdePedido(Number(req.body.pedido_clave), login));
  } catch (e) { next(e); }
};

module.exports = { getAll, getById, crearDesdePedido };
