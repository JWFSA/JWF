const rolService = require('../services/rolService');

const getAll = async (req, res, next) => {
  try {
    const all    = req.query.all === 'true';
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    res.json(await rolService.getAll({ page, limit, search, all }));
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try { res.json(await rolService.getById(req.params.id)); } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try { res.status(201).json(await rolService.create(req.body)); } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try { res.json(await rolService.update(req.params.id, req.body)); } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try { await rolService.remove(req.params.id); res.status(204).send(); } catch (err) { next(err); }
};

const assignProgramas = async (req, res, next) => {
  try { res.json(await rolService.assignProgramas(req.params.id, req.body.programas)); } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove, assignProgramas };
