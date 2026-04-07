const articuloService = require('../services/articuloService');

const getAll = async (req, res, next) => {
  try {
    const all    = req.query.all === 'true';
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const sortField = req.query.sortField || '';
    const sortDir   = req.query.sortDir   || 'asc';
    const linea  = req.query.linea  || '';
    const marca  = req.query.marca  || '';
    const rubro  = req.query.rubro  || '';
    const estado = req.query.estado || '';
    res.json(await articuloService.getAll({ page, limit, search, all, sortField, sortDir, linea, marca, rubro, estado }));
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    res.json(await articuloService.getById(Number(req.params.id)));
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { art_desc } = req.body;
    if (!art_desc) return res.status(400).json({ message: 'La descripción es requerida' });
    res.status(201).json(await articuloService.create(req.body));
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    res.json(await articuloService.update(Number(req.params.id), req.body));
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await articuloService.remove(Number(req.params.id));
    res.status(204).end();
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };
