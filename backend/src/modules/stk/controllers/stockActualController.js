const s = require('../services/stockActualService');

const getAll = async (req, res, next) => {
  try {
    res.json(await s.getAll({
      all:       req.query.all === 'true',
      page:      parseInt(req.query.page)  || 1,
      limit:     parseInt(req.query.limit) || 20,
      search:    req.query.search    || '',
      dep:       req.query.dep       ? parseInt(req.query.dep) : null,
      sortField: req.query.sortField || '',
      sortDir:   req.query.sortDir   || 'asc',
    }));
  } catch (e) { next(e); }
};

module.exports = { getAll };
