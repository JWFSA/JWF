-- Consolidación masiva de las 18 pantallas DOOH restantes
-- (Senador Long ya se consolidó en 20260415000200_consolidar_senador_long_PILOTO.sql)
--
-- Fuente de verdad: DOOH_JWF_PANTALLAS_ICÓNICAS_2026.pdf del CMS.
--
-- Convención por pantalla:
--   1) Reutilizar el ART_CODIGO del antiguo "BASIC" como consolidado (renombrar)
--   2) Insertar los 3 precios en fac_lista_precio_pantalla_det
--   3) Borrar los precios antiguos en fac_lista_precio_det (los 3 artículos)
--   4) Soft-delete de los artículos GURU/PREMIUM antiguos (ART_EST='I')
--
-- Los pedidos/facturas históricas NO se tocan. Siguen apuntando a los
-- ART_CODIGO originales (activos o inactivos). Solo cambia la visibilidad
-- futura y el mecanismo de consulta de precios nuevos.
--
-- Mapeo de pantallas nuevas:
--   - "Julio Correa": se crea como artículo nuevo (no existía).
--   - "España Vista Centro": se crea como artículo nuevo (no existía).
--   - "España y Venezuela" → renombrada a "España Vista Centenario" (misma pantalla).
--   - "Chaco Boreal" → renombrada a "Mariscal López" (misma pantalla).
--   - "FIC Aviadores" → renombrada a "Aviadores".
--   - Hortensias, San Bernardino, Coronel Oviedo: precios del ERP se reemplazan
--     por los del PDF 2026 (los del ERP estaban desactualizados).

BEGIN;

-- ─── PANTALLAS NUEVAS (no existían en el ERP) ─────────────────────────────

-- Julio Correa: 570/1025/1875
INSERT INTO "ERP".stk_articulo
  ("ART_CODIGO", "ART_DESC", "ART_DESC_ABREV", "ART_UNID_MED", "ART_LINEA",
   "ART_MARCA", "ART_RUBRO", "ART_GRUPO", "ART_EST", "ART_TIPO",
   "ART_IMPU", "ART_IND_IMP", "ART_IND_VENTA")
VALUES
  (358036, 'PANTALLA JULIO CORREA', 'PANT JULIO CORREA', 'MES', 12,
   12, 1, 16, 'A', 2, 2, 'N', 'S');

-- España Vista Centro: 570/1025/1875
INSERT INTO "ERP".stk_articulo
  ("ART_CODIGO", "ART_DESC", "ART_DESC_ABREV", "ART_UNID_MED", "ART_LINEA",
   "ART_MARCA", "ART_RUBRO", "ART_GRUPO", "ART_EST", "ART_TIPO",
   "ART_IMPU", "ART_IND_IMP", "ART_IND_VENTA")
VALUES
  (358037, 'PANTALLA ESPAÑA VISTA CENTRO', 'PANT ESPAÑA VC', 'MES', 12,
   12, 1, 16, 'A', 2, 2, 'N', 'S');

-- ─── RENAMES (consolidación: art BASIC pasa a ser el "pantalla" genérico) ──

UPDATE "ERP".stk_articulo SET "ART_DESC" = 'PANTALLA DEL SOL',             "ART_DESC_ABREV" = 'PANT DEL SOL'             WHERE "ART_CODIGO" = 3056;
UPDATE "ERP".stk_articulo SET "ART_DESC" = 'PANTALLA SANTA TERESA',        "ART_DESC_ABREV" = 'PANT SANTA TERESA'        WHERE "ART_CODIGO" = 5000;
UPDATE "ERP".stk_articulo SET "ART_DESC" = 'PANTALLA MARISCAL LÓPEZ',      "ART_DESC_ABREV" = 'PANT MARISCAL LÓPEZ'      WHERE "ART_CODIGO" = 3022;
UPDATE "ERP".stk_articulo SET "ART_DESC" = 'PANTALLA SACRAMENTO',          "ART_DESC_ABREV" = 'PANT SACRAMENTO'          WHERE "ART_CODIGO" = 3066;
UPDATE "ERP".stk_articulo SET "ART_DESC" = 'PANTALLA AVIADORES',           "ART_DESC_ABREV" = 'PANT AVIADORES'           WHERE "ART_CODIGO" = 2471;
UPDATE "ERP".stk_articulo SET "ART_DESC" = 'PANTALLA AEROPUERTO',          "ART_DESC_ABREV" = 'PANT AEROPUERTO'          WHERE "ART_CODIGO" = 2463;
UPDATE "ERP".stk_articulo SET "ART_DESC" = 'PANTALLA GNB',                 "ART_DESC_ABREV" = 'PANT GNB'                 WHERE "ART_CODIGO" = 2467;
UPDATE "ERP".stk_articulo SET "ART_DESC" = 'PANTALLA HORTENSIAS VISTA CENTRO', "ART_DESC_ABREV" = 'PANT HORTENSIAS VC'   WHERE "ART_CODIGO" = 9;
UPDATE "ERP".stk_articulo SET "ART_DESC" = 'PANTALLA HORTENSIAS VISTA LUQUE',  "ART_DESC_ABREV" = 'PANT HORTENSIAS VL'   WHERE "ART_CODIGO" = 6188;
UPDATE "ERP".stk_articulo SET "ART_DESC" = 'PANTALLA ESPAÑA VISTA CENTENARIO', "ART_DESC_ABREV" = 'PANT ESPAÑA CENT'     WHERE "ART_CODIGO" = 358012;
UPDATE "ERP".stk_articulo SET "ART_DESC" = 'PANTALLA PINEDO',              "ART_DESC_ABREV" = 'PANT PINEDO'              WHERE "ART_CODIGO" = 8;
UPDATE "ERP".stk_articulo SET "ART_DESC" = 'PANTALLA MOLAS LÓPEZ',         "ART_DESC_ABREV" = 'PANT MOLAS LÓPEZ'         WHERE "ART_CODIGO" = 2818;
UPDATE "ERP".stk_articulo SET "ART_DESC" = 'PANTALLA MARIANO',             "ART_DESC_ABREV" = 'PANT MARIANO'             WHERE "ART_CODIGO" = 3115;
UPDATE "ERP".stk_articulo SET "ART_DESC" = 'PANTALLA CACIQUE',             "ART_DESC_ABREV" = 'PANT CACIQUE'             WHERE "ART_CODIGO" = 3021;
UPDATE "ERP".stk_articulo SET "ART_DESC" = 'PANTALLA SAN BERNARDINO',      "ART_DESC_ABREV" = 'PANT SAN BERNARDINO'      WHERE "ART_CODIGO" = 2837;
UPDATE "ERP".stk_articulo SET "ART_DESC" = 'PANTALLA CORONEL OVIEDO',      "ART_DESC_ABREV" = 'PANT CORONEL OVIEDO'      WHERE "ART_CODIGO" = 2828;

-- ─── CARGA DE PRECIOS (lista 1 = "Precio USD Basic") ──────────────────────
-- Formato: (EMPR, NRO_LISTA_PRECIO, ART, PLAN, PRECIO_UNITARIO, INSERCIONES_MES)

INSERT INTO "ERP".fac_lista_precio_pantalla_det
  ("LPPD_EMPR", "LPPD_NRO_LISTA_PRECIO", "LPPD_ART", "LPPD_PLAN",
   "LPPD_PRECIO_UNITARIO", "LPPD_INSERCIONES_MES")
VALUES
  -- Icónicas Trofeo
  (1, 1,   3056, 'BASIC',    5700,  280),
  (1, 1,   3056, 'GURU',     9520,  520),
  (1, 1,   3056, 'PREMIUM', 14980, 1040),   -- Del Sol
  (1, 1,   5000, 'BASIC',    5700,  280),
  (1, 1,   5000, 'GURU',     9520,  520),
  (1, 1,   5000, 'PREMIUM', 14980, 1040),   -- Santa Teresa
  (1, 1,   3022, 'BASIC',    2850,  280),
  (1, 1,   3022, 'GURU',     4850,  520),
  (1, 1,   3022, 'PREMIUM',  9000, 1040),   -- Mariscal López
  (1, 1,   3066, 'BASIC',    2200,  280),
  (1, 1,   3066, 'GURU',     3990,  520),
  (1, 1,   3066, 'PREMIUM',  7000, 1040),   -- Sacramento
  -- Otras icónicas
  (1, 1,   2471, 'BASIC',    2200,  280),
  (1, 1,   2471, 'GURU',     3990,  520),
  (1, 1,   2471, 'PREMIUM',  7000, 1040),   -- Aviadores
  (1, 1,   2463, 'BASIC',    1150,  280),
  (1, 1,   2463, 'GURU',     2050,  520),
  (1, 1,   2463, 'PREMIUM',  3500, 1040),   -- Aeropuerto
  (1, 1,   2467, 'BASIC',    1100,  280),
  (1, 1,   2467, 'GURU',     2000,  520),
  (1, 1,   2467, 'PREMIUM',  3000, 1040),   -- GNB
  (1, 1,      9, 'BASIC',     570,  280),
  (1, 1,      9, 'GURU',     1025,  520),
  (1, 1,      9, 'PREMIUM',  1875, 1040),   -- Hortensias VC
  (1, 1,   6188, 'BASIC',     570,  280),
  (1, 1,   6188, 'GURU',     1025,  520),
  (1, 1,   6188, 'PREMIUM',  1875, 1040),   -- Hortensias VL
  (1, 1, 358036, 'BASIC',     570,  280),
  (1, 1, 358036, 'GURU',     1025,  520),
  (1, 1, 358036, 'PREMIUM',  1875, 1040),   -- Julio Correa (nueva)
  (1, 1, 358037, 'BASIC',     570,  280),
  (1, 1, 358037, 'GURU',     1025,  520),
  (1, 1, 358037, 'PREMIUM',  1875, 1040),   -- España Vista Centro (nueva)
  (1, 1, 358012, 'BASIC',     570,  280),
  (1, 1, 358012, 'GURU',     1025,  520),
  (1, 1, 358012, 'PREMIUM',  1875, 1040),   -- España Vista Centenario
  (1, 1,      8, 'BASIC',     570,  280),
  (1, 1,      8, 'GURU',     1025,  520),
  (1, 1,      8, 'PREMIUM',  1875, 1040),   -- Pinedo
  (1, 1,   2818, 'BASIC',     570,  280),
  (1, 1,   2818, 'GURU',     1025,  520),
  (1, 1,   2818, 'PREMIUM',  1875, 1040),   -- Molas López
  (1, 1,   3115, 'BASIC',     455,  280),
  (1, 1,   3115, 'GURU',      820,  520),
  (1, 1,   3115, 'PREMIUM',  1500, 1040),   -- Mariano
  (1, 1,   3021, 'BASIC',     455,  280),
  (1, 1,   3021, 'GURU',      820,  520),
  (1, 1,   3021, 'PREMIUM',  1500, 1040),   -- Cacique
  (1, 1,   2837, 'BASIC',     455,  280),
  (1, 1,   2837, 'GURU',      820,  520),
  (1, 1,   2837, 'PREMIUM',  1500, 1040),   -- San Bernardino
  (1, 1,   2828, 'BASIC',     250,  280),
  (1, 1,   2828, 'GURU',      500,  520),
  (1, 1,   2828, 'PREMIUM',   950, 1040)    -- Coronel Oviedo
ON CONFLICT DO NOTHING;

-- ─── LIMPIEZA de precios antiguos en fac_lista_precio_det ─────────────────
-- (los consolidados + los que se desactivan). Los pedidos/facturas históricas
-- están en otras tablas y NO se tocan.

DELETE FROM "ERP".fac_lista_precio_det
WHERE "LIPR_ART" IN (
  -- consolidados (ya no tienen precio acá; viven en fac_lista_precio_pantalla_det)
  3056, 5000, 3022, 3066, 2471, 2463, 2467, 9, 6188, 358012,
  8, 2818, 3115, 3021, 2837, 2828,
  -- GURU/PREMIUM antiguos (se desactivan)
  2300, 2844,        -- Del Sol GURU/PREMIUM
  6008, 6007,        -- Santa Teresa GUR/PRE
  6068, 2994,        -- Chaco Boreal GURU/PREMIUM
  2399, 2890,        -- Sacramento GURU/PREMIUM
  2631, 2632,        -- FIC Aviadores GURU/PREMIUM
  2855, 2465,        -- Aeropuerto GURU (2855) y PREMIUM (2465)
  2468, 2469,        -- GNB GURU/PREMIUM
  3750, 6,           -- Hortensias VC GU/PR
  3749, 5,           -- Hortensias VL GU/PR
  358013, 358014,    -- España Vta Centenario GURU/PREMIUM
  6066, 6065,        -- Pinedo GURU/PREMIUM
  3058, 332,         -- Molas López GURU/PREMIUM
  6062, 7,           -- Mariano GURU/PREMIUM
  2995, 4,           -- Cacique GURU/PREMIUM
  3060, 2211,        -- San Bernardino GURU/PREMIUM
  3059, 10           -- Coronel Oviedo GURU/PREMIUM
);

-- ─── SOFT-DELETE de artículos GURU/PREMIUM antiguos ────────────────────────

UPDATE "ERP".stk_articulo
SET "ART_EST" = 'I'
WHERE "ART_CODIGO" IN (
  2300, 2844,        -- Del Sol
  6008, 6007,        -- Santa Teresa
  6068, 2994,        -- Chaco Boreal (ahora Mariscal López)
  2399, 2890,        -- Sacramento
  2631, 2632,        -- FIC Aviadores (ahora Aviadores)
  2855, 2465,        -- Aeropuerto GURU y PREMIUM
  2468, 2469,        -- GNB
  3750, 6,           -- Hortensias VC
  3749, 5,           -- Hortensias VL
  358013, 358014,    -- España y Venezuela (ahora Vta Centenario)
  6066, 6065,        -- Pinedo
  3058, 332,         -- Molas López
  6062, 7,           -- Mariano
  2995, 4,           -- Cacique
  3060, 2211,        -- San Bernardino
  3059, 10           -- Coronel Oviedo
);

COMMIT;

-- ─── VERIFICACIÓN (ejecutar post-migración) ──────────────────────────────
-- Debe devolver 19 filas (las 19 pantallas consolidadas):
--
--   SELECT a."ART_CODIGO", a."ART_DESC",
--     (SELECT COUNT(*) FROM "ERP".fac_lista_precio_pantalla_det p
--      WHERE p."LPPD_ART" = a."ART_CODIGO" AND p."LPPD_EMPR" = 1
--        AND p."LPPD_NRO_LISTA_PRECIO" = 1) AS precios_cargados
--   FROM "ERP".stk_articulo a
--   WHERE a."ART_LINEA" = 12 AND a."ART_EST" = 'A'
--     AND a."ART_DESC" NOT LIKE '%EXCLUSIVIDAD%'
--     AND a."ART_DESC" NOT LIKE 'PANT %'
--     AND a."ART_DESC" NOT LIKE '%BASIC%'
--     AND a."ART_DESC" NOT LIKE '%GURU%'
--     AND a."ART_DESC" NOT LIKE '%PREMIUM%'
--     AND a."ART_DESC" NOT LIKE '%PREMIUN%'
--     AND a."ART_DESC" NOT LIKE '%BASICO%'
--   ORDER BY a."ART_DESC";
