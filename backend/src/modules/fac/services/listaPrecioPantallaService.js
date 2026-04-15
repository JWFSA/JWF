// Service para fac_lista_precio_pantalla_det
//
// Gestiona los 3 precios (BASIC / GURU / PREMIUM) de los artículos pantalla DOOH
// dentro de una lista de precios. Complementa a fac_lista_precio_det (1 precio por
// artículo) — no la reemplaza. Solo se usa para artículos con ART_LINEA = 12.

const pool = require('../../../config/db');

const PLANES_VALIDOS = ['BASIC', 'GURU', 'PREMIUM'];
const INSERCIONES_POR_DEFECTO = { BASIC: 280, GURU: 520, PREMIUM: 1040 };

function validarPlan(plan) {
  if (!PLANES_VALIDOS.includes(plan)) {
    throw { status: 400, message: `Plan inválido. Debe ser uno de: ${PLANES_VALIDOS.join(', ')}` };
  }
}

// Listar todos los precios-por-plan de una lista, agrupados por artículo.
// Devuelve: [{ lppd_art, art_desc, precios: { BASIC: {...}, GURU: {...}, PREMIUM: {...} } }, ...]
const getByLista = async (listaId, { search = '' } = {}) => {
  const params = [listaId];
  const whereSearch = search
    ? `AND a."ART_DESC" ILIKE $${params.push(`%${search}%`)}`
    : '';

  const { rows } = await pool.query(
    `SELECT d."LPPD_EMPR"              AS lppd_empr,
            d."LPPD_NRO_LISTA_PRECIO"  AS lppd_nro_lista_precio,
            d."LPPD_ART"               AS lppd_art,
            d."LPPD_PLAN"              AS lppd_plan,
            d."LPPD_PRECIO_UNITARIO"   AS lppd_precio_unitario,
            d."LPPD_INSERCIONES_MES"   AS lppd_inserciones_mes,
            a."ART_DESC"               AS art_desc,
            a."ART_UNID_MED"           AS art_unid_med
     FROM "ERP".fac_lista_precio_pantalla_det d
     JOIN "ERP".stk_articulo a ON a."ART_CODIGO" = d."LPPD_ART"
     WHERE d."LPPD_EMPR" = 1
       AND d."LPPD_NRO_LISTA_PRECIO" = $1
       ${whereSearch}
     ORDER BY a."ART_DESC", d."LPPD_PLAN"`,
    params,
  );

  // Agrupar por artículo para facilitar render en UI (fila = pantalla, col = plan)
  const porArticulo = new Map();
  for (const r of rows) {
    if (!porArticulo.has(r.lppd_art)) {
      porArticulo.set(r.lppd_art, {
        lppd_art: r.lppd_art,
        art_desc: r.art_desc,
        art_unid_med: r.art_unid_med,
        precios: {},
      });
    }
    porArticulo.get(r.lppd_art).precios[r.lppd_plan] = {
      precio_unitario: Number(r.lppd_precio_unitario),
      inserciones_mes: r.lppd_inserciones_mes,
    };
  }
  return Array.from(porArticulo.values());
};

// Obtener los 3 precios de un artículo pantalla en una lista
const getByArticulo = async (listaId, artCodigo) => {
  const { rows } = await pool.query(
    `SELECT d."LPPD_PLAN"             AS lppd_plan,
            d."LPPD_PRECIO_UNITARIO"  AS lppd_precio_unitario,
            d."LPPD_INSERCIONES_MES"  AS lppd_inserciones_mes
     FROM "ERP".fac_lista_precio_pantalla_det d
     WHERE d."LPPD_EMPR" = 1
       AND d."LPPD_NRO_LISTA_PRECIO" = $1
       AND d."LPPD_ART" = $2
     ORDER BY CASE d."LPPD_PLAN"
                WHEN 'BASIC' THEN 1
                WHEN 'GURU' THEN 2
                WHEN 'PREMIUM' THEN 3
              END`,
    [listaId, artCodigo],
  );

  const precios = {};
  for (const r of rows) {
    precios[r.lppd_plan] = {
      precio_unitario: Number(r.lppd_precio_unitario),
      inserciones_mes: r.lppd_inserciones_mes,
    };
  }
  return precios;
};

// Upsert de un precio-por-plan. Si inserciones_mes no viene, usa el default del plan.
const upsert = async (listaId, artCodigo, { plan, precio_unitario, inserciones_mes }) => {
  validarPlan(plan);
  if (precio_unitario == null || isNaN(Number(precio_unitario)) || Number(precio_unitario) < 0) {
    throw { status: 400, message: 'precio_unitario debe ser un número >= 0' };
  }
  const inserciones = inserciones_mes ?? INSERCIONES_POR_DEFECTO[plan];
  if (!Number.isInteger(inserciones) || inserciones <= 0) {
    throw { status: 400, message: 'inserciones_mes debe ser un entero positivo' };
  }

  // Validar que el artículo sea pantalla (ART_LINEA = 12)
  const { rows: artRows } = await pool.query(
    `SELECT "ART_LINEA" FROM "ERP".stk_articulo WHERE "ART_CODIGO" = $1`,
    [artCodigo],
  );
  if (artRows.length === 0) {
    throw { status: 404, message: 'Artículo no encontrado' };
  }
  if (Number(artRows[0].ART_LINEA) !== 12) {
    throw { status: 400, message: 'Solo se pueden cargar precios por plan para artículos pantalla (ART_LINEA = 12)' };
  }

  await pool.query(
    `INSERT INTO "ERP".fac_lista_precio_pantalla_det
       ("LPPD_EMPR", "LPPD_NRO_LISTA_PRECIO", "LPPD_ART", "LPPD_PLAN",
        "LPPD_PRECIO_UNITARIO", "LPPD_INSERCIONES_MES")
     VALUES (1, $1, $2, $3, $4, $5)
     ON CONFLICT ("LPPD_EMPR", "LPPD_NRO_LISTA_PRECIO", "LPPD_ART", "LPPD_PLAN")
     DO UPDATE SET
       "LPPD_PRECIO_UNITARIO" = EXCLUDED."LPPD_PRECIO_UNITARIO",
       "LPPD_INSERCIONES_MES" = EXCLUDED."LPPD_INSERCIONES_MES"`,
    [listaId, artCodigo, plan, precio_unitario, inserciones],
  );
};

// Eliminar un precio-por-plan específico
const remove = async (listaId, artCodigo, plan) => {
  validarPlan(plan);
  await pool.query(
    `DELETE FROM "ERP".fac_lista_precio_pantalla_det
     WHERE "LPPD_EMPR" = 1
       AND "LPPD_NRO_LISTA_PRECIO" = $1
       AND "LPPD_ART" = $2
       AND "LPPD_PLAN" = $3`,
    [listaId, artCodigo, plan],
  );
};

// Eliminar los 3 precios de un artículo en una lista (ej: desasociar la pantalla de la lista)
const removeAllOfArticulo = async (listaId, artCodigo) => {
  await pool.query(
    `DELETE FROM "ERP".fac_lista_precio_pantalla_det
     WHERE "LPPD_EMPR" = 1
       AND "LPPD_NRO_LISTA_PRECIO" = $1
       AND "LPPD_ART" = $2`,
    [listaId, artCodigo],
  );
};

module.exports = {
  PLANES_VALIDOS,
  INSERCIONES_POR_DEFECTO,
  getByLista,
  getByArticulo,
  upsert,
  remove,
  removeAllOfArticulo,
};
