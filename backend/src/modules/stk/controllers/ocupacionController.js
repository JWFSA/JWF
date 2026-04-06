const s = require('../services/ocupacionService');

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const { all, page, limit, search, sortField, sortDir, ubicacion, estado } = req.query;
      res.json(await s.getAll({
        all: all === 'true',
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        search: search || '',
        sortField: sortField || '',
        sortDir: sortDir || 'desc',
        ubicacion: ubicacion || '',
        estado: estado || '',
      }));
    } catch (e) { next(e); }
  },

  getUbicaciones: async (_req, res, next) => {
    try { res.json(await s.getUbicaciones()); } catch (e) { next(e); }
  },
};
