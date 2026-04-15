-- Tabla paralela a fac_lista_precio_det, específica para pantallas DOOH.
--
-- Contexto: cada pantalla DOOH (ART_LINEA = 12) se vende con 3 planes
-- comerciales (BASIC / GURU / PREMIUM) que varían en cantidad de inserciones
-- mensuales y precio, pero comparten la misma pantalla física.
--
-- En lugar de crear 3 artículos separados por pantalla (lo que se hacía antes),
-- ahora existe UN artículo pantalla consolidado y esta tabla guarda sus
-- 3 precios por lista de precio.
--
-- El resto del ERP (pedidos, facturas, otros artículos) sigue usando
-- fac_lista_precio_det sin cambios. Esta tabla la consume solo el flujo
-- de cotización de campañas DOOH (CMS) y la UI de edición de listas para
-- artículos con ART_LINEA = 12.

-- Pre-requisito: fac_lista_precio no tenía constraint UNIQUE sobre
-- (LIPE_EMPR, LIPE_NRO_LISTA_PRECIO), necesaria para poder crear la FK
-- desde la nueva tabla. La agregamos acá si no existe. Verificado: no hay
-- filas duplicadas en la tabla al momento de esta migración.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = '"ERP".fac_lista_precio'::regclass
      AND conname = 'fac_lista_precio_empr_nro_uniq'
  ) THEN
    ALTER TABLE "ERP".fac_lista_precio
      ADD CONSTRAINT fac_lista_precio_empr_nro_uniq
      UNIQUE ("LIPE_EMPR", "LIPE_NRO_LISTA_PRECIO");
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "ERP".fac_lista_precio_pantalla_det (
  "LPPD_EMPR"             INTEGER       NOT NULL,
  "LPPD_NRO_LISTA_PRECIO" INTEGER       NOT NULL,
  "LPPD_ART"              INTEGER       NOT NULL,
  "LPPD_PLAN"             VARCHAR(10)   NOT NULL,
  "LPPD_PRECIO_UNITARIO"  NUMERIC(15,4) NOT NULL,
  "LPPD_INSERCIONES_MES"  INTEGER       NOT NULL,

  CONSTRAINT fac_lista_precio_pantalla_det_pkey
    PRIMARY KEY ("LPPD_EMPR", "LPPD_NRO_LISTA_PRECIO", "LPPD_ART", "LPPD_PLAN"),

  CONSTRAINT fac_lista_precio_pantalla_det_plan_check
    CHECK ("LPPD_PLAN" IN ('BASIC', 'GURU', 'PREMIUM')),

  CONSTRAINT fac_lista_precio_pantalla_det_precio_positivo
    CHECK ("LPPD_PRECIO_UNITARIO" >= 0),

  CONSTRAINT fac_lista_precio_pantalla_det_inserciones_positivo
    CHECK ("LPPD_INSERCIONES_MES" > 0),

  CONSTRAINT fac_lista_precio_pantalla_det_lista_fkey
    FOREIGN KEY ("LPPD_EMPR", "LPPD_NRO_LISTA_PRECIO")
    REFERENCES "ERP".fac_lista_precio ("LIPE_EMPR", "LIPE_NRO_LISTA_PRECIO")
    ON UPDATE CASCADE ON DELETE RESTRICT,

  CONSTRAINT fac_lista_precio_pantalla_det_art_fkey
    FOREIGN KEY ("LPPD_ART") REFERENCES "ERP".stk_articulo ("ART_CODIGO")
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS fac_lista_precio_pantalla_det_art_idx
  ON "ERP".fac_lista_precio_pantalla_det ("LPPD_ART");

COMMENT ON TABLE "ERP".fac_lista_precio_pantalla_det IS
  'Precios por plan (BASIC/GURU/PREMIUM) de artículos pantalla DOOH (ART_LINEA=12). '
  'Complementa fac_lista_precio_det; no la reemplaza.';

COMMENT ON COLUMN "ERP".fac_lista_precio_pantalla_det."LPPD_PLAN" IS
  'Plan comercial: BASIC (280 ins/mes), GURU (520 ins/mes), PREMIUM (1040 ins/mes).';

COMMENT ON COLUMN "ERP".fac_lista_precio_pantalla_det."LPPD_INSERCIONES_MES" IS
  'Cantidad de inserciones mensuales incluidas en el plan. '
  'Snapshot al momento de cargar el precio; si el estándar cambia, actualizar.';
