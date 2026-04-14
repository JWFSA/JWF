const s = require('../services/ordenTrabajoService');

const getAll = async (req, res, next) => {
  try {
    const { all, page, limit, search, sortField, sortDir, tipo, situacion, fechaDesde, fechaHasta } = req.query;
    res.json(await s.getAll({
      all: all === 'true', page: parseInt(page) || 1, limit: parseInt(limit) || 20,
      search: search || '', sortField: sortField || '', sortDir: sortDir || 'asc',
      tipo: tipo || '', situacion: situacion || '',
      fechaDesde: fechaDesde || '', fechaHasta: fechaHasta || '',
    }));
  } catch (e) { next(e); }
};

const getById  = async (req, res, next) => { try { res.json(await s.getById(Number(req.params.id))); } catch (e) { next(e); } };

const create = async (req, res, next) => {
  try {
    const login = req.user?.login || 'SISTEMA';
    res.status(201).json(await s.create(req.body, login));
  } catch (e) { next(e); }
};

const update   = async (req, res, next) => { try { res.json(await s.update(Number(req.params.id), req.body)); } catch (e) { next(e); } };
const remove   = async (req, res, next) => { try { await s.remove(Number(req.params.id)); res.status(204).end(); } catch (e) { next(e); } };

const addGasto = async (req, res, next) => {
  try {
    const login = req.user?.login || 'SISTEMA';
    res.status(201).json(await s.addGasto(Number(req.params.id), req.body, login));
  } catch (e) { next(e); }
};

const removeGasto = async (req, res, next) => {
  try { res.json(await s.removeGasto(Number(req.params.id), Number(req.params.item))); } catch (e) { next(e); }
};

const getTiposOT = async (_req, res, next) => { try { res.json(await s.getTiposOT()); } catch (e) { next(e); } };

const crearDesdePedido = async (req, res, next) => {
  try {
    const login = req.user?.login || 'SISTEMA';
    res.status(201).json(await s.crearDesdePedido(Number(req.body.pedido_clave), req.body.item_ped || null, login));
  } catch (e) { next(e); }
};

module.exports = { getAll, getById, create, update, remove, addGasto, removeGasto, getTiposOT, crearDesdePedido };
