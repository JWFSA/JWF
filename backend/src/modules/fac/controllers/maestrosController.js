const s = require('../services/maestrosService');

// Zonas
const getZonas      = async (req, res, next) => { try { res.json(await s.getZonas({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '' })); } catch (e) { next(e); } };
const createZona    = async (req, res, next) => { try { if (!req.body.zona_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createZona(req.body)); } catch (e) { next(e); } };
const updateZona    = async (req, res, next) => { try { res.json(await s.updateZona(req.params.id, req.body)); } catch (e) { next(e); } };
const deleteZona    = async (req, res, next) => { try { await s.deleteZona(req.params.id); res.status(204).end(); } catch (e) { next(e); } };

// Categorías
const getCategorias    = async (req, res, next) => { try { res.json(await s.getCategorias({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '' })); } catch (e) { next(e); } };
const createCategoria  = async (req, res, next) => { try { if (!req.body.fcat_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createCategoria(req.body)); } catch (e) { next(e); } };
const updateCategoria  = async (req, res, next) => { try { res.json(await s.updateCategoria(req.params.id, req.body)); } catch (e) { next(e); } };
const deleteCategoria  = async (req, res, next) => { try { await s.deleteCategoria(req.params.id); res.status(204).end(); } catch (e) { next(e); } };

// Condiciones
const getCondiciones   = async (req, res, next) => { try { res.json(await s.getCondiciones()); } catch (e) { next(e); } };
const createCondicion  = async (req, res, next) => { try { if (!req.body.con_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createCondicion(req.body)); } catch (e) { next(e); } };
const deleteCondicion  = async (req, res, next) => { try { await s.deleteCondicion(decodeURIComponent(req.params.id)); res.status(204).end(); } catch (e) { next(e); } };

// Vendedores
const getVendedores    = async (req, res, next) => { try { res.json(await s.getVendedores({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '' })); } catch (e) { next(e); } };
const createVendedor   = async (req, res, next) => { try { if (!req.body.vend_oper) return res.status(400).json({ message: 'El operador es requerido' }); res.status(201).json(await s.createVendedor(req.body)); } catch (e) { next(e); } };
const updateVendedor   = async (req, res, next) => { try { res.json(await s.updateVendedor(req.params.id, req.body)); } catch (e) { next(e); } };
const deleteVendedor   = async (req, res, next) => { try { await s.deleteVendedor(req.params.id); res.status(204).end(); } catch (e) { next(e); } };

module.exports = {
  getZonas, createZona, updateZona, deleteZona,
  getCategorias, createCategoria, updateCategoria, deleteCategoria,
  getCondiciones, createCondicion, deleteCondicion,
  getVendedores, createVendedor, updateVendedor, deleteVendedor,
};
