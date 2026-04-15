// Controller para fac_lista_precio_pantalla_det
// Ver: services/listaPrecioPantallaService.js

const s = require('../services/listaPrecioPantallaService');

// GET /api/fac/maestros/listas-precio/:id/pantallas
// Query: search (opcional)
const getByLista = async (req, res, next) => {
  try {
    const listaId = Number(req.params.id);
    res.json(await s.getByLista(listaId, { search: req.query.search || '' }));
  } catch (e) {
    next(e);
  }
};

// GET /api/fac/maestros/listas-precio/:id/pantallas/:art
// Devuelve un objeto { BASIC: {precio_unitario, inserciones_mes}, GURU: {...}, PREMIUM: {...} }
const getByArticulo = async (req, res, next) => {
  try {
    const listaId = Number(req.params.id);
    const art = Number(req.params.art);
    res.json(await s.getByArticulo(listaId, art));
  } catch (e) {
    next(e);
  }
};

// PUT /api/fac/maestros/listas-precio/:id/pantallas/:art/:plan
// Body: { precio_unitario: number, inserciones_mes?: number }
const upsert = async (req, res, next) => {
  try {
    const listaId = Number(req.params.id);
    const art = Number(req.params.art);
    const plan = String(req.params.plan).toUpperCase();
    const { precio_unitario, inserciones_mes } = req.body || {};
    await s.upsert(listaId, art, { plan, precio_unitario, inserciones_mes });
    res.status(200).json({ ok: true });
  } catch (e) {
    next(e);
  }
};

// DELETE /api/fac/maestros/listas-precio/:id/pantallas/:art/:plan
const remove = async (req, res, next) => {
  try {
    const listaId = Number(req.params.id);
    const art = Number(req.params.art);
    const plan = String(req.params.plan).toUpperCase();
    await s.remove(listaId, art, plan);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
};

// DELETE /api/fac/maestros/listas-precio/:id/pantallas/:art
// Elimina los 3 precios de un artículo pantalla en una lista
const removeAllOfArticulo = async (req, res, next) => {
  try {
    const listaId = Number(req.params.id);
    const art = Number(req.params.art);
    await s.removeAllOfArticulo(listaId, art);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
};

module.exports = {
  getByLista,
  getByArticulo,
  upsert,
  remove,
  removeAllOfArticulo,
};
