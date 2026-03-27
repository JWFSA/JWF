const svc = require('../services/facturaService');

const getAll  = async (req, res, next) => {
  try {
    const all      = req.query.all === 'true';
    const page     = parseInt(req.query.page)  || 1;
    const limit    = parseInt(req.query.limit) || 20;
    const search   = req.query.search   || '';
    const sortField = req.query.sortField || '';
    const sortDir   = req.query.sortDir   || 'desc';
    res.json(await svc.getAll({ page, limit, search, all, sortField, sortDir }));
  } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
  try { res.json(await svc.getById(req.params.id)); } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    if (!req.body.doc_fec_doc) return res.status(400).json({ message: 'La fecha es requerida' });
    res.status(201).json(await svc.create(req.body));
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try { res.json(await svc.update(req.params.id, req.body)); } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try { await svc.remove(req.params.id); res.status(204).end(); } catch (e) { next(e); }
};

module.exports = { getAll, getById, create, update, remove };
