const pool = require('../../../config/db');

// ─── Helpers genéricos ──────────────────────────────────────────────────────

const makeGetAll = (table, pkCol, descCol, extraCols = '') => {
  return async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
    page  = Math.max(1, page);
    limit = Math.max(1, Math.min(1000, limit));

    const params = search ? [`%${search}%`] : [];
    const where  = search ? `WHERE ${descCol} ILIKE $1` : '';
    const countRes = await pool.query(`SELECT COUNT(*) FROM ${table} ${where}`, params);
    const total = parseInt(countRes.rows[0].count);
    const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
    const validSorts = { desc: descCol, codigo: pkCol };
    const orderBy = Object.hasOwn(validSorts, sortField) ? `${validSorts[sortField]} ${dir}` : `${pkCol} ${dir}`;
    const select = `SELECT ${pkCol}, ${descCol}${extraCols ? ', ' + extraCols : ''} FROM ${table} ${where} ORDER BY ${orderBy}`;
    if (all) {
      const { rows } = await pool.query(select, params);
      return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
    }
    const offset = (page - 1) * limit;
    const { rows } = await pool.query(
      `${select} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );
    return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  };
};

const makeCreate = (table, pkCol, descCol, extraMapping = {}) => {
  return async (data) => {
    const { rows: maxRows } = await pool.query(`SELECT COALESCE(MAX(${pkCol}), 0) + 1 AS next FROM ${table}`);
    const nextId = maxRows[0].next;
    const extraKeys = Object.keys(extraMapping);
    const cols = [pkCol, descCol, ...extraKeys.map(k => extraMapping[k])];
    const vals = [nextId, data.desc, ...extraKeys.map(k => data[k] ?? null)];
    const placeholders = vals.map((_, i) => `$${i + 1}`).join(',');
    await pool.query(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${placeholders})`, vals);
    return { codigo: nextId, desc: data.desc };
  };
};

const makeUpdate = (table, pkCol, descCol, extraMapping = {}) => {
  return async (id, data) => {
    const sets = []; const params = [];
    if (data.desc !== undefined) { params.push(data.desc); sets.push(`${descCol} = $${params.length}`); }
    for (const [k, col] of Object.entries(extraMapping)) {
      if (data[k] !== undefined) { params.push(data[k]); sets.push(`${col} = $${params.length}`); }
    }
    if (!sets.length) return;
    params.push(id);
    await pool.query(`UPDATE ${table} SET ${sets.join(', ')} WHERE ${pkCol} = $${params.length}`, params);
  };
};

const makeRemove = (table, pkCol) => {
  return async (id) => {
    await pool.query(`DELETE FROM ${table} WHERE ${pkCol} = $1`, [id]);
  };
};

// ─── GRUPOS ─────────────────────────────────────────────────────────────────

const getGrupos  = makeGetAll('cnt_grupo', '"GRUP_CODIGO"', '"GRUP_DESC"', '"GRUP_SALDO_NORMAL"');
const createGrupo = async (data) => {
  const { rows } = await pool.query('SELECT COALESCE(MAX("GRUP_CODIGO"), 0) + 1 AS next FROM cnt_grupo');
  const id = rows[0].next;
  await pool.query(
    'INSERT INTO cnt_grupo ("GRUP_CODIGO","GRUP_DESC","GRUP_SALDO_NORMAL") VALUES ($1,$2,$3)',
    [id, data.desc, data.saldo_normal || 'D']
  );
  return { codigo: id, desc: data.desc, saldo_normal: data.saldo_normal || 'D' };
};
const updateGrupo = async (id, data) => {
  const sets = []; const params = [];
  if (data.desc !== undefined) { params.push(data.desc); sets.push(`"GRUP_DESC" = $${params.length}`); }
  if (data.saldo_normal !== undefined) { params.push(data.saldo_normal); sets.push(`"GRUP_SALDO_NORMAL" = $${params.length}`); }
  if (sets.length) { params.push(id); await pool.query(`UPDATE cnt_grupo SET ${sets.join(', ')} WHERE "GRUP_CODIGO" = $${params.length}`, params); }
};
const removeGrupo = makeRemove('cnt_grupo', '"GRUP_CODIGO"');

// ─── RUBROS ─────────────────────────────────────────────────────────────────

const getRubros   = makeGetAll('cnt_rubro', '"RUB_CODIGO"', '"RUB_DESC"');
const createRubro = makeCreate('cnt_rubro', '"RUB_CODIGO"', '"RUB_DESC"');
const updateRubro = makeUpdate('cnt_rubro', '"RUB_CODIGO"', '"RUB_DESC"');
const removeRubro = makeRemove('cnt_rubro', '"RUB_CODIGO"');

// ─── CENTROS DE COSTO ───────────────────────────────────────────────────────

const getCentrosCosto  = makeGetAll('cnt_ccosto', '"CCO_CODIGO"', '"CCO_DESC"');
const createCentroCosto = makeCreate('cnt_ccosto', '"CCO_CODIGO"', '"CCO_DESC"');
const updateCentroCosto = makeUpdate('cnt_ccosto', '"CCO_CODIGO"', '"CCO_DESC"');
const removeCentroCosto = makeRemove('cnt_ccosto', '"CCO_CODIGO"');

module.exports = {
  getGrupos, createGrupo, updateGrupo, removeGrupo,
  getRubros, createRubro, updateRubro, removeRubro,
  getCentrosCosto, createCentroCosto, updateCentroCosto, removeCentroCosto,
};
