const s = require('../services/cuentaService');

const parseListParams = (query) => ({
  all:       query.all === 'true',
  page:      Math.max(1, parseInt(query.page) || 1),
  limit:     Math.max(1, Math.min(1000, parseInt(query.limit) || 20)),
  search:    query.search    || '',
  sortField: query.sortField || '',
  sortDir:   query.sortDir === 'desc' ? 'desc' : 'asc',
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
    if (!req.body.ctac_nro || !req.body.ctac_desc) return res.status(400).json({ message: 'El número y descripción de la cuenta son requeridos' });
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
