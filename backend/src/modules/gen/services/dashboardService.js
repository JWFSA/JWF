const pool = require('../../../config/db');

const getStats = async () => {
  const [
    clientesRes,
    articulosRes,
    proveedoresRes,
    empleadosRes,
    facturasMesRes,
    pedidosPendientesRes,
    ordenesPendientesRes,
    ordenesCompraPendRes,
    docsPorPagarRes,
    asientosMesRes,
    ultimaFacturasRes,
    ultimosPedidosRes,
    ultimasComprasRes,
    stockBajoRes,
  ] = await Promise.all([
    pool.query(`SELECT COUNT(*) AS total FROM fin_cliente`),
    pool.query(`SELECT COUNT(*) AS total FROM stk_articulo`),
    pool.query(`SELECT COUNT(*) AS total FROM fin_proveedor`),
    pool.query(`SELECT COUNT(*) AS total FROM per_empleado`),
    pool.query(`
      SELECT COUNT(*) AS cantidad, COALESCE(SUM(d."DOC_SALDO_LOC"), 0) AS total
      FROM fin_documento d
      WHERE d."DOC_TIPO_MOV" = 10
        AND DATE_TRUNC('month', d."DOC_FEC_DOC") = DATE_TRUNC('month', CURRENT_DATE)
    `),
    pool.query(`
      SELECT COUNT(*) AS cantidad, COALESCE(SUM(p."PED_IMP_TOTAL_MON"), 0) AS total
      FROM fac_pedido p WHERE p."PED_ESTADO" NOT IN ('F', 'A')
    `),
    pool.query(`
      SELECT COUNT(*) AS cantidad, COALESCE(SUM(o."ORDP_TOT_PAGO"), 0) AS total
      FROM fin_orden_pago o WHERE o."ORDP_ESTADO" NOT IN ('P', 'A')
    `),
    pool.query(`
      SELECT COUNT(*) AS cantidad, COALESCE(SUM(o."ORCOM_TOTAL"), 0) AS total
      FROM com_orden_compra o WHERE o."ORCOM_ESTADO" = 'PE'
    `),
    pool.query(`
      SELECT COUNT(*) AS cantidad, COALESCE(SUM(d."DOC_SALDO_MON"), 0) AS total
      FROM fin_documento d
      WHERE d."DOC_TIPO_SALDO" = 'C' AND d."DOC_SALDO_MON" > 0
    `),
    pool.query(`
      SELECT COUNT(*) AS cantidad
      FROM cnt_asiento a
      WHERE a."ASI_EMPR" = 1
        AND DATE_TRUNC('month', a."ASI_FEC") = DATE_TRUNC('month', CURRENT_DATE)
    `),
    pool.query(`
      SELECT d."DOC_CLAVE" AS clave, d."DOC_NRO_DOC" AS nro, d."DOC_FEC_DOC" AS fecha,
        COALESCE(c."CLI_NOM", d."DOC_CLI_NOM") AS cliente, d."DOC_SALDO_LOC" AS total,
        m."MON_SIMBOLO" AS simbolo
      FROM fin_documento d
      LEFT JOIN fin_cliente c ON c."CLI_CODIGO" = d."DOC_CLI"
      LEFT JOIN gen_moneda m ON m."MON_CODIGO" = d."DOC_MON"
      WHERE d."DOC_TIPO_MOV" = 10 ORDER BY d."DOC_CLAVE" DESC LIMIT 6
    `),
    pool.query(`
      SELECT p."PED_CLAVE" AS clave, p."PED_NRO" AS nro, p."PED_FECHA" AS fecha,
        c."CLI_NOM" AS cliente, p."PED_ESTADO" AS estado, p."PED_IMP_TOTAL_MON" AS total
      FROM fac_pedido p LEFT JOIN fin_cliente c ON c."CLI_CODIGO" = p."PED_CLI"
      ORDER BY p."PED_CLAVE" DESC LIMIT 6
    `),
    pool.query(`
      SELECT o."ORCOM_NRO" AS nro, o."ORCOM_FEC_EMIS" AS fecha,
        p."PROV_RAZON_SOCIAL" AS proveedor, o."ORCOM_TOTAL" AS total, o."ORCOM_ESTADO" AS estado
      FROM com_orden_compra o
      LEFT JOIN fin_proveedor p ON p."PROV_CODIGO" = o."ORCOM_PROV"
      ORDER BY o."ORCOM_NRO" DESC LIMIT 6
    `),
    pool.query(`
      SELECT a."ART_DESC" AS articulo, s."ARDE_CANT_ACT" AS stock
      FROM stk_articulo_deposito s
      JOIN stk_articulo a ON a."ART_CODIGO" = s."ARDE_ART"
      WHERE s."ARDE_CANT_ACT" >= 0 AND s."ARDE_CANT_ACT" <= 5
      ORDER BY s."ARDE_CANT_ACT" ASC LIMIT 5
    `),
  ]);

  return {
    kpis: {
      clientes:    parseInt(clientesRes.rows[0].total),
      articulos:   parseInt(articulosRes.rows[0].total),
      proveedores: parseInt(proveedoresRes.rows[0].total),
      empleados:   parseInt(empleadosRes.rows[0].total),
      facturasMes: {
        cantidad: parseInt(facturasMesRes.rows[0].cantidad),
        total:    parseFloat(facturasMesRes.rows[0].total),
      },
      pedidosPendientes: {
        cantidad: parseInt(pedidosPendientesRes.rows[0].cantidad),
        total:    parseFloat(pedidosPendientesRes.rows[0].total),
      },
      ordenesPendientes: {
        cantidad: parseInt(ordenesPendientesRes.rows[0].cantidad),
        total:    parseFloat(ordenesPendientesRes.rows[0].total),
      },
      ordenesCompraPend: {
        cantidad: parseInt(ordenesCompraPendRes.rows[0].cantidad),
        total:    parseFloat(ordenesCompraPendRes.rows[0].total),
      },
      docsPorPagar: {
        cantidad: parseInt(docsPorPagarRes.rows[0].cantidad),
        total:    parseFloat(docsPorPagarRes.rows[0].total),
      },
      asientosMes: parseInt(asientosMesRes.rows[0].cantidad),
    },
    ultimasFacturas: ultimaFacturasRes.rows,
    ultimosPedidos:  ultimosPedidosRes.rows,
    ultimasCompras:  ultimasComprasRes.rows,
    stockBajo:       stockBajoRes.rows,
  };
};

module.exports = { getStats };
