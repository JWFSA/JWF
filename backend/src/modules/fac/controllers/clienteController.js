const clienteService = require('../services/clienteService');

const getAll = async (req, res, next) => {
  try {
    const all    = req.query.all === 'true';
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const sortField = req.query.sortField || '';
    const sortDir   = req.query.sortDir   || 'asc';
    res.json(await clienteService.getAll({ page, limit, search, all, sortField, sortDir }));
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try { res.json(await clienteService.getById(req.params.id)); } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    if (!req.body.cli_nom) return res.status(400).json({ message: 'El nombre es requerido' });
    res.status(201).json(await clienteService.create(req.body));
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try { res.json(await clienteService.update(req.params.id, req.body)); } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try { await clienteService.remove(req.params.id); res.status(204).end(); } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };
