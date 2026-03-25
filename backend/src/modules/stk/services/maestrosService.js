const pool = require('../../../config/db');

// ─── LÍNEAS ──────────────────────────────────────────────────────────────────

const getLineas = async ({ page = 1, limit = 20, search = '', all = false } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "LIN_DESC" ILIKE $1` : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM stk_linea ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  if (all) {
    const { rows } = await pool.query(`SELECT "LIN_CODIGO" AS lin_codigo, "LIN_DESC" AS lin_desc FROM stk_linea ${where} ORDER BY "LIN_DESC"`, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(
    `SELECT "LIN_CODIGO" AS lin_codigo, "LIN_DESC" AS lin_desc FROM stk_linea ${where} ORDER BY "LIN_DESC" LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getLinea = async (codigo) => {
  const { rows } = await pool.query(`SELECT "LIN_CODIGO" AS lin_codigo, "LIN_DESC" AS lin_desc FROM stk_linea WHERE "LIN_CODIGO" = $1`, [codigo]);
  if (!rows.length) throw { status: 404, message: 'Línea no encontrada' };
  return rows[0];
};

const createLinea = async (data) => {
  const { rows } = await pool.query('SELECT COALESCE(MAX("LIN_CODIGO"), 0) + 1 AS next FROM stk_linea');
  const codigo = rows[0].next;
  await pool.query(`INSERT INTO stk_linea ("LIN_CODIGO","LIN_DESC") VALUES ($1,$2)`, [codigo, data.lin_desc]);
  return getLinea(codigo);
};

const updateLinea = async (codigo, data) => {
  await pool.query('UPDATE stk_linea SET "LIN_DESC" = $1 WHERE "LIN_CODIGO" = $2', [data.lin_desc, codigo]);
  return getLinea(codigo);
};

const deleteLinea = async (codigo) => {
  await pool.query('DELETE FROM stk_linea WHERE "LIN_CODIGO" = $1', [codigo]);
};

// ─── MARCAS ──────────────────────────────────────────────────────────────────

const getMarcas = async ({ page = 1, limit = 20, search = '', all = false } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "MARC_DESC" ILIKE $1` : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM stk_marca ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  if (all) {
    const { rows } = await pool.query(`SELECT "MARC_CODIGO" AS marc_codigo, "MARC_DESC" AS marc_desc FROM stk_marca ${where} ORDER BY "MARC_DESC"`, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(
    `SELECT "MARC_CODIGO" AS marc_codigo, "MARC_DESC" AS marc_desc FROM stk_marca ${where} ORDER BY "MARC_DESC" LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getMarca = async (codigo) => {
  const { rows } = await pool.query(`SELECT "MARC_CODIGO" AS marc_codigo, "MARC_DESC" AS marc_desc FROM stk_marca WHERE "MARC_CODIGO" = $1`, [codigo]);
  if (!rows.length) throw { status: 404, message: 'Marca no encontrada' };
  return rows[0];
};

const createMarca = async (data) => {
  const { rows } = await pool.query('SELECT COALESCE(MAX("MARC_CODIGO"), 0) + 1 AS next FROM stk_marca');
  const codigo = rows[0].next;
  await pool.query(`INSERT INTO stk_marca ("MARC_CODIGO","MARC_DESC") VALUES ($1,$2)`, [codigo, data.marc_desc]);
  return getMarca(codigo);
};

const updateMarca = async (codigo, data) => {
  await pool.query('UPDATE stk_marca SET "MARC_DESC" = $1 WHERE "MARC_CODIGO" = $2', [data.marc_desc, codigo]);
  return getMarca(codigo);
};

const deleteMarca = async (codigo) => {
  await pool.query('DELETE FROM stk_marca WHERE "MARC_CODIGO" = $1', [codigo]);
};

// ─── RUBROS ──────────────────────────────────────────────────────────────────

const getRubros = async ({ page = 1, limit = 20, search = '', all = false } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "RUB_DESC" ILIKE $1` : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM stk_rubro ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  if (all) {
    const { rows } = await pool.query(
      `SELECT "RUB_CODIGO" AS rub_codigo, "RUB_DESC" AS rub_desc, "RUB_IND_INCLUIR_RANKING" AS rub_ind_incluir_ranking FROM stk_rubro ${where} ORDER BY "RUB_DESC"`, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(
    `SELECT "RUB_CODIGO" AS rub_codigo, "RUB_DESC" AS rub_desc, "RUB_IND_INCLUIR_RANKING" AS rub_ind_incluir_ranking FROM stk_rubro ${where} ORDER BY "RUB_DESC" LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getRubro = async (codigo) => {
  const { rows } = await pool.query(
    `SELECT "RUB_CODIGO" AS rub_codigo, "RUB_DESC" AS rub_desc, "RUB_IND_INCLUIR_RANKING" AS rub_ind_incluir_ranking FROM stk_rubro WHERE "RUB_CODIGO" = $1`, [codigo]);
  if (!rows.length) throw { status: 404, message: 'Rubro no encontrado' };
  return rows[0];
};

const createRubro = async (data) => {
  const { rows } = await pool.query('SELECT COALESCE(MAX("RUB_CODIGO"), 0) + 1 AS next FROM stk_rubro');
  const codigo = rows[0].next;
  await pool.query(
    `INSERT INTO stk_rubro ("RUB_CODIGO","RUB_DESC","RUB_IND_INCLUIR_RANKING") VALUES ($1,$2,$3)`,
    [codigo, data.rub_desc, data.rub_ind_incluir_ranking || 'N']
  );
  return getRubro(codigo);
};

const updateRubro = async (codigo, data) => {
  const fields = []; const params = [];
  const map = { rub_desc: '"RUB_DESC"', rub_ind_incluir_ranking: '"RUB_IND_INCLUIR_RANKING"' };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
  }
  if (!fields.length) return getRubro(codigo);
  params.push(codigo);
  await pool.query(`UPDATE stk_rubro SET ${fields.join(', ')} WHERE "RUB_CODIGO" = $${params.length}`, params);
  return getRubro(codigo);
};

const deleteRubro = async (codigo) => {
  await pool.query('DELETE FROM stk_rubro WHERE "RUB_CODIGO" = $1', [codigo]);
};

// ─── UNIDADES DE MEDIDA ──────────────────────────────────────────────────────

const getUnidadesMedida = async () => {
  const { rows } = await pool.query(`SELECT "UM_CODIGO" AS um_codigo FROM stk_unid_med ORDER BY "UM_CODIGO"`);
  return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
};

const createUnidadMedida = async (data) => {
  await pool.query(`INSERT INTO stk_unid_med ("UM_CODIGO") VALUES ($1)`, [data.um_codigo]);
  return { um_codigo: data.um_codigo };
};

const deleteUnidadMedida = async (codigo) => {
  await pool.query('DELETE FROM stk_unid_med WHERE "UM_CODIGO" = $1', [codigo]);
};

// ─── GRUPOS ──────────────────────────────────────────────────────────────────

const getGrupos = async ({ page = 1, limit = 20, search = '', all = false, linea } = {}) => {
  const conditions = [];
  const params = [];
  if (linea) { params.push(linea); conditions.push(`"GRUP_LINEA" = $${params.length}`); }
  if (search) { params.push(`%${search}%`); conditions.push(`"GRUP_DESC" ILIKE $${params.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countRes = await pool.query(`SELECT COUNT(*) FROM stk_grupo ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const select = `
    SELECT g."GRUP_LINEA" AS grup_linea, g."GRUP_CODIGO" AS grup_codigo,
           g."GRUP_DESC" AS grup_desc, g."GRUP_COEFICIENTE" AS grup_coeficiente,
           l."LIN_DESC" AS lin_desc
    FROM stk_grupo g
    LEFT JOIN stk_linea l ON l."LIN_CODIGO" = g."GRUP_LINEA"
    ${where} ORDER BY g."GRUP_LINEA", g."GRUP_CODIGO"`;

  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getGrupo = async (linea, codigo) => {
  const { rows } = await pool.query(
    `SELECT g."GRUP_LINEA" AS grup_linea, g."GRUP_CODIGO" AS grup_codigo,
            g."GRUP_DESC" AS grup_desc, g."GRUP_COEFICIENTE" AS grup_coeficiente,
            l."LIN_DESC" AS lin_desc
     FROM stk_grupo g LEFT JOIN stk_linea l ON l."LIN_CODIGO" = g."GRUP_LINEA"
     WHERE g."GRUP_LINEA" = $1 AND g."GRUP_CODIGO" = $2`,
    [linea, codigo]
  );
  if (!rows.length) throw { status: 404, message: 'Grupo no encontrado' };
  return rows[0];
};

const createGrupo = async (data) => {
  const { rows } = await pool.query(
    'SELECT COALESCE(MAX("GRUP_CODIGO"), 0) + 1 AS next FROM stk_grupo WHERE "GRUP_LINEA" = $1',
    [data.grup_linea]
  );
  const codigo = rows[0].next;
  await pool.query(
    `INSERT INTO stk_grupo ("GRUP_LINEA","GRUP_CODIGO","GRUP_DESC","GRUP_COEFICIENTE") VALUES ($1,$2,$3,$4)`,
    [data.grup_linea, codigo, data.grup_desc, data.grup_coeficiente ?? 1]
  );
  return getGrupo(data.grup_linea, codigo);
};

const updateGrupo = async (linea, codigo, data) => {
  const fields = []; const params = [];
  if (data.grup_desc !== undefined)         { params.push(data.grup_desc);         fields.push(`"GRUP_DESC" = $${params.length}`); }
  if (data.grup_coeficiente !== undefined)  { params.push(data.grup_coeficiente);  fields.push(`"GRUP_COEFICIENTE" = $${params.length}`); }
  if (!fields.length) return getGrupo(linea, codigo);
  params.push(linea); params.push(codigo);
  await pool.query(`UPDATE stk_grupo SET ${fields.join(', ')} WHERE "GRUP_LINEA" = $${params.length - 1} AND "GRUP_CODIGO" = $${params.length}`, params);
  return getGrupo(linea, codigo);
};

const deleteGrupo = async (linea, codigo) => {
  await pool.query('DELETE FROM stk_grupo WHERE "GRUP_LINEA" = $1 AND "GRUP_CODIGO" = $2', [linea, codigo]);
};

module.exports = {
  getLineas, getLinea, createLinea, updateLinea, deleteLinea,
  getMarcas, getMarca, createMarca, updateMarca, deleteMarca,
  getRubros, getRubro, createRubro, updateRubro, deleteRubro,
  getUnidadesMedida, createUnidadMedida, deleteUnidadMedida,
  getGrupos, getGrupo, createGrupo, updateGrupo, deleteGrupo,
};
