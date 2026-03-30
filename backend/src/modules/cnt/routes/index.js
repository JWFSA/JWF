const router = require('express').Router();
const { verifyToken } = require('../../../middlewares/auth');
const maestrosController  = require('../controllers/maestrosController');
const ejercicioController = require('../controllers/ejercicioController');
const cuentaController    = require('../controllers/cuentaController');
const asientoController   = require('../controllers/asientoController');

// Grupos
router.get('/maestros/grupos',         verifyToken, maestrosController.getGrupos);
router.post('/maestros/grupos',        verifyToken, maestrosController.createGrupo);
router.put('/maestros/grupos/:id',     verifyToken, maestrosController.updateGrupo);
router.delete('/maestros/grupos/:id',  verifyToken, maestrosController.deleteGrupo);

// Rubros
router.get('/maestros/rubros',         verifyToken, maestrosController.getRubros);
router.post('/maestros/rubros',        verifyToken, maestrosController.createRubro);
router.put('/maestros/rubros/:id',     verifyToken, maestrosController.updateRubro);
router.delete('/maestros/rubros/:id',  verifyToken, maestrosController.deleteRubro);

// Centros de costo
router.get('/maestros/centros-costo',         verifyToken, maestrosController.getCentrosCosto);
router.post('/maestros/centros-costo',        verifyToken, maestrosController.createCentroCosto);
router.put('/maestros/centros-costo/:id',     verifyToken, maestrosController.updateCentroCosto);
router.delete('/maestros/centros-costo/:id',  verifyToken, maestrosController.deleteCentroCosto);

// Ejercicios contables
router.get('/ejercicios',        verifyToken, ejercicioController.getAll);
router.get('/ejercicios/:id',    verifyToken, ejercicioController.getById);
router.post('/ejercicios',       verifyToken, ejercicioController.create);
router.put('/ejercicios/:id',    verifyToken, ejercicioController.update);
router.delete('/ejercicios/:id', verifyToken, ejercicioController.remove);

// Plan de cuentas
router.get('/cuentas',        verifyToken, cuentaController.getAll);
router.get('/cuentas/:id',    verifyToken, cuentaController.getById);
router.post('/cuentas',       verifyToken, cuentaController.create);
router.put('/cuentas/:id',    verifyToken, cuentaController.update);
router.delete('/cuentas/:id', verifyToken, cuentaController.remove);

// Asientos contables
router.get('/asientos',        verifyToken, asientoController.getAll);
router.get('/asientos/:id',    verifyToken, asientoController.getById);
router.post('/asientos',       verifyToken, asientoController.create);
router.put('/asientos/:id',    verifyToken, asientoController.update);
router.delete('/asientos/:id', verifyToken, asientoController.remove);

module.exports = router;
