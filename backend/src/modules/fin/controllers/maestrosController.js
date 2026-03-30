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

// Personerías
const getPersonerias    = async (req, res, next) => { try { res.json(await s.getPersonerias({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '', sortField: req.query.sortField || '', sortDir: req.query.sortDir || 'asc' })); } catch (e) { next(e); } };
const createPersoneria  = async (req, res, next) => { try { if (!req.body.pers_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createPersoneria(req.body)); } catch (e) { next(e); } };
const updatePersoneria  = async (req, res, next) => { try { res.json(await s.updatePersoneria(req.params.id, req.body)); } catch (e) { next(e); } };
const deletePersoneria  = async (req, res, next) => { try { await s.deletePersoneria(req.params.id); res.status(204).end(); } catch (e) { next(e); } };

// Clases de documento
const getClasesDoc    = async (req, res, next) => { try { res.json(await s.getClasesDoc({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '', sortField: req.query.sortField || '', sortDir: req.query.sortDir || 'asc' })); } catch (e) { next(e); } };
const createClaseDoc  = async (req, res, next) => { try { if (!req.body.cldo_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createClaseDoc(req.body)); } catch (e) { next(e); } };
const updateClaseDoc  = async (req, res, next) => { try { res.json(await s.updateClaseDoc(req.params.id, req.body)); } catch (e) { next(e); } };
const deleteClaseDoc  = async (req, res, next) => { try { await s.deleteClaseDoc(req.params.id); res.status(204).end(); } catch (e) { next(e); } };

// Conceptos financieros
const parseQuery = (req) => ({ all: req.query.all === 'true', page: Math.max(1, parseInt(req.query.page) || 1), limit: Math.max(1, Math.min(1000, parseInt(req.query.limit) || 20)), search: req.query.search || '', sortField: req.query.sortField || '', sortDir: req.query.sortDir === 'desc' ? 'desc' : 'asc' });
const getConceptos    = async (req, res, next) => { try { res.json(await s.getConceptos(parseQuery(req))); } catch (e) { next(e); } };
const getConcepto     = async (req, res, next) => { try { const id = Number(req.params.id); if (!Number.isFinite(id)) return res.status(400).json({ message: 'ID inválido' }); res.json(await s.getConcepto(id)); } catch (e) { next(e); } };
const createConcepto  = async (req, res, next) => { try { if (!req.body.fcon_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createConcepto(req.body)); } catch (e) { next(e); } };
const updateConcepto  = async (req, res, next) => { try { const id = Number(req.params.id); if (!Number.isFinite(id)) return res.status(400).json({ message: 'ID inválido' }); res.json(await s.updateConcepto(id, req.body)); } catch (e) { next(e); } };
const deleteConcepto  = async (req, res, next) => { try { const id = Number(req.params.id); if (!Number.isFinite(id)) return res.status(400).json({ message: 'ID inválido' }); await s.deleteConcepto(id); res.status(204).end(); } catch (e) { next(e); } };

// Períodos financieros
const getPeriodos    = async (req, res, next) => { try { res.json(await s.getPeriodos(parseQuery(req))); } catch (e) { next(e); } };
const createPeriodo  = async (req, res, next) => { try { if (!req.body.peri_fec_ini || !req.body.peri_fec_fin) return res.status(400).json({ message: 'Las fechas son requeridas' }); res.status(201).json(await s.createPeriodo(req.body)); } catch (e) { next(e); } };
const updatePeriodo  = async (req, res, next) => { try { const id = Number(req.params.id); if (!Number.isFinite(id)) return res.status(400).json({ message: 'ID inválido' }); await s.updatePeriodo(id, req.body); res.json({ ok: true }); } catch (e) { next(e); } };
const deletePeriodo  = async (req, res, next) => { try { const id = Number(req.params.id); if (!Number.isFinite(id)) return res.status(400).json({ message: 'ID inválido' }); await s.deletePeriodo(id); res.status(204).end(); } catch (e) { next(e); } };

// Cobradores
const getCobradores    = async (req, res, next) => { try { res.json(await s.getCobradores(parseQuery(req))); } catch (e) { next(e); } };
const createCobrador   = async (req, res, next) => { try { if (!req.body.cob_codigo) return res.status(400).json({ message: 'El código es requerido' }); res.status(201).json(await s.createCobrador(req.body)); } catch (e) { next(e); } };
const updateCobrador   = async (req, res, next) => { try { const id = Number(req.params.id); if (!Number.isFinite(id)) return res.status(400).json({ message: 'ID inválido' }); await s.updateCobrador(id, req.body); res.json({ ok: true }); } catch (e) { next(e); } };
const deleteCobrador   = async (req, res, next) => { try { const id = Number(req.params.id); if (!Number.isFinite(id)) return res.status(400).json({ message: 'ID inválido' }); await s.deleteCobrador(id); res.status(204).end(); } catch (e) { next(e); } };

module.exports = {
  getBancos, createBanco, updateBanco, deleteBanco,
  getFormasPago, createFormaPago, updateFormaPago, deleteFormaPago,
  getRamos, createRamo, updateRamo, deleteRamo,
  getTiposProveedor, createTipoProveedor, updateTipoProveedor, deleteTipoProveedor,
  getPersonerias, createPersoneria, updatePersoneria, deletePersoneria,
  getClasesDoc, createClaseDoc, updateClaseDoc, deleteClaseDoc,
  getConceptos, getConcepto, createConcepto, updateConcepto, deleteConcepto,
  getPeriodos, createPeriodo, updatePeriodo, deletePeriodo,
  getCobradores, createCobrador, updateCobrador, deleteCobrador,
};
