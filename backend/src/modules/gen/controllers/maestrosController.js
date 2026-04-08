const s = require('../services/maestrosService');

// ─── MONEDAS ─────────────────────────────────────────────────────────────────
const getMonedas      = async (req, res, next) => { try { res.json(await s.getMonedas()); } catch (e) { next(e); } };
const createMoneda    = async (req, res, next) => {
  try {
    if (!req.body.mon_desc) return res.status(400).json({ message: 'La descripción es requerida' });
    res.status(201).json(await s.createMoneda(req.body));
  } catch (e) { next(e); }
};
const updateMoneda    = async (req, res, next) => { try { res.json(await s.updateMoneda(Number(req.params.id), req.body)); } catch (e) { next(e); } };
const deleteMoneda    = async (req, res, next) => { try { await s.deleteMoneda(Number(req.params.id)); res.status(204).end(); } catch (e) { next(e); } };

// ─── PAÍSES ──────────────────────────────────────────────────────────────────
const getPaises       = async (req, res, next) => { try { res.json(await s.getPaises()); } catch (e) { next(e); } };
const createPais      = async (req, res, next) => {
  try {
    if (!req.body.pais_desc) return res.status(400).json({ message: 'La descripción es requerida' });
    res.status(201).json(await s.createPais(req.body));
  } catch (e) { next(e); }
};
const updatePais      = async (req, res, next) => { try { res.json(await s.updatePais(Number(req.params.id), req.body)); } catch (e) { next(e); } };
const deletePais      = async (req, res, next) => { try { await s.deletePais(Number(req.params.id)); res.status(204).end(); } catch (e) { next(e); } };

// ─── CIUDADES ─────────────────────────────────────────────────────────────────
const getCiudades     = async (req, res, next) => { try { res.json(await s.getCiudades({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '', sortField: req.query.sortField || '', sortDir: req.query.sortDir || 'asc' })); } catch (e) { next(e); } };
const createCiudad    = async (req, res, next) => { try { if (!req.body.ciudad_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createCiudad(req.body)); } catch (e) { next(e); } };
const updateCiudad    = async (req, res, next) => { try { res.json(await s.updateCiudad(Number(req.params.id), req.body)); } catch (e) { next(e); } };
const deleteCiudad    = async (req, res, next) => { try { await s.deleteCiudad(Number(req.params.id)); res.status(204).end(); } catch (e) { next(e); } };

// ─── DEPARTAMENTOS ────────────────────────────────────────────────────────────
const getDepartamentos  = async (req, res, next) => { try { res.json(await s.getDepartamentos()); } catch (e) { next(e); } };
const createDepartamento = async (req, res, next) => {
  try {
    if (!req.body.dpto_desc) return res.status(400).json({ message: 'La descripción es requerida' });
    res.status(201).json(await s.createDepartamento(req.body));
  } catch (e) { next(e); }
};
const updateDepartamento = async (req, res, next) => { try { res.json(await s.updateDepartamento(Number(req.params.id), req.body)); } catch (e) { next(e); } };
const deleteDepartamento = async (req, res, next) => { try { await s.deleteDepartamento(Number(req.params.id)); res.status(204).end(); } catch (e) { next(e); } };

// ─── SECCIONES ────────────────────────────────────────────────────────────────
const getSecciones    = async (req, res, next) => { try { res.json(await s.getSecciones(req.query.dpto)); } catch (e) { next(e); } };
const createSeccion   = async (req, res, next) => {
  try {
    if (!req.body.secc_desc) return res.status(400).json({ message: 'La descripción es requerida' });
    res.status(201).json(await s.createSeccion(req.params.dpto, req.body));
  } catch (e) { next(e); }
};
const updateSeccion   = async (req, res, next) => { try { res.json(await s.updateSeccion(Number(req.params.dpto), Number(req.params.id), req.body)); } catch (e) { next(e); } };
const deleteSeccion   = async (req, res, next) => { try { await s.deleteSeccion(Number(req.params.dpto), Number(req.params.id)); res.status(204).end(); } catch (e) { next(e); } };

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
const updatePrograma  = async (req, res, next) => { try { res.json(await s.updatePrograma(Number(req.params.id), req.body)); } catch (e) { next(e); } };
const deletePrograma  = async (req, res, next) => { try { await s.deletePrograma(Number(req.params.id)); res.status(204).end(); } catch (e) { next(e); } };

// ─── IMPUESTOS ────────────────────────────────────────────────────────────────
const getImpuestos    = async (req, res, next) => { try { res.json(await s.getImpuestos({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '', sortField: req.query.sortField || '', sortDir: req.query.sortDir || 'asc' })); } catch (e) { next(e); } };
const createImpuesto  = async (req, res, next) => { try { if (!req.body.impu_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createImpuesto(req.body)); } catch (e) { next(e); } };
const updateImpuesto  = async (req, res, next) => { try { res.json(await s.updateImpuesto(Number(req.params.id), req.body)); } catch (e) { next(e); } };
const deleteImpuesto  = async (req, res, next) => { try { await s.deleteImpuesto(Number(req.params.id)); res.status(204).end(); } catch (e) { next(e); } };

// ─── TIPOS DE IMPUESTO ────────────────────────────────────────────────────────
const getTiposImpuesto   = async (req, res, next) => { try { res.json(await s.getTiposImpuesto()); } catch (e) { next(e); } };
const createTipoImpuesto = async (req, res, next) => { try { if (!req.body.timpu_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createTipoImpuesto(req.body)); } catch (e) { next(e); } };
const updateTipoImpuesto = async (req, res, next) => { try { res.json(await s.updateTipoImpuesto(Number(req.params.id), req.body)); } catch (e) { next(e); } };
const deleteTipoImpuesto = async (req, res, next) => { try { await s.deleteTipoImpuesto(Number(req.params.id)); res.status(204).end(); } catch (e) { next(e); } };

// ─── PROFESIONES ────────────────────────────────────────────────────────────
const getProfesiones       = async (req, res, next) => { try { res.json(await s.getProfesiones({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '', sortField: req.query.sortField || '', sortDir: req.query.sortDir || 'asc' })); } catch (e) { next(e); } };
const createProfesion      = async (req, res, next) => { try { if (!req.body.prof_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createProfesion(req.body)); } catch (e) { next(e); } };
const updateProfesion      = async (req, res, next) => { try { res.json(await s.updateProfesion(Number(req.params.id), req.body)); } catch (e) { next(e); } };
const deleteProfesion      = async (req, res, next) => { try { await s.deleteProfesion(Number(req.params.id)); res.status(204).end(); } catch (e) { next(e); } };

// ─── DISTRITOS ──────────────────────────────────────────────────────────────
const getDistritos         = async (req, res, next) => { try { res.json(await s.getDistritos({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '', sortField: req.query.sortField || '', sortDir: req.query.sortDir || 'asc' })); } catch (e) { next(e); } };
const createDistrito       = async (req, res, next) => { try { if (!req.body.dist_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createDistrito(req.body)); } catch (e) { next(e); } };
const updateDistrito       = async (req, res, next) => { try { res.json(await s.updateDistrito(Number(req.params.id), req.body)); } catch (e) { next(e); } };
const deleteDistrito       = async (req, res, next) => { try { await s.deleteDistrito(Number(req.params.id)); res.status(204).end(); } catch (e) { next(e); } };

// ─── MOTIVOS DE ANULACIÓN ───────────────────────────────────────────────────
const getMotivosAnulacion  = async (req, res, next) => { try { res.json(await s.getMotivosAnulacion({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '', sortField: req.query.sortField || '', sortDir: req.query.sortDir || 'asc' })); } catch (e) { next(e); } };
const createMotivoAnulacion = async (req, res, next) => { try { if (!req.body.moan_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createMotivoAnulacion(req.body)); } catch (e) { next(e); } };
const updateMotivoAnulacion = async (req, res, next) => { try { res.json(await s.updateMotivoAnulacion(Number(req.params.id), req.body)); } catch (e) { next(e); } };
const deleteMotivoAnulacion = async (req, res, next) => { try { await s.deleteMotivoAnulacion(Number(req.params.id)); res.status(204).end(); } catch (e) { next(e); } };

// ─── LOCALIDADES ────────────────────────────────────────────────────────────
const getLocalidades       = async (req, res, next) => { try { res.json(await s.getLocalidades({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '', sortField: req.query.sortField || '', sortDir: req.query.sortDir || 'asc', dep: req.query.dep ? Number(req.query.dep) : null })); } catch (e) { next(e); } };
const createLocalidad      = async (req, res, next) => { try { if (!req.body.loc_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createLocalidad(req.body)); } catch (e) { next(e); } };
const updateLocalidad      = async (req, res, next) => { try { res.json(await s.updateLocalidad(Number(req.params.id), req.body)); } catch (e) { next(e); } };
const deleteLocalidad      = async (req, res, next) => { try { await s.deleteLocalidad(Number(req.params.id)); res.status(204).end(); } catch (e) { next(e); } };

// ─── BARRIOS ────────────────────────────────────────────────────────────────
const getBarrios           = async (req, res, next) => { try { res.json(await s.getBarrios({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '', sortField: req.query.sortField || '', sortDir: req.query.sortDir || 'asc', loc: req.query.loc ? Number(req.query.loc) : null })); } catch (e) { next(e); } };
const createBarrio         = async (req, res, next) => { try { if (!req.body.barr_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createBarrio(req.body)); } catch (e) { next(e); } };
const updateBarrio         = async (req, res, next) => { try { res.json(await s.updateBarrio(Number(req.params.id), req.body)); } catch (e) { next(e); } };
const deleteBarrio         = async (req, res, next) => { try { await s.deleteBarrio(Number(req.params.id)); res.status(204).end(); } catch (e) { next(e); } };

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
  getProfesiones, createProfesion, updateProfesion, deleteProfesion,
  getDistritos, createDistrito, updateDistrito, deleteDistrito,
  getMotivosAnulacion, createMotivoAnulacion, updateMotivoAnulacion, deleteMotivoAnulacion,
  getLocalidades, createLocalidad, updateLocalidad, deleteLocalidad,
  getBarrios, createBarrio, updateBarrio, deleteBarrio,
};
