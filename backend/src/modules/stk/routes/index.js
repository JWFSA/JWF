const router = require('express').Router();
const { verifyToken } = require('../../../middlewares/auth');
const maestrosController = require('../controllers/maestrosController');
const depositoController = require('../controllers/depositoController');
const articuloController = require('../controllers/articuloController');

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

// Artículos
router.get('/articulos',      verifyToken, articuloController.getAll);
router.get('/articulos/:id',  verifyToken, articuloController.getById);
router.post('/articulos',     verifyToken, articuloController.create);
router.put('/articulos/:id',  verifyToken, articuloController.update);
router.delete('/articulos/:id', verifyToken, articuloController.remove);

module.exports = router;
