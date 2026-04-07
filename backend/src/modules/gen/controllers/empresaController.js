const empresaService = require('../services/empresaService');

const getAll = async (req, res, next) => {
  try {
    const all    = req.query.all === 'true';
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const search    = req.query.search    || '';
    const sortField = req.query.sortField || '';
    const sortDir   = req.query.sortDir   || 'asc';
    res.json(await empresaService.getAll({ page, limit, search, all, sortField, sortDir }));
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try { res.json(await empresaService.getById(Number(req.params.id))); } catch (err) { next(err); }
};

const getSucursales = async (req, res, next) => {
  try { res.json(await empresaService.getSucursales(Number(req.params.id))); } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    if (!req.body.empr_razon_social) return res.status(400).json({ message: 'La razón social es requerida' });
    res.status(201).json(await empresaService.create(req.body));
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    res.json(await empresaService.update(Number(req.params.id), req.body));
  } catch (err) { next(err); }
};

const createSucursal = async (req, res, next) => {
  try {
    if (!req.body.suc_desc) return res.status(400).json({ message: 'La descripción es requerida' });
    res.status(201).json(await empresaService.createSucursal(Number(req.params.id), req.body));
  } catch (err) { next(err); }
};

const updateSucursal = async (req, res, next) => {
  try {
    res.json(await empresaService.updateSucursal(Number(req.params.id), Number(req.params.sucId), req.body));
  } catch (err) { next(err); }
};

const deleteSucursal = async (req, res, next) => {
  try {
    await empresaService.deleteSucursal(Number(req.params.id), Number(req.params.sucId));
    res.status(204).end();
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, getSucursales, create, update, createSucursal, updateSucursal, deleteSucursal };
