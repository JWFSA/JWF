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
router.get('/empresas', verifyToken, empresaCtrl.getAll);
router.get('/empresas/:id', verifyToken, empresaCtrl.getById);
router.get('/empresas/:id/sucursales', verifyToken, empresaCtrl.getSucursales);

// Maestros (catálogos)
router.get('/maestros/monedas', verifyToken, maestrosCtrl.getMonedas);
router.get('/maestros/paises', verifyToken, maestrosCtrl.getPaises);
router.get('/maestros/ciudades', verifyToken, maestrosCtrl.getCiudades);
router.get('/maestros/departamentos', verifyToken, maestrosCtrl.getDepartamentos);
router.get('/maestros/secciones', verifyToken, maestrosCtrl.getSecciones);
router.get('/maestros/sistemas', verifyToken, maestrosCtrl.getSistemas);
router.get('/maestros/programas', verifyToken, maestrosCtrl.getProgramas);

module.exports = router;
