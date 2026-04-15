-- PLANTILLA para cargar precios por plan (BASIC/GURU/PREMIUM) en
-- fac_lista_precio_pantalla_det, a partir del tarifario oficial 2026
-- (ver DOOH_JWF_PANTALLAS_ICÓNICAS_2026.pdf en el repo CMS).
--
-- NO EJECUTAR AUTOMÁTICAMENTE. Este archivo documenta el procedimiento
-- a seguir manualmente cuando se decida el modelo de consolidación:
--
-- 1) Elegir UN ART_CODIGO por pantalla como "pantalla consolidada":
--    - Opción A: crear un artículo nuevo "PANTALLA <NOMBRE>" limpio
--      (INSERT en stk_articulo con ART_LINEA = 12).
--    - Opción B: reutilizar uno de los 3 existentes (ej. el PREMIUM)
--      renombrándolo a "PANTALLA <NOMBRE>" vía UPDATE en stk_articulo.
--
-- 2) Dar de baja lógica los otros 2 artículos por pantalla:
--    UPDATE "ERP".stk_articulo SET "ART_EST" = 'I'
--      WHERE "ART_CODIGO" IN (<viejos>);
--    NO borrarlos — los pedidos/facturas históricas los referencian.
--
-- 3) Cargar los 3 precios en fac_lista_precio_pantalla_det con el
--    ART_CODIGO consolidado elegido en el paso 1.

-- =============================================================
-- Tarifario 2026 (lista_precio = 1, "Precio USD Basic")
-- =============================================================
-- Formato de cada INSERT: se asume <art_codigo> ya resuelto manualmente.
-- Reemplazar <art_codigo> por el ART_CODIGO consolidado de cada pantalla.
--
-- Estructura:
--   INSERT INTO "ERP".fac_lista_precio_pantalla_det
--     ("LPPD_EMPR", "LPPD_NRO_LISTA_PRECIO", "LPPD_ART", "LPPD_PLAN",
--      "LPPD_PRECIO_UNITARIO", "LPPD_INSERCIONES_MES")
--   VALUES (1, 1, <art_codigo>, '<PLAN>', <precio>, <inserciones>);

-- Pantalla DelSol (Trofeo) — 23x20m, 460m², 95.000 vehículos/día
-- INSERT ... (1, 1, <art>, 'BASIC',    5700, 280);
-- INSERT ... (1, 1, <art>, 'GURU',     9520, 520);
-- INSERT ... (1, 1, <art>, 'PREMIUM', 14980, 1040);

-- Pantalla Santa Teresa (Trofeo) — 20x28,5m, 570m², 95.000 vehículos/día
-- INSERT ... (1, 1, <art>, 'BASIC',    5700, 280);
-- INSERT ... (1, 1, <art>, 'GURU',     9520, 520);
-- INSERT ... (1, 1, <art>, 'PREMIUM', 14980, 1040);

-- Pantalla Mariscal López (Trofeo) — 16x14m, 224m², 40.000 vehículos/día
-- INSERT ... (1, 1, <art>, 'BASIC',    2850, 280);
-- INSERT ... (1, 1, <art>, 'GURU',     4850, 520);
-- INSERT ... (1, 1, <art>, 'PREMIUM',  9000, 1040);

-- Pantalla Sacramento (Trofeo) — 28x5m, 140m², 50.000 vehículos/día
-- INSERT ... (1, 1, <art>, 'BASIC',    2200, 280);
-- INSERT ... (1, 1, <art>, 'GURU',     3990, 520);
-- INSERT ... (1, 1, <art>, 'PREMIUM',  7000, 1040);

-- Pantalla Aviadores — 17x5m, 85m², 95.000 vehículos/día
-- INSERT ... (1, 1, <art>, 'BASIC',    2200, 280);
-- INSERT ... (1, 1, <art>, 'GURU',     3990, 520);
-- INSERT ... (1, 1, <art>, 'PREMIUM',  7000, 1040);

-- Pantalla Aeropuerto — 9,5x11m, 104,5m², 40.000 vehículos/día
-- INSERT ... (1, 1, <art>, 'BASIC',    1150, 280);
-- INSERT ... (1, 1, <art>, 'GURU',     2050, 520);
-- INSERT ... (1, 1, <art>, 'PREMIUM',  3500, 1040);

-- Pantalla GNB — 15x8m, 120m², 40.000 vehículos/día
-- INSERT ... (1, 1, <art>, 'BASIC',    1100, 280);
-- INSERT ... (1, 1, <art>, 'GURU',     2000, 520);
-- INSERT ... (1, 1, <art>, 'PREMIUM',  3000, 1040);

-- Pantalla Hortensias Vista Centro — 8x4m, 32m², 95.000 vehículos/día
-- INSERT ... (1, 1, <art>, 'BASIC',     570, 280);
-- INSERT ... (1, 1, <art>, 'GURU',     1025, 520);
-- INSERT ... (1, 1, <art>, 'PREMIUM',  1875, 1040);

-- Pantalla Hortensias Vista Luque — 8x4m, 32m², 95.000 vehículos/día
-- INSERT ... (1, 1, <art>, 'BASIC',     570, 280);
-- INSERT ... (1, 1, <art>, 'GURU',     1025, 520);
-- INSERT ... (1, 1, <art>, 'PREMIUM',  1875, 1040);

-- Pantalla España Vista Centro — 5x7m, 35m², 50.000 vehículos/día
-- INSERT ... (1, 1, <art>, 'BASIC',     570, 280);
-- INSERT ... (1, 1, <art>, 'GURU',     1025, 520);
-- INSERT ... (1, 1, <art>, 'PREMIUM',  1875, 1040);

-- Pantalla España Vista Centenario — 5x7m, 35m², 50.000 vehículos/día
-- INSERT ... (1, 1, <art>, 'BASIC',     570, 280);
-- INSERT ... (1, 1, <art>, 'GURU',     1025, 520);
-- INSERT ... (1, 1, <art>, 'PREMIUM',  1875, 1040);

-- Pantalla Senador Long — 6x7m, 42m², 50.000 vehículos/día
-- INSERT ... (1, 1, <art>, 'BASIC',     570, 280);
-- INSERT ... (1, 1, <art>, 'GURU',     1025, 520);
-- INSERT ... (1, 1, <art>, 'PREMIUM',  1875, 1040);

-- Pantalla Pinedo — 9,5x11m, 104,5m², 50.000 vehículos/día
-- INSERT ... (1, 1, <art>, 'BASIC',     570, 280);
-- INSERT ... (1, 1, <art>, 'GURU',     1025, 520);
-- INSERT ... (1, 1, <art>, 'PREMIUM',  1875, 1040);

-- Pantalla Molas López — 9,5x11m, 104,5m², 40.000 vehículos/día
-- INSERT ... (1, 1, <art>, 'BASIC',     570, 280);
-- INSERT ... (1, 1, <art>, 'GURU',     1025, 520);
-- INSERT ... (1, 1, <art>, 'PREMIUM',  1875, 1040);

-- Pantalla Julio Correa — 7x8m, 56m², 40.000 vehículos/día
-- INSERT ... (1, 1, <art>, 'BASIC',     570, 280);
-- INSERT ... (1, 1, <art>, 'GURU',     1025, 520);
-- INSERT ... (1, 1, <art>, 'PREMIUM',  1875, 1040);

-- Pantalla Mariano — 10x5m, 50m², 65.000 vehículos/día
-- INSERT ... (1, 1, <art>, 'BASIC',     455, 280);
-- INSERT ... (1, 1, <art>, 'GURU',      820, 520);
-- INSERT ... (1, 1, <art>, 'PREMIUM',  1500, 1040);

-- Pantalla Cacique — 5x7m, 35m², 55.000 vehículos/día
-- INSERT ... (1, 1, <art>, 'BASIC',     455, 280);
-- INSERT ... (1, 1, <art>, 'GURU',      820, 520);
-- INSERT ... (1, 1, <art>, 'PREMIUM',  1500, 1040);

-- Pantalla San Bernardino — 10x4m, 40m², 40.000 vehículos/día
-- NOTA: precios de temporada baja. Crear una lista_precio distinta
-- para temporada alta si aplica.
-- INSERT ... (1, 1, <art>, 'BASIC',     455, 280);
-- INSERT ... (1, 1, <art>, 'GURU',      820, 520);
-- INSERT ... (1, 1, <art>, 'PREMIUM',  1500, 1040);

-- Pantalla Coronel Oviedo — 8x10m, 80m², 40.000 vehículos/día
-- INSERT ... (1, 1, <art>, 'BASIC',     250, 280);
-- INSERT ... (1, 1, <art>, 'GURU',      500, 520);
-- INSERT ... (1, 1, <art>, 'PREMIUM',   950, 1040);
