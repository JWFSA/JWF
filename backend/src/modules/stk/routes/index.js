const router = require('express').Router();
const { verifyToken } = require('../../../middlewares/auth');
const maestrosController    = require('../controllers/maestrosController');
const depositoController    = require('../controllers/depositoController');
const articuloController    = require('../controllers/articuloController');
const movimientoController  = require('../controllers/movimientoController');
const stockActualController = require('../controllers/stockActualController');
const remisionController    = require('../controllers/remisionController');
const cotizacionController  = require('../controllers/cotizacionController');
const ocupacionController   = require('../controllers/ocupacionController');

// Líneas
router.get('/maestros/lineas',          verifyToken, maestrosController.getLineas);
router.post('/maestros/lineas',         verifyToken, maestrosController.createLinea);
router.put('/maestros/lineas/:id',      verifyToken, maestrosController.updateLinea);
router.delete('/maestros/lineas/:id',   verifyToken, maestrosController.deleteLinea);

// Marcas
router.get('/maestros/marcas',          verifyToken, maestrosController.getMarcas);
router.post('/maestros/marcas',         verifyToken, maestrosController.createMarca);
router.put('/maestros/marcas/:id',      verifyToken, maestrosController.updateMarca);
router.delete('/maestros/marcas/:id',   verifyToken, maestrosController.deleteMarca);

// Rubros
router.get('/maestros/rubros',          verifyToken, maestrosController.getRubros);
router.post('/maestros/rubros',         verifyToken, maestrosController.createRubro);
router.put('/maestros/rubros/:id',      verifyToken, maestrosController.updateRubro);
router.delete('/maestros/rubros/:id',   verifyToken, maestrosController.deleteRubro);

// Unidades de medida
router.get('/maestros/unidades-medida',         verifyToken, maestrosController.getUnidadesMedida);
router.post('/maestros/unidades-medida',        verifyToken, maestrosController.createUnidadMedida);
router.delete('/maestros/unidades-medida/:id',  verifyToken, maestrosController.deleteUnidadMedida);

// Depósitos
router.get('/depositos',                    verifyToken, depositoController.getAll);
router.post('/depositos',                   verifyToken, depositoController.create);
router.put('/depositos/:empr/:suc/:codigo', verifyToken, depositoController.update);
router.delete('/depositos/:empr/:suc/:codigo', verifyToken, depositoController.remove);

// Grupos
router.get('/maestros/grupos',                      verifyToken, maestrosController.getGrupos);
router.post('/maestros/grupos',                     verifyToken, maestrosController.createGrupo);
router.put('/maestros/grupos/:linea/:codigo',       verifyToken, maestrosController.updateGrupo);
router.delete('/maestros/grupos/:linea/:codigo',    verifyToken, maestrosController.deleteGrupo);

// Operaciones (catálogo para movimientos)
router.get('/maestros/operaciones', verifyToken, maestrosController.getOperaciones);

// Artículos
router.get('/articulos',      verifyToken, articuloController.getAll);
router.get('/articulos/:id',  verifyToken, articuloController.getById);
router.post('/articulos',     verifyToken, articuloController.create);
router.put('/articulos/:id',  verifyToken, articuloController.update);
router.delete('/articulos/:id', verifyToken, articuloController.remove);

// Stock actual
router.get('/stock', verifyToken, stockActualController.getAll);

// Movimientos de stock
router.get('/movimientos',      verifyToken, movimientoController.getAll);
router.get('/movimientos/:id',  verifyToken, movimientoController.getById);
router.post('/movimientos',     verifyToken, movimientoController.create);
router.put('/movimientos/:id',  verifyToken, movimientoController.update);
router.delete('/movimientos/:id', verifyToken, movimientoController.remove);

// Remisiones
router.get('/remisiones',       verifyToken, remisionController.getAll);
router.get('/remisiones/:nro',  verifyToken, remisionController.getById);
router.post('/remisiones',      verifyToken, remisionController.create);
router.put('/remisiones/:nro',  verifyToken, remisionController.update);
router.delete('/remisiones/:nro', verifyToken, remisionController.remove);
router.get('/remisiones/from-factura/:id', verifyToken, remisionController.getFromFactura);

// Clasificaciones
router.get('/maestros/clasificaciones',         verifyToken, maestrosController.getClasificaciones);
router.post('/maestros/clasificaciones',        verifyToken, maestrosController.createClasificacion);
router.put('/maestros/clasificaciones/:id',     verifyToken, maestrosController.updateClasificacion);
router.delete('/maestros/clasificaciones/:id',  verifyToken, maestrosController.deleteClasificacion);

// Choferes
router.get('/maestros/choferes',         verifyToken, maestrosController.getChoferes);
router.post('/maestros/choferes',        verifyToken, maestrosController.createChofer);
router.put('/maestros/choferes/:id',     verifyToken, maestrosController.updateChofer);
router.delete('/maestros/choferes/:id',  verifyToken, maestrosController.deleteChofer);

// Ocupaciones de espacios
router.get('/ocupaciones',              verifyToken, ocupacionController.getAll);
router.get('/ocupaciones/ubicaciones',  verifyToken, ocupacionController.getUbicaciones);

// Inserciones
router.get('/maestros/inserciones',         verifyToken, maestrosController.getInserciones);
router.post('/maestros/inserciones',        verifyToken, maestrosController.createInsercion);
router.put('/maestros/inserciones/:id',     verifyToken, maestrosController.updateInsercion);
router.delete('/maestros/inserciones/:id',  verifyToken, maestrosController.deleteInsercion);

// Cotizaciones
router.get('/cotizaciones',                verifyToken, cotizacionController.getAll);
router.post('/cotizaciones',               verifyToken, cotizacionController.create);
router.put('/cotizaciones/:fec/:mon',      verifyToken, cotizacionController.update);
router.delete('/cotizaciones/:fec/:mon',   verifyToken, cotizacionController.remove);

module.exports = router;
