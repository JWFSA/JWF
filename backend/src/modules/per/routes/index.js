const router = require('express').Router();
const { verifyToken } = require('../../../middlewares/auth');
const m  = require('../controllers/maestrosController');
const ec = require('../controllers/empleadoController');
const cc = require('../controllers/contratoController');
const fc = require('../controllers/familiaController');
const conc = require('../controllers/conceptoController');

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

// Tipos de liquidación
router.get('/maestros/tipos-liquidacion',         verifyToken, m.tiposLiquidacion.getAll);
router.post('/maestros/tipos-liquidacion',        verifyToken, m.tiposLiquidacion.create);
router.put('/maestros/tipos-liquidacion/:id',     verifyToken, m.tiposLiquidacion.update);
router.delete('/maestros/tipos-liquidacion/:id',  verifyToken, m.tiposLiquidacion.remove);

// Tipos de pago
router.get('/maestros/tipos-pago',         verifyToken, m.tiposPago.getAll);
router.post('/maestros/tipos-pago',        verifyToken, m.tiposPago.create);
router.put('/maestros/tipos-pago/:id',     verifyToken, m.tiposPago.update);
router.delete('/maestros/tipos-pago/:id',  verifyToken, m.tiposPago.remove);

// Tipos de familiar
router.get('/maestros/tipos-familiar',         verifyToken, m.tiposFamiliar.getAll);
router.post('/maestros/tipos-familiar',        verifyToken, m.tiposFamiliar.create);
router.put('/maestros/tipos-familiar/:id',     verifyToken, m.tiposFamiliar.update);
router.delete('/maestros/tipos-familiar/:id',  verifyToken, m.tiposFamiliar.remove);

// Idiomas
router.get('/maestros/idiomas',         verifyToken, m.idiomas.getAll);
router.post('/maestros/idiomas',        verifyToken, m.idiomas.create);
router.put('/maestros/idiomas/:id',     verifyToken, m.idiomas.update);
router.delete('/maestros/idiomas/:id',  verifyToken, m.idiomas.remove);

// Carreras
router.get('/maestros/carreras',         verifyToken, m.carreras.getAll);
router.post('/maestros/carreras',        verifyToken, m.carreras.create);
router.put('/maestros/carreras/:id',     verifyToken, m.carreras.update);
router.delete('/maestros/carreras/:id',  verifyToken, m.carreras.remove);

// Bachilleratos
router.get('/maestros/bachilleratos',         verifyToken, m.bachilleratos.getAll);
router.post('/maestros/bachilleratos',        verifyToken, m.bachilleratos.create);
router.put('/maestros/bachilleratos/:id',     verifyToken, m.bachilleratos.update);
router.delete('/maestros/bachilleratos/:id',  verifyToken, m.bachilleratos.remove);

// Capacitaciones
router.get('/maestros/capacitaciones',         verifyToken, m.capacitaciones.getAll);
router.post('/maestros/capacitaciones',        verifyToken, m.capacitaciones.create);
router.put('/maestros/capacitaciones/:id',     verifyToken, m.capacitaciones.update);
router.delete('/maestros/capacitaciones/:id',  verifyToken, m.capacitaciones.remove);

// Niveles de capacitación
router.get('/maestros/niveles-capacitacion',         verifyToken, m.nivelesCapacitacion.getAll);
router.post('/maestros/niveles-capacitacion',        verifyToken, m.nivelesCapacitacion.create);
router.put('/maestros/niveles-capacitacion/:id',     verifyToken, m.nivelesCapacitacion.update);
router.delete('/maestros/niveles-capacitacion/:id',  verifyToken, m.nivelesCapacitacion.remove);

// Estados de estudio
router.get('/maestros/estados-estudio',         verifyToken, m.estadosEstudio.getAll);
router.post('/maestros/estados-estudio',        verifyToken, m.estadosEstudio.create);
router.put('/maestros/estados-estudio/:id',     verifyToken, m.estadosEstudio.update);
router.delete('/maestros/estados-estudio/:id',  verifyToken, m.estadosEstudio.remove);

// Funciones
router.get('/maestros/funciones',         verifyToken, m.funciones.getAll);
router.post('/maestros/funciones',        verifyToken, m.funciones.create);
router.put('/maestros/funciones/:id',     verifyToken, m.funciones.update);
router.delete('/maestros/funciones/:id',  verifyToken, m.funciones.remove);

// Clasificaciones de descuento
router.get('/maestros/clasificaciones-descuento',         verifyToken, m.clasificacionesDescuento.getAll);
router.post('/maestros/clasificaciones-descuento',        verifyToken, m.clasificacionesDescuento.create);
router.put('/maestros/clasificaciones-descuento/:id',     verifyToken, m.clasificacionesDescuento.update);
router.delete('/maestros/clasificaciones-descuento/:id',  verifyToken, m.clasificacionesDescuento.remove);

// Tipos de salario
router.get('/maestros/tipos-salario',         verifyToken, m.tiposSalario.getAll);
router.post('/maestros/tipos-salario',        verifyToken, m.tiposSalario.create);
router.put('/maestros/tipos-salario/:id',     verifyToken, m.tiposSalario.update);
router.delete('/maestros/tipos-salario/:id',  verifyToken, m.tiposSalario.remove);

// Motivos de licencia
router.get('/maestros/motivos-licencia',         verifyToken, m.motivosLicencia.getAll);
router.post('/maestros/motivos-licencia',        verifyToken, m.motivosLicencia.create);
router.put('/maestros/motivos-licencia/:id',     verifyToken, m.motivosLicencia.update);
router.delete('/maestros/motivos-licencia/:id',  verifyToken, m.motivosLicencia.remove);

// Clasificaciones de concepto (solo lectura)
router.get('/maestros/clasificaciones-concepto', verifyToken, m.clasificacionesConcepto.getAll);

// Instituciones educativas
router.get('/maestros/inst-educativas',         verifyToken, m.instEducativas.getAll);
router.post('/maestros/inst-educativas',        verifyToken, m.instEducativas.create);
router.put('/maestros/inst-educativas/:id',     verifyToken, m.instEducativas.update);
router.delete('/maestros/inst-educativas/:id',  verifyToken, m.instEducativas.remove);

// Empleados
router.get('/empleados',      verifyToken, ec.getAll);
router.get('/empleados/:id',  verifyToken, ec.getById);
router.post('/empleados',     verifyToken, ec.create);
router.put('/empleados/:id',  verifyToken, ec.update);
router.delete('/empleados/:id', verifyToken, ec.remove);

// Contratos
router.get('/contratos',         verifyToken, cc.getAll);
router.post('/contratos',        verifyToken, cc.create);
router.put('/contratos/:id',     verifyToken, cc.update);
router.delete('/contratos/:id',  verifyToken, cc.remove);

// Familiares
router.get('/familiares',                        verifyToken, fc.getAll);
router.post('/familiares',                       verifyToken, fc.create);
router.put('/familiares/:empleado/:id',          verifyToken, fc.update);
router.delete('/familiares/:empleado/:id',       verifyToken, fc.remove);

// Conceptos
router.get('/conceptos',         verifyToken, conc.getAll);
router.post('/conceptos',        verifyToken, conc.create);
router.put('/conceptos/:id',     verifyToken, conc.update);
router.delete('/conceptos/:id',  verifyToken, conc.remove);

module.exports = router;
