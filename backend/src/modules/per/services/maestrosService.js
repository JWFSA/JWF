const pool = require('../../../config/db');

// ─── CARGOS ───────────────────────────────────────────────────────────────────

const getCargos = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "CAR_DESC" ILIKE $1` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM per_cargo ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = sortField === 'desc' ? `"CAR_DESC" ${dir}` : `"CAR_CODIGO" ${dir}`;
  const select = `SELECT "CAR_CODIGO" AS car_codigo, "CAR_DESC" AS car_desc FROM per_cargo ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createCargo = async ({ car_desc }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("CAR_CODIGO"), 0) + 1 AS next FROM per_cargo`);
  await pool.query(`INSERT INTO per_cargo ("CAR_CODIGO","CAR_DESC") VALUES ($1,$2)`, [next, car_desc]);
  return { car_codigo: next, car_desc };
};

const updateCargo = async (id, { car_desc }) => {
  await pool.query(`UPDATE per_cargo SET "CAR_DESC" = $1 WHERE "CAR_CODIGO" = $2`, [car_desc, id]);
  return { car_codigo: id, car_desc };
};

const deleteCargo = async (id) => {
  await pool.query(`DELETE FROM per_cargo WHERE "CAR_CODIGO" = $1`, [id]);
};

// ─── CATEGORÍAS ───────────────────────────────────────────────────────────────

const getCategorias = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "PCAT_DESC" ILIKE $1` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM per_categoria ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = sortField === 'desc' ? `"PCAT_DESC" ${dir}` : `"PCAT_CODIGO" ${dir}`;
  const select = `SELECT "PCAT_CODIGO" AS pcat_codigo, "PCAT_DESC" AS pcat_desc FROM per_categoria ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createCategoria = async ({ pcat_desc }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("PCAT_CODIGO"), 0) + 1 AS next FROM per_categoria`);
  await pool.query(`INSERT INTO per_categoria ("PCAT_CODIGO","PCAT_DESC") VALUES ($1,$2)`, [next, pcat_desc]);
  return { pcat_codigo: next, pcat_desc };
};

const updateCategoria = async (id, { pcat_desc }) => {
  await pool.query(`UPDATE per_categoria SET "PCAT_DESC" = $1 WHERE "PCAT_CODIGO" = $2`, [pcat_desc, id]);
  return { pcat_codigo: id, pcat_desc };
};

const deleteCategoria = async (id) => {
  await pool.query(`DELETE FROM per_categoria WHERE "PCAT_CODIGO" = $1`, [id]);
};

// ─── ÁREAS ────────────────────────────────────────────────────────────────────

const getAreas = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "PER_AREA_DESC" ILIKE $1` : '';
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = sortField === 'desc' ? `per_area_desc ${dir}` : `per_area_cod ${dir}`;
  // Subquery para deduplicar por código antes de paginar/contar
  const base = `SELECT DISTINCT ON ("PER_AREA_COD") "PER_AREA_COD" AS per_area_cod, "PER_AREA_DESC" AS per_area_desc FROM per_area ${where} ORDER BY "PER_AREA_COD"`;
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM (${base}) sub`, params);
  const total = parseInt(count);
  const select = `SELECT * FROM (${base}) sub ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createArea = async ({ per_area_desc }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("PER_AREA_COD"), 0) + 1 AS next FROM per_area`);
  await pool.query(`INSERT INTO per_area ("PER_AREA_COD","PER_AREA_DESC","PER_AREA_EMPRESA") VALUES ($1,$2,$3)`, [next, per_area_desc, 1]);
  return { per_area_cod: next, per_area_desc };
};

const updateArea = async (id, { per_area_desc }) => {
  await pool.query(`UPDATE per_area SET "PER_AREA_DESC" = $1 WHERE "PER_AREA_COD" = $2`, [per_area_desc, id]);
  return { per_area_cod: id, per_area_desc };
};

const deleteArea = async (id) => {
  await pool.query(`DELETE FROM per_area WHERE "PER_AREA_COD" = $1`, [id]);
};

// ─── SECCIONES ────────────────────────────────────────────────────────────────

const getSecciones = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "PER_SECC_DESC" ILIKE $1` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM per_seccion ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = sortField === 'desc' ? `"PER_SECC_DESC" ${dir}` : `"PER_SECC_COD" ${dir}`;
  const select = `SELECT "PER_SECC_COD" AS per_secc_cod, "PER_SECC_DESC" AS per_secc_desc,
                         "PER_SECC_AREA" AS per_secc_area, "PER_SECC_AREA_DESC" AS per_secc_area_desc
                  FROM per_seccion ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createSeccion = async ({ per_secc_desc, per_secc_area }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("PER_SECC_COD"), 0) + 1 AS next FROM per_seccion`);
  await pool.query(
    `INSERT INTO per_seccion ("PER_SECC_COD","PER_SECC_DESC","PER_SECC_AREA","PER_SECC_EMPRESA") VALUES ($1,$2,$3,$4)`,
    [next, per_secc_desc, per_secc_area || null, 1]
  );
  return { per_secc_cod: next, per_secc_desc };
};

const updateSeccion = async (id, { per_secc_desc, per_secc_area }) => {
  await pool.query(
    `UPDATE per_seccion SET "PER_SECC_DESC" = $1, "PER_SECC_AREA" = $2 WHERE "PER_SECC_COD" = $3`,
    [per_secc_desc, per_secc_area || null, id]
  );
  return { per_secc_cod: id, per_secc_desc };
};

const deleteSeccion = async (id) => {
  await pool.query(`DELETE FROM per_seccion WHERE "PER_SECC_COD" = $1`, [id]);
};

// ─── TURNOS ───────────────────────────────────────────────────────────────────

const getTurnos = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "TUR_DESC" ILIKE $1` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM per_turno ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = sortField === 'desc' ? `"TUR_DESC" ${dir}` : `"TUR_CODIGO" ${dir}`;
  const select = `SELECT "TUR_CODIGO" AS tur_codigo, "TUR_DESC" AS tur_desc, "TUR_ESTADO" AS tur_estado FROM per_turno ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createTurno = async ({ tur_desc, tur_estado }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("TUR_CODIGO"), 0) + 1 AS next FROM per_turno`);
  await pool.query(`INSERT INTO per_turno ("TUR_CODIGO","TUR_DESC","TUR_EMPRESA","TUR_ESTADO") VALUES ($1,$2,$3,$4)`, [next, tur_desc, 1, tur_estado || 'A']);
  return { tur_codigo: next, tur_desc, tur_estado: tur_estado || 'A' };
};

const updateTurno = async (id, { tur_desc, tur_estado }) => {
  await pool.query(`UPDATE per_turno SET "TUR_DESC" = $1, "TUR_ESTADO" = $2 WHERE "TUR_CODIGO" = $3`, [tur_desc, tur_estado || 'A', id]);
  return { tur_codigo: id, tur_desc, tur_estado };
};

const deleteTurno = async (id) => {
  await pool.query(`DELETE FROM per_turno WHERE "TUR_CODIGO" = $1`, [id]);
};

// ─── TIPOS DE CONTRATO ────────────────────────────────────────────────────────

const getTiposContrato = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "TIPCON_DESCRIPCION" ILIKE $1` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM per_tipo_contrato ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = sortField === 'desc' ? `"TIPCON_DESCRIPCION" ${dir}` : `"TIPCON_CODIGO" ${dir}`;
  const select = `SELECT "TIPCON_CODIGO" AS tipcon_codigo, "TIPCON_DESCRIPCION" AS tipcon_descripcion, "TIPCON_IND_PRUEBA" AS tipcon_ind_prueba FROM per_tipo_contrato ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createTipoContrato = async ({ tipcon_descripcion, tipcon_ind_prueba }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("TIPCON_CODIGO"), 0) + 1 AS next FROM per_tipo_contrato`);
  await pool.query(`INSERT INTO per_tipo_contrato ("TIPCON_CODIGO","TIPCON_DESCRIPCION","TIPCON_IND_PRUEBA") VALUES ($1,$2,$3)`, [next, tipcon_descripcion, tipcon_ind_prueba ?? 0]);
  return { tipcon_codigo: next, tipcon_descripcion, tipcon_ind_prueba: tipcon_ind_prueba ?? 0 };
};

const updateTipoContrato = async (id, { tipcon_descripcion, tipcon_ind_prueba }) => {
  await pool.query(`UPDATE per_tipo_contrato SET "TIPCON_DESCRIPCION" = $1, "TIPCON_IND_PRUEBA" = $2 WHERE "TIPCON_CODIGO" = $3`, [tipcon_descripcion, tipcon_ind_prueba ?? 0, id]);
  return { tipcon_codigo: id, tipcon_descripcion, tipcon_ind_prueba: tipcon_ind_prueba ?? 0 };
};

const deleteTipoContrato = async (id) => {
  await pool.query(`DELETE FROM per_tipo_contrato WHERE "TIPCON_CODIGO" = $1`, [id]);
};

// ─── MOTIVOS DE AUSENCIA ──────────────────────────────────────────────────────

const getMotivosAusencia = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "MAUS_DESC" ILIKE $1` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM per_motivo_ausencia ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = sortField === 'desc' ? `"MAUS_DESC" ${dir}` : `"MAUS_CLAVE" ${dir}`;
  const select = `SELECT "MAUS_CLAVE" AS maus_clave, "MAUS_DESC" AS maus_desc FROM per_motivo_ausencia ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createMotivoAusencia = async ({ maus_desc }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("MAUS_CLAVE"), 0) + 1 AS next FROM per_motivo_ausencia`);
  await pool.query(`INSERT INTO per_motivo_ausencia ("MAUS_CLAVE","MAUS_DESC") VALUES ($1,$2)`, [next, maus_desc]);
  return { maus_clave: next, maus_desc };
};

const updateMotivoAusencia = async (id, { maus_desc }) => {
  await pool.query(`UPDATE per_motivo_ausencia SET "MAUS_DESC" = $1 WHERE "MAUS_CLAVE" = $2`, [maus_desc, id]);
  return { maus_clave: id, maus_desc };
};

const deleteMotivoAusencia = async (id) => {
  await pool.query(`DELETE FROM per_motivo_ausencia WHERE "MAUS_CLAVE" = $1`, [id]);
};

// ─── FORMAS DE PAGO ───────────────────────────────────────────────────────────

const getFormasPago = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "FORMA_DESC" ILIKE $1` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM per_forma_pago ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = sortField === 'desc' ? `"FORMA_DESC" ${dir}` : `"FORMA_CODIGO" ${dir}`;
  const select = `SELECT "FORMA_CODIGO" AS forma_codigo, "FORMA_DESC" AS forma_desc, "FORMA_TIPO_PAGO" AS forma_tipo_pago FROM per_forma_pago ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createFormaPago = async ({ forma_desc, forma_tipo_pago }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("FORMA_CODIGO"), 0) + 1 AS next FROM per_forma_pago`);
  await pool.query(`INSERT INTO per_forma_pago ("FORMA_CODIGO","FORMA_DESC","FORMA_TIPO_PAGO") VALUES ($1,$2,$3)`, [next, forma_desc, forma_tipo_pago || null]);
  return { forma_codigo: next, forma_desc, forma_tipo_pago: forma_tipo_pago || null };
};

const updateFormaPago = async (id, { forma_desc, forma_tipo_pago }) => {
  await pool.query(`UPDATE per_forma_pago SET "FORMA_DESC" = $1, "FORMA_TIPO_PAGO" = $2 WHERE "FORMA_CODIGO" = $3`, [forma_desc, forma_tipo_pago || null, id]);
  return { forma_codigo: id, forma_desc, forma_tipo_pago: forma_tipo_pago || null };
};

const deleteFormaPago = async (id) => {
  await pool.query(`DELETE FROM per_forma_pago WHERE "FORMA_CODIGO" = $1`, [id]);
};

// ─── TIPOS DE LIQUIDACIÓN ────────────────────────────────────────────────────

const getTiposLiquidacion = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "TIPLIQ_DESCRIPCION" ILIKE $1` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM per_tipo_liq ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = sortField === 'desc' ? `"TIPLIQ_DESCRIPCION" ${dir}` : `"TIPLIQ_CODIGO" ${dir}`;
  const select = `SELECT "TIPLIQ_CODIGO" AS tipliq_codigo, "TIPLIQ_DESCRIPCION" AS tipliq_descripcion FROM per_tipo_liq ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createTipoLiquidacion = async ({ tipliq_descripcion }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("TIPLIQ_CODIGO"), 0) + 1 AS next FROM per_tipo_liq`);
  await pool.query(`INSERT INTO per_tipo_liq ("TIPLIQ_CODIGO","TIPLIQ_DESCRIPCION") VALUES ($1,$2)`, [next, tipliq_descripcion]);
  return { tipliq_codigo: next, tipliq_descripcion };
};

const updateTipoLiquidacion = async (id, { tipliq_descripcion }) => {
  await pool.query(`UPDATE per_tipo_liq SET "TIPLIQ_DESCRIPCION" = $1 WHERE "TIPLIQ_CODIGO" = $2`, [tipliq_descripcion, id]);
  return { tipliq_codigo: id, tipliq_descripcion };
};

const deleteTipoLiquidacion = async (id) => {
  await pool.query(`DELETE FROM per_tipo_liq WHERE "TIPLIQ_CODIGO" = $1`, [id]);
};

// ─── TIPOS DE PAGO ───────────────────────────────────────────────────────────

const getTiposPago = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "TPAG_DESC" ILIKE $1` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM per_tipo_pago ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = sortField === 'desc' ? `"TPAG_DESC" ${dir}` : `"TPAG_CODIGO" ${dir}`;
  const select = `SELECT "TPAG_CODIGO" AS tpag_codigo, "TPAG_DESC" AS tpag_desc FROM per_tipo_pago ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createTipoPago = async ({ tpag_desc }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("TPAG_CODIGO"), 0) + 1 AS next FROM per_tipo_pago`);
  await pool.query(`INSERT INTO per_tipo_pago ("TPAG_CODIGO","TPAG_DESC") VALUES ($1,$2)`, [next, tpag_desc]);
  return { tpag_codigo: next, tpag_desc };
};

const updateTipoPago = async (id, { tpag_desc }) => {
  await pool.query(`UPDATE per_tipo_pago SET "TPAG_DESC" = $1 WHERE "TPAG_CODIGO" = $2`, [tpag_desc, id]);
  return { tpag_codigo: id, tpag_desc };
};

const deleteTipoPago = async (id) => {
  await pool.query(`DELETE FROM per_tipo_pago WHERE "TPAG_CODIGO" = $1`, [id]);
};

// ─── TIPOS DE FAMILIAR ──────────────────────────────────────────────────────

const getTiposFamiliar = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "TIPO_DESC" ILIKE $1` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM per_tipo_familiar ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = sortField === 'desc' ? `"TIPO_DESC" ${dir}` : `"TIPO_CODIGO" ${dir}`;
  const select = `SELECT "TIPO_CODIGO" AS tipo_codigo, "TIPO_DESC" AS tipo_desc, "TIPO_COBRA_CONC" AS tipo_cobra_conc FROM per_tipo_familiar ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createTipoFamiliar = async ({ tipo_desc, tipo_cobra_conc }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("TIPO_CODIGO"), 0) + 1 AS next FROM per_tipo_familiar`);
  await pool.query(`INSERT INTO per_tipo_familiar ("TIPO_CODIGO","TIPO_DESC","TIPO_COBRA_CONC") VALUES ($1,$2,$3)`, [next, tipo_desc, tipo_cobra_conc || null]);
  return { tipo_codigo: next, tipo_desc, tipo_cobra_conc: tipo_cobra_conc || null };
};

const updateTipoFamiliar = async (id, { tipo_desc, tipo_cobra_conc }) => {
  await pool.query(`UPDATE per_tipo_familiar SET "TIPO_DESC" = $1, "TIPO_COBRA_CONC" = $2 WHERE "TIPO_CODIGO" = $3`, [tipo_desc, tipo_cobra_conc || null, id]);
  return { tipo_codigo: id, tipo_desc, tipo_cobra_conc: tipo_cobra_conc || null };
};

const deleteTipoFamiliar = async (id) => {
  await pool.query(`DELETE FROM per_tipo_familiar WHERE "TIPO_CODIGO" = $1`, [id]);
};

// ─── IDIOMAS ─────────────────────────────────────────────────────────────────

const getIdiomas = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "IDI_DESCRIPCION" ILIKE $1` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM per_idioma ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = sortField === 'desc' ? `"IDI_DESCRIPCION" ${dir}` : `"IDI_CODIGO" ${dir}`;
  const select = `SELECT "IDI_CODIGO" AS idi_codigo, "IDI_DESCRIPCION" AS idi_descripcion FROM per_idioma ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createIdioma = async ({ idi_descripcion }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("IDI_CODIGO"), 0) + 1 AS next FROM per_idioma`);
  await pool.query(`INSERT INTO per_idioma ("IDI_CODIGO","IDI_DESCRIPCION") VALUES ($1,$2)`, [next, idi_descripcion]);
  return { idi_codigo: next, idi_descripcion };
};

const updateIdioma = async (id, { idi_descripcion }) => {
  await pool.query(`UPDATE per_idioma SET "IDI_DESCRIPCION" = $1 WHERE "IDI_CODIGO" = $2`, [idi_descripcion, id]);
  return { idi_codigo: id, idi_descripcion };
};

const deleteIdioma = async (id) => {
  await pool.query(`DELETE FROM per_idioma WHERE "IDI_CODIGO" = $1`, [id]);
};

// ─── CARRERAS ────────────────────────────────────────────────────────────────

const getCarreras = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "CARR_DESCRIPCION" ILIKE $1` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM per_carrera ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = sortField === 'desc' ? `"CARR_DESCRIPCION" ${dir}` : `"CARR_CODIGO" ${dir}`;
  const select = `SELECT "CARR_CODIGO" AS carr_codigo, "CARR_DESCRIPCION" AS carr_descripcion FROM per_carrera ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createCarrera = async ({ carr_descripcion }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("CARR_CODIGO"), 0) + 1 AS next FROM per_carrera`);
  await pool.query(`INSERT INTO per_carrera ("CARR_CODIGO","CARR_DESCRIPCION") VALUES ($1,$2)`, [next, carr_descripcion]);
  return { carr_codigo: next, carr_descripcion };
};

const updateCarrera = async (id, { carr_descripcion }) => {
  await pool.query(`UPDATE per_carrera SET "CARR_DESCRIPCION" = $1 WHERE "CARR_CODIGO" = $2`, [carr_descripcion, id]);
  return { carr_codigo: id, carr_descripcion };
};

const deleteCarrera = async (id) => {
  await pool.query(`DELETE FROM per_carrera WHERE "CARR_CODIGO" = $1`, [id]);
};

// ─── BACHILLERATOS ───────────────────────────────────────────────────────────

const getBachilleratos = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "BACH_DESCRIPCION" ILIKE $1` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM per_bachiller ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = sortField === 'desc' ? `"BACH_DESCRIPCION" ${dir}` : `"BACH_CODIGO" ${dir}`;
  const select = `SELECT "BACH_CODIGO" AS bach_codigo, "BACH_DESCRIPCION" AS bach_descripcion FROM per_bachiller ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createBachillerato = async ({ bach_descripcion }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("BACH_CODIGO"), 0) + 1 AS next FROM per_bachiller`);
  await pool.query(`INSERT INTO per_bachiller ("BACH_CODIGO","BACH_DESCRIPCION") VALUES ($1,$2)`, [next, bach_descripcion]);
  return { bach_codigo: next, bach_descripcion };
};

const updateBachillerato = async (id, { bach_descripcion }) => {
  await pool.query(`UPDATE per_bachiller SET "BACH_DESCRIPCION" = $1 WHERE "BACH_CODIGO" = $2`, [bach_descripcion, id]);
  return { bach_codigo: id, bach_descripcion };
};

const deleteBachillerato = async (id) => {
  await pool.query(`DELETE FROM per_bachiller WHERE "BACH_CODIGO" = $1`, [id]);
};

// ─── CAPACITACIONES ──────────────────────────────────────────────────────────

const getCapacitaciones = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "PCAPAC_DESC" ILIKE $1` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM per_capacitacion ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = sortField === 'desc' ? `"PCAPAC_DESC" ${dir}` : `"PCAPAC_CODIGO" ${dir}`;
  const select = `SELECT "PCAPAC_CODIGO" AS pcapac_codigo, "PCAPAC_DESC" AS pcapac_desc FROM per_capacitacion ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createCapacitacion = async ({ pcapac_desc }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("PCAPAC_CODIGO"), 0) + 1 AS next FROM per_capacitacion`);
  await pool.query(`INSERT INTO per_capacitacion ("PCAPAC_CODIGO","PCAPAC_DESC") VALUES ($1,$2)`, [next, pcapac_desc]);
  return { pcapac_codigo: next, pcapac_desc };
};

const updateCapacitacion = async (id, { pcapac_desc }) => {
  await pool.query(`UPDATE per_capacitacion SET "PCAPAC_DESC" = $1 WHERE "PCAPAC_CODIGO" = $2`, [pcapac_desc, id]);
  return { pcapac_codigo: id, pcapac_desc };
};

const deleteCapacitacion = async (id) => {
  await pool.query(`DELETE FROM per_capacitacion WHERE "PCAPAC_CODIGO" = $1`, [id]);
};

// ─── NIVELES DE CAPACITACIÓN ─────────────────────────────────────────────────

const getNivelesCapacitacion = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "PCAPN_DESC" ILIKE $1` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM per_nivel_capac ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = sortField === 'desc' ? `"PCAPN_DESC" ${dir}` : `"PCAPN_COD" ${dir}`;
  const select = `SELECT "PCAPN_COD" AS pcapn_cod, "PCAPN_DESC" AS pcapn_desc FROM per_nivel_capac ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createNivelCapacitacion = async ({ pcapn_desc }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("PCAPN_COD"), 0) + 1 AS next FROM per_nivel_capac`);
  await pool.query(`INSERT INTO per_nivel_capac ("PCAPN_COD","PCAPN_DESC") VALUES ($1,$2)`, [next, pcapn_desc]);
  return { pcapn_cod: next, pcapn_desc };
};

const updateNivelCapacitacion = async (id, { pcapn_desc }) => {
  await pool.query(`UPDATE per_nivel_capac SET "PCAPN_DESC" = $1 WHERE "PCAPN_COD" = $2`, [pcapn_desc, id]);
  return { pcapn_cod: id, pcapn_desc };
};

const deleteNivelCapacitacion = async (id) => {
  await pool.query(`DELETE FROM per_nivel_capac WHERE "PCAPN_COD" = $1`, [id]);
};

// ─── ESTADOS DE ESTUDIO ──────────────────────────────────────────────────────

const getEstadosEstudio = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "EST_DESCRIPCION" ILIKE $1` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM per_estado_estudio ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = sortField === 'desc' ? `"EST_DESCRIPCION" ${dir}` : `"EST_CODIGO" ${dir}`;
  const select = `SELECT "EST_CODIGO" AS est_codigo, "EST_DESCRIPCION" AS est_descripcion FROM per_estado_estudio ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createEstadoEstudio = async ({ est_descripcion }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("EST_CODIGO"), 0) + 1 AS next FROM per_estado_estudio`);
  await pool.query(`INSERT INTO per_estado_estudio ("EST_CODIGO","EST_DESCRIPCION") VALUES ($1,$2)`, [next, est_descripcion]);
  return { est_codigo: next, est_descripcion };
};

const updateEstadoEstudio = async (id, { est_descripcion }) => {
  await pool.query(`UPDATE per_estado_estudio SET "EST_DESCRIPCION" = $1 WHERE "EST_CODIGO" = $2`, [est_descripcion, id]);
  return { est_codigo: id, est_descripcion };
};

const deleteEstadoEstudio = async (id) => {
  await pool.query(`DELETE FROM per_estado_estudio WHERE "EST_CODIGO" = $1`, [id]);
};

// ─── FUNCIONES ───────────────────────────────────────────────────────────────

const getFunciones = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "FUN_DESC" ILIKE $1` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM per_funcion ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = sortField === 'desc' ? `"FUN_DESC" ${dir}` : `"FUN_CODIGO" ${dir}`;
  const select = `SELECT "FUN_CODIGO" AS fun_codigo, "FUN_DESC" AS fun_desc FROM per_funcion ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createFuncion = async ({ fun_desc }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("FUN_CODIGO"), 0) + 1 AS next FROM per_funcion`);
  await pool.query(`INSERT INTO per_funcion ("FUN_CODIGO","FUN_DESC") VALUES ($1,$2)`, [next, fun_desc]);
  return { fun_codigo: next, fun_desc };
};

const updateFuncion = async (id, { fun_desc }) => {
  await pool.query(`UPDATE per_funcion SET "FUN_DESC" = $1 WHERE "FUN_CODIGO" = $2`, [fun_desc, id]);
  return { fun_codigo: id, fun_desc };
};

const deleteFuncion = async (id) => {
  await pool.query(`DELETE FROM per_funcion WHERE "FUN_CODIGO" = $1`, [id]);
};

// ─── CLASIFICACIONES DE DESCUENTO ────────────────────────────────────────────

const getClasificacionesDescuento = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "CLDE_DESC" ILIKE $1` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM per_clasificacion_descuento ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = sortField === 'desc' ? `"CLDE_DESC" ${dir}` : `"CLDE_CODIGO" ${dir}`;
  const select = `SELECT "CLDE_CODIGO" AS clde_codigo, "CLDE_DESC" AS clde_desc FROM per_clasificacion_descuento ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createClasificacionDescuento = async ({ clde_desc }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("CLDE_CODIGO"), 0) + 1 AS next FROM per_clasificacion_descuento`);
  await pool.query(`INSERT INTO per_clasificacion_descuento ("CLDE_CODIGO","CLDE_DESC") VALUES ($1,$2)`, [next, clde_desc]);
  return { clde_codigo: next, clde_desc };
};

const updateClasificacionDescuento = async (id, { clde_desc }) => {
  await pool.query(`UPDATE per_clasificacion_descuento SET "CLDE_DESC" = $1 WHERE "CLDE_CODIGO" = $2`, [clde_desc, id]);
  return { clde_codigo: id, clde_desc };
};

const deleteClasificacionDescuento = async (id) => {
  await pool.query(`DELETE FROM per_clasificacion_descuento WHERE "CLDE_CODIGO" = $1`, [id]);
};

// ─── TIPOS DE SALARIO ────────────────────────────────────────────────────────

const getTiposSalario = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "PTIPO_SAL_DESC" ILIKE $1` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM per_tipo_salario ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const allowedSort = { desc: `"PTIPO_SAL_DESC"`, tipo: `"PTIPO_SAL_TIPO"` };
  const orderCol = allowedSort[sortField] || `"PTIPO_SAL_CODIGO"`;
  const select = `SELECT "PTIPO_SAL_CODIGO" AS ptipo_sal_codigo, "PTIPO_SAL_DESC" AS ptipo_sal_desc, "PTIPO_SAL_DIAS_TRAB" AS ptipo_sal_dias_trab, "PTIPO_SAL_TIPO" AS ptipo_sal_tipo FROM per_tipo_salario ${where} ORDER BY ${orderCol} ${dir}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createTipoSalario = async ({ ptipo_sal_desc, ptipo_sal_dias_trab, ptipo_sal_tipo }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("PTIPO_SAL_CODIGO"), 0) + 1 AS next FROM per_tipo_salario`);
  await pool.query(`INSERT INTO per_tipo_salario ("PTIPO_SAL_CODIGO","PTIPO_SAL_DESC","PTIPO_SAL_DIAS_TRAB","PTIPO_SAL_TIPO") VALUES ($1,$2,$3,$4)`,
    [next, ptipo_sal_desc, ptipo_sal_dias_trab ?? null, ptipo_sal_tipo || null]);
  return { ptipo_sal_codigo: next, ptipo_sal_desc, ptipo_sal_dias_trab, ptipo_sal_tipo };
};

const updateTipoSalario = async (id, { ptipo_sal_desc, ptipo_sal_dias_trab, ptipo_sal_tipo }) => {
  await pool.query(`UPDATE per_tipo_salario SET "PTIPO_SAL_DESC" = $1, "PTIPO_SAL_DIAS_TRAB" = $2, "PTIPO_SAL_TIPO" = $3 WHERE "PTIPO_SAL_CODIGO" = $4`,
    [ptipo_sal_desc, ptipo_sal_dias_trab ?? null, ptipo_sal_tipo || null, id]);
  return { ptipo_sal_codigo: id, ptipo_sal_desc, ptipo_sal_dias_trab, ptipo_sal_tipo };
};

const deleteTipoSalario = async (id) => {
  await pool.query(`DELETE FROM per_tipo_salario WHERE "PTIPO_SAL_CODIGO" = $1`, [id]);
};

// ─── MOTIVOS DE LICENCIA ─────────────────────────────────────────────────────

const getMotivosLicencia = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "MLIC_DESC" ILIKE $1` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM per_motivo_licencia ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const allowedSort = { desc: `"MLIC_DESC"`, tipo: `"MLIC_TIPO"` };
  const orderCol = allowedSort[sortField] || `"MLIC_CODIGO"`;
  const select = `SELECT "MLIC_CODIGO" AS mlic_codigo, "MLIC_DESC" AS mlic_desc, "MLIC_TIPO" AS mlic_tipo, "MLIC_CAT_DIAS" AS mlic_cat_dias, "MLIC_IPS" AS mlic_ips, "MLIC_CONTROL_DEFICIT" AS mlic_control_deficit FROM per_motivo_licencia ${where} ORDER BY ${orderCol} ${dir}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createMotivoLicencia = async ({ mlic_desc, mlic_tipo, mlic_cat_dias, mlic_ips, mlic_control_deficit }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("MLIC_CODIGO"), 0) + 1 AS next FROM per_motivo_licencia`);
  await pool.query(`INSERT INTO per_motivo_licencia ("MLIC_CODIGO","MLIC_DESC","MLIC_TIPO","MLIC_CAT_DIAS","MLIC_IPS","MLIC_CONTROL_DEFICIT") VALUES ($1,$2,$3,$4,$5,$6)`,
    [next, mlic_desc, mlic_tipo || null, mlic_cat_dias ?? null, mlic_ips || 'N', mlic_control_deficit || 'N']);
  return { mlic_codigo: next, mlic_desc, mlic_tipo, mlic_cat_dias, mlic_ips: mlic_ips || 'N', mlic_control_deficit: mlic_control_deficit || 'N' };
};

const updateMotivoLicencia = async (id, { mlic_desc, mlic_tipo, mlic_cat_dias, mlic_ips, mlic_control_deficit }) => {
  await pool.query(`UPDATE per_motivo_licencia SET "MLIC_DESC" = $1, "MLIC_TIPO" = $2, "MLIC_CAT_DIAS" = $3, "MLIC_IPS" = $4, "MLIC_CONTROL_DEFICIT" = $5 WHERE "MLIC_CODIGO" = $6`,
    [mlic_desc, mlic_tipo || null, mlic_cat_dias ?? null, mlic_ips || 'N', mlic_control_deficit || 'N', id]);
  return { mlic_codigo: id, mlic_desc, mlic_tipo, mlic_cat_dias, mlic_ips, mlic_control_deficit };
};

const deleteMotivoLicencia = async (id) => {
  await pool.query(`DELETE FROM per_motivo_licencia WHERE "MLIC_CODIGO" = $1`, [id]);
};

// ─── INSTITUCIONES EDUCATIVAS ────────────────────────────────────────────────

const getInstEducativas = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "INST_DESCRIPCION" ILIKE $1` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM per_inst_educativa ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = sortField === 'desc' ? `"INST_DESCRIPCION" ${dir}` : `"INST_CODIGO" ${dir}`;
  const select = `SELECT "INST_CODIGO" AS inst_codigo, "INST_DESCRIPCION" AS inst_descripcion, "INST_PP" AS inst_pp, "INST_P" AS inst_p, "INST_S" AS inst_s, "INST_T" AS inst_t, "INST_I" AS inst_i FROM per_inst_educativa ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createInstEducativa = async ({ inst_descripcion, inst_pp, inst_p, inst_s, inst_t, inst_i }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("INST_CODIGO"), 0) + 1 AS next FROM per_inst_educativa`);
  await pool.query(`INSERT INTO per_inst_educativa ("INST_CODIGO","INST_DESCRIPCION","INST_PP","INST_P","INST_S","INST_T","INST_I") VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [next, inst_descripcion, inst_pp || 'N', inst_p || 'N', inst_s || 'N', inst_t || 'N', inst_i || 'N']);
  return { inst_codigo: next, inst_descripcion, inst_pp: inst_pp || 'N', inst_p: inst_p || 'N', inst_s: inst_s || 'N', inst_t: inst_t || 'N', inst_i: inst_i || 'N' };
};

const updateInstEducativa = async (id, { inst_descripcion, inst_pp, inst_p, inst_s, inst_t, inst_i }) => {
  await pool.query(`UPDATE per_inst_educativa SET "INST_DESCRIPCION" = $1, "INST_PP" = $2, "INST_P" = $3, "INST_S" = $4, "INST_T" = $5, "INST_I" = $6 WHERE "INST_CODIGO" = $7`,
    [inst_descripcion, inst_pp || 'N', inst_p || 'N', inst_s || 'N', inst_t || 'N', inst_i || 'N', id]);
  return { inst_codigo: id, inst_descripcion, inst_pp, inst_p, inst_s, inst_t, inst_i };
};

const deleteInstEducativa = async (id) => {
  await pool.query(`DELETE FROM per_inst_educativa WHERE "INST_CODIGO" = $1`, [id]);
};

// ─── CLASIFICACIONES DE CONCEPTO (solo lectura para selects) ─────────────────

const getClasificacionesConcepto = async ({ all = false } = {}) => {
  const { rows } = await pool.query(`SELECT "CLCO_CODIGO" AS clco_codigo, "CLCO_DESC" AS clco_desc, "CLCO_TIPO" AS clco_tipo, "CLCO_ORDEN" AS clco_orden FROM per_clasificacion_concepto ORDER BY "CLCO_ORDEN"`);
  return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
};

module.exports = {
  getCargos, createCargo, updateCargo, deleteCargo,
  getCategorias, createCategoria, updateCategoria, deleteCategoria,
  getAreas, createArea, updateArea, deleteArea,
  getSecciones, createSeccion, updateSeccion, deleteSeccion,
  getTurnos, createTurno, updateTurno, deleteTurno,
  getTiposContrato, createTipoContrato, updateTipoContrato, deleteTipoContrato,
  getMotivosAusencia, createMotivoAusencia, updateMotivoAusencia, deleteMotivoAusencia,
  getFormasPago, createFormaPago, updateFormaPago, deleteFormaPago,
  getTiposLiquidacion, createTipoLiquidacion, updateTipoLiquidacion, deleteTipoLiquidacion,
  getTiposPago, createTipoPago, updateTipoPago, deleteTipoPago,
  getTiposFamiliar, createTipoFamiliar, updateTipoFamiliar, deleteTipoFamiliar,
  getIdiomas, createIdioma, updateIdioma, deleteIdioma,
  getCarreras, createCarrera, updateCarrera, deleteCarrera,
  getBachilleratos, createBachillerato, updateBachillerato, deleteBachillerato,
  getCapacitaciones, createCapacitacion, updateCapacitacion, deleteCapacitacion,
  getNivelesCapacitacion, createNivelCapacitacion, updateNivelCapacitacion, deleteNivelCapacitacion,
  getEstadosEstudio, createEstadoEstudio, updateEstadoEstudio, deleteEstadoEstudio,
  getFunciones, createFuncion, updateFuncion, deleteFuncion,
  getClasificacionesDescuento, createClasificacionDescuento, updateClasificacionDescuento, deleteClasificacionDescuento,
  getTiposSalario, createTipoSalario, updateTipoSalario, deleteTipoSalario,
  getMotivosLicencia, createMotivoLicencia, updateMotivoLicencia, deleteMotivoLicencia,
  getInstEducativas, createInstEducativa, updateInstEducativa, deleteInstEducativa,
  getClasificacionesConcepto,
};
