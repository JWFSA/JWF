const s = require('../services/maestrosService');

// Zonas
const getZonas      = async (req, res, next) => { try { res.json(await s.getZonas({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '', sortField: req.query.sortField || '', sortDir: req.query.sortDir || 'asc' })); } catch (e) { next(e); } };
const createZona    = async (req, res, next) => { try { if (!req.body.zona_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createZona(req.body)); } catch (e) { next(e); } };
const updateZona    = async (req, res, next) => { try { res.json(await s.updateZona(Number(req.params.id), req.body)); } catch (e) { next(e); } };
const deleteZona    = async (req, res, next) => { try { await s.deleteZona(Number(req.params.id)); res.status(204).end(); } catch (e) { next(e); } };

// Categorías
const getCategorias    = async (req, res, next) => { try { res.json(await s.getCategorias({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '', sortField: req.query.sortField || '', sortDir: req.query.sortDir || 'asc' })); } catch (e) { next(e); } };
const createCategoria  = async (req, res, next) => { try { if (!req.body.fcat_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createCategoria(req.body)); } catch (e) { next(e); } };
const updateCategoria  = async (req, res, next) => { try { res.json(await s.updateCategoria(Number(req.params.id), req.body)); } catch (e) { next(e); } };
const deleteCategoria  = async (req, res, next) => { try { await s.deleteCategoria(Number(req.params.id)); res.status(204).end(); } catch (e) { next(e); } };

// Condiciones
const getCondiciones   = async (req, res, next) => { try { res.json(await s.getCondiciones()); } catch (e) { next(e); } };
const createCondicion  = async (req, res, next) => { try { if (!req.body.con_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createCondicion(req.body)); } catch (e) { next(e); } };
const deleteCondicion  = async (req, res, next) => { try { await s.deleteCondicion(decodeURIComponent(req.params.id)); res.status(204).end(); } catch (e) { next(e); } };

// Vendedores
const getVendedores    = async (req, res, next) => { try { res.json(await s.getVendedores({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '', sortField: req.query.sortField || '', sortDir: req.query.sortDir || 'asc' })); } catch (e) { next(e); } };
const createVendedor   = async (req, res, next) => { try { if (!req.body.vend_oper) return res.status(400).json({ message: 'El operador es requerido' }); res.status(201).json(await s.createVendedor(req.body)); } catch (e) { next(e); } };
const updateVendedor   = async (req, res, next) => { try { res.json(await s.updateVendedor(Number(req.params.id), req.body)); } catch (e) { next(e); } };
const deleteVendedor   = async (req, res, next) => { try { await s.deleteVendedor(Number(req.params.id)); res.status(204).end(); } catch (e) { next(e); } };
const getOperadoresVendedores = async (req, res, next) => { try { res.json(await s.getOperadoresVendedores()); } catch (e) { next(e); } };

// Listas de precio
const getListasPrecio   = async (req, res, next) => { try { res.json(await s.getListasPrecio({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '', sortField: req.query.sortField || '', sortDir: req.query.sortDir || 'asc' })); } catch (e) { next(e); } };
const createListaPrecio = async (req, res, next) => { try { if (!req.body.lipe_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createListaPrecio(req.body)); } catch (e) { next(e); } };
const updateListaPrecio = async (req, res, next) => { try { res.json(await s.updateListaPrecio(Number(req.params.id), req.body)); } catch (e) { next(e); } };
const deleteListaPrecio = async (req, res, next) => { try { await s.deleteListaPrecio(Number(req.params.id)); res.status(204).end(); } catch (e) { next(e); } };

// Lista de precio — detalle
const getListaPrecioItems  = async (req, res, next) => { try { res.json(await s.getListaPrecioItems(Number(req.params.id), { all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '' })); } catch (e) { next(e); } };
const upsertListaPrecioItem = async (req, res, next) => { try { if (!req.body.lipr_art) return res.status(400).json({ message: 'El artículo es requerido' }); await s.upsertListaPrecioItem(Number(req.params.id), req.body); res.status(200).json({ ok: true }); } catch (e) { next(e); } };
const deleteListaPrecioItem = async (req, res, next) => { try { await s.deleteListaPrecioItem(Number(req.params.id), Number(req.params.art)); res.status(204).end(); } catch (e) { next(e); } };

// Barrios
const getBarrios    = async (req, res, next) => { try { res.json(await s.getBarrios({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '', sortField: req.query.sortField || '', sortDir: req.query.sortDir || 'asc' })); } catch (e) { next(e); } };
const createBarrio  = async (req, res, next) => { try { if (!req.body.ba_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createBarrio(req.body)); } catch (e) { next(e); } };
const updateBarrio  = async (req, res, next) => { try { res.json(await s.updateBarrio(Number(req.params.id), req.body)); } catch (e) { next(e); } };
const deleteBarrio  = async (req, res, next) => { try { await s.deleteBarrio(Number(req.params.id)); res.status(204).end(); } catch (e) { next(e); } };

const getAgencias    = async (req, res, next) => { try { res.json(await s.getAgencias({ all: req.query.all === 'true', page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '', sortField: req.query.sortField || '', sortDir: req.query.sortDir || 'asc' })); } catch (e) { next(e); } };
const createAgencia  = async (req, res, next) => { try { if (!req.body.agen_desc) return res.status(400).json({ message: 'La descripción es requerida' }); res.status(201).json(await s.createAgencia(req.body)); } catch (e) { next(e); } };
const updateAgencia  = async (req, res, next) => { try { res.json(await s.updateAgencia(Number(req.params.id), req.body)); } catch (e) { next(e); } };
const deleteAgencia  = async (req, res, next) => { try { await s.deleteAgencia(Number(req.params.id)); res.status(204).end(); } catch (e) { next(e); } };

// Precio artículo (lookup para pedidos)
const getPrecioArticulo = async (req, res, next) => {
  try {
    const { lista, art, monPed } = req.query;
    if (!lista || !art) return res.status(400).json({ message: 'lista y art son requeridos' });
    const result = await s.getPrecioArticulo(Number(lista), Number(art), Number(monPed) || 1);
    if (!result) return res.status(404).json({ message: 'Artículo no encontrado en la lista de precio' });
    res.json(result);
  } catch (e) { next(e); }
};

module.exports = {
  getZonas, createZona, updateZona, deleteZona,
  getCategorias, createCategoria, updateCategoria, deleteCategoria,
  getCondiciones, createCondicion, deleteCondicion,
  getVendedores, getOperadoresVendedores, createVendedor, updateVendedor, deleteVendedor,
  getListasPrecio, createListaPrecio, updateListaPrecio, deleteListaPrecio,
  getListaPrecioItems, upsertListaPrecioItem, deleteListaPrecioItem,
  getBarrios, createBarrio, updateBarrio, deleteBarrio,
  getAgencias, createAgencia, updateAgencia, deleteAgencia,
  getPrecioArticulo,
};
