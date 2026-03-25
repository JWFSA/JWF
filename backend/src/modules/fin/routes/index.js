const router = require('express').Router();
const { verifyToken } = require('../../../middlewares/auth');
const maestrosController  = require('../controllers/maestrosController');
const proveedorController = require('../controllers/proveedorController');

// Bancos
router.get('/maestros/bancos',         verifyToken, maestrosController.getBancos);
router.post('/maestros/bancos',        verifyToken, maestrosController.createBanco);
router.put('/maestros/bancos/:id',     verifyToken, maestrosController.updateBanco);
router.delete('/maestros/bancos/:id',  verifyToken, maestrosController.deleteBanco);

// Formas de pago
router.get('/maestros/formas-pago',         verifyToken, maestrosController.getFormasPago);
router.post('/maestros/formas-pago',        verifyToken, maestrosController.createFormaPago);
router.put('/maestros/formas-pago/:id',     verifyToken, maestrosController.updateFormaPago);
router.delete('/maestros/formas-pago/:id',  verifyToken, maestrosController.deleteFormaPago);

// Ramos
router.get('/maestros/ramos',         verifyToken, maestrosController.getRamos);
router.post('/maestros/ramos',        verifyToken, maestrosController.createRamo);
router.put('/maestros/ramos/:id',     verifyToken, maestrosController.updateRamo);
router.delete('/maestros/ramos/:id',  verifyToken, maestrosController.deleteRamo);

// Tipos de proveedor
router.get('/maestros/tipos-proveedor',         verifyToken, maestrosController.getTiposProveedor);
router.post('/maestros/tipos-proveedor',        verifyToken, maestrosController.createTipoProveedor);
router.put('/maestros/tipos-proveedor/:id',     verifyToken, maestrosController.updateTipoProveedor);
router.delete('/maestros/tipos-proveedor/:id',  verifyToken, maestrosController.deleteTipoProveedor);

// Proveedores
router.get('/proveedores',        verifyToken, proveedorController.getAll);
router.get('/proveedores/:id',    verifyToken, proveedorController.getById);
router.post('/proveedores',       verifyToken, proveedorController.create);
router.put('/proveedores/:id',    verifyToken, proveedorController.update);
router.delete('/proveedores/:id', verifyToken, proveedorController.remove);

module.exports = router;
