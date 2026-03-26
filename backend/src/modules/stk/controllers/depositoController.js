const s = require('../services/depositoService');

const getAll = async (req, res, next) => {
  try {
    res.json(await s.getAll({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '', sortField: req.query.sortField || '', sortDir: req.query.sortDir || 'asc' }));
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const { dep_empr, dep_suc, dep_desc } = req.body;
    if (!dep_empr || !dep_suc || !dep_desc) return res.status(400).json({ message: 'Empresa, sucursal y descripción son requeridos' });
    res.status(201).json(await s.create(req.body));
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const { empr, suc, codigo } = req.params;
    res.json(await s.update(empr, suc, codigo, req.body));
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try {
    const { empr, suc, codigo } = req.params;
    await s.remove(empr, suc, codigo);
    res.status(204).end();
  } catch (e) { next(e); }
};

module.exports = { getAll, create, update, remove };
