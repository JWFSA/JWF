const s = require('../services/solicitudDescuentoService');

const parseListParams = (query) => ({
  all:       query.all === 'true',
  page:      Math.max(1, parseInt(query.page) || 1),
  limit:     Math.max(1, Math.min(1000, parseInt(query.limit) || 20)),
  search:    query.search    || '',
  sortField: query.sortField || '',
  sortDir:   query.sortDir === 'desc' ? 'desc' : 'asc',
});

const getAll = async (req, res, next) => {
  try { res.json(await s.getAll(parseListParams(req.query))); } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'ID inválido' });
    res.json(await s.getById(id));
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    if (!req.body.sod_clave_ped) return res.status(400).json({ message: 'El pedido es requerido' });
    if (!req.body.detalle?.length) return res.status(400).json({ message: 'Debe incluir al menos un ítem' });
    const login = req.user?.login || 'SISTEMA';
    res.status(201).json(await s.create(req.body, login));
  } catch (e) { next(e); }
};

const procesarItem = async (req, res, next) => {
  try {
    const clave = Number(req.params.id);
    const item = Number(req.params.item);
    const accion = req.params.accion; // 'aprobar' o 'rechazar'
    if (!['aprobar', 'rechazar'].includes(accion)) return res.status(400).json({ message: 'Acción inválida' });
    const login = req.user?.login || 'SISTEMA';
    res.json(await s.procesarItem(clave, item, accion, req.body, login));
  } catch (e) { next(e); }
};

const procesarTodos = async (req, res, next) => {
  try {
    const clave = Number(req.params.id);
    const accion = req.params.accion;
    if (!['aprobar', 'rechazar'].includes(accion)) return res.status(400).json({ message: 'Acción inválida' });
    const login = req.user?.login || 'SISTEMA';
    res.json(await s.procesarTodos(clave, accion, login));
  } catch (e) { next(e); }
};

const reporteDescuentos = async (req, res, next) => {
  try {
    const { fechaDesde, fechaHasta, vendedor } = req.query;
    if (!fechaDesde || !fechaHasta) return res.status(400).json({ message: 'Rango de fechas requerido' });
    res.json(await s.reporteDescuentos({ fechaDesde, fechaHasta, vendedor }));
  } catch (e) { next(e); }
};

module.exports = { getAll, getById, create, procesarItem, procesarTodos, reporteDescuentos };
