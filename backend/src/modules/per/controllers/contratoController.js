const s = require('../services/contratoService');

const getAll = async (req, res, next) => {
  try {
    res.json(await s.getContratos({
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
    if (!req.body.con_empleado || !req.body.con_fecha_ini) return res.status(400).json({ message: 'Empleado y fecha inicio son requeridos' });
    res.status(201).json(await s.createContrato(req.body));
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try { res.json(await s.updateContrato(req.params.id, req.body)); } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try { await s.deleteContrato(req.params.id); res.status(204).end(); } catch (e) { next(e); }
};

module.exports = { getAll, create, update, remove };
