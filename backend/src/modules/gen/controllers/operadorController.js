const operadorService = require('../services/operadorService');

const getAll = async (req, res, next) => {
  try {
    const all    = req.query.all === 'true';
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    res.json(await operadorService.getAll({ page, limit, search, all }));
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    res.json(await operadorService.getById(req.params.id));
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    res.status(201).json(await operadorService.create(req.body));
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    res.json(await operadorService.update(req.params.id, req.body));
  } catch (err) { next(err); }
};

const assignRoles = async (req, res, next) => {
  try {
    res.json(await operadorService.assignRoles(req.params.id, req.body.roles));
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, assignRoles };
