const operadorService = require('../services/operadorService');

const getAll = async (req, res, next) => {
  try {
    const all    = req.query.all === 'true';
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const search    = req.query.search    || '';
    const sortField = req.query.sortField || '';
    const sortDir   = req.query.sortDir   || 'asc';
    res.json(await operadorService.getAll({ page, limit, search, all, sortField, sortDir }));
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    res.json(await operadorService.getById(Number(req.params.id)));
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    res.status(201).json(await operadorService.create(req.body));
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    res.json(await operadorService.update(Number(req.params.id), req.body));
  } catch (err) { next(err); }
};

const assignRoles = async (req, res, next) => {
  try {
    res.json(await operadorService.assignRoles(Number(req.params.id), req.body.roles));
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, assignRoles };
