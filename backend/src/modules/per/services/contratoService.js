const pool = require('../../../config/db');

const getContratos = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc', empleado = '' } = {}) => {
  const params = [];
  const conditions = [];

  if (empleado) { params.push(Number(empleado)); conditions.push(`c."CON_EMPLEADO" = $${params.length}`); }
  if (search) { params.push(`%${search}%`); conditions.push(`(c."CON_OBSERVACION" ILIKE $${params.length} OR e."EMPL_NOMBRE" ILIKE $${params.length})`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM per_contrato c LEFT JOIN per_empleado e ON e."EMPL_LEGAJO" = c."CON_EMPLEADO" ${where}`, params);
  const total = parseInt(count);

  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const allowedSort = { fecha: `c."CON_FECHA_INI"`, empleado: `e."EMPL_NOMBRE"` };
  const orderCol = allowedSort[sortField] || `c."CON_FECHA_INI"`;

  const select = `SELECT c."CON_CODIGO" AS con_codigo, c."CON_EMPLEADO" AS con_empleado,
    e."EMPL_NOMBRE" AS empl_nombre, e."EMPL_APE" AS empl_ape,
    c."CON_TIPO_CONTRATO" AS con_tipo_contrato, tc."TIPCON_DESCRIPCION" AS tipcon_descripcion,
    c."CON_FECHA_INI" AS con_fecha_ini, c."CON_FECHA_FIN" AS con_fecha_fin,
    c."CON_OBSERVACION" AS con_observacion, c."CON_DIAS_PREAVISO" AS con_dias_preaviso,
    c."CON_MOV_PROPIA" AS con_mov_propia
    FROM per_contrato c
    LEFT JOIN per_empleado e ON e."EMPL_LEGAJO" = c."CON_EMPLEADO"
    LEFT JOIN per_tipo_contrato tc ON tc."TIPCON_CODIGO" = c."CON_TIPO_CONTRATO"
    ${where} ORDER BY ${orderCol} ${dir}`;

  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createContrato = async ({ con_empleado, con_tipo_contrato, con_fecha_ini, con_fecha_fin, con_observacion, con_dias_preaviso, con_mov_propia }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX(CAST("CON_CODIGO" AS INTEGER)), 0) + 1 AS next FROM per_contrato`);
  const codigo = String(next);
  await pool.query(
    `INSERT INTO per_contrato ("CON_CODIGO","CON_EMPLEADO","CON_TIPO_CONTRATO","CON_FECHA_INI","CON_FECHA_FIN","CON_OBSERVACION","CON_DIAS_PREAVISO","CON_MOV_PROPIA")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [codigo, con_empleado, con_tipo_contrato || null, con_fecha_ini, con_fecha_fin || null, con_observacion || null, con_dias_preaviso ?? null, con_mov_propia || 'N']
  );
  return { con_codigo: codigo, con_empleado, con_tipo_contrato, con_fecha_ini, con_fecha_fin, con_observacion, con_dias_preaviso, con_mov_propia };
};

const updateContrato = async (id, { con_tipo_contrato, con_fecha_ini, con_fecha_fin, con_observacion, con_dias_preaviso, con_mov_propia }) => {
  await pool.query(
    `UPDATE per_contrato SET "CON_TIPO_CONTRATO" = $1, "CON_FECHA_INI" = $2, "CON_FECHA_FIN" = $3, "CON_OBSERVACION" = $4, "CON_DIAS_PREAVISO" = $5, "CON_MOV_PROPIA" = $6 WHERE "CON_CODIGO" = $7`,
    [con_tipo_contrato || null, con_fecha_ini, con_fecha_fin || null, con_observacion || null, con_dias_preaviso ?? null, con_mov_propia || 'N', id]
  );
  return { con_codigo: id };
};

const deleteContrato = async (id) => {
  await pool.query(`DELETE FROM per_contrato WHERE "CON_CODIGO" = $1`, [id]);
};

module.exports = { getContratos, createContrato, updateContrato, deleteContrato };
