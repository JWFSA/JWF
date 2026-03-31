const svc = require('../services/facturaService');

const parseListParams = (query) => ({
  all:          query.all === 'true',
  page:         Math.max(1, parseInt(query.page) || 1),
  limit:        Math.max(1, Math.min(1000, parseInt(query.limit) || 20)),
  search:       query.search    || '',
  sortField:    query.sortField || '',
  sortDir:      query.sortDir === 'desc' ? 'desc' : 'asc',
  fechaDesde:   query.fechaDesde || '',
  fechaHasta:   query.fechaHasta || '',
  moneda:       query.moneda     || '',
  soloConSaldo: query.soloConSaldo === 'true',
});

const getAll  = async (req, res, next) => {
  try { res.json(await svc.getAll(parseListParams(req.query))); } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
  try { res.json(await svc.getById(req.params.id)); } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    if (!req.body.doc_fec_doc) return res.status(400).json({ message: 'La fecha es requerida' });
    res.status(201).json(await svc.create(req.body));
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try { res.json(await svc.update(req.params.id, req.body)); } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try { await svc.remove(req.params.id); res.status(204).end(); } catch (e) { next(e); }
};

module.exports = { getAll, getById, create, update, remove };
