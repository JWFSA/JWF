const empresaService = require('../services/empresaService');

const getAll = async (req, res, next) => {
  try {
    const all    = req.query.all === 'true';
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    res.json(await empresaService.getAll({ page, limit, search, all }));
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try { res.json(await empresaService.getById(req.params.id)); } catch (err) { next(err); }
};

const getSucursales = async (req, res, next) => {
  try { res.json(await empresaService.getSucursales(req.params.id)); } catch (err) { next(err); }
};

module.exports = { getAll, getById, getSucursales };
