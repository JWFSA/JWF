const s = require('../services/maestrosService');

// ─── MONEDAS ─────────────────────────────────────────────────────────────────
const getMonedas      = async (req, res, next) => { try { res.json(await s.getMonedas()); } catch (e) { next(e); } };
const createMoneda    = async (req, res, next) => {
  try {
    if (!req.body.mon_desc) return res.status(400).json({ message: 'La descripción es requerida' });
    res.status(201).json(await s.createMoneda(req.body));
  } catch (e) { next(e); }
};
const updateMoneda    = async (req, res, next) => { try { res.json(await s.updateMoneda(req.params.id, req.body)); } catch (e) { next(e); } };
const deleteMoneda    = async (req, res, next) => { try { await s.deleteMoneda(req.params.id); res.status(204).end(); } catch (e) { next(e); } };

// ─── PAÍSES ──────────────────────────────────────────────────────────────────
const getPaises       = async (req, res, next) => { try { res.json(await s.getPaises()); } catch (e) { next(e); } };
const createPais      = async (req, res, next) => {
  try {
    if (!req.body.pais_desc) return res.status(400).json({ message: 'La descripción es requerida' });
    res.status(201).json(await s.createPais(req.body));
  } catch (e) { next(e); }
};
const updatePais      = async (req, res, next) => { try { res.json(await s.updatePais(req.params.id, req.body)); } catch (e) { next(e); } };
const deletePais      = async (req, res, next) => { try { await s.deletePais(req.params.id); res.status(204).end(); } catch (e) { next(e); } };

// ─── CIUDADES ─────────────────────────────────────────────────────────────────
const getCiudades     = async (req, res, next) => { try { res.json(await s.getCiudades({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '', sortField: req.query.sortField || '', sortDir: req.query.sortDir || 'asc' })); } catch (e) { next(e); } };
const createCiudad    = async (req, res, next) => { try { if (!req.body.ciudad_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createCiudad(req.body)); } catch (e) { next(e); } };
const updateCiudad    = async (req, res, next) => { try { res.json(await s.updateCiudad(req.params.id, req.body)); } catch (e) { next(e); } };
const deleteCiudad    = async (req, res, next) => { try { await s.deleteCiudad(req.params.id); res.status(204).end(); } catch (e) { next(e); } };

// ─── DEPARTAMENTOS ────────────────────────────────────────────────────────────
const getDepartamentos  = async (req, res, next) => { try { res.json(await s.getDepartamentos()); } catch (e) { next(e); } };
const createDepartamento = async (req, res, next) => {
  try {
    if (!req.body.dpto_desc) return res.status(400).json({ message: 'La descripción es requerida' });
    res.status(201).json(await s.createDepartamento(req.body));
  } catch (e) { next(e); }
};
const updateDepartamento = async (req, res, next) => { try { res.json(await s.updateDepartamento(req.params.id, req.body)); } catch (e) { next(e); } };
const deleteDepartamento = async (req, res, next) => { try { await s.deleteDepartamento(req.params.id); res.status(204).end(); } catch (e) { next(e); } };

// ─── SECCIONES ────────────────────────────────────────────────────────────────
const getSecciones    = async (req, res, next) => { try { res.json(await s.getSecciones(req.query.dpto)); } catch (e) { next(e); } };
const createSeccion   = async (req, res, next) => {
  try {
    if (!req.body.secc_desc) return res.status(400).json({ message: 'La descripción es requerida' });
    res.status(201).json(await s.createSeccion(req.params.dpto, req.body));
  } catch (e) { next(e); }
};
const updateSeccion   = async (req, res, next) => { try { res.json(await s.updateSeccion(req.params.dpto, req.params.id, req.body)); } catch (e) { next(e); } };
const deleteSeccion   = async (req, res, next) => { try { await s.deleteSeccion(req.params.dpto, req.params.id); res.status(204).end(); } catch (e) { next(e); } };

// ─── SISTEMAS ─────────────────────────────────────────────────────────────────
const getSistemas     = async (req, res, next) => { try { res.json(await s.getSistemas()); } catch (e) { next(e); } };

// ─── PROGRAMAS ────────────────────────────────────────────────────────────────
const getProgramas    = async (req, res, next) => { try { res.json(await s.getProgramas(req.query.sistema)); } catch (e) { next(e); } };
const createPrograma  = async (req, res, next) => {
  try {
    if (!req.body.prog_desc || !req.body.prog_sistema) return res.status(400).json({ message: 'Descripción y sistema son requeridos' });
    res.status(201).json(await s.createPrograma(req.body));
  } catch (e) { next(e); }
};
const updatePrograma  = async (req, res, next) => { try { res.json(await s.updatePrograma(req.params.id, req.body)); } catch (e) { next(e); } };
const deletePrograma  = async (req, res, next) => { try { await s.deletePrograma(req.params.id); res.status(204).end(); } catch (e) { next(e); } };

// ─── IMPUESTOS ────────────────────────────────────────────────────────────────
const getImpuestos    = async (req, res, next) => { try { res.json(await s.getImpuestos({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '', sortField: req.query.sortField || '', sortDir: req.query.sortDir || 'asc' })); } catch (e) { next(e); } };
const createImpuesto  = async (req, res, next) => { try { if (!req.body.impu_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createImpuesto(req.body)); } catch (e) { next(e); } };
const updateImpuesto  = async (req, res, next) => { try { res.json(await s.updateImpuesto(req.params.id, req.body)); } catch (e) { next(e); } };
const deleteImpuesto  = async (req, res, next) => { try { await s.deleteImpuesto(req.params.id); res.status(204).end(); } catch (e) { next(e); } };

// ─── TIPOS DE IMPUESTO ────────────────────────────────────────────────────────
const getTiposImpuesto   = async (req, res, next) => { try { res.json(await s.getTiposImpuesto()); } catch (e) { next(e); } };
const createTipoImpuesto = async (req, res, next) => { try { if (!req.body.timpu_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createTipoImpuesto(req.body)); } catch (e) { next(e); } };
const updateTipoImpuesto = async (req, res, next) => { try { res.json(await s.updateTipoImpuesto(req.params.id, req.body)); } catch (e) { next(e); } };
const deleteTipoImpuesto = async (req, res, next) => { try { await s.deleteTipoImpuesto(req.params.id); res.status(204).end(); } catch (e) { next(e); } };

module.exports = {
  getMonedas, createMoneda, updateMoneda, deleteMoneda,
  getPaises, createPais, updatePais, deletePais,
  getCiudades, createCiudad, updateCiudad, deleteCiudad,
  getDepartamentos, createDepartamento, updateDepartamento, deleteDepartamento,
  getSecciones, createSeccion, updateSeccion, deleteSeccion,
  getSistemas,
  getProgramas, createPrograma, updatePrograma, deletePrograma,
  getImpuestos, createImpuesto, updateImpuesto, deleteImpuesto,
  getTiposImpuesto, createTipoImpuesto, updateTipoImpuesto, deleteTipoImpuesto,
};
