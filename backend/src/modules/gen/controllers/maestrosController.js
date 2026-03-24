const maestrosService = require('../services/maestrosService');

const getMonedas = async (req, res, next) => {
  try { res.json(await maestrosService.getMonedas()); } catch (err) { next(err); }
};
const getPaises = async (req, res, next) => {
  try { res.json(await maestrosService.getPaises()); } catch (err) { next(err); }
};
const getCiudades = async (req, res, next) => {
  try { res.json(await maestrosService.getCiudades()); } catch (err) { next(err); }
};
const getDepartamentos = async (req, res, next) => {
  try { res.json(await maestrosService.getDepartamentos()); } catch (err) { next(err); }
};
const getSecciones = async (req, res, next) => {
  try { res.json(await maestrosService.getSecciones(req.query.dpto)); } catch (err) { next(err); }
};
const getSistemas = async (req, res, next) => {
  try { res.json(await maestrosService.getSistemas()); } catch (err) { next(err); }
};
const getProgramas = async (req, res, next) => {
  try { res.json(await maestrosService.getProgramas(req.query.sistema)); } catch (err) { next(err); }
};

module.exports = { getMonedas, getPaises, getCiudades, getDepartamentos, getSecciones, getSistemas, getProgramas };
