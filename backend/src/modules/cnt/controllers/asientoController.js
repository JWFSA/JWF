const s = require('../services/asientoService');

const parseListParams = (query) => ({
  all:        query.all === 'true',
  page:       Math.max(1, parseInt(query.page) || 1),
  limit:      Math.max(1, Math.min(1000, parseInt(query.limit) || 20)),
  search:     query.search     || '',
  sortField:  query.sortField  || '',
  sortDir:    query.sortDir === 'desc' ? 'desc' : 'asc',
  fechaDesde: query.fechaDesde || '',
  fechaHasta: query.fechaHasta || '',
  ejercicio:  query.ejercicio  || '',
});

const getAll  = async (req, res, next) => {
  try { res.json(await s.getAll(parseListParams(req.query))); } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'ID inválido' });
    res.json(await s.getById(id));
  } catch (e) { next(e); }
};

const create  = async (req, res, next) => {
  try {
    if (!req.body.asi_fec || !req.body.asi_ejercicio) return res.status(400).json({ message: 'La fecha y ejercicio son requeridos' });
    res.status(201).json(await s.create(req.body));
  } catch (e) { next(e); }
};

const update  = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'ID inválido' });
    res.json(await s.update(id, req.body));
  } catch (e) { next(e); }
};

const remove  = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'ID inválido' });
    await s.remove(id); res.status(204).end();
  } catch (e) { next(e); }
};

module.exports = { getAll, getById, create, update, remove };
