# JWF

Sistema de gestión empresarial - Reemplazo del sistema legacy.

## Stack

- **Frontend**: Next.js 14 + Tailwind CSS + TypeScript
- **Backend**: Node.js + Express
- **Base de datos**: PostgreSQL (JWF)

## Estructura

```
jwf/
├── backend/          # API REST con Express
│   └── src/
│       ├── config/         # Configuración DB
│       ├── middlewares/    # Auth JWT, error handler
│       └── modules/
│           ├── gen/        # Módulo General ✅
│           ├── fac/        # Facturación (próximo)
│           ├── fin/        # Finanzas (próximo)
│           ├── stk/        # Stock (próximo)
│           └── per/        # Personal (próximo)
└── frontend/         # App Next.js
    └── src/
        ├── app/
        │   ├── (auth)/     # Login
        │   └── (dashboard)/
        │       └── gen/    # Pantallas módulo GEN ✅
        ├── components/     # Componentes reutilizables
        ├── services/       # Llamadas a la API
        └── types/          # Tipos TypeScript
```

## Levantar el proyecto

### Backend
```bash
cd backend
npm install
npm run dev
# → http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

## Módulos implementados

### GEN - General ✅
- Autenticación JWT
- Operadores (usuarios)
- Roles y permisos
- Empresas y sucursales
- Sistemas/módulos
- Catálogos (monedas, países, ciudades, departamentos)
