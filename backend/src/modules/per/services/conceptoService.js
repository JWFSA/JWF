const pool = require('../../../config/db');

const getConceptos = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE c."PCON_DESC" ILIKE $1` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM per_concepto c ${where}`, params);
  const total = parseInt(count);

  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const allowedSort = { desc: `c."PCON_DESC"`, orden: `c."PCON_ORDEN"`, clas: `cl."CLCO_DESC"` };
  const orderCol = allowedSort[sortField] || `c."PCON_CLAVE"`;

  const select = `SELECT c."PCON_CLAVE" AS pcon_clave, c."PCON_CLAVE_CONCEPTO" AS pcon_clave_concepto,
    c."PCON_DESC" AS pcon_desc, c."PCON_IND_FIJO" AS pcon_ind_fijo,
    c."PCON_CLAVE_CTACO" AS pcon_clave_ctaco,
    c."PCON_IND_AGUINALDO" AS pcon_ind_aguinaldo,
    c."PCON_CLAS_CONCEPTO" AS pcon_clas_concepto, cl."CLCO_DESC" AS clco_desc, cl."CLCO_TIPO" AS clco_tipo,
    c."PCON_CLAS_CONC_DESCUENTO" AS pcon_clas_conc_descuento, cd."CLDE_DESC" AS clde_desc,
    c."PCON_CONC_AGUINALDO" AS pcon_conc_aguinaldo,
    c."PCON_CONC_HORAS_EXTRAS" AS pcon_conc_horas_extras,
    c."PCON_CONC_BONIF_FAMILIAR" AS pcon_conc_bonif_familiar,
    c."PCON_IND_SUM_IPS" AS pcon_ind_sum_ips,
    c."PCON_RECIBO_SALARIO" AS pcon_recibo_salario,
    c."PCON_IND_OTROS_BENEFICIOS" AS pcon_ind_otros_beneficios,
    c."PCON_ANTICIPO" AS pcon_anticipo,
    c."PCON_IND_MJT" AS pcon_ind_mjt,
    c."PCON_CONC_COMISION" AS pcon_conc_comision,
    c."PCON_EMPRESA" AS pcon_empresa,
    c."PCON_SUMA_BF" AS pcon_suma_bf,
    c."PCON_ORDEN" AS pcon_orden
    FROM per_concepto c
    LEFT JOIN per_clasificacion_concepto cl ON cl."CLCO_CODIGO" = c."PCON_CLAS_CONCEPTO"
    LEFT JOIN per_clasificacion_descuento cd ON cd."CLDE_CODIGO" = c."PCON_CLAS_CONC_DESCUENTO"
    ${where} ORDER BY ${orderCol} ${dir}`;

  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createConcepto = async (data) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("PCON_CLAVE"), 0) + 1 AS next FROM per_concepto`);
  await pool.query(
    `INSERT INTO per_concepto ("PCON_CLAVE","PCON_CLAVE_CONCEPTO","PCON_DESC","PCON_IND_FIJO","PCON_CLAVE_CTACO",
      "PCON_IND_AGUINALDO","PCON_CLAS_CONCEPTO","PCON_CLAS_CONC_DESCUENTO",
      "PCON_CONC_AGUINALDO","PCON_CONC_HORAS_EXTRAS","PCON_CONC_BONIF_FAMILIAR",
      "PCON_IND_SUM_IPS","PCON_RECIBO_SALARIO","PCON_IND_OTROS_BENEFICIOS",
      "PCON_ANTICIPO","PCON_IND_MJT","PCON_CONC_COMISION","PCON_EMPRESA","PCON_SUMA_BF","PCON_ORDEN")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
    [next, data.pcon_clave_concepto ?? null, data.pcon_desc,
     data.pcon_ind_fijo || 'N', data.pcon_clave_ctaco ?? null,
     data.pcon_ind_aguinaldo || 'N', data.pcon_clas_concepto ?? null, data.pcon_clas_conc_descuento ?? null,
     data.pcon_conc_aguinaldo || 'N', data.pcon_conc_horas_extras || 'N', data.pcon_conc_bonif_familiar || 'N',
     data.pcon_ind_sum_ips || 'N', data.pcon_recibo_salario || 'S', data.pcon_ind_otros_beneficios || 'N',
     data.pcon_anticipo || 'N', data.pcon_ind_mjt || 'N', data.pcon_conc_comision || 'N',
     data.pcon_empresa || '1', data.pcon_suma_bf || 'N', data.pcon_orden ?? null]
  );
  return { pcon_clave: next, ...data };
};

const updateConcepto = async (id, data) => {
  await pool.query(
    `UPDATE per_concepto SET "PCON_CLAVE_CONCEPTO" = $1, "PCON_DESC" = $2, "PCON_IND_FIJO" = $3, "PCON_CLAVE_CTACO" = $4,
      "PCON_IND_AGUINALDO" = $5, "PCON_CLAS_CONCEPTO" = $6, "PCON_CLAS_CONC_DESCUENTO" = $7,
      "PCON_CONC_AGUINALDO" = $8, "PCON_CONC_HORAS_EXTRAS" = $9, "PCON_CONC_BONIF_FAMILIAR" = $10,
      "PCON_IND_SUM_IPS" = $11, "PCON_RECIBO_SALARIO" = $12, "PCON_IND_OTROS_BENEFICIOS" = $13,
      "PCON_ANTICIPO" = $14, "PCON_IND_MJT" = $15, "PCON_CONC_COMISION" = $16,
      "PCON_EMPRESA" = $17, "PCON_SUMA_BF" = $18, "PCON_ORDEN" = $19
     WHERE "PCON_CLAVE" = $20`,
    [data.pcon_clave_concepto ?? null, data.pcon_desc, data.pcon_ind_fijo || 'N', data.pcon_clave_ctaco ?? null,
     data.pcon_ind_aguinaldo || 'N', data.pcon_clas_concepto ?? null, data.pcon_clas_conc_descuento ?? null,
     data.pcon_conc_aguinaldo || 'N', data.pcon_conc_horas_extras || 'N', data.pcon_conc_bonif_familiar || 'N',
     data.pcon_ind_sum_ips || 'N', data.pcon_recibo_salario || 'S', data.pcon_ind_otros_beneficios || 'N',
     data.pcon_anticipo || 'N', data.pcon_ind_mjt || 'N', data.pcon_conc_comision || 'N',
     data.pcon_empresa || '1', data.pcon_suma_bf || 'N', data.pcon_orden ?? null, id]
  );
  return { pcon_clave: id };
};

const deleteConcepto = async (id) => {
  await pool.query(`DELETE FROM per_concepto WHERE "PCON_CLAVE" = $1`, [id]);
};

module.exports = { getConceptos, createConcepto, updateConcepto, deleteConcepto };
