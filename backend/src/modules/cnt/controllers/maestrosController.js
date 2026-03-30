const s = require('../services/maestrosService');

const handler = (fn) => async (req, res, next) => { try { await fn(req, res); } catch (e) { next(e); } };
const parseQuery = (req) => ({
  all: req.query.all === 'true',
  page: Math.max(1, parseInt(req.query.page) || 1),
  limit: Math.max(1, Math.min(1000, parseInt(req.query.limit) || 20)),
  search: req.query.search || '',
  sortField: req.query.sortField || '',
  sortDir: req.query.sortDir === 'desc' ? 'desc' : 'asc',
});

const validateId = (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) { res.status(400).json({ message: 'ID inválido' }); return null; }
  return id;
};

// Grupos
const getGrupos    = handler(async (req, res) => res.json(await s.getGrupos(parseQuery(req))));
const createGrupo  = handler(async (req, res) => {
  if (!req.body.desc?.trim()) return res.status(400).json({ message: 'La descripción es requerida' });
  res.status(201).json(await s.createGrupo(req.body));
});
const updateGrupo  = handler(async (req, res) => {
  const id = validateId(req, res); if (id === null) return;
  await s.updateGrupo(id, req.body); res.json({ ok: true });
});
const deleteGrupo  = handler(async (req, res) => {
  const id = validateId(req, res); if (id === null) return;
  await s.removeGrupo(id); res.status(204).end();
});

// Rubros
const getRubros    = handler(async (req, res) => res.json(await s.getRubros(parseQuery(req))));
const createRubro  = handler(async (req, res) => {
  if (!req.body.desc?.trim()) return res.status(400).json({ message: 'La descripción es requerida' });
  res.status(201).json(await s.createRubro(req.body));
});
const updateRubro  = handler(async (req, res) => {
  const id = validateId(req, res); if (id === null) return;
  await s.updateRubro(id, req.body); res.json({ ok: true });
});
const deleteRubro  = handler(async (req, res) => {
  const id = validateId(req, res); if (id === null) return;
  await s.removeRubro(id); res.status(204).end();
});

// Centros de costo
const getCentrosCosto    = handler(async (req, res) => res.json(await s.getCentrosCosto(parseQuery(req))));
const createCentroCosto  = handler(async (req, res) => {
  if (!req.body.desc?.trim()) return res.status(400).json({ message: 'La descripción es requerida' });
  res.status(201).json(await s.createCentroCosto(req.body));
});
const updateCentroCosto  = handler(async (req, res) => {
  const id = validateId(req, res); if (id === null) return;
  await s.updateCentroCosto(id, req.body); res.json({ ok: true });
});
const deleteCentroCosto  = handler(async (req, res) => {
  const id = validateId(req, res); if (id === null) return;
  await s.removeCentroCosto(id); res.status(204).end();
});

module.exports = {
  getGrupos, createGrupo, updateGrupo, deleteGrupo,
  getRubros, createRubro, updateRubro, deleteRubro,
  getCentrosCosto, createCentroCosto, updateCentroCosto, deleteCentroCosto,
};
