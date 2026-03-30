const s = require('../services/horarioService');

const getAll = async (req, res, next) => {
  try {
    res.json(await s.getAll({
      all:       req.query.all === 'true',
      page:      Math.max(1, parseInt(req.query.page) || 1),
      limit:     Math.max(1, Math.min(1000, parseInt(req.query.limit) || 20)),
      search:    req.query.search    || '',
      sortField: req.query.sortField || '',
      sortDir:   req.query.sortDir === 'desc' ? 'desc' : 'asc',
      empleado:  req.query.empleado  || '',
    }));
  } catch (e) { next(e); }
};

module.exports = { getAll };
