const router = require('express').Router();
const { verifyToken } = require('../../../middlewares/auth');
const ordenCompraController  = require('../controllers/ordenCompraController');
const contratoProvController = require('../controllers/contratoProvController');

// Órdenes de compra
router.get('/ordenes-compra',        verifyToken, ordenCompraController.getAll);
router.get('/ordenes-compra/:id',    verifyToken, ordenCompraController.getById);
router.post('/ordenes-compra',       verifyToken, ordenCompraController.create);
router.put('/ordenes-compra/:id',    verifyToken, ordenCompraController.update);
router.delete('/ordenes-compra/:id', verifyToken, ordenCompraController.remove);

// Contratos de proveedor
router.get('/contratos',        verifyToken, contratoProvController.getAll);
router.get('/contratos/:id',    verifyToken, contratoProvController.getById);
router.post('/contratos',       verifyToken, contratoProvController.create);
router.put('/contratos/:id',    verifyToken, contratoProvController.update);
router.delete('/contratos/:id', verifyToken, contratoProvController.remove);

module.exports = router;
