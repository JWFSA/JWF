const s = require('../services/maestrosService');

const handler = (getAll, create, update, remove) => ({
  getAll: async (req, res, next) => {
    try {
      const all       = req.query.all === 'true';
      const page      = parseInt(req.query.page)  || 1;
      const limit     = parseInt(req.query.limit) || 20;
      const search    = req.query.search    || '';
      const sortField = req.query.sortField || '';
      const sortDir   = req.query.sortDir   || 'asc';
      res.json(await getAll({ page, limit, search, all, sortField, sortDir }));
    } catch (e) { next(e); }
  },
  create: async (req, res, next) => {
    try { res.status(201).json(await create(req.body)); } catch (e) { next(e); }
  },
  update: async (req, res, next) => {
    try { res.json(await update(Number(req.params.id), req.body)); } catch (e) { next(e); }
  },
  remove: async (req, res, next) => {
    try { await remove(Number(req.params.id)); res.status(204).end(); } catch (e) { next(e); }
  },
});

module.exports = {
  cargos:          handler(s.getCargos,          s.createCargo,          s.updateCargo,          s.deleteCargo),
  categorias:      handler(s.getCategorias,      s.createCategoria,      s.updateCategoria,      s.deleteCategoria),
  areas:           handler(s.getAreas,           s.createArea,           s.updateArea,           s.deleteArea),
  secciones:       handler(s.getSecciones,       s.createSeccion,        s.updateSeccion,        s.deleteSeccion),
  turnos:          handler(s.getTurnos,          s.createTurno,          s.updateTurno,          s.deleteTurno),
  tiposContrato:   handler(s.getTiposContrato,   s.createTipoContrato,   s.updateTipoContrato,   s.deleteTipoContrato),
  motivosAusencia: handler(s.getMotivosAusencia, s.createMotivoAusencia, s.updateMotivoAusencia, s.deleteMotivoAusencia),
  formasPago:      handler(s.getFormasPago,      s.createFormaPago,      s.updateFormaPago,      s.deleteFormaPago),
  tiposLiquidacion: handler(s.getTiposLiquidacion, s.createTipoLiquidacion, s.updateTipoLiquidacion, s.deleteTipoLiquidacion),
  tiposPago:       handler(s.getTiposPago,       s.createTipoPago,       s.updateTipoPago,       s.deleteTipoPago),
  tiposFamiliar:   handler(s.getTiposFamiliar,   s.createTipoFamiliar,   s.updateTipoFamiliar,   s.deleteTipoFamiliar),
  idiomas:         handler(s.getIdiomas,         s.createIdioma,         s.updateIdioma,         s.deleteIdioma),
  carreras:        handler(s.getCarreras,        s.createCarrera,        s.updateCarrera,        s.deleteCarrera),
  bachilleratos:   handler(s.getBachilleratos,   s.createBachillerato,   s.updateBachillerato,   s.deleteBachillerato),
  capacitaciones:  handler(s.getCapacitaciones,  s.createCapacitacion,   s.updateCapacitacion,   s.deleteCapacitacion),
  nivelesCapacitacion: handler(s.getNivelesCapacitacion, s.createNivelCapacitacion, s.updateNivelCapacitacion, s.deleteNivelCapacitacion),
  estadosEstudio:  handler(s.getEstadosEstudio,  s.createEstadoEstudio,  s.updateEstadoEstudio,  s.deleteEstadoEstudio),
  funciones:       handler(s.getFunciones,       s.createFuncion,        s.updateFuncion,        s.deleteFuncion),
  clasificacionesDescuento: handler(s.getClasificacionesDescuento, s.createClasificacionDescuento, s.updateClasificacionDescuento, s.deleteClasificacionDescuento),
};
