const s = require('../services/campanhaService');

const parseListParams = (query) => ({
  all:       query.all === 'true',
  page:      Math.max(1, parseInt(query.page) || 1),
  limit:     Math.max(1, Math.min(1000, parseInt(query.limit) || 20)),
  search:    query.search    || '',
  sortField: query.sortField || '',
  sortDir:   query.sortDir === 'desc' ? 'desc' : 'asc',
});

const getAll = async (req, res, next) => {
  try { res.json(await s.getAll(parseListParams(req.query))); } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    if (!req.body.camp_nombre) return res.status(400).json({ message: 'El nombre es requerido' });
    res.status(201).json(await s.create(req.body));
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const cli = Number(req.params.cli);
    const nro = Number(req.params.nro);
    if (!Number.isFinite(cli) || !Number.isFinite(nro)) return res.status(400).json({ message: 'Parámetros inválidos' });
    await s.update(cli, nro, req.body);
    res.json({ ok: true });
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try {
    const cli = Number(req.params.cli);
    const nro = Number(req.params.nro);
    if (!Number.isFinite(cli) || !Number.isFinite(nro)) return res.status(400).json({ message: 'Parámetros inválidos' });
    await s.remove(cli, nro);
    res.status(204).end();
  } catch (e) { next(e); }
};

module.exports = { getAll, create, update, remove };
