const router = require('express').Router();
const { verifyToken } = require('../../../middlewares/auth');
const maestrosController       = require('../controllers/maestrosController');
const proveedorController      = require('../controllers/proveedorController');
const cuentaBancariaController = require('../controllers/cuentaBancariaController');
const ordenPagoController      = require('../controllers/ordenPagoController');
const documentoController      = require('../controllers/documentoController');
const chequeController         = require('../controllers/chequeController');

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

// Personerías
router.get('/maestros/personerias',         verifyToken, maestrosController.getPersonerias);
router.post('/maestros/personerias',        verifyToken, maestrosController.createPersoneria);
router.put('/maestros/personerias/:id',     verifyToken, maestrosController.updatePersoneria);
router.delete('/maestros/personerias/:id',  verifyToken, maestrosController.deletePersoneria);

// Clases de documento
router.get('/maestros/clases-doc',         verifyToken, maestrosController.getClasesDoc);
router.post('/maestros/clases-doc',        verifyToken, maestrosController.createClaseDoc);
router.put('/maestros/clases-doc/:id',     verifyToken, maestrosController.updateClaseDoc);
router.delete('/maestros/clases-doc/:id',  verifyToken, maestrosController.deleteClaseDoc);

// Conceptos financieros
router.get('/maestros/conceptos',         verifyToken, maestrosController.getConceptos);
router.get('/maestros/conceptos/:id',     verifyToken, maestrosController.getConcepto);
router.post('/maestros/conceptos',        verifyToken, maestrosController.createConcepto);
router.put('/maestros/conceptos/:id',     verifyToken, maestrosController.updateConcepto);
router.delete('/maestros/conceptos/:id',  verifyToken, maestrosController.deleteConcepto);

// Cuentas bancarias
router.get('/cuentas-bancarias',        verifyToken, cuentaBancariaController.getAll);
router.get('/cuentas-bancarias/:id',    verifyToken, cuentaBancariaController.getById);
router.post('/cuentas-bancarias',       verifyToken, cuentaBancariaController.create);
router.put('/cuentas-bancarias/:id',    verifyToken, cuentaBancariaController.update);
router.delete('/cuentas-bancarias/:id', verifyToken, cuentaBancariaController.remove);

// Proveedores
router.get('/proveedores',        verifyToken, proveedorController.getAll);
router.get('/proveedores/:id',    verifyToken, proveedorController.getById);
router.post('/proveedores',       verifyToken, proveedorController.create);
router.put('/proveedores/:id',    verifyToken, proveedorController.update);
router.delete('/proveedores/:id', verifyToken, proveedorController.remove);

// Órdenes de pago
router.get('/ordenes-pago',        verifyToken, ordenPagoController.getAll);
router.get('/ordenes-pago/:id',    verifyToken, ordenPagoController.getById);
router.post('/ordenes-pago',       verifyToken, ordenPagoController.create);
router.put('/ordenes-pago/:id',    verifyToken, ordenPagoController.update);
router.delete('/ordenes-pago/:id', verifyToken, ordenPagoController.remove);

// Documentos financieros (solo lectura — documentos complejos generados por procesos)
router.get('/documentos',        verifyToken, documentoController.getAll);
router.get('/documentos/:id',    verifyToken, documentoController.getById);

// Cheques recibidos (solo lectura)
router.get('/cheques',        verifyToken, chequeController.getAll);
router.get('/cheques/:id',    verifyToken, chequeController.getById);

module.exports = router;
