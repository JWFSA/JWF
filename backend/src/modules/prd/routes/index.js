const router = require('express').Router();
const { verifyToken } = require('../../../middlewares/auth');
const otController = require('../controllers/ordenTrabajoController');
const ppController = require('../controllers/pedidoProduccionController');

// Tipos de OT (lookup)
router.get('/tipos-ot', verifyToken, otController.getTiposOT);

// Ordenes de trabajo
router.get('/ordenes-trabajo',                       verifyToken, otController.getAll);
router.get('/ordenes-trabajo/:id',                   verifyToken, otController.getById);
router.post('/ordenes-trabajo',                      verifyToken, otController.create);
router.put('/ordenes-trabajo/:id',                   verifyToken, otController.update);
router.delete('/ordenes-trabajo/:id',                verifyToken, otController.remove);
router.post('/ordenes-trabajo/desde-pedido',         verifyToken, otController.crearDesdePedido);
router.post('/ordenes-trabajo/:id/gastos',           verifyToken, otController.addGasto);
router.delete('/ordenes-trabajo/:id/gastos/:item',   verifyToken, otController.removeGasto);

// Pedidos de produccion
router.get('/pedidos-produccion',                    verifyToken, ppController.getAll);
router.get('/pedidos-produccion/:id',                verifyToken, ppController.getById);
router.post('/pedidos-produccion/desde-pedido',      verifyToken, ppController.crearDesdePedido);

module.exports = router;
