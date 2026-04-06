const s = require('../services/cobranzaService');

module.exports = {
  getPendientes: async (req, res, next) => {
    try {
      const { all, page, limit, search, sortField, sortDir } = req.query;
      res.json(await s.getPendientes({
        all: all === 'true',
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        search: search || '',
        sortField: sortField || '',
        sortDir: sortDir || 'asc',
      }));
    } catch (e) { next(e); }
  },

  getCuotas: async (req, res, next) => {
    try { res.json(await s.getCuotas(Number(req.params.id))); } catch (e) { next(e); }
  },

  getCobros: async (req, res, next) => {
    try {
      const { page, limit, search, sortField, sortDir } = req.query;
      res.json(await s.getCobros({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        search: search || '',
        sortField: sortField || '',
        sortDir: sortDir || 'desc',
      }));
    } catch (e) { next(e); }
  },

  registrarCobro: async (req, res, next) => {
    try {
      if (!req.body.doc_clave) return res.status(400).json({ message: 'doc_clave es requerido' });
      if (!req.body.importe)   return res.status(400).json({ message: 'importe es requerido' });
      const login = req.user?.login || 'SISTEMA';
      res.status(201).json(await s.registrarCobro(req.body, login));
    } catch (e) { next(e); }
  },
};
