const s = require('../services/maestrosService');

// Líneas
const getLineas          = async (req, res, next) => { try { res.json(await s.getLineas({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '', sortField: req.query.sortField || '', sortDir: req.query.sortDir || 'asc' })); } catch (e) { next(e); } };
const createLinea        = async (req, res, next) => { try { if (!req.body.lin_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createLinea(req.body)); } catch (e) { next(e); } };
const updateLinea        = async (req, res, next) => { try { res.json(await s.updateLinea(req.params.id, req.body)); } catch (e) { next(e); } };
const deleteLinea        = async (req, res, next) => { try { await s.deleteLinea(req.params.id); res.status(204).end(); } catch (e) { next(e); } };

// Marcas
const getMarcas          = async (req, res, next) => { try { res.json(await s.getMarcas({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '', sortField: req.query.sortField || '', sortDir: req.query.sortDir || 'asc' })); } catch (e) { next(e); } };
const createMarca        = async (req, res, next) => { try { if (!req.body.marc_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createMarca(req.body)); } catch (e) { next(e); } };
const updateMarca        = async (req, res, next) => { try { res.json(await s.updateMarca(req.params.id, req.body)); } catch (e) { next(e); } };
const deleteMarca        = async (req, res, next) => { try { await s.deleteMarca(req.params.id); res.status(204).end(); } catch (e) { next(e); } };

// Rubros
const getRubros          = async (req, res, next) => { try { res.json(await s.getRubros({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '', sortField: req.query.sortField || '', sortDir: req.query.sortDir || 'asc' })); } catch (e) { next(e); } };
const createRubro        = async (req, res, next) => { try { if (!req.body.rub_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createRubro(req.body)); } catch (e) { next(e); } };
const updateRubro        = async (req, res, next) => { try { res.json(await s.updateRubro(req.params.id, req.body)); } catch (e) { next(e); } };
const deleteRubro        = async (req, res, next) => { try { await s.deleteRubro(req.params.id); res.status(204).end(); } catch (e) { next(e); } };

// Unidades de medida
const getUnidadesMedida  = async (req, res, next) => { try { res.json(await s.getUnidadesMedida({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '', sortDir: req.query.sortDir || 'asc' })); } catch (e) { next(e); } };
const createUnidadMedida = async (req, res, next) => { try { if (!req.body.um_codigo) return res.status(400).json({ message: 'El código es requerido' }); res.status(201).json(await s.createUnidadMedida(req.body)); } catch (e) { next(e); } };
const deleteUnidadMedida = async (req, res, next) => { try { await s.deleteUnidadMedida(req.params.id); res.status(204).end(); } catch (e) { next(e); } };

// Grupos
const getGrupos          = async (req, res, next) => { try { res.json(await s.getGrupos({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '', linea: req.query.linea ? parseInt(req.query.linea) : undefined, sortField: req.query.sortField || '', sortDir: req.query.sortDir || 'asc' })); } catch (e) { next(e); } };
const createGrupo        = async (req, res, next) => { try { if (!req.body.grup_desc) return res.status(400).json({ message: 'La descripción es requerida' }); if (!req.body.grup_linea) return res.status(400).json({ message: 'La línea es requerida' }); res.status(201).json(await s.createGrupo(req.body)); } catch (e) { next(e); } };
const updateGrupo        = async (req, res, next) => { try { res.json(await s.updateGrupo(req.params.linea, req.params.codigo, req.body)); } catch (e) { next(e); } };
const deleteGrupo        = async (req, res, next) => { try { await s.deleteGrupo(req.params.linea, req.params.codigo); res.status(204).end(); } catch (e) { next(e); } };

module.exports = {
  getLineas, createLinea, updateLinea, deleteLinea,
  getMarcas, createMarca, updateMarca, deleteMarca,
  getRubros, createRubro, updateRubro, deleteRubro,
  getUnidadesMedida, createUnidadMedida, deleteUnidadMedida,
  getGrupos, createGrupo, updateGrupo, deleteGrupo,
  getOperaciones: async (_req, res, next) => { try { res.json(await s.getOperaciones()); } catch (e) { next(e); } },
};
