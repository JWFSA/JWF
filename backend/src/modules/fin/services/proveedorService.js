const pool = require('../../../config/db');

const getAll = async ({ page = 1, limit = 20, search = '', all = false } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search
    ? `WHERE (p."PROV_RAZON_SOCIAL" ILIKE $1 OR p."PROV_RUC" ILIKE $1 OR p."PROV_TEL" ILIKE $1)`
    : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM fin_proveedor p ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const select = `
    SELECT p."PROV_CODIGO" AS prov_codigo, p."PROV_RAZON_SOCIAL" AS prov_razon_social,
           p."PROV_RUC" AS prov_ruc, p."PROV_TEL" AS prov_tel,
           p."PROV_EMAIL" AS prov_email, p."PROV_EST_PROV" AS prov_est_prov,
           p."PROV_TIPO" AS prov_tipo, t."TIPR_DESC" AS tipr_desc
    FROM fin_proveedor p
    LEFT JOIN fin_tipo_proveedor t ON t."TIPR_CODIGO" = p."PROV_TIPO"
    ${where} ORDER BY p."PROV_RAZON_SOCIAL"`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getById = async (id) => {
  const { rows } = await pool.query(
    `SELECT p."PROV_CODIGO" AS prov_codigo, p."PROV_RAZON_SOCIAL" AS prov_razon_social,
     p."PROV_PROPIETARIO" AS prov_propietario, p."PROV_RUC" AS prov_ruc,
     p."PROV_TEL" AS prov_tel, p."PROV_FAX" AS prov_fax,
     p."PROV_CELULAR" AS prov_celular, p."PROV_EMAIL" AS prov_email,
     p."PROV_DIR2" AS prov_dir2, p."PROV_PAIS" AS prov_pais, pa."PAIS_DESC" AS pais_desc,
     p."PROV_TIPO" AS prov_tipo, t."TIPR_DESC" AS tipr_desc,
     p."PROV_EST_PROV" AS prov_est_prov, p."PROV_PLAZO_PAGO" AS prov_plazo_pago,
     p."PROV_PERS_CONTACTO" AS prov_pers_contacto, p."PROV_PERS_CONTACTO2" AS prov_pers_contacto2,
     p."PROV_OBS" AS prov_obs, p."PROV_TRIBUTO_UNICO" AS prov_tributo_unico,
     p."PROV_RETENCION" AS prov_retencion
     FROM fin_proveedor p
     LEFT JOIN gen_pais pa ON pa."PAIS_CODIGO" = p."PROV_PAIS"
     LEFT JOIN fin_tipo_proveedor t ON t."TIPR_CODIGO" = p."PROV_TIPO"
     WHERE p."PROV_CODIGO" = $1`, [id]
  );
  if (!rows.length) throw { status: 404, message: 'Proveedor no encontrado' };
  return rows[0];
};

const create = async (data) => {
  const { rows } = await pool.query('SELECT COALESCE(MAX("PROV_CODIGO"), 0) + 1 AS next FROM fin_proveedor');
  const codigo = rows[0].next;
  await pool.query(
    `INSERT INTO fin_proveedor
     ("PROV_CODIGO","PROV_RAZON_SOCIAL","PROV_PROPIETARIO","PROV_RUC","PROV_TEL","PROV_FAX",
      "PROV_CELULAR","PROV_EMAIL","PROV_DIR2","PROV_PAIS","PROV_TIPO","PROV_EST_PROV",
      "PROV_PLAZO_PAGO","PROV_PERS_CONTACTO","PROV_PERS_CONTACTO2","PROV_OBS",
      "PROV_TRIBUTO_UNICO","PROV_RETENCION")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
    [
      codigo, data.prov_razon_social, data.prov_propietario || null,
      data.prov_ruc || null, data.prov_tel || null, data.prov_fax || null,
      data.prov_celular || null, data.prov_email || null, data.prov_dir2 || null,
      data.prov_pais || null, data.prov_tipo || null, data.prov_est_prov || 'A',
      data.prov_plazo_pago || null, data.prov_pers_contacto || null, data.prov_pers_contacto2 || null,
      data.prov_obs || null, data.prov_tributo_unico || 'N', data.prov_retencion || 'N',
    ]
  );
  return getById(codigo);
};

const update = async (id, data) => {
  const fields = []; const params = [];
  const map = {
    prov_razon_social: '"PROV_RAZON_SOCIAL"', prov_propietario: '"PROV_PROPIETARIO"',
    prov_ruc: '"PROV_RUC"', prov_tel: '"PROV_TEL"', prov_fax: '"PROV_FAX"',
    prov_celular: '"PROV_CELULAR"', prov_email: '"PROV_EMAIL"', prov_dir2: '"PROV_DIR2"',
    prov_pais: '"PROV_PAIS"', prov_tipo: '"PROV_TIPO"', prov_est_prov: '"PROV_EST_PROV"',
    prov_plazo_pago: '"PROV_PLAZO_PAGO"', prov_pers_contacto: '"PROV_PERS_CONTACTO"',
    prov_pers_contacto2: '"PROV_PERS_CONTACTO2"', prov_obs: '"PROV_OBS"',
    prov_tributo_unico: '"PROV_TRIBUTO_UNICO"', prov_retencion: '"PROV_RETENCION"',
  };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
  }
  if (!fields.length) return getById(id);
  params.push(id);
  await pool.query(`UPDATE fin_proveedor SET ${fields.join(', ')} WHERE "PROV_CODIGO" = $${params.length}`, params);
  return getById(id);
};

const remove = async (id) => {
  await pool.query('DELETE FROM fin_proveedor WHERE "PROV_CODIGO" = $1', [id]);
};

module.exports = { getAll, getById, create, update, remove };
