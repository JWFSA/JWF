# CLAUDE.md — JWF

Instrucciones y conocimiento del proyecto para Claude Code. Se carga automáticamente en cada conversación.

---

## Stack

- **Backend:** Node.js + Express, Puerto 3001
- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS, Puerto 3000
- **Base de datos:** PostgreSQL 18, base `JWF`

## Levantar el proyecto

```bash
# Backend
cd backend && npm run dev   # → http://localhost:3001

# Frontend
cd frontend && npm run dev  # → http://localhost:3000
```

## Conexión PostgreSQL

```bash
PGPASSWORD=12345 "/c/Program Files/PostgreSQL/18/bin/psql.exe" -U postgres -h localhost -p 5432 -d JWF -c "..."
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
    └── gen/
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
DB_HOST=localhost | DB_PORT=5432 | DB_USER=postgres | DB_PASSWORD=12345 | DB_NAME=JWF
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
│       └── gen/             # Pantallas módulo GEN
├── components/
│   ├── layout/              # Header, Sidebar, Providers
│   └── gen/                 # Componentes específicos GEN
├── services/gen.ts          # Llamadas axios a la API
├── types/gen.ts             # Interfaces TypeScript
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
| FAC    | Facturación  | ⏳ Pendiente  |
| FIN    | Finanzas     | ⏳ Pendiente  |
| STK    | Stock        | ⏳ Pendiente  |
| PER    | Personal     | ⏳ Pendiente  |

### Convención de nombres por módulo
- Tablas DB: `{MOD}_TABLA` (ej. `GEN_OPERADOR`, `FAC_FACTURA`)
- Rutas API: `/api/{mod}/...` (ej. `/api/gen/operadores`)
- Rutas frontend: `/dashboard/{mod}/...` (ej. `/dashboard/gen/operadores`)
- Archivos backend: `modules/{mod}/controllers/`, `modules/{mod}/services/`
- Archivos frontend: `app/(dashboard)/{mod}/`, `components/{mod}/`, `services/{mod}.ts`, `types/{mod}.ts`

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
| GET    | `/api/health`                 | Health check DB                | No   |

---

## Convenciones de código

### Backend
- Patrón: `Controller → Service → DB` — los controllers solo manejan request/response, la lógica va en services
- Códigos auto-incrementales: se calculan con `SELECT COALESCE(MAX(campo), 0) + 1`
- Passwords: siempre hasheadas con `bcryptjs`
- Queries directas con `pg` (sin ORM)
- Nombres de tabla en minúsculas (sin comillas), columnas con comillas dobles en mayúsculas

### Paginación y búsqueda (OBLIGATORIO en todos los listados)
Todos los endpoints de lista y sus pantallas deben implementar paginación y búsqueda desde el backend. Nunca filtrar ni paginar en el frontend.

**Backend — parámetros query:** `?page=1&limit=20&search=texto&all=true`

**Backend — respuesta estándar:**
```json
{ "data": [...], "pagination": { "total": 150, "page": 1, "limit": 20, "totalPages": 8 } }
```

**Backend — patrón en service:**
- `getAll({ page = 1, limit = 20, search = '', all = false } = {})`
- Usar `ILIKE $1` con `%search%` para el WHERE de búsqueda
- Siempre hacer `COUNT(*)` primero; si `all=true` omitir LIMIT/OFFSET
- Si no hay search, los parámetros de LIMIT y OFFSET son `$1` y `$2`; si hay search, son `$2` y `$3`
- Con `all=true`: devolver todos los registros sin LIMIT/OFFSET (para selectores/dropdowns)

**Backend — patrón en controller:**
```js
const all    = req.query.all === 'true';
const page   = parseInt(req.query.page)  || 1;
const limit  = parseInt(req.query.limit) || 20;
const search = req.query.search || '';
res.json(await service.getAll({ page, limit, search, all }));
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

**Frontend — UI paginación:** el selector de página siempre visible; los botones de navegación solo si `totalPages > 1`:
```tsx
{pagination && (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
    <div className="flex items-center gap-2">
      <span>{pagination.total} registros</span>
      <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
        className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
        <option value={20}>20 por página</option>
        <option value={50}>50 por página</option>
        <option value={100}>100 por página</option>
      </select>
    </div>
    {pagination.totalPages > 1 && (
      <div className="flex items-center gap-1">
        <button onClick={() => setPage(1)} disabled={page === 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Primera página"><ChevronsLeft size={16} /></button>
        <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Página anterior"><ChevronLeft size={16} /></button>
        <span className="px-2">Página {page} de {pagination.totalPages}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.totalPages} className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Página siguiente"><ChevronRight size={16} /></button>
        <button onClick={() => setPage(pagination.totalPages)} disabled={page === pagination.totalPages} className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Última página"><ChevronsRight size={16} /></button>
      </div>
    )}
  </div>
)}
```
- Íconos: `ChevronLeft`, `ChevronRight`, `ChevronsLeft`, `ChevronsRight` de `lucide-react`
- Estado `limit` con default 20; al cambiar resetear `page` a 1

### Frontend — Responsive (OBLIGATORIO)
Todos los componentes deben ser responsive. Reglas:

- **Tablas:** envueltas en `<div className="overflow-x-auto">` + `min-w-[Xpx]` en la tabla. Columnas secundarias: `hidden md:table-cell`
- **Grids de formulario:** nunca `grid-cols-2` fijo → siempre `grid-cols-1 sm:grid-cols-2`; 3 cols: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3`
- **Buscadores:** `w-full sm:w-72` (nunca `w-72` fijo)
- **Padding de contenedores:** `p-4 sm:p-6`
- **Botones header:** texto largo con `hidden sm:inline`, texto corto con `sm:hidden`
- **Botones formulario:** `flex-col-reverse sm:flex-row` con `w-full sm:w-auto`
- **Sidebar:** drawer en mobile, siempre visible en `md+`

### Frontend — TypeScript
- Interfaces en `types/{mod}.ts`
- Servicios en `services/{mod}.ts` usando el cliente axios de `lib/api.ts`
- Merge de clases Tailwind con `cn()` de `lib/utils.ts`

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
