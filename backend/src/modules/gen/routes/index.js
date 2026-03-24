const router = require('express').Router();
const { verifyToken } = require('../../../middlewares/auth');

const authCtrl = require('../controllers/authController');
const operadorCtrl = require('../controllers/operadorController');
const rolCtrl = require('../controllers/rolController');
const empresaCtrl = require('../controllers/empresaController');
const maestrosCtrl = require('../controllers/maestrosController');

// Auth (public)
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', verifyToken, authCtrl.me);

// Operadores
router.get('/operadores', verifyToken, operadorCtrl.getAll);
router.get('/operadores/:id', verifyToken, operadorCtrl.getById);
router.post('/operadores', verifyToken, operadorCtrl.create);
router.put('/operadores/:id', verifyToken, operadorCtrl.update);
router.put('/operadores/:id/roles', verifyToken, operadorCtrl.assignRoles);

// Roles
router.get('/roles', verifyToken, rolCtrl.getAll);
router.get('/roles/:id', verifyToken, rolCtrl.getById);
router.post('/roles', verifyToken, rolCtrl.create);
router.put('/roles/:id', verifyToken, rolCtrl.update);
router.delete('/roles/:id', verifyToken, rolCtrl.remove);
router.put('/roles/:id/programas', verifyToken, rolCtrl.assignProgramas);

// Empresas
router.get('/empresas',                              verifyToken, empresaCtrl.getAll);
router.get('/empresas/:id',                          verifyToken, empresaCtrl.getById);
router.post('/empresas',                             verifyToken, empresaCtrl.create);
router.put('/empresas/:id',                          verifyToken, empresaCtrl.update);
router.get('/empresas/:id/sucursales',               verifyToken, empresaCtrl.getSucursales);
router.post('/empresas/:id/sucursales',              verifyToken, empresaCtrl.createSucursal);
router.put('/empresas/:id/sucursales/:sucId',        verifyToken, empresaCtrl.updateSucursal);
router.delete('/empresas/:id/sucursales/:sucId',     verifyToken, empresaCtrl.deleteSucursal);

// Monedas
router.get('/maestros/monedas',       verifyToken, maestrosCtrl.getMonedas);
router.post('/maestros/monedas',      verifyToken, maestrosCtrl.createMoneda);
router.put('/maestros/monedas/:id',   verifyToken, maestrosCtrl.updateMoneda);
router.delete('/maestros/monedas/:id',verifyToken, maestrosCtrl.deleteMoneda);

// Países
router.get('/maestros/paises',        verifyToken, maestrosCtrl.getPaises);
router.post('/maestros/paises',       verifyToken, maestrosCtrl.createPais);
router.put('/maestros/paises/:id',    verifyToken, maestrosCtrl.updatePais);
router.delete('/maestros/paises/:id', verifyToken, maestrosCtrl.deletePais);

// Ciudades
router.get('/maestros/ciudades',      verifyToken, maestrosCtrl.getCiudades);

// Departamentos
router.get('/maestros/departamentos',          verifyToken, maestrosCtrl.getDepartamentos);
router.post('/maestros/departamentos',         verifyToken, maestrosCtrl.createDepartamento);
router.put('/maestros/departamentos/:id',      verifyToken, maestrosCtrl.updateDepartamento);
router.delete('/maestros/departamentos/:id',   verifyToken, maestrosCtrl.deleteDepartamento);

// Secciones
router.get('/maestros/secciones',                        verifyToken, maestrosCtrl.getSecciones);
router.post('/maestros/departamentos/:dpto/secciones',   verifyToken, maestrosCtrl.createSeccion);
router.put('/maestros/departamentos/:dpto/secciones/:id',verifyToken, maestrosCtrl.updateSeccion);
router.delete('/maestros/departamentos/:dpto/secciones/:id',verifyToken, maestrosCtrl.deleteSeccion);

// Sistemas
router.get('/maestros/sistemas',      verifyToken, maestrosCtrl.getSistemas);

// Programas
router.get('/maestros/programas',          verifyToken, maestrosCtrl.getProgramas);
router.post('/maestros/programas',         verifyToken, maestrosCtrl.createPrograma);
router.put('/maestros/programas/:id',      verifyToken, maestrosCtrl.updatePrograma);
router.delete('/maestros/programas/:id',   verifyToken, maestrosCtrl.deletePrograma);

module.exports = router;
