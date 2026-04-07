const s = require('../services/pedidoService');

const getAll = async (req, res, next) => {
  try {
    const { all, page, limit, search, sortField, sortDir, tipo, fechaDesde, fechaHasta, estado, vendedor } = req.query;
    res.json(await s.getAll({
      all: all === 'true',
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      search: search || '',
      sortField: sortField || '',
      sortDir: sortDir || 'asc',
      tipo: tipo || '',
      fechaDesde: fechaDesde || '',
      fechaHasta: fechaHasta || '',
      estado: estado || '',
      vendedor: vendedor || '',
    }));
  } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
  try { res.json(await s.getById(Number(req.params.id))); } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    if (!req.body.ped_fecha) return res.status(400).json({ message: 'La fecha es requerida' });
    if (!req.body.ped_cli)   return res.status(400).json({ message: 'El cliente es requerido' });
    const login = req.user?.login || 'SISTEMA';
    res.status(201).json(await s.create(req.body, login));
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try { res.json(await s.update(Number(req.params.id), req.body)); } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try { await s.remove(Number(req.params.id)); res.status(204).end(); } catch (e) { next(e); }
};

const getArticulos = async (req, res, next) => {
  try {
    res.json(await s.getArticulos({
      all: req.query.all === 'true',
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      search: req.query.search || '',
    }));
  } catch (e) { next(e); }
};

const getParaFacturar = async (req, res, next) => {
  try { res.json(await s.getParaFacturar(Number(req.params.id))); } catch (e) { next(e); }
};

const convertir = async (req, res, next) => {
  try { res.json(await s.convertirAVenta(Number(req.params.id))); } catch (e) { next(e); }
};

const copiar = async (req, res, next) => {
  try {
    const login = req.user?.login || 'SISTEMA';
    const tipoDestino = req.body.ped_tipo || null;
    res.status(201).json(await s.copiar(Number(req.params.id), tipoDestino, login));
  } catch (e) { next(e); }
};

const aprobar = async (req, res, next) => {
  try {
    const login = req.user?.login || 'SISTEMA';
    res.json(await s.aprobar(Number(req.params.id), login));
  } catch (e) { next(e); }
};

const rechazar = async (req, res, next) => {
  try {
    const login = req.user?.login || 'SISTEMA';
    res.json(await s.rechazar(Number(req.params.id), req.body.motivo || '', login));
  } catch (e) { next(e); }
};

module.exports = { getAll, getById, create, update, remove, getArticulos, getParaFacturar, convertir, copiar, aprobar, rechazar };
