const router = require('express').Router();
const { verifyToken } = require('../../../middlewares/auth');
const maestrosController            = require('../controllers/maestrosController');
const clienteController             = require('../controllers/clienteController');
const pedidoController              = require('../controllers/pedidoController');
const campanhaController            = require('../controllers/campanhaController');
const comisionController            = require('../controllers/comisionController');
const solicitudDescuentoController  = require('../controllers/solicitudDescuentoController');

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

// Agencias
router.get('/maestros/agencias',         verifyToken, maestrosController.getAgencias);
router.post('/maestros/agencias',        verifyToken, maestrosController.createAgencia);
router.put('/maestros/agencias/:id',     verifyToken, maestrosController.updateAgencia);
router.delete('/maestros/agencias/:id',  verifyToken, maestrosController.deleteAgencia);

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
router.get('/pedidos/:id/para-facturar', verifyToken, pedidoController.getParaFacturar);
router.post('/pedidos/:id/copiar', verifyToken, pedidoController.copiar);
router.post('/pedidos/:id/aprobar', verifyToken, pedidoController.aprobar);
router.post('/pedidos/:id/rechazar', verifyToken, pedidoController.rechazar);

// Presupuestos (misma tabla, tipo='P')
router.get('/presupuestos', verifyToken, (req, res, next) => { req.query.tipo = 'P'; pedidoController.getAll(req, res, next); });
router.get('/presupuestos/:id', verifyToken, pedidoController.getById);
router.post('/presupuestos', verifyToken, (req, res, next) => { req.body.ped_tipo = 'P'; pedidoController.create(req, res, next); });
router.put('/presupuestos/:id', verifyToken, pedidoController.update);
router.delete('/presupuestos/:id', verifyToken, pedidoController.remove);
router.post('/presupuestos/:id/convertir', verifyToken, pedidoController.convertir);
router.post('/presupuestos/:id/copiar', verifyToken, pedidoController.copiar);

const facturaController  = require('../controllers/facturaController');

// Facturas
router.get('/facturas',        verifyToken, facturaController.getAll);
router.get('/facturas/:id',    verifyToken, facturaController.getById);
router.post('/facturas',       verifyToken, facturaController.create);
router.put('/facturas/:id',    verifyToken, facturaController.update);
router.delete('/facturas/:id', verifyToken, facturaController.remove);

// Campañas
router.get('/campanhas',                    verifyToken, campanhaController.getAll);
router.get('/campanhas/nombres',            verifyToken, campanhaController.getDistinctNames);
router.get('/campanhas/cliente/:cli',       verifyToken, campanhaController.getByCliente);
router.post('/campanhas',                   verifyToken, campanhaController.create);
router.put('/campanhas/:cli/:nro',          verifyToken, campanhaController.update);
router.delete('/campanhas/:cli/:nro',       verifyToken, campanhaController.remove);

// Comisiones (solo lectura)
router.get('/comisiones',                   verifyToken, comisionController.getAll);

// Reporte de descuentos
router.get('/reportes/descuentos',                            verifyToken, solicitudDescuentoController.reporteDescuentos);

// Solicitudes de descuento
router.get('/solicitudes-descuento',                          verifyToken, solicitudDescuentoController.getAll);
router.get('/solicitudes-descuento/:id',                      verifyToken, solicitudDescuentoController.getById);
router.post('/solicitudes-descuento',                         verifyToken, solicitudDescuentoController.create);
router.post('/solicitudes-descuento/:id/:accion',             verifyToken, solicitudDescuentoController.procesarTodos);
router.post('/solicitudes-descuento/:id/item/:item/:accion',  verifyToken, solicitudDescuentoController.procesarItem);

module.exports = router;
