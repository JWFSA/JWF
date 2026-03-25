const router = require('express').Router();
const { verifyToken } = require('../../../middlewares/auth');
const maestrosController = require('../controllers/maestrosController');
const clienteController  = require('../controllers/clienteController');

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

// Vendedores
router.get('/vendedores',         verifyToken, maestrosController.getVendedores);
router.post('/vendedores',        verifyToken, maestrosController.createVendedor);
router.put('/vendedores/:id',     verifyToken, maestrosController.updateVendedor);
router.delete('/vendedores/:id',  verifyToken, maestrosController.deleteVendedor);

// Clientes
router.get('/clientes',       verifyToken, clienteController.getAll);
router.get('/clientes/:id',   verifyToken, clienteController.getById);
router.post('/clientes',      verifyToken, clienteController.create);
router.put('/clientes/:id',   verifyToken, clienteController.update);
router.delete('/clientes/:id',verifyToken, clienteController.remove);

module.exports = router;
