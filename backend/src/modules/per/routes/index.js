const router = require('express').Router();
const { verifyToken } = require('../../../middlewares/auth');
const m  = require('../controllers/maestrosController');
const ec = require('../controllers/empleadoController');

// Cargos
router.get('/maestros/cargos',         verifyToken, m.cargos.getAll);
router.post('/maestros/cargos',        verifyToken, m.cargos.create);
router.put('/maestros/cargos/:id',     verifyToken, m.cargos.update);
router.delete('/maestros/cargos/:id',  verifyToken, m.cargos.remove);

// Categorías
router.get('/maestros/categorias',         verifyToken, m.categorias.getAll);
router.post('/maestros/categorias',        verifyToken, m.categorias.create);
router.put('/maestros/categorias/:id',     verifyToken, m.categorias.update);
router.delete('/maestros/categorias/:id',  verifyToken, m.categorias.remove);

// Áreas
router.get('/maestros/areas',         verifyToken, m.areas.getAll);
router.post('/maestros/areas',        verifyToken, m.areas.create);
router.put('/maestros/areas/:id',     verifyToken, m.areas.update);
router.delete('/maestros/areas/:id',  verifyToken, m.areas.remove);

// Secciones
router.get('/maestros/secciones',         verifyToken, m.secciones.getAll);
router.post('/maestros/secciones',        verifyToken, m.secciones.create);
router.put('/maestros/secciones/:id',     verifyToken, m.secciones.update);
router.delete('/maestros/secciones/:id',  verifyToken, m.secciones.remove);

// Turnos
router.get('/maestros/turnos',         verifyToken, m.turnos.getAll);
router.post('/maestros/turnos',        verifyToken, m.turnos.create);
router.put('/maestros/turnos/:id',     verifyToken, m.turnos.update);
router.delete('/maestros/turnos/:id',  verifyToken, m.turnos.remove);

// Tipos de contrato
router.get('/maestros/tipos-contrato',         verifyToken, m.tiposContrato.getAll);
router.post('/maestros/tipos-contrato',        verifyToken, m.tiposContrato.create);
router.put('/maestros/tipos-contrato/:id',     verifyToken, m.tiposContrato.update);
router.delete('/maestros/tipos-contrato/:id',  verifyToken, m.tiposContrato.remove);

// Motivos de ausencia
router.get('/maestros/motivos-ausencia',         verifyToken, m.motivosAusencia.getAll);
router.post('/maestros/motivos-ausencia',        verifyToken, m.motivosAusencia.create);
router.put('/maestros/motivos-ausencia/:id',     verifyToken, m.motivosAusencia.update);
router.delete('/maestros/motivos-ausencia/:id',  verifyToken, m.motivosAusencia.remove);

// Formas de pago
router.get('/maestros/formas-pago',         verifyToken, m.formasPago.getAll);
router.post('/maestros/formas-pago',        verifyToken, m.formasPago.create);
router.put('/maestros/formas-pago/:id',     verifyToken, m.formasPago.update);
router.delete('/maestros/formas-pago/:id',  verifyToken, m.formasPago.remove);

// Empleados
router.get('/empleados',      verifyToken, ec.getAll);
router.get('/empleados/:id',  verifyToken, ec.getById);
router.post('/empleados',     verifyToken, ec.create);
router.put('/empleados/:id',  verifyToken, ec.update);
router.delete('/empleados/:id', verifyToken, ec.remove);

module.exports = router;
