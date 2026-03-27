const pool = require('../../../config/db');

const getFamiliares = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc', empleado = '' } = {}) => {
  const params = [];
  const conditions = [];

  if (empleado) { params.push(Number(empleado)); conditions.push(`f."FAM_EMPL_CODIGO" = $${params.length}`); }
  if (search) { params.push(`%${search}%`); conditions.push(`(f."FAM_NOMBRE" ILIKE $${params.length} OR e."EMPL_NOMBRE" ILIKE $${params.length})`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM per_familia f LEFT JOIN per_empleado e ON e."EMPL_LEGAJO" = f."FAM_EMPL_CODIGO" ${where}`, params);
  const total = parseInt(count);

  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const allowedSort = { nombre: `f."FAM_NOMBRE"`, empleado: `e."EMPL_NOMBRE"` };
  const orderCol = allowedSort[sortField] || `f."FAM_CODIGO"`;

  const select = `SELECT f."FAM_CODIGO" AS fam_codigo, f."FAM_EMPL_CODIGO" AS fam_empl_codigo,
    e."EMPL_NOMBRE" AS empl_nombre, e."EMPL_APE" AS empl_ape,
    f."FAM_NOMBRE" AS fam_nombre, f."FAM_FEC_NAC" AS fam_fec_nac,
    f."FAM_TIPO" AS fam_tipo, tf."TIPO_DESC" AS tipo_desc,
    f."FAM_SEXO" AS fam_sexo, f."FAM_IND_COBRA" AS fam_ind_cobra,
    f."FAM_IMP_BONIF" AS fam_imp_bonif, f."FAM_IND_DISC" AS fam_ind_disc
    FROM per_familia f
    LEFT JOIN per_empleado e ON e."EMPL_LEGAJO" = f."FAM_EMPL_CODIGO"
    LEFT JOIN per_tipo_familiar tf ON tf."TIPO_CODIGO" = f."FAM_TIPO"
    ${where} ORDER BY ${orderCol} ${dir}`;

  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createFamiliar = async ({ fam_empl_codigo, fam_nombre, fam_fec_nac, fam_tipo, fam_sexo, fam_ind_cobra, fam_imp_bonif, fam_ind_disc }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("FAM_CODIGO"), 0) + 1 AS next FROM per_familia WHERE "FAM_EMPL_CODIGO" = $1`, [fam_empl_codigo]);
  await pool.query(
    `INSERT INTO per_familia ("FAM_CODIGO","FAM_EMPL_CODIGO","FAM_NOMBRE","FAM_FEC_NAC","FAM_TIPO","FAM_SEXO","FAM_IND_COBRA","FAM_IMP_BONIF","FAM_IND_DISC","FAM_EMPRESA")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [next, fam_empl_codigo, fam_nombre, fam_fec_nac || null, fam_tipo || null, fam_sexo || null, fam_ind_cobra || 'N', fam_imp_bonif ?? null, fam_ind_disc || 'N', 1]
  );
  return { fam_codigo: next, fam_empl_codigo, fam_nombre, fam_fec_nac, fam_tipo, fam_sexo, fam_ind_cobra, fam_imp_bonif, fam_ind_disc };
};

const updateFamiliar = async (id, empleado, { fam_nombre, fam_fec_nac, fam_tipo, fam_sexo, fam_ind_cobra, fam_imp_bonif, fam_ind_disc }) => {
  await pool.query(
    `UPDATE per_familia SET "FAM_NOMBRE" = $1, "FAM_FEC_NAC" = $2, "FAM_TIPO" = $3, "FAM_SEXO" = $4, "FAM_IND_COBRA" = $5, "FAM_IMP_BONIF" = $6, "FAM_IND_DISC" = $7
     WHERE "FAM_CODIGO" = $8 AND "FAM_EMPL_CODIGO" = $9`,
    [fam_nombre, fam_fec_nac || null, fam_tipo || null, fam_sexo || null, fam_ind_cobra || 'N', fam_imp_bonif ?? null, fam_ind_disc || 'N', id, empleado]
  );
  return { fam_codigo: id };
};

const deleteFamiliar = async (id, empleado) => {
  await pool.query(`DELETE FROM per_familia WHERE "FAM_CODIGO" = $1 AND "FAM_EMPL_CODIGO" = $2`, [id, empleado]);
};

module.exports = { getFamiliares, createFamiliar, updateFamiliar, deleteFamiliar };
