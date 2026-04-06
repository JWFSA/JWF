const s = require('../services/remisionService');

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const all      = req.query.all === 'true';
      const page     = parseInt(req.query.page)  || 1;
      const limit    = parseInt(req.query.limit) || 20;
      const search   = req.query.search   || '';
      const sortField = req.query.sortField || '';
      const sortDir   = req.query.sortDir   || 'desc';
      res.json(await s.getAll({ page, limit, search, all, sortField, sortDir }));
    } catch (e) { next(e); }
  },

  getById: async (req, res, next) => {
    try {
      res.json(await s.getById(Number(req.params.nro)));
    } catch (e) { next(e); }
  },

  create: async (req, res, next) => {
    try {
      const data = req.body;
      if (!data.rem_fec_emis) return res.status(400).json({ message: 'La fecha es requerida' });
      res.status(201).json(await s.create(data));
    } catch (e) { next(e); }
  },

  update: async (req, res, next) => {
    try {
      res.json(await s.update(Number(req.params.nro), req.body));
    } catch (e) { next(e); }
  },

  remove: async (req, res, next) => {
    try {
      await s.remove(Number(req.params.nro));
      res.status(204).end();
    } catch (e) { next(e); }
  },

  getFromFactura: async (req, res, next) => {
    try {
      res.json(await s.getFromFactura(Number(req.params.id)));
    } catch (e) { next(e); }
  },
};
