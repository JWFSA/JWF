const s = require('../services/movimientoService');

const getAll   = async (req, res, next) => {
  try {
    res.json(await s.getAll({
      all:       req.query.all === 'true',
      page:      parseInt(req.query.page)  || 1,
      limit:     parseInt(req.query.limit) || 20,
      search:    req.query.search    || '',
      sortField: req.query.sortField || '',
      sortDir:   req.query.sortDir   || 'asc',
    }));
  } catch (e) { next(e); }
};

const getById  = async (req, res, next) => {
  try { res.json(await s.getById(req.params.id)); } catch (e) { next(e); }
};

const create   = async (req, res, next) => {
  try {
    if (!req.body.docu_fec_emis) return res.status(400).json({ message: 'La fecha de emisión es requerida' });
    if (!req.body.docu_tipo_mov) return res.status(400).json({ message: 'El tipo de movimiento es requerido' });
    if (!req.body.docu_dep_orig) return res.status(400).json({ message: 'El depósito origen es requerido' });
    res.status(201).json(await s.create(req.body));
  } catch (e) { next(e); }
};

const update   = async (req, res, next) => {
  try { res.json(await s.update(req.params.id, req.body)); } catch (e) { next(e); }
};

const remove   = async (req, res, next) => {
  try { await s.remove(req.params.id); res.status(204).end(); } catch (e) { next(e); }
};

module.exports = { getAll, getById, create, update, remove };
