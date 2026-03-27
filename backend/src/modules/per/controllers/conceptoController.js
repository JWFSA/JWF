const s = require('../services/conceptoService');

const getAll = async (req, res, next) => {
  try {
    res.json(await s.getConceptos({
      all: req.query.all === 'true',
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      search: req.query.search || '',
      sortField: req.query.sortField || '',
      sortDir: req.query.sortDir || 'asc',
    }));
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    if (!req.body.pcon_desc) return res.status(400).json({ message: 'La descripción es requerida' });
    res.status(201).json(await s.createConcepto(req.body));
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try { res.json(await s.updateConcepto(Number(req.params.id), req.body)); } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try { await s.deleteConcepto(Number(req.params.id)); res.status(204).end(); } catch (e) { next(e); }
};

module.exports = { getAll, create, update, remove };
