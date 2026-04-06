const s = require('../services/cotizacionService');

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const { all, page, limit, search, sortField, sortDir, moneda } = req.query;
      res.json(await s.getAll({
        all: all === 'true',
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        search: search || '',
        sortField: sortField || '',
        sortDir: sortDir || 'desc',
        moneda: moneda || '',
      }));
    } catch (e) { next(e); }
  },

  create: async (req, res, next) => {
    try {
      res.status(201).json(await s.create(req.body));
    } catch (e) { next(e); }
  },

  update: async (req, res, next) => {
    try {
      res.json(await s.update(req.params.fec, Number(req.params.mon), req.body));
    } catch (e) { next(e); }
  },

  remove: async (req, res, next) => {
    try {
      await s.remove(req.params.fec, Number(req.params.mon));
      res.status(204).end();
    } catch (e) { next(e); }
  },
};
