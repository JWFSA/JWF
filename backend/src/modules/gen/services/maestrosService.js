const pool = require('../../../config/db');

const getMonedas = async () => {
  const { rows } = await pool.query(
    `SELECT "MON_CODIGO"    AS mon_codigo,
            "MON_DESC"      AS mon_desc,
            "MON_SIMBOLO"   AS mon_simbolo,
            "MON_TASA_VTA"  AS mon_tasa_vta,
            "MON_TASA_COMP" AS mon_tasa_comp
     FROM gen_moneda ORDER BY "MON_CODIGO"`
  );
  return rows;
};

const getPaises = async () => {
  const { rows } = await pool.query(
    `SELECT "PAIS_CODIGO"       AS pais_codigo,
            "PAIS_DESC"         AS pais_desc,
            "PAIS_NACIONALIDAD" AS pais_nacionalidad
     FROM gen_pais ORDER BY "PAIS_DESC"`
  );
  return rows;
};

const getCiudades = async () => {
  const { rows } = await pool.query(
    `SELECT "CIUDAD_CODIGO" AS ciudad_codigo,
            "CIUDAD_DESC"   AS ciudad_desc
     FROM gen_ciudad ORDER BY "CIUDAD_DESC"`
  );
  return rows;
};

const getDepartamentos = async () => {
  const { rows } = await pool.query(
    `SELECT "DPTO_CODIGO" AS dpto_codigo,
            "DPTO_DESC"   AS dpto_desc
     FROM gen_departamento ORDER BY "DPTO_DESC"`
  );
  return rows;
};

const getSecciones = async (dptoCodigo) => {
  const query = dptoCodigo
    ? `SELECT "SECC_DPTO" AS secc_dpto, "SECC_CODIGO" AS secc_codigo, "SECC_DESC" AS secc_desc
       FROM gen_seccion WHERE "SECC_DPTO" = $1 ORDER BY "SECC_DESC"`
    : `SELECT "SECC_DPTO" AS secc_dpto, "SECC_CODIGO" AS secc_codigo, "SECC_DESC" AS secc_desc
       FROM gen_seccion ORDER BY "SECC_DESC"`;
  const params = dptoCodigo ? [dptoCodigo] : [];
  const { rows } = await pool.query(query, params);
  return rows;
};

const getSistemas = async () => {
  const { rows } = await pool.query(
    `SELECT "SIST_CODIGO"        AS sist_codigo,
            "SIST_DESC"          AS sist_desc,
            "SIST_DESC_ABREV"    AS sist_desc_abrev,
            "SIST_IND_HABILITADO" AS sist_ind_habilitado
     FROM gen_sistema ORDER BY "SIST_DESC"`
  );
  return rows;
};

const getProgramas = async (sistemaCodigo) => {
  const query = sistemaCodigo
    ? `SELECT p."PROG_CLAVE"         AS prog_clave,
              p."PROG_DESC"          AS prog_desc,
              p."PROG_SISTEMA"       AS prog_sistema,
              s."SIST_DESC"          AS sist_desc,
              p."PROG_TIPO_PROGRAMA" AS prog_tipo_programa
       FROM gen_programa p
       JOIN gen_sistema s ON s."SIST_CODIGO" = p."PROG_SISTEMA"
       WHERE p."PROG_SISTEMA" = $1 ORDER BY p."PROG_DESC"`
    : `SELECT p."PROG_CLAVE"         AS prog_clave,
              p."PROG_DESC"          AS prog_desc,
              p."PROG_SISTEMA"       AS prog_sistema,
              s."SIST_DESC"          AS sist_desc,
              p."PROG_TIPO_PROGRAMA" AS prog_tipo_programa
       FROM gen_programa p
       JOIN gen_sistema s ON s."SIST_CODIGO" = p."PROG_SISTEMA"
       ORDER BY s."SIST_DESC", p."PROG_DESC"`;
  const params = sistemaCodigo ? [sistemaCodigo] : [];
  const { rows } = await pool.query(query, params);
  return rows;
};

module.exports = { getMonedas, getPaises, getCiudades, getDepartamentos, getSecciones, getSistemas, getProgramas };
