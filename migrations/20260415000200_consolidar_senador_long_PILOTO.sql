-- PILOTO de consolidación: PANTALLA SENADOR LONG
--
-- Antes:
--   4609 PANTALLA SENADOR LONG BASIC   (A)  $570  en fac_lista_precio_det lista 1
--   6063 PANTALLA SENADOR LONG GURU    (A)  $1025 en fac_lista_precio_det lista 1
--   6064 PANTALLA SENADOR LONG PREMIUM (A)  $1875 en fac_lista_precio_det lista 1
--
-- Después:
--   4609 PANTALLA SENADOR LONG  (A)  3 precios en fac_lista_precio_pantalla_det lista 1
--   6063 (I) — soft-deleted, historia intacta en pedidos/facturas
--   6064 (I) — idem
--
-- Pedidos/facturas históricas NO se tocan: siguen referenciando los ART_CODIGO
-- 4609/6063/6064 como estaban. Solo cambia su disponibilidad futura y el
-- mecanismo para consultar precios nuevos.

BEGIN;

-- 1) Renombrar el artículo base (4609) como consolidado
UPDATE "ERP".stk_articulo
SET "ART_DESC"       = 'PANTALLA SENADOR LONG',
    "ART_DESC_ABREV" = 'PANT SENADOR LONG'
WHERE "ART_CODIGO" = 4609;

-- 2) Cargar los 3 precios en la nueva tabla (idempotente: ON CONFLICT DO NOTHING)
INSERT INTO "ERP".fac_lista_precio_pantalla_det
  ("LPPD_EMPR", "LPPD_NRO_LISTA_PRECIO", "LPPD_ART", "LPPD_PLAN",
   "LPPD_PRECIO_UNITARIO", "LPPD_INSERCIONES_MES")
VALUES
  (1, 1, 4609, 'BASIC',    570, 280),
  (1, 1, 4609, 'GURU',    1025, 520),
  (1, 1, 4609, 'PREMIUM', 1875, 1040)
ON CONFLICT DO NOTHING;

-- 3) Eliminar los precios de la tabla vieja para estos 3 artículos
--    (los pedidos/facturas históricos NO se tocan; están en otras tablas)
DELETE FROM "ERP".fac_lista_precio_det
WHERE "LIPR_ART" IN (4609, 6063, 6064);

-- 4) Soft-delete de los artículos GURU y PREMIUM viejos
UPDATE "ERP".stk_articulo
SET "ART_EST" = 'I'
WHERE "ART_CODIGO" IN (6063, 6064);

COMMIT;

-- Verificación post-migración:
--   SELECT "ART_CODIGO", "ART_DESC", "ART_EST" FROM "ERP".stk_articulo
--   WHERE "ART_CODIGO" IN (4609, 6063, 6064);
--
--   SELECT * FROM "ERP".fac_lista_precio_pantalla_det
--   WHERE "LPPD_ART" = 4609;
--
--   SELECT * FROM "ERP".fac_lista_precio_det
--   WHERE "LIPR_ART" IN (4609, 6063, 6064);  -- debe estar vacío
