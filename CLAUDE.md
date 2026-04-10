# CLAUDE.md — JWF

Instrucciones y conocimiento del proyecto para Claude Code. Se carga automáticamente en cada conversación.

---

## Stack

- **Backend:** Node.js + Express, Puerto 3001
- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS, Puerto 3000
- **Base de datos:** PostgreSQL 18, base `JWFSA`

## Levantar el proyecto

```bash
# Backend
cd backend && npm run dev   # → http://localhost:3001

# Frontend
cd frontend && npm run dev  # → http://localhost:3000
```

## Conexión PostgreSQL

```bash
PGPASSWORD=12345 "/c/Program Files/PostgreSQL/18/bin/psql.exe" -U postgres -h localhost -p 5432 -d JWFSA -c "..."
```

- Host: localhost | Puerto: 5432 | Usuario: postgres | Password: 12345 | DB: JWFSA

---

## Arquitectura Backend

### Patrón: Controller → Service → DB (pg.Pool)

```
backend/src/
├── app.js / server.js
├── config/
│   ├── db.js          # pg.Pool
│   └── dbConfig.js    # Soporta DATABASE_URL o vars individuales
├── middlewares/
│   ├── auth.js        # verifyToken — JWT Bearer
│   └── errorHandler.js # Mapea PG error codes a HTTP
└── modules/
    ├── gen/           # General
    ├── fac/           # Facturación
    ├── fin/           # Finanzas
    ├── stk/           # Stock
    ├── per/           # Personal
    ├── com/           # Compras
    └── cnt/           # Contabilidad
        ├── routes/index.js
        ├── controllers/
        └── services/
```

### Auth JWT
- Middleware `verifyToken` en `middlewares/auth.js`
- Token en header: `Authorization: Bearer <token>`
- Secret en `.env`: `JWT_SECRET`, expira en `JWT_EXPIRES_IN=8h`
- En 401 sin token, 403 si inválido/expirado

### Error Handler
- `23505` (unique violation) → 409 "Registro duplicado"
- `23503` (foreign key violation) → 409 "Violación de clave foránea"

### Variables de entorno Backend (`.env`)
```
PORT=3001
DB_HOST=localhost | DB_PORT=5432 | DB_USER=postgres | DB_PASSWORD=12345 | DB_NAME=JWFSA
JWT_SECRET=... | JWT_EXPIRES_IN=8h
```

---

## Arquitectura Frontend

### Estructura

```
frontend/src/
├── app/
│   ├── (auth)/login/
│   └── (dashboard)/
│       ├── layout.tsx       # Sidebar + Header
│       ├── dashboard/
│       ├── gen/             # Pantallas módulo GEN
│       ├── fac/             # Facturación
│       ├── fin/             # Finanzas
│       ├── stk/             # Stock
│       ├── per/             # Personal
│       ├── com/             # Compras
│       └── cnt/             # Contabilidad
├── components/
│   ├── layout/              # Header, Sidebar, Providers
│   ├── ui/                  # DataTable, SearchField, TablePagination, PrimaryAddButton
│   └── {mod}/               # Componentes específicos por módulo (formularios, etc.)
├── services/{mod}.ts        # Llamadas axios a la API por módulo
├── types/{mod}.ts           # Interfaces TypeScript por módulo
└── lib/
    ├── api.ts               # Axios instance + interceptores JWT
    └── utils.ts             # cn() para merge de clases Tailwind
```

### API Client (`lib/api.ts`)
- baseURL: `NEXT_PUBLIC_API_URL` (default: `http://localhost:3001/api`)
- JWT desde `localStorage` key: `jwf_token`
- En 401/403: limpia token y redirige a `/login`

### State Management
- React Query (`@tanstack/react-query`) — staleTime: 30s, retry: 1
- Forms: react-hook-form + Zod

### Variables de entorno Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## Módulos

| Código | Nombre       | Estado        |
|--------|--------------|---------------|
| GEN    | General      | ✅ Completo   |
| FAC    | Facturación  | ✅ Completo   |
| FIN    | Finanzas     | ✅ Completo   |
| STK    | Stock        | ✅ Completo   |
| PER    | Personal     | ✅ Completo   |
| COM    | Compras      | ✅ Completo   |
| CNT    | Contabilidad | ✅ Completo   |

### Convención de nombres por módulo
- Tablas DB: `{MOD}_TABLA` (ej. `GEN_OPERADOR`, `FAC_FACTURA`)
- Rutas API: `/api/{mod}/...` (ej. `/api/gen/operadores`)
- Rutas frontend: `/{mod}/...` (ej. `/gen/operadores`) — dentro del layout group `(dashboard)`
- Archivos backend: `modules/{mod}/controllers/`, `modules/{mod}/services/`
- Archivos frontend: `app/(dashboard)/{mod}/`, `components/{mod}/`, `services/{mod}.ts`, `types/{mod}.ts`

### Páginas de listado existentes en el frontend
Cada vez que se cree una nueva página de listado, agregarla aquí. Usar esta lista para saber qué páginas deben recibir cambios globales (como agregar sortField default, paginación, etc.).

| Ruta | Página | sortField default |
|------|--------|-------------------|
| `gen/operadores` | Operadores | `nom` asc |
| `gen/roles` | Roles | `nom` asc |
| `gen/empresas` | Empresas | — (sin sort) |
| `gen/paises` | Países | `desc` asc (client-side) |
| `gen/monedas` | Monedas | `codigo` asc (client-side) |
| `gen/ciudades` | Ciudades | `desc` asc |
| `gen/departamentos` | Departamentos | — (sin sort) |
| `gen/impuestos` | Impuestos | `desc` asc |
| `gen/tipos-impuesto` | Tipos de impuesto | — (sin sort) |
| `gen/sistemas` | Sistemas | — (sin sort) |
| `gen/programas` | Programas | — (sin sort) |
| `gen/profesiones` | Profesiones | `desc` asc |
| `gen/distritos` | Distritos | `desc` asc |
| `gen/motivos-anulacion` | Motivos de anulación | `desc` asc |
| `gen/localidades` | Localidades | `desc` asc |
| `gen/barrios` | Barrios | `desc` asc |
| `stk/lineas` | Líneas | `desc` asc |
| `stk/marcas` | Marcas | `desc` asc |
| `stk/rubros` | Rubros | `desc` asc |
| `stk/grupos` | Grupos | `desc` asc |
| `stk/depositos` | Depósitos | `desc` asc |
| `stk/unidades-medida` | Unidades de medida | `codigo` asc |
| `stk/movimientos` | Movimientos de stock | `fecha` desc |
| `stk/remisiones` | Remisiones | `fecha` desc |
| `stk/stock` | Stock actual | `art` asc |
| `stk/articulos` | Artículos | `desc` asc |
| `stk/clasificaciones` | Clasificaciones | `desc` asc |
| `stk/choferes` | Choferes | `nombre` asc |
| `stk/cotizaciones` | Cotizaciones | `fecha` desc |
| `fac/facturas` | Facturas | `fecha` desc |
| `fac/clientes` | Clientes | `nom` asc |
| `fac/vendedores` | Vendedores | `nom` asc |
| `fac/pedidos` | Pedidos | `fecha` desc |
| `fac/listas-precio` | Listas de precio | `desc` asc |
| `fac/zonas` | Zonas | `desc` asc |
| `fac/categorias` | Categorías | `desc` asc |
| `fac/condiciones` | Condiciones de pago | — (sin sort) |
| `fac/barrios` | Barrios | `desc` asc |
| `fac/campanhas` | Campañas | `nombre` asc |
| `fac/comisiones` | Comisiones | — (desc por clave) |
| `fac/solicitudes-descuento` | Solicitudes de descuento | `fecha` desc |
| `fin/ordenes-pago` | Órdenes de pago | `fecha` desc |
| `fin/proveedores` | Proveedores | `nom` asc |
| `fin/tipos-proveedor` | Tipos de proveedor | `desc` asc |
| `fin/bancos` | Bancos | `desc` asc |
| `fin/ramos` | Ramos | `desc` asc |
| `fin/formas-pago` | Formas de pago | `desc` asc |
| `fin/personeria` | Personerías | `desc` asc |
| `fin/clases-doc` | Clases de documento | `desc` asc |
| `fin/cuentas-bancarias` | Cuentas bancarias | `desc` asc |
| `fin/conceptos` | Conceptos financieros | `codigo` asc |
| `fin/documentos` | Documentos financieros | `fecha` desc |
| `fin/cheques` | Cheques recibidos | `fecha` desc |
| `fin/cheques-emitidos` | Cheques emitidos | `vto` desc |
| `fin/periodos` | Períodos financieros | `codigo` desc |
| `fin/cobradores` | Cobradores | — (sin sort) |
| `per/empleados` | Empleados | `nombre` asc |
| `per/cargos` | Cargos | `desc` asc |
| `per/categorias` | Categorías de personal | `desc` asc |
| `per/areas` | Áreas | `desc` asc |
| `per/secciones` | Secciones | `desc` asc |
| `per/turnos` | Turnos | `desc` asc |
| `per/tipos-contrato` | Tipos de contrato | `desc` asc |
| `per/motivos-ausencia` | Motivos de ausencia | `desc` asc |
| `per/formas-pago` | Formas de pago (PER) | `desc` asc |
| `per/tipos-liquidacion` | Tipos de liquidación | `desc` asc |
| `per/tipos-pago` | Tipos de pago (PER) | `desc` asc |
| `per/tipos-familiar` | Tipos de familiar | `desc` asc |
| `per/idiomas` | Idiomas | `desc` asc |
| `per/carreras` | Carreras | `desc` asc |
| `per/bachilleratos` | Bachilleratos | `desc` asc |
| `per/capacitaciones` | Capacitaciones | `desc` asc |
| `per/niveles-capacitacion` | Niveles de capacitación | `desc` asc |
| `per/estados-estudio` | Estados de estudio | `desc` asc |
| `per/funciones` | Funciones | `desc` asc |
| `per/clasificaciones-descuento` | Clasificaciones de descuento | `desc` asc |
| `per/tipos-salario` | Tipos de salario | `desc` asc |
| `per/motivos-licencia` | Motivos de licencia | `desc` asc |
| `per/inst-educativas` | Instituciones educativas | `desc` asc |
| `per/contratos` | Contratos | `fecha` desc |
| `per/familiares` | Familiares | `nombre` asc |
| `per/conceptos` | Conceptos de liquidación | `desc` asc |
| `per/liquidaciones` | Liquidaciones de sueldo | `fecha` desc |
| `per/horarios` | Horarios de empleados | `empleado` asc |
| `per/empl-conceptos` | Conceptos fijos por empleado | `empleado` asc |
| `per/ausencias` | Ausencias | `fecha` desc |
| `com/ordenes-compra` | Órdenes de compra | `fecha` desc |
| `com/contratos` | Contratos de proveedor | `fecha` desc |
| `cnt/asientos` | Asientos contables | `fecha` desc |
| `cnt/cuentas` | Plan de cuentas | `nro` asc |
| `cnt/ejercicios` | Ejercicios contables | `codigo` desc |
| `cnt/grupos` | Grupos de cuentas | — (sin sort) |
| `cnt/rubros` | Rubros contables | `desc` asc |
| `cnt/centros-costo` | Centros de costo | `desc` asc |

---

## Módulo COM — Tablas DB

| Tabla                   | Descripción                  | PK                           |
|-------------------------|------------------------------|------------------------------|
| `COM_ORDEN_COMPRA`      | Órdenes de compra            | `ORCOM_NRO`                  |
| `COM_ORDEN_COMPRA_DET`  | Detalle de orden de compra   | `ORCOMDET_NRO+ORCOMDET_ITEM` |
| `COM_CONTRATO_PROV`     | Contratos con proveedores    | `CONT_CLAVE`                 |
| `COM_CONTRATO_PROV_DET` | Detalle de contrato          | `COND_CLAVE_CONT+COND_NRO_ITEM` |
| `COM_CONTRATO_PROV_CUO` | Cuotas de contrato           | `CONC_CLAVE_CONT+CONC_NRO_CUO` |
| `COM_CONFIGURACION`     | Configuración del módulo     | `CONF_EMPR`                  |
| `COM_ORDEN_FAC`         | Órdenes de facturación       | `ORCOM_NRO`                  |
| `COM_ORDEN_FAC_DET`     | Detalle orden facturación    | `ORCOMDET_NRO+ORCOMDET_ITEM` |
| `COM_DOCUMENTO_DET`     | Detalle de documentos compra | —                            |
| `COM_DET_FACT_CONTR_ALQ`| Detalle factura contrato alq | —                            |

## Módulo COM — Endpoints API

**Base:** `/api/com`

| Método | Ruta                          | Descripción                    | Auth |
|--------|-------------------------------|--------------------------------|------|
| GET    | `/ordenes-compra`             | Listar órdenes de compra       | Sí   |
| GET    | `/ordenes-compra/:id`         | Detalle + líneas               | Sí   |
| POST   | `/ordenes-compra`             | Crear orden con detalle        | Sí   |
| PUT    | `/ordenes-compra/:id`         | Actualizar orden + detalle     | Sí   |
| DELETE | `/ordenes-compra/:id`         | Eliminar orden + detalle       | Sí   |
| GET    | `/contratos`                  | Listar contratos proveedor     | Sí   |
| GET    | `/contratos/:id`              | Detalle + líneas contrato      | Sí   |
| POST   | `/contratos`                  | Crear contrato con detalle     | Sí   |
| PUT    | `/contratos/:id`              | Actualizar contrato + detalle  | Sí   |
| DELETE | `/contratos/:id`              | Eliminar contrato + detalle    | Sí   |

---

## Módulo CNT — Tablas DB

| Tabla             | Descripción              | PK                          |
|-------------------|--------------------------|------------------------------|
| `CNT_CUENTA`      | Plan de cuentas          | `CTAC_CLAVE`                 |
| `CNT_ASIENTO`     | Asientos contables       | `ASI_CLAVE`                  |
| `CNT_ASIENTO_DET` | Detalle de asientos      | `ASID_CLAVE_ASI+ASID_ITEM`   |
| `CNT_EJERCICIO`   | Ejercicios contables     | `EJ_EMPR+EJ_CODIGO`          |
| `CNT_GRUPO`       | Grupos de cuentas        | `GRUP_CODIGO`                |
| `CNT_RUBRO`       | Rubros contables         | `RUB_CODIGO`                 |
| `CNT_CCOSTO`      | Centros de costo         | `CCO_CODIGO`                 |

## Módulo CNT — Endpoints API

**Base:** `/api/cnt`

| Método | Ruta                          | Descripción                    | Auth |
|--------|-------------------------------|--------------------------------|------|
| GET    | `/maestros/grupos`            | Listar grupos                  | Sí   |
| POST   | `/maestros/grupos`            | Crear grupo                    | Sí   |
| PUT    | `/maestros/grupos/:id`        | Actualizar grupo               | Sí   |
| DELETE | `/maestros/grupos/:id`        | Eliminar grupo                 | Sí   |
| GET    | `/maestros/rubros`            | Listar rubros                  | Sí   |
| POST   | `/maestros/rubros`            | Crear rubro                    | Sí   |
| PUT    | `/maestros/rubros/:id`        | Actualizar rubro               | Sí   |
| DELETE | `/maestros/rubros/:id`        | Eliminar rubro                 | Sí   |
| GET    | `/maestros/centros-costo`     | Listar centros de costo        | Sí   |
| POST   | `/maestros/centros-costo`     | Crear centro de costo          | Sí   |
| PUT    | `/maestros/centros-costo/:id` | Actualizar centro de costo     | Sí   |
| DELETE | `/maestros/centros-costo/:id` | Eliminar centro de costo       | Sí   |
| GET    | `/ejercicios`                 | Listar ejercicios              | Sí   |
| GET    | `/ejercicios/:id`             | Detalle ejercicio              | Sí   |
| POST   | `/ejercicios`                 | Crear ejercicio                | Sí   |
| PUT    | `/ejercicios/:id`             | Actualizar ejercicio           | Sí   |
| DELETE | `/ejercicios/:id`             | Eliminar ejercicio             | Sí   |
| GET    | `/cuentas`                    | Listar plan de cuentas         | Sí   |
| GET    | `/cuentas/:id`                | Detalle cuenta                 | Sí   |
| POST   | `/cuentas`                    | Crear cuenta                   | Sí   |
| PUT    | `/cuentas/:id`                | Actualizar cuenta              | Sí   |
| DELETE | `/cuentas/:id`                | Eliminar cuenta                | Sí   |
| GET    | `/asientos`                   | Listar asientos                | Sí   |
| GET    | `/asientos/:id`               | Detalle + líneas D/H           | Sí   |
| POST   | `/asientos`                   | Crear asiento con detalle      | Sí   |
| PUT    | `/asientos/:id`               | Actualizar asiento + detalle   | Sí   |
| DELETE | `/asientos/:id`               | Eliminar asiento + detalle     | Sí   |

---

## Módulo FIN — Endpoints API

**Base:** `/api/fin`

| Método | Ruta                          | Descripción                    | Auth |
|--------|-------------------------------|--------------------------------|------|
| GET    | `/ordenes-pago`               | Listar órdenes de pago         | Sí   |
| GET    | `/ordenes-pago/:id`           | Detalle orden de pago          | Sí   |
| POST   | `/ordenes-pago`               | Crear orden de pago            | Sí   |
| PUT    | `/ordenes-pago/:id`           | Actualizar orden               | Sí   |
| DELETE | `/ordenes-pago/:id`           | Eliminar orden                 | Sí   |
| GET    | `/proveedores`                | Listar proveedores             | Sí   |
| GET    | `/proveedores/:id`            | Detalle proveedor              | Sí   |
| POST   | `/proveedores`                | Crear proveedor                | Sí   |
| PUT    | `/proveedores/:id`            | Actualizar proveedor           | Sí   |
| DELETE | `/proveedores/:id`            | Eliminar proveedor             | Sí   |
| GET    | `/cuentas-bancarias`          | Listar cuentas bancarias       | Sí   |
| GET    | `/cuentas-bancarias/:id`      | Detalle cuenta bancaria        | Sí   |
| POST   | `/cuentas-bancarias`          | Crear cuenta bancaria          | Sí   |
| PUT    | `/cuentas-bancarias/:id`      | Actualizar cuenta bancaria     | Sí   |
| DELETE | `/cuentas-bancarias/:id`      | Eliminar cuenta bancaria       | Sí   |
| GET    | `/documentos`                 | Listar documentos financieros  | Sí   |
| GET    | `/documentos/:id`             | Detalle + conceptos + cuotas   | Sí   |
| GET    | `/cheques`                    | Listar cheques recibidos       | Sí   |
| GET    | `/cheques/:id`                | Detalle cheque recibido        | Sí   |
| GET    | `/cheques-emitidos`           | Listar cheques emitidos        | Sí   |
| GET    | `/maestros/bancos`            | CRUD bancos                    | Sí   |
| GET    | `/maestros/formas-pago`       | CRUD formas de pago            | Sí   |
| GET    | `/maestros/ramos`             | CRUD ramos                     | Sí   |
| GET    | `/maestros/tipos-proveedor`   | CRUD tipos de proveedor        | Sí   |
| GET    | `/maestros/personerias`       | CRUD personerías               | Sí   |
| GET    | `/maestros/clases-doc`        | CRUD clases de documento       | Sí   |
| GET    | `/maestros/conceptos`         | CRUD conceptos financieros     | Sí   |
| GET    | `/maestros/periodos`          | CRUD períodos financieros      | Sí   |
| GET    | `/maestros/cobradores`        | CRUD cobradores                | Sí   |

## Módulo FAC — Endpoints API

**Base:** `/api/fac`

| Método | Ruta                              | Descripción                    | Auth |
|--------|-----------------------------------|--------------------------------|------|
| GET    | `/facturas`                       | Listar facturas                | Sí   |
| GET    | `/facturas/:id`                   | Detalle + ítems                | Sí   |
| POST   | `/facturas`                       | Crear factura                  | Sí   |
| PUT    | `/facturas/:id`                   | Actualizar factura             | Sí   |
| DELETE | `/facturas/:id`                   | Eliminar factura               | Sí   |
| GET    | `/pedidos`                        | Listar pedidos                 | Sí   |
| GET    | `/pedidos/:id`                    | Detalle + ítems                | Sí   |
| POST   | `/pedidos`                        | Crear pedido                   | Sí   |
| PUT    | `/pedidos/:id`                    | Actualizar pedido              | Sí   |
| DELETE | `/pedidos/:id`                    | Eliminar pedido                | Sí   |
| GET    | `/clientes`                       | Listar clientes                | Sí   |
| GET    | `/clientes/:id`                   | Detalle cliente                | Sí   |
| POST   | `/clientes`                       | Crear cliente                  | Sí   |
| PUT    | `/clientes/:id`                   | Actualizar cliente             | Sí   |
| DELETE | `/clientes/:id`                   | Eliminar cliente               | Sí   |
| GET    | `/campanhas`                      | Listar campañas                | Sí   |
| POST   | `/campanhas`                      | Crear campaña                  | Sí   |
| PUT    | `/campanhas/:cli/:nro`            | Actualizar campaña             | Sí   |
| DELETE | `/campanhas/:cli/:nro`            | Eliminar campaña               | Sí   |
| GET    | `/comisiones`                     | Listar comisiones              | Sí   |
| GET    | `/solicitudes-descuento`          | Listar solicitudes             | Sí   |
| GET    | `/solicitudes-descuento/:id`      | Detalle + ítems                | Sí   |
| GET    | `/precio-articulo?lista=&art=&monPed=` | Precio artículo (lookup) | Sí   |
| GET    | `/maestros/zonas`                 | CRUD zonas                     | Sí   |
| GET    | `/maestros/categorias`            | CRUD categorías                | Sí   |
| GET    | `/maestros/condiciones`           | CRUD condiciones de venta      | Sí   |
| GET    | `/maestros/listas-precio`         | CRUD listas de precio          | Sí   |
| GET    | `/maestros/barrios`               | CRUD barrios                   | Sí   |
| GET    | `/vendedores`                     | CRUD vendedores                | Sí   |

## Módulo STK — Endpoints API

**Base:** `/api/stk`

| Método | Ruta                          | Descripción                    | Auth |
|--------|-------------------------------|--------------------------------|------|
| GET    | `/movimientos`                | Listar movimientos de stock    | Sí   |
| GET    | `/movimientos/:id`            | Detalle + ítems                | Sí   |
| POST   | `/movimientos`                | Crear movimiento               | Sí   |
| PUT    | `/movimientos/:id`            | Actualizar movimiento          | Sí   |
| DELETE | `/movimientos/:id`            | Eliminar movimiento            | Sí   |
| GET    | `/remisiones`                 | Listar remisiones              | Sí   |
| GET    | `/remisiones/:id`             | Detalle + ítems                | Sí   |
| POST   | `/remisiones`                 | Crear remisión                 | Sí   |
| PUT    | `/remisiones/:id`             | Actualizar remisión            | Sí   |
| DELETE | `/remisiones/:id`             | Eliminar remisión              | Sí   |
| GET    | `/stock`                      | Consulta stock actual          | Sí   |
| GET    | `/articulos`                  | Listar artículos               | Sí   |
| GET    | `/articulos/:id`              | Detalle artículo               | Sí   |
| POST   | `/articulos`                  | Crear artículo                 | Sí   |
| PUT    | `/articulos/:id`              | Actualizar artículo            | Sí   |
| DELETE | `/articulos/:id`              | Eliminar artículo              | Sí   |
| GET    | `/maestros/depositos`         | CRUD depósitos                 | Sí   |
| GET    | `/maestros/lineas`            | CRUD líneas                    | Sí   |
| GET    | `/maestros/grupos`            | CRUD grupos                    | Sí   |
| GET    | `/maestros/marcas`            | CRUD marcas                    | Sí   |
| GET    | `/maestros/rubros`            | CRUD rubros                    | Sí   |
| GET    | `/maestros/unidades-medida`   | CRUD unidades de medida        | Sí   |
| GET    | `/maestros/clasificaciones`   | CRUD clasificaciones           | Sí   |
| GET    | `/maestros/choferes`          | CRUD choferes                  | Sí   |
| GET    | `/cotizaciones`               | Listar cotizaciones            | Sí   |
| POST   | `/cotizaciones`               | Crear cotización               | Sí   |
| POST   | `/cotizaciones/sync`          | Sincronizar desde Cambios Chaco | Sí  |
| PUT    | `/cotizaciones/:fec/:mon`     | Actualizar cotización          | Sí   |
| DELETE | `/cotizaciones/:fec/:mon`     | Eliminar cotización            | Sí   |

## Módulo PER — Endpoints API

**Base:** `/api/per`

| Método | Ruta                          | Descripción                    | Auth |
|--------|-------------------------------|--------------------------------|------|
| GET    | `/empleados`                  | Listar empleados               | Sí   |
| GET    | `/empleados/:id`              | Detalle empleado               | Sí   |
| POST   | `/empleados`                  | Crear empleado                 | Sí   |
| PUT    | `/empleados/:id`              | Actualizar empleado            | Sí   |
| DELETE | `/empleados/:id`              | Eliminar empleado              | Sí   |
| GET    | `/contratos`                  | Listar contratos               | Sí   |
| POST   | `/contratos`                  | Crear contrato                 | Sí   |
| PUT    | `/contratos/:id`              | Actualizar contrato            | Sí   |
| DELETE | `/contratos/:id`              | Eliminar contrato              | Sí   |
| GET    | `/familiares`                 | Listar familiares              | Sí   |
| POST   | `/familiares`                 | Crear familiar                 | Sí   |
| PUT    | `/familiares/:emp/:id`        | Actualizar familiar            | Sí   |
| DELETE | `/familiares/:emp/:id`        | Eliminar familiar              | Sí   |
| GET    | `/conceptos`                  | CRUD conceptos de liquidación  | Sí   |
| GET    | `/liquidaciones`              | Listar liquidaciones           | Sí   |
| GET    | `/liquidaciones/:id`          | Detalle + conceptos            | Sí   |
| GET    | `/horarios`                   | Listar horarios empleados      | Sí   |
| GET    | `/empl-conceptos`             | Conceptos fijos por empleado   | Sí   |
| GET    | `/ausencias`                  | Listar ausencias               | Sí   |
| GET    | `/maestros/cargos`            | CRUD cargos                    | Sí   |
| GET    | `/maestros/categorias`        | CRUD categorías                | Sí   |
| GET    | `/maestros/areas`             | CRUD áreas                     | Sí   |
| GET    | `/maestros/secciones`         | CRUD secciones                 | Sí   |
| GET    | `/maestros/turnos`            | CRUD turnos                    | Sí   |
| GET    | `/maestros/tipos-contrato`    | CRUD tipos de contrato         | Sí   |
| GET    | `/maestros/motivos-ausencia`  | CRUD motivos de ausencia       | Sí   |
| GET    | `/maestros/formas-pago`       | CRUD formas de pago            | Sí   |
| GET    | `/maestros/tipos-liquidacion` | CRUD tipos de liquidación      | Sí   |
| GET    | `/maestros/tipos-pago`        | CRUD tipos de pago             | Sí   |
| GET    | `/maestros/tipos-familiar`    | CRUD tipos de familiar         | Sí   |
| GET    | `/maestros/idiomas`           | CRUD idiomas                   | Sí   |
| GET    | `/maestros/carreras`          | CRUD carreras                  | Sí   |
| GET    | `/maestros/bachilleratos`     | CRUD bachilleratos             | Sí   |
| GET    | `/maestros/capacitaciones`    | CRUD capacitaciones            | Sí   |
| GET    | `/maestros/niveles-capacitacion` | CRUD niveles capacitación   | Sí   |
| GET    | `/maestros/estados-estudio`   | CRUD estados de estudio        | Sí   |
| GET    | `/maestros/funciones`         | CRUD funciones                 | Sí   |
| GET    | `/maestros/clasificaciones-descuento` | CRUD clasif. descuento | Sí   |
| GET    | `/maestros/tipos-salario`     | CRUD tipos de salario          | Sí   |
| GET    | `/maestros/motivos-licencia`  | CRUD motivos de licencia       | Sí   |
| GET    | `/maestros/inst-educativas`   | CRUD inst. educativas          | Sí   |

---

## Módulo GEN — Tablas DB

| Tabla               | Descripción              | PK                     |
|---------------------|--------------------------|------------------------|
| `GEN_OPERADOR`      | Usuarios del sistema     | `OPER_CODIGO`          |
| `GEN_OPERADOR_ROL`  | Relación usuario-rol     | `OPRO_OPERADOR+OPRO_ROL` |
| `GEN_ROL`           | Roles                    | `ROL_CODIGO`           |
| `GEN_ROL_PROGRAMA`  | Relación rol-programa    | `ROPR_ROL+ROPR_PROGRAMA` |
| `GEN_EMPRESA`       | Empresas                 | `EMPR_CODIGO`          |
| `GEN_SUCURSAL`      | Sucursales               | `SUC_CODIGO+SUC_EMPR`  |
| `GEN_SISTEMA`       | Sistemas/Módulos         | `SIST_CODIGO`          |
| `GEN_PROGRAMA`      | Programas/Features       | `PROG_CLAVE`           |
| `GEN_MONEDA`        | Monedas                  | `MON_CODIGO`           |
| `GEN_PAIS`          | Países                   | `PAIS_CODIGO`          |
| `GEN_CIUDAD`        | Ciudades                 | `CIUDAD_CODIGO`        |
| `GEN_DEPARTAMENTO`  | Departamentos            | `DPTO_CODIGO`          |
| `GEN_SECCION`       | Secciones                | `SECC_CODIGO+SECC_DPTO`|

---

## Módulo GEN — Endpoints API

**Base:** `/api/gen`

| Método | Ruta                          | Descripción                    | Auth |
|--------|-------------------------------|--------------------------------|------|
| POST   | `/auth/login`                 | Login → JWT                    | No   |
| GET    | `/auth/me`                    | Usuario actual                 | Sí   |
| GET    | `/operadores`                 | Listar operadores              | Sí   |
| GET    | `/operadores/:id`             | Detalle + roles                | Sí   |
| POST   | `/operadores`                 | Crear operador                 | Sí   |
| PUT    | `/operadores/:id`             | Actualizar operador            | Sí   |
| PUT    | `/operadores/:id/roles`       | Asignar roles                  | Sí   |
| GET    | `/roles`                      | Listar roles                   | Sí   |
| GET    | `/roles/:id`                  | Detalle + programas            | Sí   |
| POST   | `/roles`                      | Crear rol                      | Sí   |
| PUT    | `/roles/:id`                  | Actualizar rol                 | Sí   |
| DELETE | `/roles/:id`                  | Eliminar rol (cascade)         | Sí   |
| PUT    | `/roles/:id/programas`        | Asignar programas a rol        | Sí   |
| GET    | `/empresas`                   | Listar empresas                | Sí   |
| GET    | `/empresas/:id`               | Detalle empresa                | Sí   |
| GET    | `/empresas/:id/sucursales`    | Sucursales de empresa          | Sí   |
| GET    | `/maestros/monedas`           | Catálogo monedas               | Sí   |
| GET    | `/maestros/paises`            | Catálogo países                | Sí   |
| GET    | `/maestros/ciudades`          | Catálogo ciudades              | Sí   |
| GET    | `/maestros/departamentos`     | Catálogo departamentos         | Sí   |
| GET    | `/maestros/secciones?dpto=X`  | Secciones (filtra por dpto)    | Sí   |
| GET    | `/maestros/sistemas`          | Sistemas disponibles           | Sí   |
| GET    | `/maestros/programas?sistema=X` | Programas (filtra por sistema) | Sí |
| GET    | `/api/health` (ruta global)   | Health check DB                | No   |

---

## Convenciones de código

### CRUD completo (OBLIGATORIO en todas las entidades)
Toda entidad del sistema debe tener CRUD completo — sin excepciones. Esto incluye entidades "simples" como catálogos, maestros y tablas de referencia.

**Backend:** implementar siempre `getAll`, `getById`, `create`, `update`, `remove` en el service. El controller expone los 5 endpoints: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`.

**Frontend:** implementar siempre:
- Lista con búsqueda + paginación + botón "Nuevo"
- Página o modal de creación
- Página o modal de edición (con datos precargados)
- Acción de eliminación con confirmación

**Formulario vs modal:** usar página separada (`/nuevo`, `/[id]`) cuando el formulario tiene más de 4 campos. Usar modal inline cuando es simple (1-3 campos, como nombre o código+descripción).

**Delete:** siempre pedir confirmación con `confirm()`. Si la entidad tiene dependencias en otras tablas, manejar el error 409 del backend mostrando un mensaje claro al usuario.

### Backend
- Patrón: `Controller → Service → DB` — los controllers solo manejan request/response, la lógica va en services
- Códigos auto-incrementales: se calculan con `SELECT COALESCE(MAX(campo), 0) + 1` **dentro de una transacción**
- Passwords: siempre hasheadas con `bcryptjs`
- Queries directas con `pg` (sin ORM)
- Nombres de tabla en minúsculas (sin comillas), columnas con comillas dobles en mayúsculas

### Transacciones (OBLIGATORIO en operaciones master-detail)
Cuando una operación involucra más de una tabla (header + detalle, o borrado en cascada), usar transacciones con `pool.connect()`:

```js
const client = await pool.connect();
try {
  await client.query('BEGIN');
  // ... operaciones con client.query() ...
  await client.query('COMMIT');
  return result;
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
} finally {
  client.release();
}
```

**Regla:** el MAX+1 para auto-increment SIEMPRE debe ejecutarse dentro de la transacción (vía `client.query()`) para evitar race conditions.

### Validación de inputs en controllers (OBLIGATORIO)
Todos los controllers deben validar inputs del usuario antes de pasar a los services:

```js
// Helper reutilizable — extraer de req.query con bounds seguros
const parseListParams = (query) => ({
  all:       query.all === 'true',
  page:      Math.max(1, parseInt(query.page) || 1),
  limit:     Math.max(1, Math.min(1000, parseInt(query.limit) || 20)),
  search:    query.search    || '',
  sortField: query.sortField || '',
  sortDir:   query.sortDir === 'desc' ? 'desc' : 'asc',   // whitelist estricta
});

// Validar req.params.id como número finito
const id = Number(req.params.id);
if (!Number.isFinite(id)) return res.status(400).json({ message: 'ID inválido' });
```

### Seguridad en ordenamiento (OBLIGATORIO)
Para evitar SQL injection vía `sortField`, siempre usar `Object.hasOwn()` en vez de acceso directo por bracket:

```js
// ✅ Correcto — seguro contra prototype pollution
const orderBy = Object.hasOwn(allowedSort, sortField)
  ? `${allowedSort[sortField]} ${dir}`
  : 'columna_default DESC';

// ❌ Incorrecto — vulnerable a prototype pollution
const orderBy = allowedSort[sortField] ? ...
```

### Paginación y búsqueda (OBLIGATORIO en todos los listados)
Todos los endpoints de lista y sus pantallas deben implementar paginación y búsqueda desde el backend. Nunca filtrar ni paginar en el frontend.

**Backend — parámetros query:** `?page=1&limit=20&search=texto&all=true`

**Backend — respuesta estándar:**
```json
{ "data": [...], "pagination": { "total": 150, "page": 1, "limit": 20, "totalPages": 8 } }
```

**Backend — patrón en service:**
- `getAll({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {})`
- Primeras líneas: `page = Math.max(1, page); limit = Math.max(1, Math.min(1000, limit));`
- Usar `ILIKE $1` con `%search%` para el WHERE de búsqueda
- Siempre hacer `COUNT(*)` primero; si `all=true` omitir LIMIT/OFFSET
- Si no hay search, los parámetros de LIMIT y OFFSET son `$1` y `$2`; si hay search, son `$2` y `$3`
- Con `all=true`: devolver todos los registros sin LIMIT/OFFSET (para selectores/dropdowns)
- Usar `Object.hasOwn(allowedSort, sortField)` para el ORDER BY dinámico

**Backend — patrón en controller:**
```js
// Usar parseListParams (ver sección "Validación de inputs en controllers")
const getAll = async (req, res, next) => {
  try { res.json(await s.getAll(parseListParams(req.query))); } catch (e) { next(e); }
};
```

**Frontend — tipo:** `Paginated<T>` de `@/types/gen`

**Frontend — servicio:** `getItems(params?: ListParams)` usando `ListParams` (incluye `all?: boolean`) de `@/services/gen`

**Frontend — React Query:** key incluye params: `['entidad', { page, search: debouncedSearch }]`

**Frontend — selectores/dropdowns:** usar `{ all: true }` para traer todos los registros sin importar la cantidad. Nunca usar `limit: 100` como tope arbitrario.
```ts
const { data } = useQuery({ queryKey: ['entidad', { all: true }], queryFn: () => getItems({ all: true }) });
const items = data?.data ?? [];
```

**Frontend — debounce:** 400ms con `useEffect` + `setTimeout`; al cambiar search resetear `page` a 1

**Frontend — UI paginación:** usar el componente reutilizable `TablePagination`:
```tsx
import TablePagination from '@/components/ui/TablePagination';

{pagination && (
  <TablePagination
    total={pagination.total}
    page={page}
    limit={limit}
    totalPages={pagination.totalPages}
    onPageChange={setPage}
    onLimitChange={(n) => { setLimit(n); setPage(1); }}
  />
)}
```
- Estado `limit` con default 20; al cambiar resetear `page` a 1

### Ordenamiento en DataTable (OBLIGATORIO)
Todo componente que use `DataTable` debe implementar ordenamiento asc/desc en todas las columnas que tengan sentido ordenar.

**Si el listado usa paginación server-side** (datos paginados desde el backend):
- Backend — service: aceptar `sortField` y `sortDir` en los parámetros; usar `allowedSort` + `Object.hasOwn()` para mapear claves a columnas SQL; aplicar `ORDER BY` dinámico
- Backend — controller: usar `parseListParams(req.query)` que ya incluye whitelist de `sortDir` y bounds de `page`/`limit`
- Frontend — service: incluir `sortField` y `sortDir` en los params de la request
- Frontend — página: estados `sortField` y `sortDir`; `handleSortChange` que actualiza ambos y resetea `page` a 1; pasar `sortField`, `sortDir`, `onSortChange` al `DataTable`; incluir `sortField` y `sortDir` en el `queryKey`

**Si el listado usa filtrado/paginación client-side** (backend devuelve todos los registros de una vez):
- No se modifica el backend
- Frontend — página: estados `sortField` y `sortDir`; función `sort<Entidad>` que ordena el array; aplicar el sort dentro del `useMemo` de filtrado, antes del slice de paginación; pasar `sortField`, `sortDir`, `onSortChange` al `DataTable`

**En ambos casos:** agregar `sortKey` a cada columna ordenable en `COLUMNS`.

### Frontend — Campos readonly/disabled (OBLIGATORIO)
Los campos no editables nunca deben recibir focus ni interacción por teclado:

- **Estilo visual:** `className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600"`
- **Input readonly:** usar `readOnly` (no `disabled`). Ejemplo: `<input readOnly value={...} className="..." />`
- **Select no editable:** usar `disabled`. Ejemplo: `<select disabled value={...} className="...">`
- **`tabIndex={-1}`:** agregar en campos readonly/disabled para que el Tab los salte
- **CSS global** (`globals.css`): ya aplica `pointer-events: none` y anula focus/ring en `input[readonly]`, `select[disabled]`, `textarea[readonly]`
- **Nunca** usar clases de focus (`focus:ring-*`, `focus:outline-*`) en campos readonly/disabled

### Frontend — Campos de monto/importe (OBLIGATORIO)
Los campos que muestran importes monetarios deben formatearse con separador de miles. Usar el componente `MoneyInput` de `@/components/ui/MoneyInput`:

- **Comportamiento:** muestra formateado con separador de miles cuando no tiene focus; al enfocar cambia a `type="number"` para editar normalmente; al salir del campo formatea y aplica el valor
- **Utilidades:** `formatMoney(value, decimals)` y `parseMoney(string)` en `@/lib/utils`
- **Uso:** para campos de cabecera/formulario (límite de crédito, totales, importes). En líneas de detalle dentro de tablas editables, evaluar caso a caso

```tsx
import MoneyInput from '@/components/ui/MoneyInput';

<MoneyInput value={form.importe} onChange={(v) => set({ importe: v })} className={input} />
// Con decimales:
<MoneyInput value={form.total} onChange={(v) => set({ total: v })} decimals={2} className={input} />
```

- **No usar** `type="number"` directo para campos de monto visibles al usuario — el número sin formato es difícil de leer con valores grandes

### Frontend — Registros inactivos en selectores (OBLIGATORIO)
Cuando un selector (dropdown o listado de búsqueda) muestra registros que pueden estar activos o inactivos:

- **Siempre mostrar los inactivos** — no ocultarlos, el usuario debe saber que existen
- **No permitir seleccionarlos** — usar `disabled` en `<option>` o `disabled` en botones de dropdown
- **Diferenciar visualmente** — texto gris claro, etiqueta "(Inactiva)" o badge "Inactivo", o `line-through` según el contexto

**En `<select>` (formularios):**
```tsx
{items.map((item) => (
  <option key={item.id} value={item.id} disabled={item.estado === 'I'}
    className={item.estado === 'I' ? 'text-gray-300' : ''}>
    {item.desc}{item.estado === 'I' ? ' (Inactivo)' : ''}
  </option>
))}
```

**En dropdowns custom (búsqueda con listado):**
```tsx
<button disabled={inactivo}
  className={inactivo ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 'hover:bg-primary-50'}>
  <span className={inactivo ? 'line-through' : ''}>{nombre}</span>
  {inactivo && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-400">Inactivo</span>}
</button>
```

### Frontend — Campos uppercase (OBLIGATORIO)
Cuando un campo debe mostrarse en mayúsculas:

- **Nunca** usar `toUpperCase()` en el `onChange` — mueve el cursor al final y rompe la edición en medio del texto
- **Usar CSS** `uppercase` en el className del input para mostrar visualmente en mayúsculas
- **Convertir a mayúsculas al enviar** (en el `handleSubmit` o antes del `mutate`), no al escribir

```tsx
// ✅ Correcto
<input value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })}
  className="... uppercase" />
// Al guardar:
const data = { ...form, desc: form.desc.toUpperCase() };

// ❌ Incorrecto — mueve el cursor
<input onChange={(e) => setForm({ ...form, desc: e.target.value.toUpperCase() })} />
```

### Frontend — Responsive (OBLIGATORIO)
Todos los componentes deben ser responsive. Reglas:

- **Tablas:** envueltas en `<div className="overflow-x-auto">` + `min-w-[Xpx]` en la tabla. Columnas secundarias: `hidden md:table-cell`
- **Grids de formulario:** nunca `grid-cols-2` fijo → siempre `grid-cols-1 sm:grid-cols-2`; 3 cols: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3`
- **Buscadores:** `w-full sm:w-72` (nunca `w-72` fijo)
- **Padding de contenedores:** `p-4 sm:p-6`
- **Botones header:** texto largo con `hidden sm:inline`, texto corto con `sm:hidden`
- **Botones formulario:** `flex-col-reverse sm:flex-row` con `w-full sm:w-auto`
- **Sidebar:** drawer en mobile, siempre visible en `md+`

### Frontend — Fechas (OBLIGATORIO)
Todas las fechas en el frontend deben usar las utilidades de `@/lib/utils`:

- **En tablas/listas** (mostrar al usuario): usar `formatDate(value)` → produce `dd/mm/aaaa`
- **En `<input type="date">` editables** (formularios): usar `toInputDate(value)` → produce `yyyy-mm-dd`
- **En campos readonly de formularios** (auditoría, información de solo lectura): usar `formatDate(value)` → produce `dd/mm/aaaa`. Nunca usar `toInputDate()` para campos que el usuario no edita
- **Nunca** usar `.toString().substring(0, 10)`, `.split('T')[0]` ni ninguna manipulación manual de strings de fecha directamente en componentes

```ts
import { formatDate, toInputDate } from '@/lib/utils';

// En columna de DataTable:
cell: (r) => formatDate(r.fecha_emision)

// En useState inicial de formulario:
const [form, setForm] = useState({ fecha: toInputDate(initial?.fecha) });
```

### Frontend — TypeScript
- Interfaces en `types/{mod}.ts`
- Servicios en `services/{mod}.ts` usando el cliente axios de `lib/api.ts`
- Merge de clases Tailwind con `cn()` de `lib/utils.ts`

### Frontend — Componentes UI reutilizables
Ubicados en `components/ui/`. Usar siempre estos en vez de reimplementar:

| Componente          | Uso                                                                |
|---------------------|--------------------------------------------------------------------|
| `DataTable`         | Tabla con columnas, sort, acciones editar/eliminar                 |
| `TablePagination`   | Barra de paginación (total, selector limit, botones navegación)    |
| `SearchField`       | Input de búsqueda con icono, `w-full sm:w-72`                     |
| `PrimaryAddButton`  | Botón "Nuevo" con texto largo/corto responsive                    |

### Frontend — Filtros avanzados en listados (OBLIGATORIO)
Cuando un listado necesita filtros más allá del buscador de texto, usar el patrón de filtros avanzados con `useFilters` store. Referencia: `fac/facturas/page.tsx`.

**Store:** usar `useFilters` de `@/stores/useFilterStore`:
```tsx
import { useFilters } from '@/stores/useFilterStore';
import { Filter, X } from 'lucide-react';

const PAGE_ID = 'mi-pagina';
const DEFAULTS = { filtro1: '', filtro2: '', search: '' };

// Dentro del componente:
const [filters, setFilter, clearFilters] = useFilters(PAGE_ID, DEFAULTS);
const sf = (key: keyof typeof DEFAULTS, value: string) => { setFilter(key, value); setPage(1); };
```

**Search con debounce** — usar estado local `searchInput` + `useEffect` que sincroniza al store:
```tsx
const [searchInput, setSearchInput] = useState(filters.search);
useEffect(() => {
  const t = setTimeout(() => sf('search', searchInput), 400);
  return () => clearTimeout(t);
}, [searchInput]);
```

**Contador de filtros activos** — excluir `search` del conteo:
```tsx
const activeFilters = [filters.filtro1, filters.filtro2].filter(Boolean).length;
const [showFilters, setShowFilters] = useState(activeFilters > 0);
```

**Botón toggle en header** — junto a ExportButton y PrimaryAddButton:
```tsx
<button onClick={() => setShowFilters(!showFilters)}
  className={`inline-flex items-center gap-1.5 border text-sm font-medium px-3 py-2 rounded-lg transition shrink-0 ${activeFilters > 0 ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
  <Filter size={16} />
  <span className="hidden sm:inline">Filtros</span>
  {activeFilters > 0 && <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilters}</span>}
</button>
```

**Panel colapsable** — entre header y tabla, con grid responsive y botón "Limpiar filtros":
```tsx
{showFilters && (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-semibold text-gray-700">Filtros avanzados</h3>
      {activeFilters > 0 && (
        <button onClick={() => { clearFilters(); setSearchInput(''); }} className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1">
          <X size={14} /> Limpiar filtros
        </button>
      )}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {/* Selectores con label + className sel */}
    </div>
  </div>
)}
```

**Clase para inputs/selects del panel:** `const sel = 'border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';`

**Query params** — construir objeto dinámico solo con filtros activos:
```tsx
const queryParams: any = { page, limit, search: filters.search, sortField, sortDir };
if (filters.filtro1) queryParams.filtro1 = filters.filtro1;
if (filters.filtro2) queryParams.filtro2 = filters.filtro2;
```

**Reglas:**
- Los filtros se persisten en el store (navegar y volver los mantiene)
- `search` siempre va por debounce, no directo
- Los dropdowns se cargan con `{ all: true }` via React Query
- Al cambiar cualquier filtro, resetear `page` a 1
- Grid del panel: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3` (ajustar cols según cantidad de filtros; usar `lg:grid-cols-6` si hay 5+ filtros)

### Frontend — Pantallas (patrón estándar)
- Lista con búsqueda server-side (debounce 400ms) + paginación server-side + botón "Nuevo"
- Formulario en página separada (`/nuevo`) o modal según complejidad
- React Query para fetch, invalidación de cache al mutar
- Feedback con estados de loading/error

---

## Dependencias clave

| Paquete                  | Uso                              |
|--------------------------|----------------------------------|
| `@tanstack/react-query`  | Server state, cache              |
| `axios`                  | HTTP client                      |
| `react-hook-form`        | Manejo de formularios            |
| `zod`                    | Validación de schemas            |
| `lucide-react`           | Iconos                           |
| `clsx` + `tailwind-merge`| Merge de clases Tailwind (`cn()`) |
| `bcryptjs`               | Hash de passwords (backend)      |
| `jsonwebtoken`           | JWT (backend)                    |
| `pg`                     | Cliente PostgreSQL (backend)     |

---

## Git — Estrategia de ramas

| Branch       | Uso                                                        |
|--------------|------------------------------------------------------------|
| `main`       | Producción. Solo se actualiza via PR desde `develop`       |
| `develop`    | Desarrollo activo. Aquí se hace push de todo el trabajo    |

- **Nunca** hacer push directo a `main`. Siempre trabajar en `develop`
- Para pasar a producción: crear PR `develop` → `main`
- Branch default para desarrollo: `develop`

---

## Mantenimiento de CLAUDE.md (OBLIGATORIO)

Este archivo **siempre** debe mantenerse actualizado después de cualquier cambio. Al finalizar una tarea, verificar y actualizar:

- **Tabla de módulos** — cambiar estado si corresponde (🔄 → ✅)
- **Tabla de páginas de listado** — agregar toda página nueva con su `sortField` default
- **Secciones de endpoints** — agregar nuevos endpoints creados
- **Secciones de tablas DB** — agregar tablas nuevas usadas
- **Convenciones de código** — actualizar si se establece un nuevo patrón

Nunca dejar cambios sin reflejar en este archivo. Es la fuente de verdad del proyecto.

---

## Convención de Commits — Español

Todos los commits deben seguir el formato de **Conventional Commits** en **español**:

```
<tipo>(<alcance>): <descripción>

<cuerpo opcional>

<pie opcional>
```

### Tipos de commit

| Tipo       | Uso                                          | Ejemplo                                  |
|-----------|----------------------------------------------|------------------------------------------|
| **feat**  | Nueva funcionalidad                          | `feat(gen): agregar pantalla de roles`   |
| **fix**   | Corrección de bug                            | `fix(auth): corregir validación de token` |
| **chore** | Cambios que no afectan código (deps, config)| `chore: actualizar .gitignore`           |
| **docs**  | Cambios en documentación                     | `docs: actualizar README`                |
| **style** | Formato, sin cambiar lógica (espacios, etc) | `style: ajustar indentación`             |
| **refactor** | Refactorizar código sin cambiar funcionalidad | `refactor(gen): simplificar servicio de operadores` |
| **perf**  | Mejora de rendimiento                        | `perf: optimizar queries de base de datos` |
| **test**  | Agregar o modificar tests                    | `test(auth): agregar pruebas de login`   |

### Alcance (opcional pero recomendado)

Usar el módulo o componente afectado:
- Backend: `auth`, `gen`, `fac`, `fin`, `stk`, `per`, `com`, `cnt`
- Frontend: componente o pantalla (`operadores`, `roles`, etc.)
- Infraestructura: `db`, `config`, `docker`

### Ejemplos correctos

```
feat(gen): implementar CRUD de operadores
fix(auth): permitir login con email y usuario
chore: instalar dependencia de validación
docs(backend): documentar estructura de carpetas
refactor(operadores): extraer lógica de validación a service
perf(maestros): agregar índices a tabla de países
```

### Notas
- Usar imperativo ("agregar", "corregir", no "agregado", "corregido")
- Primera línea max 50 caracteres
- **Siempre en español** para mantener coherencia con el proyecto
- Si lo consideras necesario, agregar descripción adicional después de una línea en blanco
