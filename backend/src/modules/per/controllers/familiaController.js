const s = require('../services/familiaService');

const getAll = async (req, res, next) => {
  try {
    res.json(await s.getFamiliares({
      all: req.query.all === 'true',
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      search: req.query.search || '',
      sortField: req.query.sortField || '',
      sortDir: req.query.sortDir || 'asc',
      empleado: req.query.empleado || '',
    }));
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    if (!req.body.fam_empl_codigo || !req.body.fam_nombre) return res.status(400).json({ message: 'Empleado y nombre son requeridos' });
    res.status(201).json(await s.createFamiliar(req.body));
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try { res.json(await s.updateFamiliar(req.params.id, req.params.empleado, req.body)); } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try { await s.deleteFamiliar(req.params.id, req.params.empleado); res.status(204).end(); } catch (e) { next(e); }
};

module.exports = { getAll, create, update, remove };
