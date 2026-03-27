const router = require('express').Router();
const { verifyToken } = require('../../../middlewares/auth');
const maestrosController = require('../controllers/maestrosController');
const clienteController  = require('../controllers/clienteController');
const pedidoController   = require('../controllers/pedidoController');

// Zonas
router.get('/maestros/zonas',         verifyToken, maestrosController.getZonas);
router.post('/maestros/zonas',        verifyToken, maestrosController.createZona);
router.put('/maestros/zonas/:id',     verifyToken, maestrosController.updateZona);
router.delete('/maestros/zonas/:id',  verifyToken, maestrosController.deleteZona);

// Categorías
router.get('/maestros/categorias',         verifyToken, maestrosController.getCategorias);
router.post('/maestros/categorias',        verifyToken, maestrosController.createCategoria);
router.put('/maestros/categorias/:id',     verifyToken, maestrosController.updateCategoria);
router.delete('/maestros/categorias/:id',  verifyToken, maestrosController.deleteCategoria);

// Condiciones de venta
router.get('/maestros/condiciones',        verifyToken, maestrosController.getCondiciones);
router.post('/maestros/condiciones',       verifyToken, maestrosController.createCondicion);
router.delete('/maestros/condiciones/:id', verifyToken, maestrosController.deleteCondicion);

// Listas de precio
router.get('/maestros/listas-precio',                          verifyToken, maestrosController.getListasPrecio);
router.post('/maestros/listas-precio',                         verifyToken, maestrosController.createListaPrecio);
router.get('/maestros/listas-precio/:id',                      verifyToken, async (req, res, next) => { try { const s = require('../services/maestrosService'); res.json(await s.getListaPrecio(req.params.id)); } catch (e) { next(e); } });
router.put('/maestros/listas-precio/:id',                      verifyToken, maestrosController.updateListaPrecio);
router.delete('/maestros/listas-precio/:id',                   verifyToken, maestrosController.deleteListaPrecio);
router.get('/maestros/listas-precio/:id/items',                verifyToken, maestrosController.getListaPrecioItems);
router.post('/maestros/listas-precio/:id/items',               verifyToken, maestrosController.upsertListaPrecioItem);
router.delete('/maestros/listas-precio/:id/items/:art',        verifyToken, maestrosController.deleteListaPrecioItem);

// Barrios
router.get('/maestros/barrios',         verifyToken, maestrosController.getBarrios);
router.post('/maestros/barrios',        verifyToken, maestrosController.createBarrio);
router.put('/maestros/barrios/:id',     verifyToken, maestrosController.updateBarrio);
router.delete('/maestros/barrios/:id',  verifyToken, maestrosController.deleteBarrio);

// Vendedores
router.get('/vendedores',         verifyToken, maestrosController.getVendedores);
router.post('/vendedores',        verifyToken, maestrosController.createVendedor);
router.put('/vendedores/:id',     verifyToken, maestrosController.updateVendedor);
router.delete('/vendedores/:id',  verifyToken, maestrosController.deleteVendedor);

// Clientes
router.get('/clientes',        verifyToken, clienteController.getAll);
router.get('/clientes/:id',    verifyToken, clienteController.getById);
router.post('/clientes',       verifyToken, clienteController.create);
router.put('/clientes/:id',    verifyToken, clienteController.update);
router.delete('/clientes/:id', verifyToken, clienteController.remove);

// Artículos (búsqueda para items de pedido)
router.get('/articulos', verifyToken, pedidoController.getArticulos);

// Pedidos
router.get('/pedidos',        verifyToken, pedidoController.getAll);
router.get('/pedidos/:id',    verifyToken, pedidoController.getById);
router.post('/pedidos',       verifyToken, pedidoController.create);
router.put('/pedidos/:id',    verifyToken, pedidoController.update);
router.delete('/pedidos/:id', verifyToken, pedidoController.remove);

const facturaController  = require('../controllers/facturaController');

// Facturas
router.get('/facturas',        verifyToken, facturaController.getAll);
router.get('/facturas/:id',    verifyToken, facturaController.getById);
router.post('/facturas',       verifyToken, facturaController.create);
router.put('/facturas/:id',    verifyToken, facturaController.update);
router.delete('/facturas/:id', verifyToken, facturaController.remove);

module.exports = router;
