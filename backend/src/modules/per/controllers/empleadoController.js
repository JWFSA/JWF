const s = require('../services/empleadoService');

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const all       = req.query.all === 'true';
      const page      = parseInt(req.query.page)  || 1;
      const limit     = parseInt(req.query.limit) || 20;
      const search    = req.query.search    || '';
      const sortField = req.query.sortField || '';
      const sortDir   = req.query.sortDir   || 'asc';
      const cargo     = req.query.cargo     || '';
      res.json(await s.getAll({ page, limit, search, all, sortField, sortDir, cargo }));
    } catch (e) { next(e); }
  },
  getById: async (req, res, next) => {
    try { res.json(await s.getById(Number(req.params.id))); } catch (e) { next(e); }
  },
  create: async (req, res, next) => {
    try {
      const { empl_nombre, empl_ape } = req.body;
      if (!empl_nombre) return res.status(400).json({ message: 'El nombre es requerido' });
      if (!empl_ape) return res.status(400).json({ message: 'El apellido es requerido' });
      res.status(201).json(await s.create(req.body));
    } catch (e) { next(e); }
  },
  update: async (req, res, next) => {
    try { res.json(await s.update(Number(req.params.id), req.body)); } catch (e) { next(e); }
  },
  remove: async (req, res, next) => {
    try { await s.remove(Number(req.params.id)); res.status(204).end(); } catch (e) { next(e); }
  },
};
