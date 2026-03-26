const s = require('../services/maestrosService');

// Bancos
const getBancos      = async (req, res, next) => { try { res.json(await s.getBancos({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '', sortField: req.query.sortField || '', sortDir: req.query.sortDir || 'asc' })); } catch (e) { next(e); } };
const createBanco    = async (req, res, next) => { try { if (!req.body.bco_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createBanco(req.body)); } catch (e) { next(e); } };
const updateBanco    = async (req, res, next) => { try { res.json(await s.updateBanco(req.params.id, req.body)); } catch (e) { next(e); } };
const deleteBanco    = async (req, res, next) => { try { await s.deleteBanco(req.params.id); res.status(204).end(); } catch (e) { next(e); } };

// Formas de pago
const getFormasPago    = async (req, res, next) => { try { res.json(await s.getFormasPago({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '', sortField: req.query.sortField || '', sortDir: req.query.sortDir || 'asc' })); } catch (e) { next(e); } };
const createFormaPago  = async (req, res, next) => { try { if (!req.body.fpag_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createFormaPago(req.body)); } catch (e) { next(e); } };
const updateFormaPago  = async (req, res, next) => { try { res.json(await s.updateFormaPago(req.params.id, req.body)); } catch (e) { next(e); } };
const deleteFormaPago  = async (req, res, next) => { try { await s.deleteFormaPago(req.params.id); res.status(204).end(); } catch (e) { next(e); } };

// Ramos
const getRamos      = async (req, res, next) => { try { res.json(await s.getRamos({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '', sortField: req.query.sortField || '', sortDir: req.query.sortDir || 'asc' })); } catch (e) { next(e); } };
const createRamo    = async (req, res, next) => { try { if (!req.body.ramo_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createRamo(req.body)); } catch (e) { next(e); } };
const updateRamo    = async (req, res, next) => { try { res.json(await s.updateRamo(req.params.id, req.body)); } catch (e) { next(e); } };
const deleteRamo    = async (req, res, next) => { try { await s.deleteRamo(req.params.id); res.status(204).end(); } catch (e) { next(e); } };

// Tipos de proveedor
const getTiposProveedor    = async (req, res, next) => { try { res.json(await s.getTiposProveedor({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '', sortField: req.query.sortField || '', sortDir: req.query.sortDir || 'asc' })); } catch (e) { next(e); } };
const createTipoProveedor  = async (req, res, next) => { try { if (!req.body.tipr_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createTipoProveedor(req.body)); } catch (e) { next(e); } };
const updateTipoProveedor  = async (req, res, next) => { try { res.json(await s.updateTipoProveedor(req.params.id, req.body)); } catch (e) { next(e); } };
const deleteTipoProveedor  = async (req, res, next) => { try { await s.deleteTipoProveedor(req.params.id); res.status(204).end(); } catch (e) { next(e); } };

module.exports = {
  getBancos, createBanco, updateBanco, deleteBanco,
  getFormasPago, createFormaPago, updateFormaPago, deleteFormaPago,
  getRamos, createRamo, updateRamo, deleteRamo,
  getTiposProveedor, createTipoProveedor, updateTipoProveedor, deleteTipoProveedor,
};
